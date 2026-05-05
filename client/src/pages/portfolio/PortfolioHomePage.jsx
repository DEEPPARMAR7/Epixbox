import useAuthStore from '../../store/authStore'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Spinner from '../../components/common/Spinner'
import ShareBar from '../../components/common/ShareBar'
import { getPhotographerProfile, getPublicGalleries } from '../../api/portfolioApi'

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80',
  'https://images.unsplash.com/photo-1502657877623-f66bf489d236?w=800&q=80',
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80',
]

const HERO_BG = 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1920&q=80'

const DEMO_PHOTOGRAPHER = {
  username: 'demo',
  first_name: 'Avery',
  last_name: 'Stone',
  brand_name: 'Avery Stone Photo',
  bio: 'A polished public portfolio that shows how clients browse galleries before they sign up.',
  avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
  website_url: 'https://example.com',
  brand_color: '#0f172a',
}

const DEMO_GALLERIES = [
  { id: 'demo-weddings', slug: 'weddings', title: 'Weddings', photos_count: 24, cover_url: COVER_IMAGES[0] },
  { id: 'demo-portraits', slug: 'portraits', title: 'Portraits', photos_count: 18, cover_url: COVER_IMAGES[1] },
  { id: 'demo-travel', slug: 'travel', title: 'Travel Stories', photos_count: 31, cover_url: COVER_IMAGES[2] },
  { id: 'demo-brand', slug: 'brand-sessions', title: 'Brand Sessions', photos_count: 12, cover_url: COVER_IMAGES[3] },
]

