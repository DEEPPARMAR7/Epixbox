import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Masonry from 'react-masonry-css'
import Spinner from '../../components/common/Spinner'
import ShareBar from '../../components/common/ShareBar'
import { getPhotographerProfile, getPublicGallery } from '../../api/portfolioApi'

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

const SLIDESHOW_INTERVAL = 4000

function Lightbox({ photo, index, total, onClose, onPrev, onNext, slideshowActive, onToggleSlideshow }) {
  const [showInfo, setShowInfo] = useState(false)
  const photoUrl = photo.medium_url || photo.thumb_url || SAMPLE_PHOTOS[index % SAMPLE_PHOTOS.length]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === ' ') { e.preventDefault(); onToggleSlideshow() }
      if (e.key === 'i' || e.key === 'I') setShowInfo(v => !v)
    }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose, onPrev, onNext, onToggleSlideshow])

  const exifItems = [
    photo.camera_make && photo.camera_model && { label: 'Camera', value: `${photo.camera_make} ${photo.camera_model}` },
    photo.focal_length && { label: 'Focal Length', value: `${photo.focal_length}mm` },
    photo.aperture && { label: 'Aperture', value: `f/${photo.aperture}` },
    photo.shutter_speed && { label: 'Shutter', value: photo.shutter_speed },
    photo.iso && { label: 'ISO', value: photo.iso },
    photo.taken_at && { label: 'Date', value: new Date(photo.taken_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) },
    photo.width && photo.height && { label: 'Dimensions', value: `${photo.width} × ${photo.height}` },
  ].filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={onClose}>
      {/* Top toolbar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="pointer-events-auto text-white/40 text-sm tracking-widest select-none">
          {index + 1} / {total}
        </div>
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Slideshow toggle */}
          <button
            onClick={e => { e.stopPropagation(); onToggleSlideshow() }}
            title={slideshowActive ? 'Pause slideshow (Space)' : 'Play slideshow (Space)'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition border border-white/10"
          >
            {slideshowActive ? (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                Pause
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Slideshow
              </>
            )}
          </button>
          {/* Photo info toggle */}
          {exifItems.length > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setShowInfo(v => !v) }}
              aria-label="Toggle photo info"
              title="Photo info (I)"
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition border ${showInfo ? 'bg-white text-black border-white' : 'bg-white/10 hover:bg-white/20 text-white border-white/10'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          {/* Close */}
          <button
            onClick={e => { e.stopPropagation(); onClose() }}
            title="Close (Esc)"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-xl leading-none text-white/60 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 transition"
          >
            ×
          </button>
        </div>
      </div>

      {/* Prev */}
      {index > 0 && (
        <button
          onClick={e => { e.stopPropagation(); onPrev() }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition z-10 text-3xl border border-white/10"
        >
          ‹
        </button>
      )}

      {/* Next */}
      {index < total - 1 && (
        <button
          onClick={e => { e.stopPropagation(); onNext() }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition z-10 text-3xl border border-white/10"
        >
          ›
        </button>
      )}

      {/* Image */}
      <div
        className={`relative transition-all duration-300 ${showInfo ? 'max-w-[calc(100vw-340px)]' : 'max-w-5xl'} max-h-[85vh] px-16`}
        onClick={e => e.stopPropagation()}
      >
        <img
          src={photoUrl}
          alt={photo.title || ''}
          className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl"
        />
        {/* Slideshow progress bar */}
        {slideshowActive && (
          <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/20 rounded-b overflow-hidden">
            <div
              key={index}
              className="h-full bg-white/70"
              style={{ animation: `lightboxProgress ${SLIDESHOW_INTERVAL}ms linear` }}
            />
          </div>
        )}
      </div>

      {/* Info panel */}
      {showInfo && (
        <div
          className="absolute right-0 top-0 bottom-0 w-72 bg-black/90 border-l border-white/10 z-20 overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 pt-20">
            {photo.title && (
              <h3 className="text-white font-bold text-base mb-1">{photo.title}</h3>
            )}
            {photo.description && (
              <p className="text-white/50 text-sm mb-4 leading-relaxed">{photo.description}</p>
            )}
            {exifItems.length > 0 && (
              <div className="space-y-3 border-t border-white/10 pt-4">
                <p className="text-white/30 text-xs uppercase tracking-widest font-semibold">Photo Details</p>
                {exifItems.map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-2">
                    <span className="text-white/40 text-xs">{label}</span>
                    <span className="text-white/80 text-xs font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div
        className="absolute bottom-0 inset-x-0 z-20 flex items-center justify-between px-5 py-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"
        onClick={e => e.stopPropagation()}
      >
        <div className="pointer-events-auto">
          {photo.title && (
            <p className="text-white/60 text-sm font-medium">{photo.title}</p>
          )}
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          {photo.original_url && (
            <a
              href={photo.original_url}
              download
              onClick={e => e.stopPropagation()}
              title="Download photo"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition border border-white/10"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          )}
          <Link
            to={`/shop/${photo.id}`}
            state={{ photoTitle: photo.title }}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-gray-100 transition shadow-lg"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Buy Print
          </Link>
        </div>
      </div>
    </div>
  )
}

const BREAKPOINTS = { default: 3, 1100: 3, 768: 2, 480: 1 }

export default function PortfolioGalleryPage() {
  const { username, slug } = useParams()
  const [photographer, setPhotographer] = useState(null)
  const [gallery, setGallery] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [layout, setLayout] = useState('masonry') // 'masonry' | 'grid'
  const [slideshowActive, setSlideshowActive] = useState(false)
  const slideshowTimer = useRef(null)

  useEffect(() => {
    Promise.all([getPhotographerProfile(username), getPublicGallery(username, slug)])
      .then(([p, { gallery: g, photos: ph }]) => {
        setPhotographer(p)
        setGallery(g)
        setPhotos(ph)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [username, slug])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Auto-advance slideshow
  useEffect(() => {
    if (slideshowActive && lightboxIdx !== null) {
      slideshowTimer.current = setTimeout(() => {
        setLightboxIdx(i => {
          if (i >= photos.length - 1) {
            setSlideshowActive(false)
            return i
          }
          return i + 1
        })
      }, SLIDESHOW_INTERVAL)
    }
    return () => clearTimeout(slideshowTimer.current)
  }, [slideshowActive, lightboxIdx, photos.length])

  const handlePrev = useCallback(() => {
    setSlideshowActive(false)
    setLightboxIdx(i => Math.max(0, i - 1))
  }, [])

  const handleNext = useCallback(() => {
    setSlideshowActive(false)
    setLightboxIdx(i => Math.min(photos.length - 1, i + 1))
  }, [photos.length])

  const handleToggleSlideshow = useCallback(() => {
    setSlideshowActive(v => !v)
  }, [])

  const handleCloseLightbox = useCallback(() => {
    setSlideshowActive(false)
    setLightboxIdx(null)
  }, [])

  const handleStartSlideshow = useCallback(() => {
    if (photos.length === 0) return
    setLightboxIdx(0)
    setSlideshowActive(true)
  }, [photos.length])

  const displayName = photographer?.brand_name ||
    `${photographer?.first_name || ''} ${photographer?.last_name || ''}`.trim() ||
    photographer?.username || username

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Spinner size="lg" />
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      {gallery && (
        <Helmet>
          <title>{gallery.title} — {displayName}</title>
        </Helmet>
      )}

      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/10' : 'bg-black/50 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={`/p/${username}`} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {displayName}
          </Link>
          <h2 className="text-sm font-semibold text-white tracking-wide">{gallery?.title}</h2>
          <p className="text-sm text-white/30">{photos.length} photos</p>
        </div>
      </nav>

      {/* Gallery header */}
      <div className="pt-32 pb-10 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">{gallery?.title}</h1>
        {gallery?.description && (
          <p className="text-white/50 max-w-xl mx-auto">{gallery.description}</p>
        )}
        <div className="mt-4 w-12 h-px bg-white/20 mx-auto" />
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {/* Slideshow button */}
          {photos.length > 0 && (
            <button
              onClick={handleStartSlideshow}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-100 transition shadow"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Slideshow
            </button>
          )}
          <ShareBar url={window.location.href} title={`${gallery?.title} — ${displayName}`} />
        </div>

        {/* Layout toggle */}
        {photos.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-1">
            <button
              onClick={() => setLayout('masonry')}
              title="Masonry layout"
              className={`w-9 h-9 flex items-center justify-center rounded-lg border transition ${layout === 'masonry' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <rect x="2" y="2" width="7" height="5" rx="1" /><rect x="11" y="2" width="7" height="8" rx="1" /><rect x="2" y="9" width="7" height="9" rx="1" /><rect x="11" y="12" width="7" height="6" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => setLayout('grid')}
              title="Grid layout"
              className={`w-9 h-9 flex items-center justify-center rounded-lg border transition ${layout === 'grid' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <rect x="2" y="2" width="7" height="7" rx="1" /><rect x="11" y="2" width="7" height="7" rx="1" /><rect x="2" y="11" width="7" height="7" rx="1" /><rect x="11" y="11" width="7" height="7" rx="1" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Photo grid */}
      <div className="px-2 pb-20 max-w-7xl mx-auto">
        {photos.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <div className="text-6xl mb-4">📷</div>
            <p>No photos in this gallery yet.</p>
          </div>
        ) : layout === 'masonry' ? (
          <Masonry
            breakpointCols={BREAKPOINTS}
            className="flex -ml-2 w-auto"
            columnClassName="pl-2 bg-clip-padding"
          >
            {photos.map((photo, idx) => (
              <PhotoCard key={photo.id} photo={photo} idx={idx} onClick={() => setLightboxIdx(idx)} />
            ))}
          </Masonry>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
            {photos.map((photo, idx) => (
              <PhotoCard key={photo.id} photo={photo} idx={idx} onClick={() => setLightboxIdx(idx)} square />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 text-center">
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
          onClose={handleCloseLightbox}
          onPrev={handlePrev}
          onNext={handleNext}
          slideshowActive={slideshowActive}
          onToggleSlideshow={handleToggleSlideshow}
        />
      )}
    </div>
  )
}

function PhotoCard({ photo, idx, onClick, square }) {
  return (
    <div
      className={`group relative cursor-pointer overflow-hidden bg-zinc-900 rounded-sm ${square ? 'aspect-square' : 'mb-2'}`}
      onClick={onClick}
    >
      <img
        src={photo.thumb_url || SAMPLE_PHOTOS[idx % SAMPLE_PHOTOS.length]}
        alt={photo.title || ''}
        className={`block transition duration-500 group-hover:scale-105 group-hover:brightness-110 ${square ? 'w-full h-full object-cover' : 'w-full h-auto'}`}
        loading="lazy"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex items-end justify-start p-3">
        <div className="opacity-0 group-hover:opacity-100 transition duration-300">
          {photo.title && (
            <p className="text-white font-semibold text-xs leading-tight line-clamp-2">{photo.title}</p>
          )}
        </div>
      </div>
    </div>
  )
}
