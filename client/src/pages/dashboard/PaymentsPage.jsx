import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Spinner from '../../components/common/Spinner'
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
        <div className="flex justify-center py-16"><Spinner /></div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Payments</p>
          <h1 className="mt-2 text-3xl font-black text-white">Payment Gateway and Billing</h1>
          <p className="mt-2 text-sm text-slate-400">Stripe checkout is active for orders, and billing is managed through Stripe customer portal.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
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

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Checkout Payment Options</p>
          <h2 className="mt-2 text-lg font-bold text-white">SmugMug-style multi-method checkout</h2>
          <p className="mt-1 text-sm text-slate-400">Your buyers can use Stripe-hosted methods at checkout.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {["Card", "Apple Pay", "Google Pay", "Link"].map((method) => (
              <div key={method} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-center text-xs font-semibold text-slate-200">
                {method}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">Methods shown to buyers depend on country, device/browser, and Stripe dashboard activation.</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
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
              {orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
