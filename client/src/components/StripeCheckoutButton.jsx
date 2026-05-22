import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import Spinner from './common/Spinner'
import toast from 'react-hot-toast'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const apiUrl = (path) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

export default function StripeCheckoutButton({ items, buyerEmail, buyerName }) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (!stripePublishableKey) {
      toast.error('Stripe is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY.');
      return;
    }

    setLoading(true)
    try {
      const response = await fetch(apiUrl('/checkout/create-session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'stripe',
          items,
          buyerEmail,
          buyerName,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to create Stripe checkout session')
      }

      const result = await response.json()
      const stripe = await loadStripe(stripePublishableKey)
      if (!stripe) {
        throw new Error('Stripe JS failed to load')
      }

      const { sessionId } = result
      const { error } = await stripe.redirectToCheckout({ sessionId })
      if (error) {
        throw error
      }
    } catch (err) {
      console.error('Stripe checkout error:', err)
      toast.error(err.message || 'Stripe checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <span className="inline-flex items-center gap-2"><Spinner size="sm" /> Redirecting to Stripe...</span> : 'Pay with card via Stripe'}
      </button>
      <p className="text-center text-xs text-slate-500">
        🔒 Card payments are processed securely by Stripe.
      </p>
    </div>
  )
}
