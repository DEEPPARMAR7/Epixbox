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
      const successUrl = `${window.location.origin}/subscribe/${username}/manage`
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
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-black text-gray-900">Subscribe to {data?.photographer?.brand_name || data?.photographer?.username}</h1>
        <p className="mt-2 text-sm text-gray-600">Choose a recurring plan and manage it anytime from customer portal.</p>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Your email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.plans || []).map((plan) => (
            <div key={plan.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
              <p className="mt-2 text-2xl font-black text-gray-900">{formatCurrency(plan.price_cents)} <span className="text-sm font-medium text-gray-500">/{plan.billing_period}</span></p>
              <p className="mt-2 text-sm text-gray-600">{plan.description || 'Recurring subscription plan'}</p>
              {!!plan.trial_days && <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-600">{plan.trial_days} day free trial</p>}
              <button
                type="button"
                onClick={() => onSubscribe(plan.id)}
                disabled={submitting}
                className="mt-5 w-full rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting ? 'Redirecting...' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>

        {(data?.plans || []).length === 0 && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
            No active plans available right now.
          </div>
        )}

        <div className="mt-8 text-center text-sm">
          <Link to={`/subscribe/${username}/manage`} className="text-indigo-600 hover:underline">Already subscribed? Manage your plan</Link>
        </div>
      </div>
    </PublicLayout>
  )
}
