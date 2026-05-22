import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PublicLayout from '../../components/layout/PublicLayout'
import Spinner from '../../components/common/Spinner'
import PayPalPaymentButton from '../../components/PayPalPaymentButton'
import StripeCheckoutButton from '../../components/StripeCheckoutButton'
import PaymentMethodSelector from '../../components/PaymentMethodSelector'
import { useCart } from '../../hooks/useCart'
import { formatCurrency } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const { items, totalCents, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe')
  const [availableMethods, setAvailableMethods] = useState([])
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerName, setBuyerName] = useState('')

  useEffect(() => {
    if (!availableMethods.length) return
    const ids = availableMethods.map((m) => m.id)
    if (!ids.includes(selectedPaymentMethod)) {
      setSelectedPaymentMethod(ids[0])
    }
  }, [availableMethods, selectedPaymentMethod])

  const handlePaymentSuccess = (result) => {
    clearCart()
    const orderId = result?.orderId || result?.id || result?.order_id
    const trackingToken = result?.trackingToken || result?.tracking_token || result?.token
    const tokenPart = trackingToken ? `&token=${encodeURIComponent(trackingToken)}` : ''

    if (orderId) {
      navigate(`/order-success?orderId=${orderId}${tokenPart}`)
    } else {
      navigate('/')
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      </PublicLayout>
    )
  }

  if (!items.length) {
    return (
      <PublicLayout>
        <div className="py-20 text-center">
          <p className="text-lg font-semibold text-foreground">Your cart is empty.</p>
          <p className="mt-2 text-sm text-muted-foreground">Add items to your cart before checking out.</p>
        </div>
      </PublicLayout>
    )
  }

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
              Secure checkout for your order
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
              <PaymentMethodSelector onSelect={setSelectedPaymentMethod} selectedMethod={selectedPaymentMethod} onMethods={setAvailableMethods} />

              <div className="pt-4 border-t border-border/70 space-y-4">
                <div className="grid gap-3">
                  <label className="block text-sm font-medium text-slate-700">Buyer Email</label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-border/70 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                  />
                </div>
                <div className="grid gap-3">
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-2xl border border-border/70 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                  />
                </div>

                {selectedPaymentMethod === 'stripe' ? (
                  <StripeCheckoutButton
                    items={items}
                    buyerEmail={buyerEmail}
                    buyerName={buyerName}
                  />
                ) : (
                  <PayPalPaymentButton
                    amount={totalCents}
                    items={items}
                    buyerEmail={buyerEmail}
                    buyerName={buyerName}
                    onSuccess={handlePaymentSuccess}
                    onError={(err) => toast.error('PayPal payment failed: ' + (err?.message || 'Unknown error'))}
                    onCancel={() => toast.info('Payment cancelled')}
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
