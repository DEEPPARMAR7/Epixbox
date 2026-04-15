import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Spinner from '../../components/common/Spinner'
import {
  createSubscriptionPlan,
  deactivateSubscriptionPlan,
  getMySubscriptionPlans,
  getSubscriptionAnalytics,
  updateSubscriptionPlan,
} from '../../api/subscriptionsApi'
import { formatCurrency } from '../../utils/formatters'

const EMPTY_FORM = {
  name: '',
  description: '',
  price_cents: 900,
  billing_period: 'monthly',
  trial_days: 14,
}

export default function SubscriptionPlansPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [plans, setPlans] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const activePlans = useMemo(() => plans.filter((p) => p.is_active), [plans])

  const load = async () => {
    try {
      const [planData, analyticsData] = await Promise.all([
        getMySubscriptionPlans(),
        getSubscriptionAnalytics(),
      ])
      setPlans(planData || [])
      setAnalytics(analyticsData)
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to load subscriptions dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createSubscriptionPlan({
        ...form,
        price_cents: Number(form.price_cents),
        trial_days: Number(form.trial_days),
      })
      setForm(EMPTY_FORM)
      toast.success('Subscription plan created')
      await load()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create plan')
    } finally {
      setSaving(false)
    }
  }

  const onToggleActive = async (plan) => {
    try {
      await updateSubscriptionPlan(plan.id, { is_active: !plan.is_active })
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, is_active: !p.is_active } : p)))
      toast.success(plan.is_active ? 'Plan paused' : 'Plan reactivated')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update plan')
    }
  }

  const onArchive = async (plan) => {
    if (!window.confirm(`Deactivate ${plan.name}?`)) return
    try {
      await deactivateSubscriptionPlan(plan.id)
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, is_active: false } : p)))
      toast.success('Plan deactivated')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to deactivate plan')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-16"><Spinner /></div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Subscriptions</p>
          <h1 className="mt-2 text-3xl font-black text-white">Subscriber Plans</h1>
          <p className="mt-2 text-sm text-slate-400">Create recurring plans like SmugMug memberships and manage renewals via Stripe.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Active Plans</p>
            <p className="mt-2 text-2xl font-black text-white">{activePlans.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Subscribers</p>
            <p className="mt-2 text-2xl font-black text-white">{analytics?.totals?.active || 0}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">MRR</p>
            <p className="mt-2 text-2xl font-black text-white">{formatCurrency(analytics?.mrr_cents || 0)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">30d Churn</p>
            <p className="mt-2 text-2xl font-black text-white">{analytics?.churn_rate_30d || 0}%</p>
          </div>
        </div>

        <form onSubmit={onCreate} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
          <h2 className="text-lg font-bold text-white">Create New Plan</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Plan name"
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500"
            />
            <select
              value={form.billing_period}
              onChange={(e) => setForm((f) => ({ ...f, billing_period: e.target.value }))}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <input
              type="number"
              min={100}
              value={form.price_cents}
              onChange={(e) => setForm((f) => ({ ...f, price_cents: e.target.value }))}
              placeholder="Price in cents (e.g. 900)"
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500"
            />
            <input
              type="number"
              min={0}
              max={30}
              value={form.trial_days}
              onChange={(e) => setForm((f) => ({ ...f, trial_days: e.target.value }))}
              placeholder="Trial days"
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500"
            />
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Plan description"
            className="min-h-[90px] w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Creating...' : 'Create Plan'}
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left">
              <tr>
                <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Plan</th>
                <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Price</th>
                <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Trial</th>
                <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Status</th>
                <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td className="px-4 py-3 text-slate-200">
                    <p className="font-semibold">{plan.name}</p>
                    <p className="text-xs text-slate-400">{plan.description || 'No description'}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-200">{formatCurrency(plan.price_cents)} / {plan.billing_period}</td>
                  <td className="px-4 py-3 text-slate-200">{plan.trial_days || 0} days</td>
                  <td className="px-4 py-3 text-slate-200 uppercase">{plan.is_active ? 'active' : 'inactive'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => onToggleActive(plan)} className="rounded-md border border-white/20 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/10">
                        {plan.is_active ? 'Pause' : 'Activate'}
                      </button>
                      <button onClick={() => onArchive(plan)} className="rounded-md border border-red-400/40 px-2.5 py-1 text-xs text-red-300 hover:bg-red-400/10">
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No plans created yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
