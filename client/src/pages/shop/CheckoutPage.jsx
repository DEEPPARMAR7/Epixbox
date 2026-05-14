import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import PublicLayout from '../../components/layout/PublicLayout'
import Spinner from '../../components/common/Spinner'
import PayPalPaymentButton from '../../components/PayPalPaymentButton'
import ApplePayButton from '../../components/ApplePayButton'
import GooglePayButton from '../../components/GooglePayButton'
import PaymentMethodSelector from '../../components/PaymentMethodSelector'
import { useCart } from '../../hooks/useCart'
import { createOrder } from '../../api/orderApi'
import { formatCurrency } from '../../utils/formatters'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const apiUrl = (path) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

function StripeCheckoutForm({ totalCents, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success`,
        receipt_email: email,
        payment_method_data: {
          billing_details: { name, email },
        },
      },
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message)
      setSubmitting(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Smith"
          className="w-full rounded-2xl border border-border/70 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
          className="w-full rounded-2xl border border-border/70 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10"
        />
      </div>

      <div className="pt-2">
        <label className="block text-sm font-medium text-slate-700 mb-2">Card Details</label>
        <div className="rounded-2xl border border-border/70 bg-white p-4 shadow-sm">
          <PaymentElement />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !stripe || !elements}
        className="btn-cta w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting && <Spinner size="sm" />}
        {submitting ? 'Processing...' : `Pay ${formatCurrency(totalCents)}`}
      </button>

      <p className="text-center text-xs text-slate-500">
        🔒 Secured by Stripe. We never store your card details.
      </p>
    </form>
  )
}

export default function CheckoutPage() {
  const { items, totalCents, clearCart } = useCart()
  const navigate = useNavigate()
  const [clientSecret, setClientSecret] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orderId, setOrderId] = useState(null)
  const [trackingToken, setTrackingToken] = useState(null)
  const [hostedBuyerEmail, setHostedBuyerEmail] = useState('')
  const [hostedBuyerName, setHostedBuyerName] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe')

  useEffect(() => {
    // Allow viewing payment methods in development/test mode
    if (items.length === 0) {
      // Check if we're in test mode (can add test item or show demo)
      const testMode = true // Set to false to enforce cart requirement
      
      if (!testMode) {
        navigate('/cart')
        return
      }

      // In test mode, request a small test PaymentIntent so Stripe can initialize
      (async () => {
        try {
          const resp = await fetch(apiUrl('/checkout/test-intent'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount_cents: 100 }),
          })
          if (resp.ok) {
            const json = await resp.json()
            setClientSecret(json.clientSecret)
          } else {
            console.error('Failed to create test intent', await resp.text())
          }
        } catch (err) {
          console.error('Error creating test intent:', err)
        } finally {
          setLoading(false)
        }
      })()

      return
    }
    // For non-empty carts we wait for user to choose hosted checkout or in-page Elements.
    setLoading(false)
  }, [items, navigate])

  const createHostedSession = async () => {
    try {
      setLoading(true)
      const resp = await fetch(apiUrl('/checkout/create-session-from-items'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.productId, photo_id: i.photoId, quantity: i.quantity })),
          buyer_email: hostedBuyerEmail,
          buyer_name: hostedBuyerName,
        }),
      })
      if (!resp.ok) throw new Error(await resp.text())
      const json = await resp.json()
      // Redirect to Stripe Checkout
      window.location = json.url
    } catch (err) {
      console.error('Hosted checkout failed', err)
      toast.error('Unable to start hosted Checkout: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  const startInPagePayment = async () => {
    setLoading(true)
    try {
      const { clientSecret: cs, orderId: oid, trackingToken: tt } = await createOrder({
        items: items.map((i) => ({ product_id: i.productId, photo_id: i.photoId, quantity: i.quantity })),
      })
      setClientSecret(cs)
      setOrderId(oid)
      setTrackingToken(tt || null)
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.error || 'Unable to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    clearCart()
    const tokenPart = trackingToken ? `&token=${encodeURIComponent(trackingToken)}` : ''
    navigate(`/order-success?orderId=${orderId}${tokenPart}`)
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      </PublicLayout>
    )
  }

  const stripeKeyMissing = !stripePublishableKey

  return (
    <PublicLayout>
      <Helmet>
        <title>Checkout</title>
      </Helmet>

      <div className="relative overflow-hidden px-4 py-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_hsl(var(--accent)/0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_hsl(205_70%_50%/0.08),_transparent_28%)]" />

        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="font-heading text-[11px] uppercase tracking-[0.32em] text-muted-foreground mb-3">
              Checkout
            </p>
            <h1 className="heading-lg text-foreground max-w-2xl">
              Secure payment with multiple payment options
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.95fr),minmax(420px,1.05fr)]">
            {/* Order Summary */}
            <div className="premium-card p-5 md:p-6">
              <h2 className="text-lg font-black text-foreground mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.photoId}`}
                    className="flex justify-between items-center gap-4 text-sm rounded-2xl border border-border/60 bg-background/80 p-4"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{item.photoTitle}</p>
                      <p className="text-muted-foreground">
                        {item.productName} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-black text-foreground">
                      {formatCurrency(item.price_cents * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/70 pt-4 flex justify-between font-semibold text-foreground">
                <span>Total</span>
                <span>{formatCurrency(totalCents)}</span>
              </div>
            </div>

            {/* Payment Form */}
            <div className="premium-card p-5 md:p-6 space-y-6">
              <div>
                <h1 className="text-2xl font-black text-foreground mb-3">Complete your order</h1>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Choose your preferred payment method and complete checkout securely.
                </p>
              </div>

              {/* Payment Method Selector */}
              <PaymentMethodSelector onSelect={setSelectedPaymentMethod} selectedMethod={selectedPaymentMethod} />

              {/* Payment Method Forms */}
              <div className="pt-4 border-t border-border/70">
                {selectedPaymentMethod === 'stripe' && (
                  <>
                    {stripeKeyMissing ? (
                      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                        Stripe is not configured. Set <code className="font-mono">VITE_STRIPE_PUBLISHABLE_KEY</code> in your environment file.
                      </div>
                    ) : items.length > 0 ? (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-border/70 bg-background p-4">
                          <p className="font-semibold mb-2">Hosted Checkout (recommended)</p>
                          <p className="text-sm text-muted-foreground mb-3">Redirect to Stripe Checkout to complete your purchase. Supports cards and wallets when enabled.</p>
                          <div className="grid gap-2">
                            <input
                              type="text"
                              placeholder="Full name"
                              value={hostedBuyerName}
                              onChange={(e) => setHostedBuyerName(e.target.value)}
                              className="w-full rounded-2xl border border-border/70 bg-white px-4 py-2 text-sm"
                            />
                            <input
                              type="email"
                              placeholder="Email address"
                              value={hostedBuyerEmail}
                              onChange={(e) => setHostedBuyerEmail(e.target.value)}
                              className="w-full rounded-2xl border border-border/70 bg-white px-4 py-2 text-sm"
                            />
                            <button onClick={createHostedSession} className="btn-cta w-full">Pay ${formatCurrency(totalCents)}</button>
                          </div>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">or</div>

                        <div className="rounded-2xl border border-border/70 bg-background p-4">
                          <p className="font-semibold mb-2">Pay In-Page</p>
                          <p className="text-sm text-muted-foreground mb-3">Use the embedded Payment Element in this page.</p>
                          <button onClick={startInPagePayment} className="btn-outline w-full">Initialize Card Form</button>
                          {clientSecret && (
                            <div className="mt-4">
                              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                <StripeCheckoutForm
                                  totalCents={totalCents}
                                  onSuccess={handlePaymentSuccess}
                                />
                              </Elements>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : clientSecret ? (
                      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                        <StripeCheckoutForm
                          totalCents={totalCents}
                          onSuccess={handlePaymentSuccess}
                        />
                      </Elements>
                    ) : (
                      <p className="text-sm text-red-500">Unable to initialize Stripe. Please try again.</p>
                    )}
                  </>
                )}

                {selectedPaymentMethod === 'paypal' && (
                  <PayPalPaymentButton
                    amount={totalCents}
                    items={items}
                    onSuccess={handlePaymentSuccess}
                    onError={(err) => toast.error('PayPal payment failed: ' + err.message)}
                    onCancel={() => toast.info('Payment cancelled')}
                  />
                )}

                {selectedPaymentMethod === 'apple' && (
                  <ApplePayButton
                    amount={totalCents}
                    items={items}
                    onSuccess={handlePaymentSuccess}
                    onError={(err) => toast.error('Apple Pay failed: ' + err.message)}
                  />
                )}

                {selectedPaymentMethod === 'google' && (
                  <GooglePayButton
                    amount={totalCents}
                    items={items}
                    onSuccess={handlePaymentSuccess}
                    onError={(err) => toast.error('Google Pay failed: ' + err.message)}
                  />
                )}
              </div>

              <p className="text-center text-xs text-slate-500">
                🔒 Your payment details are encrypted and secure. We never store sensitive card information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
