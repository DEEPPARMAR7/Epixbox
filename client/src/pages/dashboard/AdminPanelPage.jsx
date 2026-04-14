import { useEffect, useMemo, useState } from 'react'
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
  getAdminSystemOverview,
} from '../../api/adminApi'

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  )
}

export default function AdminPanelPage() {
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
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No transactions found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
