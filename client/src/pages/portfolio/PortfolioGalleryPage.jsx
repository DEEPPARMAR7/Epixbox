import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Masonry from 'react-masonry-css'
import Spinner from '../../components/common/Spinner'
import SocialShare from '../../components/common/SocialShare'
import { getPhotographerProfile, getPublicGallery, verifyGalleryPassword } from '../../api/portfolioApi'
import { getThemeById } from '../../api/themeApi'

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80',
  'https://images.unsplash.com/photo-1502657877623-f66bf489d236?w=600&q=80',
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80',
  'https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=600&q=80',
  'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80',
]

const DEMO_PHOTOS = [
  { id: 'demo-photo-1', title: 'Golden Hour Ceremony', thumb_url: SAMPLE_PHOTOS[0], medium_url: SAMPLE_PHOTOS[0] },
  { id: 'demo-photo-2', title: 'City Portrait Session', thumb_url: SAMPLE_PHOTOS[1], medium_url: SAMPLE_PHOTOS[1] },
  { id: 'demo-photo-3', title: 'Editorial Travel Frame', thumb_url: SAMPLE_PHOTOS[2], medium_url: SAMPLE_PHOTOS[2] },
  { id: 'demo-photo-4', title: 'Studio Branding', thumb_url: SAMPLE_PHOTOS[3], medium_url: SAMPLE_PHOTOS[3] },
  { id: 'demo-photo-5', title: 'Reception Details', thumb_url: SAMPLE_PHOTOS[4], medium_url: SAMPLE_PHOTOS[4] },
  { id: 'demo-photo-6', title: 'Landscape Story', thumb_url: SAMPLE_PHOTOS[5], medium_url: SAMPLE_PHOTOS[5] },
  { id: 'demo-photo-7', title: 'Couple Portrait', thumb_url: SAMPLE_PHOTOS[6], medium_url: SAMPLE_PHOTOS[6] },
  { id: 'demo-photo-8', title: 'Brand Lifestyle', thumb_url: SAMPLE_PHOTOS[7], medium_url: SAMPLE_PHOTOS[7] },
  { id: 'demo-photo-9', title: 'Detail Study', thumb_url: SAMPLE_PHOTOS[8], medium_url: SAMPLE_PHOTOS[8] },
]

const DEMO_GALLERY = {
  title: 'Weddings Collection',
  description: 'A sample client gallery that shows password protection, browse controls, and purchase entry points.',
}

const DEMO_PHOTOGRAPHER = {
  username: 'demo',
  first_name: 'Avery',
  last_name: 'Stone',
  brand_name: 'Avery Stone Photo',
  avatar_url: SAMPLE_PHOTOS[9],
}

