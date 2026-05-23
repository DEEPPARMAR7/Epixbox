import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import IllustratedEmptyState from '../../components/common/IllustratedEmptyState'
import {
  DashboardHeaderSkeleton,
  DashboardStatsSkeleton,
  DashboardTableSkeleton,
} from '../../components/common/DashboardSkeletons'
import PaymentMethodsDashboard from '../../components/PaymentMethodsDashboard'
import { createOrderRefund, getMyOrders, getOrderTimeline, updateOrderShipping, updateOrderStatus } from '../../api/orderApi'
import { getBilling } from '../../api/settingsApi'
import { formatCurrency } from '../../utils/formatters'

const STATUS_OPTIONS = ['pending', 'paid', 'processing', 'shipped', 'cancelled']

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [billing, setBilling] = useState(null)
  const [activeOrderId, setActiveOrderId] = useState(null)
  const [activeTimeline, setActiveTimeline] = useState([])
  const [activeShipping, setActiveShipping] = useState(null)
  const [loadingOrderPanel, setLoadingOrderPanel] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [savingShipping, setSavingShipping] = useState(false)
  const [savingRefund, setSavingRefund] = useState(false)
  const [refundSummary, setRefundSummary] = useState({ refunded_total_cents: 0, refundable_remaining_cents: 0 })
  const [refundForm, setRefundForm] = useState({ amount_cents: '', reason: 'requested_by_customer', notes: '' })
  const [shippingForm, setShippingForm] = useState({
    shipping_carrier: '',
    tracking_number: '',
    estimated_delivery: '',
    mark_shipped: false,
  })

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

  const loadOrderPanel = async (orderId) => {
    setLoadingOrderPanel(true)
    try {
      const data = await getOrderTimeline(orderId)
      setActiveTimeline(data?.timeline || [])
      setActiveShipping(data?.shipping || null)
      const refundedTotal = Number(data?.refunded_total_cents || 0)
      const selectedOrder = orders.find((o) => o.id === orderId)
      const total = Number(selectedOrder?.total_cents || 0)
      setRefundSummary({
        refunded_total_cents: refundedTotal,
        refundable_remaining_cents: Math.max(0, total - refundedTotal),
      })
      setShippingForm({
        shipping_carrier: data?.shipping?.shipping_carrier || '',
        tracking_number: data?.shipping?.tracking_number || '',
        estimated_delivery: data?.shipping?.estimated_delivery ? new Date(data.shipping.estimated_delivery).toISOString().slice(0, 16) : '',
        mark_shipped: false,
      })
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to load order lifecycle details')
    } finally {
      setLoadingOrderPanel(false)
    }
  }

  const openOrderManager = async (orderId) => {
    setActiveOrderId(orderId)
    setRefundForm({ amount_cents: '', reason: 'requested_by_customer', notes: '' })
    await loadOrderPanel(orderId)
  }

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingStatus(true)
    try {
      const updated = await updateOrderStatus(orderId, status)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)))
      await loadOrderPanel(orderId)
      toast.success('Order status updated')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update order status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleShippingSave = async (e) => {
    e.preventDefault()
    if (!activeOrderId) return
    setSavingShipping(true)
    try {
      const payload = {
        shipping_carrier: shippingForm.shipping_carrier || null,
        tracking_number: shippingForm.tracking_number || null,
        estimated_delivery: shippingForm.estimated_delivery ? new Date(shippingForm.estimated_delivery).toISOString() : null,
        mark_shipped: shippingForm.mark_shipped,
      }
      const updated = await updateOrderShipping(activeOrderId, payload)
      setOrders((prev) => prev.map((o) => (o.id === activeOrderId ? { ...o, status: updated.status } : o)))
      await loadOrderPanel(activeOrderId)
      setShippingForm((prev) => ({ ...prev, mark_shipped: false }))
      toast.success('Shipping details saved')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update shipping details')
    } finally {
      setSavingShipping(false)
    }
  }

  const handleCreateRefund = async (e) => {
    e.preventDefault()
    if (!activeOrderId) return
    setSavingRefund(true)
    try {
      const payload = {
        reason: refundForm.reason,
        notes: refundForm.notes || null,
      }
      if (refundForm.amount_cents !== '') {
        payload.amount_cents = Number(refundForm.amount_cents)
      }

      const result = await createOrderRefund(activeOrderId, payload)
      if (result?.order_status) {
        setOrders((prev) => prev.map((o) => (o.id === activeOrderId ? { ...o, status: result.order_status } : o)))
      }
      setRefundSummary({
        refunded_total_cents: Number(result?.refunded_total_cents || 0),
        refundable_remaining_cents: Number(result?.refundable_remaining_cents || 0),
      })
      await loadOrderPanel(activeOrderId)
      setRefundForm({ amount_cents: '', reason: 'requested_by_customer', notes: '' })
      toast.success('Refund request created')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create refund')
    } finally {
      setSavingRefund(false)
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
        <div id="payment-admin-panel" className="rounded-[28px] border border-white/10 bg-white/5 p-5 sm:p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Payments</p>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-4xl">Payment Gateway and Billing</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Checkout is active for orders. Billing is managed through your configured payment provider, and refunds are handled from the admin console.
          </p>
        </div>

        <PaymentMethodsDashboard />

        <div id="payment-gateway-settings" className="rounded-[28px] border border-white/10 bg-white/5 p-5 sm:p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Gateway settings</p>
              <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">Active payment providers</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Review the gateways currently available for checkout. Razorpay handles INR orders and PayPal handles international payments.
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">Gateway options</span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">Razorpay</p>
              <p className="mt-1 text-sm text-slate-400">Best for INR checkout, UPI, cards, and wallets.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">PayPal</p>
              <p className="mt-1 text-sm text-slate-400">Best for international cards and wallet payments.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Total Orders</p>
            <p className="mt-2 text-2xl font-black text-white">{orders.length}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Paid Orders</p>
            <p className="mt-2 text-2xl font-black text-white">{paid.length}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Revenue</p>
            <p className="mt-2 text-2xl font-black text-white">{formatCurrency(revenue)}</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Current Plan: <span className="text-emerald-300 uppercase">{billing?.plan || 'free'}</span></p>
              <p className="text-xs text-slate-400">Customer: {billing?.stripe_customer_id || billing?.razorpay_customer_id || 'Not linked'}</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">Billing portal disabled</span>
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="overflow-x-auto rounded-[28px] border border-white/10 bg-white/5 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur-xl">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left">
                <tr>
                  <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Order</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Buyer</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Total</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Status</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Lifecycle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {orders.slice(0, 20).map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">#{o.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-slate-300">{o.buyer_name || o.buyer_email}</td>
                    <td className="px-4 py-3 text-slate-100">{formatCurrency(o.total_cents || 0)}</td>
                    <td className="px-4 py-3 text-slate-200 uppercase">{o.status}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openOrderManager(o.id)}
                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                      >
                        Manage
                      </button>
                    </td>
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

        {activeOrderId && (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 sm:p-5 space-y-4 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Order Lifecycle</p>
                <p className="font-mono text-sm text-white">#{activeOrderId.slice(0, 8)}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveOrderId(null)}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            {loadingOrderPanel ? (
              <div className="text-sm text-slate-400">Loading order details...</div>
            ) : (
              <>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <label className="block text-xs uppercase tracking-[0.15em] text-slate-500 mb-2">Update Status</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={updatingStatus}
                        onClick={() => handleStatusUpdate(activeOrderId, status)}
                        className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-60"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleShippingSave} className="rounded-2xl border border-white/10 bg-black/20 p-3 space-y-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Shipping Details</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={shippingForm.shipping_carrier}
                      onChange={(e) => setShippingForm((prev) => ({ ...prev, shipping_carrier: e.target.value }))}
                      placeholder="Carrier (e.g. UPS, FedEx)"
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                    />
                    <input
                      value={shippingForm.tracking_number}
                      onChange={(e) => setShippingForm((prev) => ({ ...prev, tracking_number: e.target.value }))}
                      placeholder="Tracking number"
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                    />
                    <input
                      type="datetime-local"
                      value={shippingForm.estimated_delivery}
                      onChange={(e) => setShippingForm((prev) => ({ ...prev, estimated_delivery: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                    <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={shippingForm.mark_shipped}
                        onChange={(e) => setShippingForm((prev) => ({ ...prev, mark_shipped: e.target.checked }))}
                      />
                      Mark order as shipped
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={savingShipping}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {savingShipping ? 'Saving...' : 'Save Shipping'}
                  </button>
                  {activeShipping && (
                    <p className="text-xs text-slate-400">
                      Current: {activeShipping.shipping_carrier || 'No carrier'} · {activeShipping.tracking_number || 'No tracking'}
                    </p>
                  )}
                </form>

                <form onSubmit={handleCreateRefund} className="rounded-2xl border border-white/10 bg-black/20 p-3 space-y-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Issue Refund</p>
                  <p className="text-xs text-slate-400">
                    Refunded: {formatCurrency(refundSummary.refunded_total_cents)} · Remaining: {formatCurrency(refundSummary.refundable_remaining_cents)}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <input
                      type="number"
                      min="1"
                      value={refundForm.amount_cents}
                      onChange={(e) => setRefundForm((prev) => ({ ...prev, amount_cents: e.target.value }))}
                      placeholder="Amount in cents (empty = full remaining)"
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 sm:col-span-2"
                    />
                    <select
                      value={refundForm.reason}
                      onChange={(e) => setRefundForm((prev) => ({ ...prev, reason: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    >
                      <option value="requested_by_customer">Requested by customer</option>
                      <option value="duplicate">Duplicate</option>
                      <option value="fraud">Fraud</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <input
                    value={refundForm.notes}
                    onChange={(e) => setRefundForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes (optional)"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={savingRefund || refundSummary.refundable_remaining_cents <= 0}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                  >
                    {savingRefund ? 'Creating Refund...' : 'Create Refund'}
                  </button>
                </form>

                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500 mb-3">Timeline</p>
                  {activeTimeline.length === 0 ? (
                    <p className="text-sm text-slate-400">No timeline entries yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {activeTimeline.map((event) => (
                        <div key={event.id} className="border-l-2 border-emerald-400/40 pl-3">
                          <p className="text-sm font-semibold text-white">{event.title || event.type}</p>
                          {event.description && <p className="text-sm text-slate-300">{event.description}</p>}
                          <p className="text-xs text-slate-500 mt-1">{new Date(event.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
