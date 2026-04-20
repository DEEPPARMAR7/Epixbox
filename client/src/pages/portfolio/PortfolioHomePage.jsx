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
  }, [username])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const brandColor = photographer?.brand_color || '#6366f1'
  const displayName = photographer?.brand_name ||
    `${photographer?.first_name || ''} ${photographer?.last_name || ''}`.trim() ||
    photographer?.username || username

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
        scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
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

      <section id="top" className="relative h-screen flex items-end justify-center overflow-hidden">
        <img src={photographer?.avatar_url || HERO_BG} alt={displayName} className="absolute inset-0 w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30" />
        <div className="relative z-10 text-center pb-24 px-4">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold uppercase border-2 border-white/30 shadow-2xl"
            style={{ backgroundColor: brandColor }}
          >
            {photographer?.first_name?.[0] || photographer?.username?.[0] || 'P'}
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">{displayName}</h1>
          {photographer?.bio && (
            <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">{photographer.bio}</p>
          )}
          <div className="mt-6 flex justify-center">
            <ShareBar url={window.location.href} title={`${displayName} — Photography Portfolio`} />
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
          {galleries.length === 0 ? (
            username === 'demo' ? (
              <>
                <p className="text-white/30 tracking-[0.3em] uppercase text-xs text-center mb-12">
                  {DEMO_GALLERIES.length} Collections
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                  {DEMO_GALLERIES.map((g, i) => (
                    <Link key={g.id} to={`/p/${username}/${g.slug}`} className="group relative aspect-[3/2] overflow-hidden block bg-zinc-900">
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
              <div className="text-center py-20 text-white/30">
                <div className="text-6xl mb-4">🖼️</div>
                <p className="text-lg">No galleries published yet.</p>
              </div>
            )
          ) : (
            <>
              <p className="text-white/30 tracking-[0.3em] uppercase text-xs text-center mb-12">
                {galleries.length} Collections
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                {galleries.map((g, i) => (
                  <Link key={g.id} to={`/p/${username}/${g.slug}`} className="group relative aspect-[3/2] overflow-hidden block bg-zinc-900">
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
          )}
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center">
        <p className="text-white/20 text-xs tracking-widest uppercase">
          Powered by <Link to="/" className="hover:text-white/50 transition">EpicBox</Link>
        </p>
      </footer>
    </div>
  )
}
