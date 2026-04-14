import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Spinner from '../../components/common/Spinner'
import { getAdminAnalytics, getAdminUsers, updateAdminUserStatus, updateAdminUserVerification } from '../../api/adminApi'

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
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')

  const totals = useMemo(() => analytics?.totals || {}, [analytics])

  const load = async (searchText = '') => {
    try {
      const [a, u] = await Promise.all([
        getAdminAnalytics(),
        getAdminUsers({ page: 1, limit: 30, search: searchText || undefined }),
      ])
      setAnalytics(a)
      setUsers(u.items || [])
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
          <p className="mt-2 text-sm text-red-200">Your account does not have admin privileges.</p>
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
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => toggleVerified(u)} className="rounded-md border border-white/20 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/10">
                        {u.email_verified ? 'Mark Unverified' : 'Mark Verified'}
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
      </div>
    </DashboardLayout>
  )
}