export default function PortfolioHomePage() {
  const { username } = useParams()
  const authUser = useAuthStore(s => s.user)
  const token = useAuthStore(s => s.token)
  const [photographer, setPhotographer] = useState(null)
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [warning, setWarning] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const normalizedUsername = String(username || '').trim().toLowerCase()

    if (normalizedUsername === 'demo') {
      setPhotographer(DEMO_PHOTOGRAPHER)
      setGalleries(DEMO_GALLERIES)
      setWarning('')
      setLoading(false)
      return
    }

    if (!normalizedUsername) {
      setError('Portfolio not found')
      setLoading(false)
      return
    }

    const isOwner = authUser && authUser.username && authUser.username.toLowerCase() === normalizedUsername
    Promise.allSettled([
      getPhotographerProfile(normalizedUsername),
      getPublicGalleries(normalizedUsername, isOwner ? token : undefined),
    ])
      .then(([profileResult, galleriesResult]) => {
        if (profileResult.status === 'rejected') {
          const status = profileResult.reason?.response?.status
          if (status === 404) {
            setError('Portfolio not found')
          } else if (status === 402) {
            setError('This portfolio is private on the current plan')
          } else {
            setError('Portfolio is temporarily unavailable')
          }
          return
        }

        setPhotographer(profileResult.value)

        if (galleriesResult.status === 'fulfilled') {
          setGalleries(galleriesResult.value)
          setWarning('')
        } else {
          setGalleries([])
          setWarning('Galleries are temporarily unavailable. Please refresh in a moment.')
        }
      })
      .finally(() => setLoading(false))
  }, [username, authUser, token])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const brandColor = photographer?.brand_color || '#6366f1'
  const displayName = photographer?.brand_name ||
    `${photographer?.first_name || ''} ${photographer?.last_name || ''}`.trim() ||
    photographer?.username || username
  const publicCollectionCount = galleries.length
  const publicPhotoCount = galleries.reduce((sum, gallery) => sum + Number(gallery.photos_count || 0), 0)
  const featuredGallery = galleries[0] || DEMO_GALLERIES[0]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Spinner size="lg" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="text-6xl mb-4">📷</div>
        <h1 className="text-2xl font-bold mb-2">{error}</h1>
        <p className="text-white/50">Check the portfolio username or try again shortly.</p>
        <Link to="/" className="mt-6 inline-block text-indigo-400 hover:underline">Back to EpicBox</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <Helmet>
        <title>{displayName} — Portfolio</title>
      </Helmet>

      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/88 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.25)]' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6 min-w-0">
            <Link to="/" className="text-sm font-bold tracking-wide text-white/80 hover:text-white transition">EpicBox</Link>
            <div className="hidden md:flex items-center gap-5 text-xs font-semibold uppercase tracking-wider">
              <a href="#top" className="text-white/80 hover:text-white transition">Home</a>
              <a href="#galleries" className="text-white/50 hover:text-white transition">Browse</a>
              <a href="#galleries" className="text-white/50 hover:text-white transition">Search</a>
            </div>
          </div>
          <h1 className="hidden lg:block text-base font-semibold tracking-wide text-white truncate px-4">{displayName}</h1>
          <div className="flex items-center gap-2">
            {photographer?.website_url && photographer.website_url !== 'https://example.com' && (
              <a href={photographer.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-white/60 hover:text-white transition">Website</a>
            )}
            <a
              href="#galleries"
              className="rounded-full bg-emerald-300 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#06210f] hover:bg-emerald-200 transition"
            >
              Browse
            </a>
          </div>
        </div>
      </nav>

      <section id="top" className="relative min-h-screen flex items-end justify-center overflow-hidden">
        <img src={photographer?.avatar_url || HERO_BG} alt={displayName} className="absolute inset-0 w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16 pt-32 md:pb-24">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr),minmax(320px,0.8fr)] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/75 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: brandColor }} />
                Public portfolio
              </div>
              <div
                className="mt-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/25 text-3xl font-bold uppercase text-white shadow-2xl ring-8 ring-black/10"
                style={{ backgroundColor: brandColor }}
              >
                {photographer?.first_name?.[0] || photographer?.username?.[0] || 'P'}
              </div>
              <h1 className="mt-5 max-w-3xl text-5xl font-black tracking-tight drop-shadow-[0_6px_24px_rgba(0,0,0,0.35)] md:text-7xl">{displayName}</h1>
              {photographer?.bio && (
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">{photographer.bio}</p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">Collections</p>
                  <p className="mt-1 text-2xl font-black text-white">{publicCollectionCount}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">Photos</p>
                  <p className="mt-1 text-2xl font-black text-white">{publicPhotoCount.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">Status</p>
                  <p className="mt-1 text-2xl font-black text-white">Open</p>
                </div>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#galleries"
                  className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-extrabold uppercase tracking-wide text-[#06210f] transition hover:bg-emerald-200"
                >
                  Browse collections
                </a>
                <div className="rounded-full border border-white/15 bg-white/5 px-4 py-3 text-xs font-medium text-white/70 backdrop-blur-md">
                  Clean portfolio, client-ready presentation, fast browsing
                </div>
              </div>
              <div className="mt-6 flex justify-start">
                <ShareBar url={window.location.href} title={`${displayName} — Photography Portfolio`} />
              </div>
            </div>

            <div className="rounded-[32px] border border-white/12 bg-black/35 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-5">
              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/50">
                <div className="relative aspect-[4/5]">
                  <img
                    src={featuredGallery?.cover_url || HERO_BG}
                    alt={featuredGallery?.title || displayName}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55">Featured collection</p>
                    <h2 className="mt-2 text-2xl font-black text-white">{featuredGallery?.title || 'Collections'}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/70">
                      {featuredGallery?.photos_count ? `${featuredGallery.photos_count} photos ready to browse.` : 'A polished preview card that leads visitors into your work.'}
                    </p>
                    <a
                      href="#galleries"
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-white/20"
                    >
                      View all collections
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 animate-bounce">
            <svg className="w-6 h-6 mx-auto text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      <section id="galleries" className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          {warning && (
            <div className="mb-8 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-200">
              {warning}
            </div>
          )}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-white/30 tracking-[0.3em] uppercase text-xs">Collections</p>
              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Browse the portfolio</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-white/45">
              Each collection is laid out for quick scanning, clean presentation, and a stronger first impression.
            </p>
          </div>
          {galleries.length === 0 ? (
            username === 'demo' ? (
              <>
                <p className="text-white/30 tracking-[0.3em] uppercase text-xs text-center mb-12">
                  {DEMO_GALLERIES.length} Collections
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DEMO_GALLERIES.map((g, i) => (
                    <Link key={g.id} to={`/p/${username}/${g.slug}`} className="group relative aspect-[3/2] overflow-hidden block rounded-2xl bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.22)] ring-1 ring-white/10">
                      <img src={g.cover_url || COVER_IMAGES[i % COVER_IMAGES.length]} alt={g.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-105 group-hover:brightness-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-500" />
                      <div className="absolute bottom-0 inset-x-0 p-6 translate-y-1 group-hover:translate-y-0 transition duration-300">
                        <h3 className="text-xl font-bold text-white mb-1">{g.title}</h3>
                        <p className="text-white/50 text-sm">{g.photos_count || 0} photos</p>
                        <div className="mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-300 text-white/70 text-xs font-medium tracking-widest uppercase">
                          View Gallery
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-[28px] border border-white/10 bg-white/5 px-6 py-16 text-center text-white/30">
                <div className="text-6xl mb-4">🖼️</div>
                <p className="text-lg font-medium text-white/60">No galleries published yet.</p>
                <p className="mt-2 text-sm text-white/35">Once public galleries are added in the dashboard, they appear here automatically.</p>
              </div>
            )
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {galleries.map((g, i) => (
                  <Link
                    key={g.id}
                    to={`/p/${username}/${g.slug}`}
                    className={`group relative overflow-hidden block rounded-[28px] bg-zinc-900 shadow-[0_24px_60px_rgba(0,0,0,0.22)] ring-1 ring-white/10 transition duration-500 hover:-translate-y-1 hover:ring-white/20 ${i === 0 ? 'sm:col-span-2 lg:col-span-2' : 'aspect-[3/2]'}`}
                  >
                    <img src={g.cover_url || COVER_IMAGES[i % COVER_IMAGES.length]} alt={g.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-105 group-hover:brightness-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                    <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/15" />
                    <div className="absolute left-0 right-0 bottom-0 p-5 md:p-6">
                      <div className="flex items-end justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">Collection</p>
                          <h3 className="mt-2 text-xl font-black text-white md:text-2xl">{g.title}</h3>
                          <p className="mt-2 text-sm text-white/55">{g.photos_count || 0} photos</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/85 transition group-hover:bg-white/20">
                          →
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center bg-black/95">
        <p className="text-white/20 text-xs tracking-widest uppercase">
          Powered by <Link to="/" className="hover:text-white/50 transition">EpicBox</Link>
        </p>
      </footer>
    </div>
  )
}
