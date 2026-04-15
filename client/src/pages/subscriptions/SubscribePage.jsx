import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import PublicLayout from '../../components/layout/PublicLayout'
import Spinner from '../../components/common/Spinner'
import {
  createSubscriptionCheckoutSession,
  getPublicSubscriptionPlans,
} from '../../api/subscriptionsApi'
import { formatCurrency } from '../../utils/formatters'

export default function SubscribePage() {
  const { username } = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [data, setData] = useState({ photographer: null, plans: [] })
  const [email, setEmail] = useState('')
  const [selectedPlanId, setSelectedPlanId] = useState(null)

  useEffect(() => {
    getPublicSubscriptionPlans(username)
      .then(setData)
      .catch((err) => toast.error(err?.response?.data?.error || 'Unable to load subscription plans'))
      .finally(() => setLoading(false))
  }, [username])

  const onSubscribe = async (planId) => {
    if (!email) {
      toast.error('Enter your email first')
      return
    }

    setSubmitting(true)
    try {
      const successUrl = `${window.location.origin}/subscribe/${username}/success`
      const cancelUrl = window.location.href
      const { url } = await createSubscriptionCheckoutSession({
        planId,
        customerEmail: email,
        successUrl,
        cancelUrl,
      })
      window.location.href = url
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to start checkout')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex justify-center items-center"><Spinner size="lg" /></div>
      </PublicLayout>
    )
  }

  const selectedPlan = (data?.plans || []).find((p) => p.id === selectedPlanId) || null

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Subscriptions</p>
          <h1 className="mt-2 text-3xl font-black text-white">Subscribe to {data?.photographer?.brand_name || data?.photographer?.username}</h1>
          <p className="mt-2 text-sm text-slate-400">Step 1: choose plan. Step 2: add email. Step 3: pay securely with Stripe.</p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.plans || []).map((plan) => (
            <button
              type="button"
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`rounded-2xl border p-5 text-left transition ${selectedPlanId === plan.id ? 'border-emerald-300/60 bg-emerald-300/10' : 'border-white/10 bg-slate-900/70 hover:bg-slate-900'}`}
            >
              <h2 className="text-lg font-bold text-white">{plan.name}</h2>
              <p className="mt-2 text-2xl font-black text-white">{formatCurrency(plan.price_cents)} <span className="text-sm font-medium text-slate-400">/{plan.billing_period}</span></p>
              <p className="mt-2 text-sm text-slate-400">{plan.description || 'Recurring subscription plan'}</p>
              {!!plan.trial_days && <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-300">{plan.trial_days} day free trial</p>}
              {selectedPlanId === plan.id && <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-200">Selected</p>}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <h2 className="text-lg font-bold text-white">Complete Checkout</h2>
          {selectedPlan ? (
            <p className="mt-2 text-sm text-slate-300">Selected plan: <span className="font-semibold text-white">{selectedPlan.name}</span> ({formatCurrency(selectedPlan.price_cents)}/{selectedPlan.billing_period})</p>
          ) : (
            <p className="mt-2 text-sm text-amber-300">Select a plan above to continue.</p>
          )}

          {!!selectedPlan?.trial_days && (
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Trial countdown starts after checkout: {selectedPlan.trial_days} day{selectedPlan.trial_days > 1 ? 's' : ''}
            </p>
          )}

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-300">Your email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500"
            />
          </div>

          <button
            type="button"
            onClick={() => selectedPlan && onSubscribe(selectedPlan.id)}
            disabled={submitting || !selectedPlan}
            className="mt-4 w-full rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? 'Redirecting to payment...' : 'Continue to Secure Payment'}
          </button>

          <p className="mt-2 text-xs text-slate-500">Payments are processed by Stripe. You can upgrade, downgrade, or cancel later.</p>
        </div>

        {(data?.plans || []).length === 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-center text-sm text-slate-400">
            No active plans available right now.
          </div>
        )}

        <div className="mt-8 text-center text-sm">
          <Link to={`/subscribe/${username}/manage`} className="text-indigo-300 hover:text-indigo-200">Already subscribed? Manage your plan</Link>
        </div>
      </div>
    </PublicLayout>
  )
}
