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
    <div className="h-screen overflow-hidden bg-[#05070d] text-slate-100">
      <header className="border-b border-white/10 bg-[#060c16]/95">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-2xl font-black tracking-tight text-white">
              EpicBox
            </Link>
            <button className="hidden sm:inline-flex items-center rounded-full bg-emerald-300 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#06210f] hover:bg-emerald-200 transition">
              Upload
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={clsx(
                    'rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                    isActive ? 'text-emerald-300' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-300/30">
              7 DAYS LEFT
            </span>
            <button className="hidden sm:inline-flex items-center rounded-full bg-emerald-300 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#06210f] hover:bg-emerald-200 transition">
              Subscribe
            </button>
            <a
              href={`/p/${user?.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline text-xs font-semibold text-slate-300 hover:text-white"
            >
              View Site
            </a>
            <div className="w-8 h-8 bg-emerald-200/15 rounded-full flex items-center justify-center text-emerald-200 font-bold text-sm uppercase ring-1 ring-emerald-200/25">
              {user?.first_name?.[0] || user?.username?.[0] || 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="hidden sm:inline text-xs font-medium text-slate-400 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-64px)] overflow-y-auto bg-[radial-gradient(circle_at_8%_0%,rgba(39,209,190,0.13),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(59,130,246,0.12),transparent_30%),#05070d] p-4 sm:p-6">
        <div className="mx-auto w-full max-w-[1200px]">
          {children}
        </div>
      </main>
    </div>
  )
}
