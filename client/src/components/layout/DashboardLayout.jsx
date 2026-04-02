import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { logout as apiLogout } from '../../api/authApi'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊', exact: true },
  { to: '/dashboard/galleries', label: 'Library', icon: '🖼️' },
  { to: '/dashboard/proofing', label: 'Organize', icon: '🧭' },
  { to: '/dashboard/settings', label: 'My Site', icon: '🌐' },
  { to: '/dashboard/pricing', label: 'Selling Tools', icon: '💰' },
]

export default function DashboardLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try { await apiLogout() } catch {}
    logout()
    navigate('/login')
    toast.success('Logged out')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#05070d] text-slate-100">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-white/10 bg-[#0a0f19] lg:flex lg:flex-col lg:flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link to="/dashboard" className="text-lg font-black tracking-tight text-white">
            EpicBox
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-300/40'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <a
            href={`/p/${user?.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-emerald-300 hover:text-white hover:bg-emerald-500/20 rounded-xl transition-colors"
          >
            <span>🌐</span>
            View My Portfolio ↗
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <span>🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-[#060c16]/95 border-b border-white/10 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="lg:hidden text-base font-black tracking-tight text-white"
            >
              EpicBox
            </Link>
            <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-300/20 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-300/30">
              7 Days Left
            </span>
            <h1 className="text-sm sm:text-base font-semibold text-slate-200">
              {navItems.find(n => n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={`/p/${user?.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center rounded-full bg-emerald-300 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-[#06210f] hover:bg-emerald-200 transition"
            >
              View Site
            </a>
            <div className="w-8 h-8 bg-emerald-200/15 rounded-full flex items-center justify-center text-emerald-200 font-bold text-sm uppercase ring-1 ring-emerald-200/25">
              {user?.first_name?.[0] || user?.username?.[0] || 'U'}
            </div>
            <span className="hidden sm:inline text-sm text-slate-300 font-medium max-w-[180px] truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_8%_0%,rgba(39,209,190,0.13),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(59,130,246,0.12),transparent_30%),#05070d] p-4 sm:p-6">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
