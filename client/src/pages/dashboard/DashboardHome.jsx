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

const STARTER_CARDS = [
  {
    title: 'Upload Photos',
    description: 'Create a gallery and start adding images for clients or personal albums.',
    action: 'Create a Gallery',
    to: '/dashboard/galleries',
    icon: '⬆️',
  },
  {
    title: 'View Your Site',
    description: 'Open the public portfolio to see how visitors experience your work.',
    action: 'View Site',
    to: null,
    icon: '🌐',
  },
  {
    title: 'Share Photos',
    description: 'Send galleries or proofing links to clients for quick review.',
    action: 'Open Proofing',
    to: '/dashboard/proofing',
    icon: '✉️',
  },
  {
    title: 'Review Watermark',
    description: 'Tune branding and site settings so protected previews look right.',
    action: 'Site Settings',
    to: '/dashboard/settings',
    icon: '🛡️',
  },
  {
    title: 'Review Pricing',
    description: 'Set print and product prices before turning on sales tools.',
    action: 'Open Pricing',
    to: '/dashboard/pricing',
    icon: '💰',
  },
]

function StarterCard({ title, description, action, to, icon, onAction }) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-300/15 text-xl ring-1 ring-emerald-300/25">
          {icon}
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200/70">
          Getting Started
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      <div className="mt-5">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition group-hover:text-emerald-200">
          {action}
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </>
  )

  if (onAction) {
    return (
      <button
        type="button"
        onClick={onAction}
        className="group block w-full rounded-2xl border border-white/10 bg-[#0b1020] p-5 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition hover:-translate-y-0.5 hover:border-emerald-300/30 hover:bg-[#0d1426]"
      >
        {content}
      </button>
    )
  }

  return to ? (
    <Link
      to={to}
      className="group block rounded-2xl border border-white/10 bg-[#0b1020] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition hover:-translate-y-0.5 hover:border-emerald-300/30 hover:bg-[#0d1426]"
    >
      {content}
    </Link>
  ) : (
    <div className="rounded-2xl border border-white/10 bg-[#0b1020] p-5">{content}</div>
  )
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
  const publicGalleries = galleries.filter(g => g.visibility === 'public')

  const handleCopyPortfolioLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${user?.username}`)
    toast.success('Portfolio link copied!')
  }

  return (
    <DashboardLayout>
      <div className="mb-8 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)] sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-200/70">Dashboard</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Welcome {user?.first_name || user?.username || 'Back'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Start with the basics below, then manage galleries, proofing, pricing, and your public site from one place.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-2xl lg:flex-1">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Public galleries</p>
              <p className="mt-2 text-2xl font-black text-white">{publicGalleries.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Photos</p>
              <p className="mt-2 text-2xl font-black text-white">{totalPhotos.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Revenue</p>
              <p className="mt-2 text-2xl font-black text-white">{formatCurrency(monthRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleCopyPortfolioLink}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Copy Portfolio Link
          </button>
          <a
            href={`/p/${user?.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-4 py-2.5 text-sm font-extrabold uppercase tracking-wide text-[#06210f] transition hover:bg-emerald-200"
          >
            View Site ↗
          </a>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : (
        <div className="space-y-8">
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Getting Started</h2>
              <p className="mt-2 text-sm text-slate-500">Use these shortcuts to build the same workflow style you showed in the screenshot.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {STARTER_CARDS.map((card) => (
                <StarterCard
                  key={card.title}
                  title={card.title}
                  description={card.description}
                  action={card.action}
                  to={card.title === 'Share Photos' ? undefined : (card.title === 'View Your Site' ? `/p/${user?.username || ''}` : card.to)}
                  icon={card.icon}
                  onAction={card.title === 'Share Photos' ? handleCopyPortfolioLink : undefined}
                />
              ))}
            </div>
            <div className="mt-4 text-sm text-slate-400">
              Looking for more tips? Check out the <Link to="/dashboard/settings" className="font-semibold text-emerald-300 hover:text-emerald-200">Quickstart Guide</Link>.
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Galleries" value={galleries.length} icon="🖼️" color="bg-gradient-to-br from-indigo-500 to-indigo-700" />
            <StatCard label="Photos" value={totalPhotos.toLocaleString()} icon="📷" color="bg-gradient-to-br from-violet-500 to-violet-700" />
            <StatCard label="Orders" value={monthOrders.length} icon="📦" color="bg-gradient-to-br from-sky-500 to-sky-700" />
            <StatCard label="Revenue" value={formatCurrency(monthRevenue)} icon="💰" color="bg-gradient-to-br from-emerald-500 to-emerald-700" />
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/dashboard/galleries')}
                className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-300/30 hover:bg-emerald-400/10 transition group text-left"
              >
                <div className="w-12 h-12 bg-emerald-300/15 rounded-xl flex items-center justify-center text-2xl group-hover:bg-emerald-300/25 transition">🖼️</div>
                <div>
                  <p className="font-semibold text-white text-sm">New Gallery</p>
                  <p className="text-xs text-slate-400 mt-0.5">Organize your work</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/dashboard/proofing')}
                className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-sky-300/30 hover:bg-sky-400/10 transition group text-left"
              >
                <div className="w-12 h-12 bg-sky-300/15 rounded-xl flex items-center justify-center text-2xl group-hover:bg-sky-300/25 transition">✅</div>
                <div>
                  <p className="font-semibold text-white text-sm">Client Proofing</p>
                  <p className="text-xs text-slate-400 mt-0.5">Share for review</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/dashboard/pricing')}
                className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-amber-300/30 hover:bg-amber-400/10 transition group text-left"
              >
                <div className="w-12 h-12 bg-amber-300/15 rounded-xl flex items-center justify-center text-2xl group-hover:bg-amber-300/25 transition">💰</div>
                <div>
                  <p className="font-semibold text-white text-sm">Pricing</p>
                  <p className="text-xs text-slate-400 mt-0.5">Set print prices</p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent galleries */}
          {galleries.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Recent Galleries</h2>
                <Link to="/dashboard/galleries" className="text-sm text-emerald-300 font-medium hover:underline">View all →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleries.slice(0, 3).map((g, i) => (
                  <Link
                    key={g.id}
                    to={`/dashboard/galleries/${g.id}/edit`}
                    className="group block bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition"
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
                      <p className="font-semibold text-white text-sm truncate">{g.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{g.photos_count || 0} photos</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent orders */}
          {orders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Recent Orders</h2>
              <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="text-left text-xs text-slate-400 font-semibold uppercase tracking-wider px-6 py-3">Order</th>
                      <th className="text-left text-xs text-slate-400 font-semibold uppercase tracking-wider px-4 py-3">Date</th>
                      <th className="text-left text-xs text-slate-400 font-semibold uppercase tracking-wider px-4 py-3">Buyer</th>
                      <th className="text-left text-xs text-slate-400 font-semibold uppercase tracking-wider px-4 py-3">Total</th>
                      <th className="text-left text-xs text-slate-400 font-semibold uppercase tracking-wider px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-white/5 transition">
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">#{o.id.slice(0, 8)}</td>
                        <td className="px-4 py-4 text-slate-300 whitespace-nowrap">{formatDate(o.created_at)}</td>
                        <td className="px-4 py-4 text-slate-200 font-medium truncate max-w-[140px]">{o.buyer_name || o.buyer_email}</td>
                        <td className="px-4 py-4 font-semibold text-white">{formatCurrency(o.total_cents || 0)}</td>
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
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/20">
              <div className="text-5xl mb-4">📷</div>
              <h3 className="text-lg font-bold text-white mb-2">Start building your portfolio</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">Create your first gallery, upload photos, and share your work with the world.</p>
              <Link
                to="/dashboard/galleries"
                className="inline-flex items-center gap-2 bg-emerald-300 text-[#06210f] px-6 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wide hover:bg-emerald-200 transition"
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
