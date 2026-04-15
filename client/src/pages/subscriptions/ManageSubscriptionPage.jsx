import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import PublicLayout from '../../components/layout/PublicLayout'
import {
  createCustomerSubscriptionPortal,
  getCustomerSubscriptions,
} from '../../api/subscriptionsApi'
import { formatCurrency } from '../../utils/formatters'

export default function ManageSubscriptionPage() {
  const { username } = useParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [openingId, setOpeningId] = useState(null)
  const [subscriptions, setSubscriptions] = useState([])

  const activeCount = useMemo(
    () => subscriptions.filter((s) => s.status === 'active' || s.status === 'trialing').length,
    [subscriptions]
  )

  const onLookup = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await getCustomerSubscriptions({ email, username })
      setSubscriptions(data?.subscriptions || [])
      if (!(data?.subscriptions || []).length) toast('No subscriptions found for this email')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  const openPortal = async (sub) => {
    setOpeningId(sub.id)
    try {
      const { url } = await createCustomerSubscriptionPortal({
        subscriptionId: sub.id,
        customerEmail: email,
        returnUrl: window.location.href,
      })
      window.location.href = url
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Unable to open billing portal')
    } finally {
      setOpeningId(null)
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-black text-gray-900">Manage Subscription</h1>
        <p className="mt-2 text-sm text-gray-600">Look up your active plans, view trial countdown, and manage upgrade/downgrade/cancel from Stripe portal.</p>

        <form onSubmit={onLookup} className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Subscriber email</label>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? 'Checking...' : 'Find'}
            </button>
          </div>
        </form>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          Active subscriptions: <span className="font-bold">{activeCount}</span>
        </div>

        <div className="mt-6 space-y-3">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-base font-bold text-gray-900">{sub.SubscriptionPlan?.name || 'Plan'}</p>
                  <p className="text-sm text-gray-600">{formatCurrency(sub.SubscriptionPlan?.price_cents || 0)} / {sub.SubscriptionPlan?.billing_period || 'monthly'}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase text-gray-700">{sub.status}</span>
              </div>

              {sub.trial_days_remaining > 0 && (
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Trial ends in {sub.trial_days_remaining} day{sub.trial_days_remaining > 1 ? 's' : ''}
                </p>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => openPortal(sub)}
                  disabled={openingId === sub.id}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {openingId === sub.id ? 'Opening...' : 'Manage in Billing Portal'}
                </button>
              </div>
            </div>
          ))}

          {!loading && subscriptions.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
              Enter your email to check subscriptions for {username}.
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
