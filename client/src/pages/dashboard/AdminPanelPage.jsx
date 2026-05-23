import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Spinner from '../../components/common/Spinner'
import {
  getAdminAnalytics,
  getAdminUsers,
  updateAdminUserStatus,
  updateAdminUserVerification,
  deleteAdminUser,
  resetAdminUserPassword,
  getAdminMediaOverview,
  getAdminPhotos,
  deleteAdminPhoto,
  getAdminTransactions,
  getAdminTransactionDetail,
  updateAdminTransactionStatus,
  updateAdminTransactionShipping,
  createAdminTransactionRefund,
  getAdminSystemOverview,
} from '../../api/adminApi'

const ORDER_STATUS_OPTIONS = ['pending', 'paid', 'processing', 'shipped', 'cancelled']

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  )
}

export default function AdminPanelPage() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [activeTab, setActiveTab] = useState('users')
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [mediaOverview, setMediaOverview] = useState(null)
  const [photos, setPhotos] = useState([])
  const [transactions, setTransactions] = useState([])
  const [systemOverview, setSystemOverview] = useState(null)
  const [search, setSearch] = useState('')
  const [activeTransactionId, setActiveTransactionId] = useState(null)
  const [transactionDetail, setTransactionDetail] = useState(null)
  const [loadingTransactionDetail, setLoadingTransactionDetail] = useState(false)
  const [updatingTransaction, setUpdatingTransaction] = useState(false)
  const [transactionShippingForm, setTransactionShippingForm] = useState({
    shipping_carrier: '',
    tracking_number: '',
    estimated_delivery: '',
    mark_shipped: false,
  })
  const [transactionRefundForm, setTransactionRefundForm] = useState({ amount_cents: '', reason: 'requested_by_customer', notes: '' })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const requestedTab = params.get('tab')
    if (requestedTab && ['users', 'media', 'payments', 'system'].includes(requestedTab)) {
      setActiveTab(requestedTab)
    }
  }, [location.search])

  const totals = useMemo(() => analytics?.totals || {}, [analytics])

  const load = async (searchText = '') => {
    try {
      const [a, u, m, p, t, s] = await Promise.all([
        getAdminAnalytics(),
        getAdminUsers({ page: 1, limit: 30, search: searchText || undefined }),
        getAdminMediaOverview(),
        getAdminPhotos({ page: 1, limit: 20 }),
        getAdminTransactions({ page: 1, limit: 20 }),
        getAdminSystemOverview(),
      ])
      setAnalytics(a)
      setUsers(u.items || [])
      setMediaOverview(m)
      setPhotos(p.items || [])
      setTransactions(t.items || [])
      setSystemOverview(s)
      setForbidden(false)
    } catch (err) {
      if (err?.response?.status === 403) {
        setForbidden(true)
      } else {
        toast.error(err?.response?.data?.error || 'Failed to load admin panel')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onSearch = (e) => {
    e.preventDefault()
    load(search.trim())
  }

  const toggleActive = async (user) => {
    try {
      const next = !user.is_active
      await updateAdminUserStatus(user.id, next)
      setUsers(prev => prev.map(x => (x.id === user.id ? { ...x, is_active: next } : x)))
      toast.success(next ? 'User activated' : 'User deactivated')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update user status')
    }
  }

  const toggleVerified = async (user) => {
    try {
      const next = !user.email_verified
      await updateAdminUserVerification(user.id, next)
      setUsers(prev => prev.map(x => (x.id === user.id ? { ...x, email_verified: next } : x)))
      toast.success(next ? 'Email marked verified' : 'Email marked unverified')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update verification')
    }
  }

  const removeUser = async (user) => {
    if (!window.confirm(`Delete user ${user.email}? This cannot be undone.`)) return
    try {
      await deleteAdminUser(user.id)
      setUsers(prev => prev.filter(x => x.id !== user.id))
      toast.success('User deleted')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to delete user')
    }
  }

  const resetPassword = async (user) => {
    if (!window.confirm(`Reset password for ${user.email}?`)) return
    try {
      const res = await resetAdminUserPassword(user.id)
      window.alert(`Temporary password for ${user.email}: ${res.temporaryPassword}`)
      toast.success('Temporary password generated')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to reset password')
    }
  }

  const removePhoto = async (photo) => {
    if (!window.confirm(`Delete photo ${photo.filename_original || photo.title || photo.id}?`)) return
    try {
      await deleteAdminPhoto(photo.id)
      setPhotos(prev => prev.filter(x => x.id !== photo.id))
      toast.success('Photo removed')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to delete photo')
    }
  }

  const openTransactionDetail = async (id) => {
    setActiveTransactionId(id)
    setLoadingTransactionDetail(true)
    try {
      const detail = await getAdminTransactionDetail(id)
      setTransactionDetail(detail)
      const shipping = detail?.order || {}
      setTransactionShippingForm({
        shipping_carrier: shipping.shipping_carrier || '',
        tracking_number: shipping.tracking_number || '',
        estimated_delivery: shipping.estimated_delivery ? new Date(shipping.estimated_delivery).toISOString().slice(0, 16) : '',
        mark_shipped: false,
      })
      setTransactionRefundForm({ amount_cents: '', reason: 'requested_by_customer', notes: '' })
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to load transaction detail')
      setActiveTransactionId(null)
    } finally {
      setLoadingTransactionDetail(false)
    }
  }

  const refreshTransactionDetail = async () => {
    if (!activeTransactionId) return
    const detail = await getAdminTransactionDetail(activeTransactionId)
    setTransactionDetail(detail)
  }

  const handleAdminStatusUpdate = async (status) => {
    if (!activeTransactionId) return
    setUpdatingTransaction(true)
    try {
      const updated = await updateAdminTransactionStatus(activeTransactionId, status)
      setTransactions(prev => prev.map(t => (t.id === activeTransactionId ? { ...t, status: updated.status } : t)))
      await refreshTransactionDetail()
      toast.success('Transaction status updated')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update status')
    } finally {
      setUpdatingTransaction(false)
    }
  }

  const handleAdminShippingSave = async (e) => {
    e.preventDefault()
    if (!activeTransactionId) return
    setUpdatingTransaction(true)
    try {
      await updateAdminTransactionShipping(activeTransactionId, {
        shipping_carrier: transactionShippingForm.shipping_carrier || null,
        tracking_number: transactionShippingForm.tracking_number || null,
        estimated_delivery: transactionShippingForm.estimated_delivery ? new Date(transactionShippingForm.estimated_delivery).toISOString() : null,
        mark_shipped: transactionShippingForm.mark_shipped,
      })
      await refreshTransactionDetail()
      setTransactionShippingForm((prev) => ({ ...prev, mark_shipped: false }))
      toast.success('Shipping updated')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update shipping')
    } finally {
      setUpdatingTransaction(false)
    }
  }

  const handleAdminRefundCreate = async (e) => {
    e.preventDefault()
    if (!activeTransactionId) return
    setUpdatingTransaction(true)
    try {
      const payload = {
        reason: transactionRefundForm.reason,
        notes: transactionRefundForm.notes || null,
      }
      if (transactionRefundForm.amount_cents !== '') payload.amount_cents = Number(transactionRefundForm.amount_cents)
      await createAdminTransactionRefund(activeTransactionId, payload)
      await refreshTransactionDetail()
      toast.success('Refund created')
      setTransactionRefundForm({ amount_cents: '', reason: 'requested_by_customer', notes: '' })
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create refund')
    } finally {
      setUpdatingTransaction(false)
    }
  }

  const formatBytes = (bytes) => {
    const value = Number(bytes || 0)
    if (value < 1024) return `${value} B`
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
    if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`
    return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-16"><Spinner /></div>
      </DashboardLayout>
    )
  }

  if (forbidden) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
          <h1 className="text-xl font-bold text-white">Admin access required</h1>
          <p className="mt-2 text-sm text-red-200">Only owner account can access this panel. Ensure your login email is listed in OWNER_EMAILS (backend) and VITE_OWNER_EMAILS (frontend).</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin Panel</p>
          <h1 className="mt-2 text-3xl font-black text-white">User Authentication and Access</h1>
          <p className="mt-2 text-sm text-slate-400">Manage active accounts and email verification to strengthen authentication controls.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <Stat label="Users" value={totals.users || 0} />
          <Stat label="Galleries" value={totals.galleries || 0} />
          <Stat label="Photos" value={totals.photos || 0} />
          <Stat label="Orders" value={totals.orders || 0} />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ['users', 'Manage Users'],
            ['media', 'Photos and Galleries'],
            ['payments', 'Manage Payments'],
            ['system', 'Monitor System'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === key ? 'bg-blue-600 text-white' : 'border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <form onSubmit={onSearch} className="flex gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users by email or username"
                  className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                />
                <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Search</button>
              </form>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-left">
                  <tr>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">User</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Email</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Active</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Verified</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 text-slate-200">{u.first_name || ''} {u.last_name || ''} {u.username ? `(${u.username})` : ''}</td>
                      <td className="px-4 py-3 text-slate-300">{u.email}</td>
                      <td className="px-4 py-3">{u.is_active ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3">{u.email_verified ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => toggleActive(u)} className="rounded-md border border-white/20 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/10">
                            {u.is_active ? 'Suspend' : 'Activate'}
                          </button>
                          <button onClick={() => toggleVerified(u)} className="rounded-md border border-white/20 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/10">
                            {u.email_verified ? 'Unverify' : 'Verify'}
                          </button>
                          <button onClick={() => resetPassword(u)} className="rounded-md border border-amber-300/40 px-2.5 py-1 text-xs text-amber-200 hover:bg-amber-300/10">
                            Reset Password
                          </button>
                          <button onClick={() => removeUser(u)} className="rounded-md border border-red-400/40 px-2.5 py-1 text-xs text-red-300 hover:bg-red-400/10">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'media' && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Total Photos" value={mediaOverview?.totals?.photos || 0} />
              <Stat label="Storage Used" value={formatBytes(mediaOverview?.totals?.storageBytes || 0)} />
              <Stat label="Uploads (7d)" value={mediaOverview?.activity7d?.uploads || 0} />
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-left">
                  <tr>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Photo</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Owner</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Size</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {photos.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 text-slate-200">{p.title || p.filename_original || p.id}</td>
                      <td className="px-4 py-3 text-slate-300">{p.User?.email || p.user_id}</td>
                      <td className="px-4 py-3 text-slate-300">{formatBytes(p.file_size_bytes)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => removePhoto(p)} className="rounded-md border border-red-400/40 px-2.5 py-1 text-xs text-red-300 hover:bg-red-400/10">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {photos.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No photos found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Paid revenue across all successful transactions: <span className="font-bold text-white">${((transactions.reduce((sum, t) => sum + (t.status === 'paid' ? (t.total_cents || 0) : 0), 0)) / 100).toFixed(2)}</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-left">
                  <tr>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Order</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Buyer</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Amount</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Status</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Stripe Ref</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-3 font-mono text-xs text-slate-300">#{t.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-slate-300">{t.buyer_name || t.buyer_email}</td>
                      <td className="px-4 py-3 text-slate-200">${((t.total_cents || 0) / 100).toFixed(2)}</td>
                      <td className="px-4 py-3 uppercase text-slate-200">{t.status}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{t.stripe_payment_intent_id || 'n/a'}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openTransactionDetail(t.id)}
                          className="rounded-md border border-white/20 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/10"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No transactions found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {activeTransactionId && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Transaction #{activeTransactionId.slice(0, 8)}</p>
                  <button
                    type="button"
                    onClick={() => { setActiveTransactionId(null); setTransactionDetail(null) }}
                    className="rounded-md border border-white/20 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>

                {loadingTransactionDetail || !transactionDetail ? (
                  <p className="text-sm text-slate-400">Loading transaction detail...</p>
                ) : (
                  <>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500 mb-2">Update Status</p>
                      <div className="flex flex-wrap gap-2">
                        {ORDER_STATUS_OPTIONS.map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={updatingTransaction}
                            onClick={() => handleAdminStatusUpdate(status)}
                            className="rounded-md border border-white/20 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/10 disabled:opacity-60"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleAdminShippingSave} className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-2">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Shipping</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input value={transactionShippingForm.shipping_carrier} onChange={(e) => setTransactionShippingForm(prev => ({ ...prev, shipping_carrier: e.target.value }))} placeholder="Carrier" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500" />
                        <input value={transactionShippingForm.tracking_number} onChange={(e) => setTransactionShippingForm(prev => ({ ...prev, tracking_number: e.target.value }))} placeholder="Tracking" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500" />
                        <input type="datetime-local" value={transactionShippingForm.estimated_delivery} onChange={(e) => setTransactionShippingForm(prev => ({ ...prev, estimated_delivery: e.target.value }))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
                        <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                          <input type="checkbox" checked={transactionShippingForm.mark_shipped} onChange={(e) => setTransactionShippingForm(prev => ({ ...prev, mark_shipped: e.target.checked }))} />
                          Mark shipped
                        </label>
                      </div>
                      <button type="submit" disabled={updatingTransaction} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60">Save Shipping</button>
                    </form>

                    <form onSubmit={handleAdminRefundCreate} className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-2">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Create Refund</p>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <input type="number" min="1" value={transactionRefundForm.amount_cents} onChange={(e) => setTransactionRefundForm(prev => ({ ...prev, amount_cents: e.target.value }))} placeholder="Amount cents" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500" />
                        <select value={transactionRefundForm.reason} onChange={(e) => setTransactionRefundForm(prev => ({ ...prev, reason: e.target.value }))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
                          <option value="requested_by_customer">Requested by customer</option>
                          <option value="duplicate">Duplicate</option>
                          <option value="fraud">Fraud</option>
                          <option value="other">Other</option>
                        </select>
                        <button type="submit" disabled={updatingTransaction} className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60">Create Refund</button>
                      </div>
                      <input value={transactionRefundForm.notes} onChange={(e) => setTransactionRefundForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Notes" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500" />
                    </form>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500 mb-2">Timeline</p>
                      {(transactionDetail.timeline || []).length === 0 ? (
                        <p className="text-sm text-slate-400">No timeline entries</p>
                      ) : (
                        <div className="space-y-2">
                          {(transactionDetail.timeline || []).map((event) => (
                            <div key={event.id} className="border-l-2 border-blue-300/40 pl-3">
                              <p className="text-sm font-semibold text-white">{event.title || event.type}</p>
                              {event.description && <p className="text-sm text-slate-300">{event.description}</p>}
                              <p className="text-xs text-slate-500">{new Date(event.created_at).toLocaleString()}</p>
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
        )}

        {activeTab === 'system' && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Environment" value={systemOverview?.runtime?.env || 'n/a'} />
              <Stat label="Uptime (sec)" value={systemOverview?.runtime?.uptimeSec || 0} />
              <Stat label="DB Health" value={systemOverview?.health?.database || 'n/a'} />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p>Requests tracked: <span className="font-semibold text-white">{systemOverview?.monitoring?.requestCount || 0}</span></p>
              <p>Average latency: <span className="font-semibold text-white">{systemOverview?.monitoring?.avgLatencyMs || 0} ms</span></p>
              <p>5xx responses: <span className="font-semibold text-white">{systemOverview?.monitoring?.errorResponses || 0}</span></p>
              <p className="mt-2 text-xs text-slate-400">{systemOverview?.logsHint || 'Use server logs and Sentry for detailed traces.'}</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
