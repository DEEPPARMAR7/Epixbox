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
import { useCart } from '../../hooks/useCart'
import { createOrder } from '../../api/orderApi'
import { formatCurrency } from '../../utils/formatters'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

function CheckoutForm({ totalCents, onSuccess }) {
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Smith"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="pt-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment</label>
        <div className="border border-gray-200 rounded-lg p-3">
          <PaymentElement />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !stripe || !elements}
        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {submitting && <Spinner size="sm" />}
        {submitting ? 'Processing...' : `Pay ${formatCurrency(totalCents)}`}
      </button>

      <p className="text-center text-xs text-gray-400">
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

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart')
      return
    }
    createOrder({
      items: items.map((i) => ({
        product_id: i.productId,
        photo_id: i.photoId,
        quantity: i.quantity,
      })),
    })
      .then(({ clientSecret: cs, orderId: oid, trackingToken: tt }) => {
        setClientSecret(cs)
        setOrderId(oid)
        setTrackingToken(tt || null)
      })
      .catch((err) => {
        console.error(err)
        toast.error(err?.response?.data?.error || 'Unable to start checkout. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [items, navigate])

  const handleSuccess = () => {
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

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.photoId}`}
                  className="flex justify-between items-center text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-800">{item.photoTitle}</p>
                    <p className="text-gray-500">
                      {item.productName} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(item.price_cents * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(totalCents)}</span>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete your order</h1>

            <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Secure checkout</p>
              <p className="mt-3 text-sm text-gray-600">
                Payments are processed securely through Stripe. Available methods depend on your device, browser, and Stripe account settings.
              </p>
            </div>

            {stripeKeyMissing ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                Stripe is not configured. Set <code className="font-mono">VITE_STRIPE_PUBLISHABLE_KEY</code> in your environment file and restart the client.
              </div>
            ) : clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                <CheckoutForm
                  totalCents={totalCents}
                  onSuccess={handleSuccess}
                />
              </Elements>
            ) : (
              <p className="text-red-500 text-sm">Unable to initialize payment. Please try again.</p>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
