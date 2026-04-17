import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { logout as apiLogout } from '../../api/authApi'
import { getGalleries } from '../../api/galleryApi'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { MoreVertical, Upload, LayoutDashboard, Images, Compass, Globe, CreditCard, User, LogOut } from 'lucide-react'
import BottomSheet from '../common/BottomSheet'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊', exact: true },
  { to: '/dashboard/galleries', label: 'Library', icon: '🖼️' },
  { to: '/dashboard/organize', label: 'Organize', icon: '🧭' },
  { to: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
  { to: '/dashboard/payments', label: 'Payments', icon: '💳' },
  { to: '/dashboard/settings', label: 'My Site', icon: '🌐' },
  { to: '/dashboard/themes', label: 'Themes', icon: '🎨' },
  { to: '/dashboard/pricing', label: 'Selling Tools', icon: '💰' },
]

export default function DashboardLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)
  const ownerEmails = String(import.meta.env.VITE_OWNER_EMAILS || '').split(',').map((v) => v.trim().toLowerCase()).filter(Boolean)
  const isOwner = ownerEmails.includes(String(user?.email || '').toLowerCase())

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

    const handleScrollClose = () => {
      setProfileMenuOpen(false)
    }

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('touchstart', handleOutsideClick)
      document.addEventListener('keydown', handleEscape)
      window.addEventListener('scroll', handleScrollClose, true)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('scroll', handleScrollClose, true)
    }
  }, [profileMenuOpen])

  useEffect(() => {
    setProfileMenuOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname, location.search])

  const goTo = (path) => {
    setProfileMenuOpen(false)
    setMobileMenuOpen(false)
    navigate(path)
  }

  const handleLogout = async () => {
    try { await apiLogout() } catch (error) { void error }
    logout()
    navigate('/login')
    toast.success('Logged out')
  }

  const handleUploadClick = async () => {
    setMobileMenuOpen(false)
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
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100">
      <header className="border-b border-slate-700/50 bg-slate-920/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-2xl font-black tracking-tight text-white">
              EpicBox
            </Link>
            <button
              type="button"
              onClick={handleUploadClick}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-white transition hover:bg-blue-700 sm:px-4 sm:text-xs"
            >
              <Upload size={14} />
              <span className="sm:hidden">Upload</span>
              <span className="hidden sm:inline">Upload</span>
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-1 rounded-full border border-slate-700/50 bg-slate-900/40 p-1">
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
                    isActive ? 'bg-blue-600/20 text-blue-300 ring-1 ring-blue-600/50' : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/pricing')}
              className="hidden sm:inline-flex items-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white hover:bg-blue-700 transition"
            >
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
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/50 bg-slate-900/50 text-white transition hover:bg-slate-800 md:hidden"
              aria-label="Open dashboard menu"
            >
              <MoreVertical size={18} />
            </button>
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="h-9 w-9 rounded-full bg-blue-600/20 text-blue-300 font-bold text-sm uppercase ring-1 ring-blue-600/50 transition hover:bg-blue-600/30"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                aria-label="Open profile menu"
              >
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl shadow-black/60">
                  <div className="border-b border-slate-700/50 px-4 py-3">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="truncate text-sm font-semibold text-white">{user?.email || user?.username || 'User'}</p>
                  </div>

                  <div className="p-2">
                    <button onClick={() => goTo('/dashboard')} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">
                      <span>Quickstart Guide</span>
                      <span className="rounded-full bg-blue-600/30 px-2 py-0.5 text-[10px] font-semibold text-blue-300">NEW</span>
                    </button>
                    {isOwner && <button onClick={() => goTo('/dashboard/admin')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">Admin Panel</button>}
                    <button onClick={() => goTo('/dashboard/payments')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">Payments</button>
                    <button onClick={() => goTo('/dashboard/profile')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">Edit My Profile</button>
                    <button onClick={() => goTo('/dashboard/settings?category=site&tab=branding')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">Edit Site Profile</button>
                    <button onClick={() => goTo('/dashboard/settings?category=site&tab=general')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">Site Settings</button>
                  </div>

                  <div className="border-t border-slate-700/50 p-2">
                    <button onClick={() => goTo('/dashboard/proofing')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">Shared With Me</button>
                    <button onClick={() => goTo('/dashboard/pricing')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">EpicBox Perks</button>
                    <button onClick={() => goTo('/dashboard/galleries')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">EpicBox Apps</button>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false)
                        handleLogout()
                      }}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-400 hover:bg-red-950/40"
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

      <BottomSheet
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Dashboard Menu"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleUploadClick}
              className="flex items-center gap-3 rounded-2xl border border-blue-600/40 bg-blue-600/15 px-4 py-3 text-left font-semibold text-blue-300 transition hover:bg-blue-600/25"
            >
              <Upload size={18} />
              Upload
            </button>
            <button
              type="button"
              onClick={() => goTo('/dashboard/pricing')}
              className="flex items-center gap-3 rounded-2xl border border-slate-700/40 bg-slate-700/15 px-4 py-3 text-left font-semibold text-slate-100 transition hover:bg-slate-700/25"
            >
              <CreditCard size={18} />
              Pricing
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Navigate</p>
            {navItems.map((item) => {
              const Icon = item.to === '/dashboard'
                ? LayoutDashboard
                : item.to === '/dashboard/galleries'
                  ? Images
                  : item.to === '/dashboard/organize'
                    ? Compass
                    : item.to === '/dashboard/analytics'
                      ? LayoutDashboard
                    : item.to === '/dashboard/payments'
                      ? CreditCard
                    : item.to === '/dashboard/pricing'
                      ? CreditCard
                      : Globe
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to)

              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => goTo(item.to)}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition',
                    isActive
                      ? 'border-blue-600/40 bg-blue-600/15 text-blue-300'
                      : 'border-slate-700/40 bg-slate-700/15 text-slate-100 hover:bg-slate-700/25'
                  )}
                >
                  <Icon size={18} />
                  <span className="font-semibold">{item.label}</span>
                </button>
              )
            })}
          </div>

          <div className="space-y-2 border-t border-white/10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Quick Links</p>
            {isOwner && (
              <button onClick={() => goTo('/dashboard/admin')} className="flex w-full items-center gap-3 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-left font-semibold text-amber-100 hover:bg-amber-300/15">
                <LayoutDashboard size={18} />
                Admin Panel
              </button>
            )}
            <button onClick={() => goTo('/dashboard/profile')} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left font-semibold text-slate-100 hover:bg-white/10">
              <User size={18} />
              Edit Profile
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                handleLogout()
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-left font-semibold text-rose-200 hover:bg-rose-400/15"
            >
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        </div>
      </BottomSheet>

      <main
        onScroll={() => {
          if (profileMenuOpen) setProfileMenuOpen(false)
        }}
        className="h-[calc(100vh-64px)] overflow-y-auto bg-[radial-gradient(circle_at_8%_0%,rgba(39,209,190,0.13),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(59,130,246,0.12),transparent_30%),#05070d] p-4 sm:p-6"
      >
        <div className="mx-auto w-full max-w-[1280px]">
          {children}
        </div>
      </main>
    </div>
  )
}