function Lightbox({ photo, index, total, onClose, onPrev, onNext }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose, onPrev, onNext])

  const photoUrl = photo.thumb_url || photo.medium_url || SAMPLE_PHOTOS[index % SAMPLE_PHOTOS.length]

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={onClose}>
      {/* Close */}
      <button onClick={onClose} className="absolute top-5 right-6 rounded-full bg-black/30 px-3 py-1 text-white/70 hover:text-white text-3xl leading-none z-10 transition backdrop-blur-sm">
        &times;
      </button>

      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-white/60 text-xs tracking-[0.22em] uppercase backdrop-blur-sm">
        {index + 1} / {total}
      </div>

      {/* Prev */}
      {index > 0 && (
        <button
          onClick={e => { e.stopPropagation(); onPrev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition z-10 text-3xl"
        >
          ‹
        </button>
      )}

      {/* Next */}
      {index < total - 1 && (
        <button
          onClick={e => { e.stopPropagation(); onNext() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition z-10 text-3xl"
        >
          ›
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-5xl max-h-[85vh] px-16" onClick={e => e.stopPropagation()}>
        <img
          src={photoUrl}
          alt={photo.title || ''}
          className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
        />
        {photo.title && (
          <div className="absolute bottom-0 inset-x-0 text-center pb-3">
            <p className="text-white/60 text-sm">{photo.title}</p>
          </div>
        )}
      </div>

      {/* Buy Print */}
      <div className="absolute bottom-6 right-6">
        <Link
          to={`/shop/${photo.id}`}
          state={{ photoTitle: photo.title }}
          onClick={e => e.stopPropagation()}
          className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-100 transition shadow-lg"
        >
          Buy Print
        </Link>
      </div>
    </div>
  )
}

const BREAKPOINTS = { default: 3, 1100: 3, 768: 2, 480: 1 }

export default function PortfolioGalleryPage() {
  const { username, slug } = useParams()
  const normalizedUsername = String(username || '').trim().toLowerCase()
  const normalizedSlug = String(slug || '').trim()
  const [photographer, setPhotographer] = useState(null)
  const [gallery, setGallery] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [layoutMode, setLayoutMode] = useState(() => {
    const saved = localStorage.getItem(`gallery-layout:${normalizedUsername}:${normalizedSlug}`)
    return saved || 'masonry'
  })
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem(`gallery-access:${normalizedUsername}:${normalizedSlug}`) || '')
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [protectedGalleryId, setProtectedGalleryId] = useState(null)
  const [passwordHint, setPasswordHint] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState('')
  const [themeVars, setThemeVars] = useState(null)
  const [customCss, setCustomCss] = useState('')

  useEffect(() => {
    localStorage.setItem(`gallery-layout:${normalizedUsername}:${normalizedSlug}`, layoutMode)
  }, [layoutMode, normalizedUsername, normalizedSlug])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      if (normalizedUsername === 'demo') {
        if (cancelled) return
        setPhotographer(DEMO_PHOTOGRAPHER)
        setGallery(DEMO_GALLERY)
        setPhotos(DEMO_PHOTOS)
        setPasswordRequired(false)
        setUnlockError('')
        setLoading(false)
        return
      }

      if (!normalizedUsername || !normalizedSlug) {
        if (cancelled) return
        setError('Gallery not found.')
        setLoading(false)
        return
      }

      try {
        const [profileResult, galleryResult] = await Promise.allSettled([
          getPhotographerProfile(normalizedUsername),
          getPublicGallery(normalizedUsername, normalizedSlug, accessToken),
        ])

        if (cancelled) return

        if (profileResult.status === 'fulfilled') {
          setPhotographer(profileResult.value)
        } else {
          setPhotographer(null)
        }

        if (galleryResult.status === 'fulfilled') {
          const galleryData = galleryResult.value
          setGallery(galleryData.gallery)
          setPhotos(galleryData.photos || [])
          setPasswordRequired(false)
          setUnlockError('')

          const appearance = galleryData?.gallery?.settings?.appearance || {}
          setCustomCss(String(appearance.custom_css || ''))
          if (appearance.theme_id) {
            try {
              const theme = await getThemeById(appearance.theme_id)
              setThemeVars(theme?.css_variables || null)
            } catch {
              setThemeVars(null)
            }
          } else {
            setThemeVars(null)
          }
          return
        }

        const response = galleryResult.reason?.response
        if (response?.status === 401 && response?.data?.needs_password) {
          setPasswordRequired(true)
          setProtectedGalleryId(response.data.gallery_id)
          setPasswordHint(response.data.hint || '')
          setError(null)
        } else if (response?.status === 402) {
          setError('This portfolio is private on the current plan.')
        } else if (response?.status === 410) {
          setError('This gallery has expired and is no longer available.')
        } else if (response?.status === 404) {
          setError('Gallery not found.')
        } else {
          setError('Unable to load this gallery right now.')
        }
      } catch (err) {
        if (cancelled) return
        const response = err?.response
        if (response?.status === 401 && response?.data?.needs_password) {
          setPasswordRequired(true)
          setProtectedGalleryId(response.data.gallery_id)
          setPasswordHint(response.data.hint || '')
          setError(null)
        } else if (response?.status === 402) {
          setError('This portfolio is private on the current plan.')
        } else if (response?.status === 410) {
          setError('This gallery has expired and is no longer available.')
        } else if (response?.status === 404) {
          setError('Gallery not found.')
        } else {
          setError('Unable to load this gallery right now.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [normalizedUsername, normalizedSlug, accessToken])

  const handleUnlock = async (e) => {
    e.preventDefault()
    if (!protectedGalleryId || !passwordInput.trim()) return

    setUnlocking(true)
    setUnlockError('')
    try {
      const data = await verifyGalleryPassword(protectedGalleryId, passwordInput.trim())
      const token = data?.access_token || ''
      if (!token) {
        setUnlockError('Unlock token not received. Please try again.')
        return
      }
      sessionStorage.setItem(`gallery-access:${normalizedUsername}:${normalizedSlug}`, token)
      setAccessToken(token)
      setPasswordInput('')
      setPasswordRequired(false)
    } catch (err) {
      setUnlockError(err?.response?.data?.error || 'Incorrect password. Please try again.')
    } finally {
      setUnlocking(false)
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handlePrev = useCallback(() => setLightboxIdx(i => Math.max(0, i - 1)), [])
  const handleNext = useCallback(() => setLightboxIdx(i => Math.min(photos.length - 1, i + 1)), [photos.length])

  const displayName = photographer?.brand_name ||
    `${photographer?.first_name || ''} ${photographer?.last_name || ''}`.trim() ||
    photographer?.username || normalizedUsername

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Spinner size="lg" />
    </div>
  )

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-2xl font-bold mb-3">Gallery Unavailable</p>
          <p className="text-white/60">{error}</p>
        </div>
      </div>
    )
  }

  const galleryStyle = themeVars
    ? {
      '--theme-bg': themeVars.bg || '#000000',
      '--theme-text': themeVars.text || '#ffffff',
      '--theme-accent': themeVars.accent || '#34d399',
      backgroundColor: 'var(--theme-bg)',
      color: 'var(--theme-text)',
    }
    : undefined

  return (
    <div className="min-h-screen bg-black text-white" style={galleryStyle}>
      {gallery && (
        <Helmet>
          <title>{gallery.title} — {displayName}</title>
        </Helmet>
      )}

      {customCss && <style>{customCss}</style>}

      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/10' : 'bg-black/50 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-5 min-w-0">
            <Link to={`/p/${username}`} className="text-sm font-bold tracking-wide text-white/80 hover:text-white transition">
              {displayName}
            </Link>
            <div className="hidden md:flex items-center gap-4 text-[11px] font-semibold uppercase tracking-wider">
              <Link to={`/p/${username}`} className="text-white/60 hover:text-white transition">Home</Link>
              <a href="#grid" className="text-white/80 hover:text-white transition">Browse</a>
              <a href="#grid" className="text-white/60 hover:text-white transition">Search</a>
            </div>
          </div>
          <h2 className="hidden lg:block text-sm font-semibold tracking-wide truncate px-4" style={themeVars?.accent ? { color: themeVars.accent } : undefined}>{gallery?.title}</h2>
          <p className="text-sm text-white/40">{photos.length} photos</p>
        </div>
      </nav>

      {/* Gallery header */}
      <div className="pt-32 pb-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">{gallery?.title}</h1>
        {gallery?.description && (
          <p className="text-white/50 max-w-xl mx-auto">{gallery.description}</p>
        )}
        <div className="mt-4 w-12 h-px bg-white/20 mx-auto" />
        <div className="mt-6 flex justify-center">
          <SocialShare
            url={window.location.href}
            title={`${gallery?.title} — ${displayName}`}
            description={gallery?.description || `Photography gallery by ${displayName}`}
          />
        </div>
        <div className="mt-6 inline-flex rounded-full border border-white/15 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setLayoutMode('masonry')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${layoutMode === 'masonry' ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}
          >
            Masonry
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode('grid')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${layoutMode === 'grid' ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode('slideshow')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${layoutMode === 'slideshow' ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}
          >
            Slideshow
          </button>
        </div>
      </div>

      {/* Masonry grid */}
      <div id="grid" className="px-2 pb-20 max-w-7xl mx-auto">
        {photos.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <div className="text-6xl mb-4">📷</div>
            <p>No photos in this gallery yet.</p>
          </div>
        ) : layoutMode === 'masonry' ? (
          <Masonry
            breakpointCols={BREAKPOINTS}
            className="flex -ml-4 w-auto"
            columnClassName="pl-2 bg-clip-padding"
          >
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="mb-4 group relative cursor-pointer overflow-hidden bg-zinc-900 rounded-2xl ring-1 ring-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
                onClick={() => setLightboxIdx(idx)}
              >
                <img
                  src={photo.thumb_url || SAMPLE_PHOTOS[idx % SAMPLE_PHOTOS.length]}
                  alt={photo.title || ''}
                  className="w-full h-auto block transition duration-500 group-hover:scale-105 group-hover:brightness-110"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition duration-300 text-center px-4">
                    {photo.title && (
                      <p className="text-white font-semibold text-sm mb-2">{photo.title}</p>
                    )}
                    <div className="flex gap-2 justify-center">
                      <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full">
                        View
                      </span>
                      <Link
                        to={`/shop/${photo.id}`}
                        state={{ photoTitle: photo.title }}
                        onClick={e => e.stopPropagation()}
                        className="text-xs bg-white text-black px-3 py-1 rounded-full font-semibold hover:bg-gray-100 transition"
                      >
                        Buy Print
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Masonry>
        ) : layoutMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
                onClick={() => setLightboxIdx(idx)}
              >
                <img
                  src={photo.thumb_url || SAMPLE_PHOTOS[idx % SAMPLE_PHOTOS.length]}
                  alt={photo.title || ''}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition duration-300" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <p className="text-white/60 text-sm mb-4">Slideshow Mode</p>
              <button onClick={() => setLayoutMode('grid')} className="text-xs bg-white/10 text-white px-4 py-2 rounded-full hover:bg-white/20 transition">
                Exit Slideshow
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 text-center bg-black/95">
        <Link to={`/p/${username}`} className="text-white/30 text-sm hover:text-white/60 transition">
          ← Back to {displayName}'s Portfolio
        </Link>
      </footer>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          photo={photos[lightboxIdx]}
          index={lightboxIdx}
          total={photos.length}
          onClose={() => setLightboxIdx(null)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}

      {passwordRequired && (
        <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-zinc-950 p-6">
            <h3 className="text-xl font-bold text-white mb-2">This Gallery Is Password Protected</h3>
            <p className="text-sm text-white/60 mb-4">Enter the client password to view this gallery.</p>
            {passwordHint && (
              <p className="text-xs text-emerald-300/90 mb-4">Hint: {passwordHint}</p>
            )}
            <form onSubmit={handleUnlock} className="space-y-3">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/40"
                autoFocus
              />
              {unlockError && <p className="text-xs text-red-300">{unlockError}</p>}
              <button
                type="submit"
                disabled={unlocking || !passwordInput.trim()}
                className="w-full rounded-lg bg-white text-black py-2 text-sm font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {unlocking ? 'Unlocking...' : 'Unlock Gallery'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
