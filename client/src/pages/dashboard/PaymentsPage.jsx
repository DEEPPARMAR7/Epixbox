import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import IllustratedEmptyState from '../../components/common/IllustratedEmptyState'
import {
  DashboardHeaderSkeleton,
  DashboardStatsSkeleton,
  DashboardTableSkeleton,
} from '../../components/common/DashboardSkeletons'
import { getMyOrders } from '../../api/orderApi'
import { createBillingPortal, getBilling } from '../../api/settingsApi'
import { formatCurrency } from '../../utils/formatters'

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [billing, setBilling] = useState(null)
  const [openingPortal, setOpeningPortal] = useState(false)

  useEffect(() => {
    Promise.all([getMyOrders(), getBilling()])
      .then(([o, b]) => {
        setOrders(o || [])
        setBilling(b)
      })
      .catch((err) => toast.error(err?.response?.data?.error || 'Failed to load payments'))
      .finally(() => setLoading(false))
  }, [])

  const paid = useMemo(() => orders.filter(o => o.status === 'paid'), [orders])
  const revenue = useMemo(() => paid.reduce((sum, o) => sum + (o.total_cents || 0), 0), [paid])

  const openPortal = async () => {
    setOpeningPortal(true)
    try {
      const { url } = await createBillingPortal()
      window.location.href = url
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Billing portal unavailable for this account')
    } finally {
      setOpeningPortal(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-5 sm:space-y-6">
          <DashboardHeaderSkeleton />
          <DashboardStatsSkeleton count={3} />
          <DashboardTableSkeleton rows={6} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Payments</p>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">Payment Gateway and Billing</h1>
          <p className="mt-2 text-sm text-slate-400">Stripe checkout is active for orders, and billing is managed through Stripe customer portal.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Total Orders</p>
            <p className="mt-2 text-2xl font-black text-white">{orders.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Paid Orders</p>
            <p className="mt-2 text-2xl font-black text-white">{paid.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Revenue</p>
            <p className="mt-2 text-2xl font-black text-white">{formatCurrency(revenue)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Current Plan: <span className="text-emerald-300 uppercase">{billing?.plan || 'free'}</span></p>
              <p className="text-xs text-slate-400">Stripe customer: {billing?.stripe_customer_id || 'Not linked'}</p>
            </div>
            <button
              type="button"
              onClick={openPortal}
              disabled={openingPortal}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {openingPortal ? 'Opening...' : 'Open Stripe Billing Portal'}
            </button>
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left">
                <tr>
                  <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Order</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Buyer</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Total</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {orders.slice(0, 20).map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">#{o.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-slate-300">{o.buyer_name || o.buyer_email}</td>
                    <td className="px-4 py-3 text-slate-100">{formatCurrency(o.total_cents || 0)}</td>
                    <td className="px-4 py-3 text-slate-200 uppercase">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <IllustratedEmptyState
            variant="orders"
            title="No orders yet"
            description="As customers start purchasing photos, payment activity and status will appear here."
            actionLabel="Review Pricing"
            actionTo="/dashboard/pricing"
          />
        )}
      </div>
    </DashboardLayout>
  )
}
