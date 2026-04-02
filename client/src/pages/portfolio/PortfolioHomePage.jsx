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

export default function PortfolioHomePage() {
  const { username } = useParams()
  const [photographer, setPhotographer] = useState(null)
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [layout, setLayout] = useState('grid') // 'grid' | 'list'

  useEffect(() => {
    Promise.all([getPhotographerProfile(username), getPublicGalleries(username)])
      .then(([p, g]) => { setPhotographer(p); setGalleries(g) })
      .catch(() => setError('Photographer not found'))
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
        <h1 className="text-2xl font-bold mb-2">Portfolio not found</h1>
        <p className="text-white/50">This portfolio does not exist yet.</p>
        <Link to="/" className="mt-6 inline-block text-indigo-400 hover:underline">Back to EpixBox</Link>
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
          <Link to="/" className="text-sm text-white/50 hover:text-white transition">EpixBox</Link>
          <h1 className="text-base font-semibold tracking-wide text-white">{displayName}</h1>
          {photographer?.website_url
            ? <a href={photographer.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white transition">Website</a>
            : <div />}
        </div>
      </nav>

      <section className="relative h-screen flex items-end justify-center overflow-hidden">
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
          {galleries.length > 0 && (
            <a
              href="#galleries"
              className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-sm font-medium transition"
            >
              Browse Galleries
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          )}
          <div className="mt-6 animate-bounce">
            <svg className="w-6 h-6 mx-auto text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      <section id="galleries" className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          {galleries.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-lg">No galleries published yet.</p>
            </div>
          ) : (
            <>
              {/* Header row with count + layout toggle */}
              <div className="flex items-center justify-between mb-10">
                <p className="text-white/30 tracking-[0.3em] uppercase text-xs">
                  {galleries.length} {galleries.length === 1 ? 'Collection' : 'Collections'}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setLayout('grid')}
                    title="Grid view"
                    className={`w-8 h-8 flex items-center justify-center rounded-lg border transition ${layout === 'grid' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'}`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <rect x="2" y="2" width="7" height="7" rx="1" /><rect x="11" y="2" width="7" height="7" rx="1" /><rect x="2" y="11" width="7" height="7" rx="1" /><rect x="11" y="11" width="7" height="7" rx="1" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setLayout('list')}
                    title="List view"
                    className={`w-8 h-8 flex items-center justify-center rounded-lg border transition ${layout === 'list' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {layout === 'grid' ? (
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
              ) : (
                <div className="space-y-px">
                  {galleries.map((g, i) => (
                    <Link key={g.id} to={`/p/${username}/${g.slug}`} className="group flex items-center gap-5 bg-zinc-900/50 hover:bg-zinc-800/80 transition p-4 rounded-sm">
                      <div className="w-20 h-14 flex-shrink-0 overflow-hidden rounded bg-zinc-800">
                        <img src={g.cover_url || COVER_IMAGES[i % COVER_IMAGES.length]} alt={g.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm truncate">{g.title}</h3>
                        {g.description && <p className="text-white/40 text-xs mt-0.5 truncate">{g.description}</p>}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-white/30 text-xs">{g.photos_count || 0} photos</p>
                        <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 transition mt-1 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center">
        <p className="text-white/20 text-xs tracking-widest uppercase">
          Powered by <Link to="/" className="hover:text-white/50 transition">EpixBox</Link>
        </p>
      </footer>
    </div>
  )
}
