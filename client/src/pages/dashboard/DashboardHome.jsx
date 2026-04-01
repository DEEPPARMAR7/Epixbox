import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Spinner from '../../components/common/Spinner'
import { getGalleries } from '../../api/galleryApi'
import { getMyOrders } from '../../api/orderApi'
import { formatCurrency, formatDate } from '../../utils/formatters'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=70',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=70',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=70',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=70',
  'https://images.unsplash.com/photo-1502657877623-f66bf489d236?w=400&q=70',
]

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-emerald-100 text-emerald-700',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  cancelled: 'bg-red-100 text-red-800',
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-1">{label}</p>
          <p className="text-3xl font-black">{value}</p>
        </div>
        <span className="text-3xl opacity-80">{icon}</span>
      </div>
      <div className="absolute -bottom-3 -right-3 w-20 h-20 rounded-full bg-white/10" />
    </div>
  )
}

export default function DashboardHome() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [galleries, setGalleries] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getGalleries(), getMyOrders()])
      .then(([g, o]) => { setGalleries(g); setOrders(o) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalPhotos = galleries.reduce((s, g) => s + (g.photos_count || 0), 0)
  const monthOrders = orders.filter(o => new Date(o.created_at).getMonth() === new Date().getMonth())
  const monthRevenue = monthOrders.filter(o => o.status === 'paid').reduce((s, o) => s + (o.total_cents || 0), 0)

  const handleCopyPortfolioLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${user?.username}`)
    toast.success('Portfolio link copied!')
  }

  return (
    <DashboardLayout>
      {/* Header greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Hello, {user?.first_name || user?.username} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here's your photography business at a glance.</p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleCopyPortfolioLink}
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            <span>🔗</span> Copy Link
          </button>
          <a
            href={`/p/${user?.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition shadow-sm"
          >
            <span>🌐</span> View Portfolio ↗
          </a>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : (
        <div className="space-y-8">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Galleries" value={galleries.length} icon="🖼️" color="bg-gradient-to-br from-indigo-500 to-indigo-700" />
            <StatCard label="Photos" value={totalPhotos.toLocaleString()} icon="📷" color="bg-gradient-to-br from-violet-500 to-violet-700" />
            <StatCard label="Orders" value={monthOrders.length} icon="📦" color="bg-gradient-to-br from-sky-500 to-sky-700" />
            <StatCard label="Revenue" value={formatCurrency(monthRevenue)} icon="💰" color="bg-gradient-to-br from-emerald-500 to-emerald-700" />
          </div>

          {/* Portfolio banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gray-900 text-white p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div
              className="absolute inset-0 opacity-20 bg-cover bg-center"
              style={{ backgroundImage: `url(https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1400&q=60)` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/40" />
            <div className="relative z-10">
              <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-2">Your Public Portfolio</p>
              <p className="text-2xl font-black text-white">epicbox.app/p/{user?.username}</p>
              <p className="text-white/40 text-sm mt-1">
                {galleries.filter(g => g.visibility === 'public').length} public {galleries.filter(g => g.visibility === 'public').length === 1 ? 'gallery' : 'galleries'} · {totalPhotos} photos
              </p>
            </div>
            <div className="relative z-10 flex gap-3 flex-shrink-0">
              <a
                href={`/p/${user?.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition whitespace-nowrap"
              >
                Open ↗
              </a>
              <button
                onClick={handleCopyPortfolioLink}
                className="bg-white/10 border border-white/20 text-white font-medium px-4 py-2.5 rounded-xl text-sm hover:bg-white/20 transition whitespace-nowrap"
              >
                Copy Link
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/dashboard/galleries')}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition group text-left"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-indigo-100 transition">🖼️</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">New Gallery</p>
                  <p className="text-xs text-gray-400 mt-0.5">Organize your work</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/dashboard/proofing')}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:border-violet-200 hover:shadow-md transition group text-left"
              >
                <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-violet-100 transition">✅</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Client Proofing</p>
                  <p className="text-xs text-gray-400 mt-0.5">Share for review</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/dashboard/pricing')}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-md transition group text-left"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-emerald-100 transition">💰</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Pricing</p>
                  <p className="text-xs text-gray-400 mt-0.5">Set print prices</p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent galleries */}
          {galleries.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Recent Galleries</h2>
                <Link to="/dashboard/galleries" className="text-sm text-indigo-600 font-medium hover:underline">View all →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleries.slice(0, 3).map((g, i) => (
                  <Link
                    key={g.id}
                    to={`/dashboard/galleries/${g.id}/edit`}
                    className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={g.cover_url || COVER_IMAGES[i % COVER_IMAGES.length]}
                        alt={g.title}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        onError={e => { e.target.src = COVER_IMAGES[i % COVER_IMAGES.length] }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        g.visibility === 'public' ? 'bg-emerald-500 text-white' :
                        g.visibility === 'private' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {g.visibility}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-gray-900 text-sm truncate">{g.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{g.photos_count || 0} photos</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent orders */}
          {orders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Recent Orders</h2>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50/50">
                    <tr>
                      <th className="text-left text-xs text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">Order</th>
                      <th className="text-left text-xs text-gray-400 font-semibold uppercase tracking-wider px-4 py-3">Date</th>
                      <th className="text-left text-xs text-gray-400 font-semibold uppercase tracking-wider px-4 py-3">Buyer</th>
                      <th className="text-left text-xs text-gray-400 font-semibold uppercase tracking-wider px-4 py-3">Total</th>
                      <th className="text-left text-xs text-gray-400 font-semibold uppercase tracking-wider px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 font-mono text-xs text-gray-400">#{o.id.slice(0, 8)}</td>
                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{formatDate(o.created_at)}</td>
                        <td className="px-4 py-4 text-gray-700 font-medium truncate max-w-[140px]">{o.buyer_name || o.buyer_email}</td>
                        <td className="px-4 py-4 font-semibold text-gray-900">{formatCurrency(o.total_cents || 0)}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state */}
          {galleries.length === 0 && orders.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="text-5xl mb-4">📷</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Start building your portfolio</h3>
              <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Create your first gallery, upload photos, and share your work with the world.</p>
              <Link
                to="/dashboard/galleries"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
              >
                + Create First Gallery
              </Link>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
