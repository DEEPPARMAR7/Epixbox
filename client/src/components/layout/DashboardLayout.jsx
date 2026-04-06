import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { logout as apiLogout } from '../../api/authApi'
import { getGalleries } from '../../api/galleryApi'
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)

  const resolveUsername = () => {
    const currentUsername = user?.username
    if (currentUsername) return currentUsername.toLowerCase()

    try {
      const authV2 = JSON.parse(localStorage.getItem('epixbox-auth') || '{}')
      if (authV2?.user?.username) return authV2.user.username.toLowerCase()
    } catch (error) {
      void error
    }

    try {
      const authV1 = JSON.parse(localStorage.getItem('auth-storage') || '{}')
      if (authV1?.state?.user?.username) return authV1.state.user.username.toLowerCase()
    } catch (error) {
      void error
    }

    return ''
  }

  const publicSiteUrl = resolveUsername() ? `/p/${resolveUsername()}` : '/dashboard/settings'

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false)
      }
    }

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('touchstart', handleOutsideClick)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [profileMenuOpen])

  useEffect(() => {
    setProfileMenuOpen(false)
  }, [location.pathname, location.search])

  const goTo = (path) => {
    setProfileMenuOpen(false)
    navigate(path)
  }

  const handleLogout = async () => {
    try { await apiLogout() } catch (error) { void error }
    logout()
    navigate('/login')
    toast.success('Logged out')
  }

  const handleUploadClick = async () => {
    try {
      const galleries = await getGalleries()
      if (galleries?.length > 0) {
        navigate(`/dashboard/galleries/${galleries[0].id}/upload`)
        return
      }
      navigate('/dashboard/galleries')
      toast('Create a gallery first, then upload files there.')
    } catch (error) {
      void error
      navigate('/dashboard/galleries')
      toast.error('Could not open upload screen')
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#05070d] text-slate-100">
      <header className="border-b border-white/10 bg-[#05070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-2xl font-black tracking-tight text-white">
              EpicBox
            </Link>
            <button
              type="button"
              onClick={handleUploadClick}
              className="hidden sm:inline-flex items-center rounded-full bg-emerald-300 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#06210f] hover:bg-emerald-200 transition"
            >
              Upload
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={clsx(
                    'rounded-full px-3 py-2 text-sm font-semibold transition-colors',
                    isActive ? 'bg-emerald-300/15 text-emerald-200 ring-1 ring-emerald-300/25' : 'text-slate-300 hover:text-white hover:bg-white/5'
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
              href={publicSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline text-xs font-semibold text-slate-300 hover:text-white"
            >
              View Site
            </a>
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="h-9 w-9 rounded-full bg-emerald-200/15 text-emerald-200 font-bold text-sm uppercase ring-1 ring-emerald-200/25 transition hover:bg-emerald-200/25"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                aria-label="Open profile menu"
              >
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#080c17] shadow-2xl shadow-black/40">
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="truncate text-sm font-semibold text-white">{user?.email || user?.username || 'User'}</p>
                  </div>

                  <div className="p-2">
                    <button onClick={() => goTo('/dashboard')} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5">
                      <span>Quickstart Guide</span>
                      <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-200">NEW</span>
                    </button>
                    <button onClick={() => goTo('/dashboard/profile')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5">Edit My Profile</button>
                    <button onClick={() => goTo('/dashboard/settings?category=site&tab=branding')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5">Edit Site Profile</button>
                    <button onClick={() => goTo('/dashboard/settings?category=site&tab=general')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5">Site Settings</button>
                  </div>

                  <div className="border-t border-white/10 p-2">
                    <button onClick={() => goTo('/dashboard/proofing')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5">Shared With Me</button>
                    <button onClick={() => goTo('/dashboard/pricing')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5">EpicBox Perks</button>
                    <button onClick={() => goTo('/dashboard/galleries')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5">EpicBox Apps</button>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false)
                        handleLogout()
                      }}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-300 hover:bg-rose-500/10"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-64px)] overflow-y-auto bg-[radial-gradient(circle_at_8%_0%,rgba(39,209,190,0.13),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(59,130,246,0.12),transparent_30%),#05070d] p-4 sm:p-6">
        <div className="mx-auto w-full max-w-[1280px]">
          {children}
        </div>
      </main>
    </div>
  )
}
