import { useEffect, useState, useCallback } from 'react'
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

function Lightbox({ photo, index, total, onClose, onPrev, onNext, isSlideshow, setIsSlideshow }) {
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
      <button onClick={onClose} className="absolute top-5 right-6 text-white/60 hover:text-white text-4xl leading-none z-10 transition">
        &times;
      </button>

      {/* Counter & Slideshow Toggle */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
        <span className="text-white/40 text-sm tracking-widest">{index + 1} / {total}</span>
        {isSlideshow !== undefined && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsSlideshow(!isSlideshow); }}
            className="text-white/60 hover:text-white transition text-sm"
          >
            {isSlideshow ? '⏸ Pause' : '▶ Play'}
          </button>
        )}
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
          className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl"
        />
        {photo.title && (
          <div className="absolute bottom-0 inset-x-0 text-center pb-3">
            <p className="text-white/60 text-sm">{photo.title}</p>
          </div>
        )}
      </div>

      {/* EXIF Info Panel */}
      <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-4 max-w-xs" onClick={e => e.stopPropagation()}>
        {photo.title && <p className="text-white font-semibold text-sm mb-3">{photo.title}</p>}
        <div className="space-y-1.5 text-xs text-white/60">
          {photo.exif_make && photo.exif_model && (
            <div className="flex justify-between gap-4">
              <span>Camera</span>
              <span className="text-white/80">{photo.exif_make} {photo.exif_model}</span>
            </div>
          )}
          {photo.exif_focal_length && (
            <div className="flex justify-between gap-4">
              <span>Focal Length</span>
              <span className="text-white/80">{photo.exif_focal_length}mm</span>
            </div>
          )}
          {photo.exif_aperture && (
            <div className="flex justify-between gap-4">
              <span>Aperture</span>
              <span className="text-white/80">f/{photo.exif_aperture}</span>
            </div>
          )}
          {photo.exif_shutter_speed && (
            <div className="flex justify-between gap-4">
              <span>Shutter</span>
              <span className="text-white/80">{photo.exif_shutter_speed}s</span>
            </div>
          )}
          {photo.exif_iso && (
            <div className="flex justify-between gap-4">
              <span>ISO</span>
              <span className="text-white/80">{photo.exif_iso}</span>
            </div>
          )}
        </div>
      </div>

      {/* Buy Print */}
      <div className="absolute bottom-6 right-6">
        <Link
          to={`/shop/${photo.id}`}
          state={{ photoTitle: photo.title }}
          onClick={e => e.stopPropagation()}
          className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition shadow-lg"
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
  const [photographer, setPhotographer] = useState(null)
  const [gallery, setGallery] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [isSlideshow, setIsSlideshow] = useState(false)

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

  const handlePrev = useCallback(() => setLightboxIdx(i => Math.max(0, i - 1)), [])
  const handleNext = useCallback(() => setLightboxIdx(i => Math.min(photos.length - 1, i + 1)), [photos.length])

  // Slideshow auto-advance
  useEffect(() => {
    if (!isSlideshow || lightboxIdx === null) return
    const timer = setInterval(() => {
      setLightboxIdx(i => (i + 1 >= photos.length ? 0 : i + 1))
    }, 3000)
    return () => clearInterval(timer)
  }, [isSlideshow, lightboxIdx, photos.length])

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
      <div className="pt-32 pb-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">{gallery?.title}</h1>
        {gallery?.description && (
          <p className="text-white/50 max-w-xl mx-auto">{gallery.description}</p>
        )}
        <div className="mt-4 w-12 h-px bg-white/20 mx-auto" />
        <div className="mt-6 flex justify-center gap-3 items-center">
          <ShareBar url={window.location.href} title={`${gallery?.title} — ${displayName}`} />
          <button
            onClick={() => { setLightboxIdx(0); setIsSlideshow(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Slideshow
          </button>
        </div>
      </div>

      {/* Masonry grid */}
      <div className="px-2 pb-20 max-w-7xl mx-auto">
        {photos.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <div className="text-6xl mb-4">📷</div>
            <p>No photos in this gallery yet.</p>
          </div>
        ) : (
          <Masonry
            breakpointCols={BREAKPOINTS}
            className="flex -ml-1 w-auto"
            columnClassName="pl-1 bg-clip-padding"
          >
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="mb-1 group relative cursor-pointer overflow-hidden bg-zinc-900"
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
          onClose={() => { setLightboxIdx(null); setIsSlideshow(false); }}
          onPrev={handlePrev}
          onNext={handleNext}
          isSlideshow={isSlideshow}
          setIsSlideshow={setIsSlideshow}
        />
      )}
    </div>
  )
}
