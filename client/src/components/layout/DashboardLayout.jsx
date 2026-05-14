import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { logout as apiLogout } from '../../api/authApi'
import { getGalleries } from '../../api/galleryApi'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { MoreVertical, Upload, LayoutDashboard, Images, Compass, Globe, User, LogOut } from 'lucide-react'
import BottomSheet from '../common/BottomSheet'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊', exact: true },
  { to: '/dashboard/galleries', label: 'Library', icon: '🖼️' },
  { to: '/dashboard/organize', label: 'Organize', icon: '🧭' },
  { to: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
  { to: '/dashboard/payments', label: 'Payments', icon: '💳' },
  { to: '/dashboard/settings', label: 'My Site', icon: '🌐' },
  { to: '/dashboard/themes', label: 'Themes', icon: '🎨' },
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="shrink-0 border-b border-slate-700/50 bg-slate-950/92 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-3 px-4 py-3 sm:h-16 sm:px-6 sm:py-0">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/dashboard" className="min-w-0 text-xl font-black tracking-tight text-white sm:text-2xl">
              EpicBox
            </Link>
            <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200 sm:inline-flex">
              Dashboard
            </span>
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
              onClick={handleUploadClick}
              className="hidden items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-emerald-100 transition hover:bg-emerald-400/15 sm:inline-flex"
            >
              <Upload size={14} />
              Upload
            </button>
            <a
              href={publicSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-full border border-slate-700/40 bg-slate-900/40 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500/50 hover:text-white sm:inline-flex"
            >
              View Site
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-700/50 bg-slate-900/50 px-3 text-sm font-semibold text-white transition hover:border-slate-500/60 hover:bg-slate-800 md:hidden"
              aria-label="Open dashboard menu"
            >
              <MoreVertical size={18} />
              <span>Menu</span>
            </button>
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-400/20 text-blue-100 font-bold text-sm uppercase ring-1 ring-blue-400/30 shadow-[0_8px_24px_rgba(59,130,246,0.18)] transition hover:scale-[1.02] hover:bg-blue-500/35"
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
                    <button onClick={() => goTo('/dashboard/profile')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">Edit My Profile</button>
                    <button onClick={() => goTo('/dashboard/settings?category=site&tab=branding')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">Edit Site Profile</button>
                    <button onClick={() => goTo('/dashboard/settings?category=site&tab=general')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">Site Settings</button>
                  </div>

                  <div className="border-t border-slate-700/50 p-2">
                    <button onClick={() => goTo('/dashboard/proofing')} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">Shared With Me</button>
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

        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-2 gap-3 px-4 pb-3 sm:hidden">
          <button
            type="button"
            onClick={handleUploadClick}
            className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-100 transition hover:bg-emerald-400/15"
          >
            <Upload size={16} />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-sm font-bold text-slate-100 transition hover:border-slate-500/60 hover:bg-slate-800"
          >
            <MoreVertical size={16} />
            More
          </button>
        </div>
      </header>

      <BottomSheet
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Dashboard Menu"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Quick Access</p>
            <p className="mt-1 text-sm text-slate-300">Fast actions for galleries, uploads, and site settings.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={handleUploadClick}
              className="flex items-center gap-3 rounded-2xl border border-blue-600/40 bg-gradient-to-r from-blue-600/20 to-cyan-500/10 px-4 py-3 text-left font-semibold text-blue-200 transition hover:from-blue-600/25 hover:to-cyan-500/15"
            >
              <Upload size={18} />
              Upload
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
                        ? Globe
                        : item.to === '/dashboard/settings'
                          ? Globe
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
                        ? 'border-blue-500/40 bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-blue-200 shadow-[0_8px_28px_rgba(37,99,235,0.10)]'
                        : 'border-slate-700/40 bg-slate-700/15 text-slate-100 hover:border-slate-500/50 hover:bg-slate-700/25'
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
        className="flex-1 min-h-0 overflow-y-auto bg-[radial-gradient(circle_at_8%_0%,rgba(39,209,190,0.13),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(59,130,246,0.12),transparent_30%),#05070d] p-4 sm:p-6"
      >
        <div className="mx-auto w-full max-w-[1280px]">
          {children}
        </div>
      </main>
    </div>
  )
}
