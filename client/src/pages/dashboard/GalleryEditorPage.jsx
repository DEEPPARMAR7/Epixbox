import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import { getGallery, updateGallery } from '../../api/galleryApi'
import { getPhotos, deletePhoto } from '../../api/photoApi'

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=70',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&q=70',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&q=70',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300&q=70',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&q=70',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=70',
]

const VISIBILITY_CONFIG = {
  public: { label: 'Public', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  private: { label: 'Private', color: 'text-red-600 bg-red-50 border-red-200' },
  unlisted: { label: 'Unlisted', color: 'text-amber-600 bg-amber-50 border-amber-200' },
}

const INPUT = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white transition'

export default function GalleryEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [gallery, setGallery] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', visibility: 'public' })

  useEffect(() => {
    Promise.all([getGallery(id), getPhotos({ galleryId: id })])
      .then(([g, p]) => {
        setGallery(g)
        setPhotos(p)
        setForm({ title: g.title || '', description: g.description || '', visibility: g.visibility || 'public' })
      })
      .catch(() => toast.error('Failed to load gallery'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateGallery(id, form)
      setGallery(updated)
      toast.success('Gallery saved!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Delete this photo permanently?')) return
    try {
      await deletePhoto(photoId)
      setPhotos(p => p.filter(ph => ph.id !== photoId))
      toast.success('Photo deleted')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete photo')
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-20"><Spinner /></div>
    </DashboardLayout>
  )

  const vis = VISIBILITY_CONFIG[gallery?.visibility] || VISIBILITY_CONFIG.public
  const coverImg = gallery?.cover_url || photos[0]?.thumb_url || SAMPLE_PHOTOS[0]

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/dashboard/galleries" className="hover:text-indigo-600 transition">Galleries</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate">{gallery?.title}</span>
      </div>

      {/* Gallery hero strip */}
      <div className="relative h-40 rounded-2xl overflow-hidden mb-8 bg-gray-100">
        <img src={coverImg} alt={gallery?.title} className="w-full h-full object-cover" onError={e => { e.target.src = SAMPLE_PHOTOS[0] }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-end p-6 justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">{gallery?.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${vis.color}`}>
                {vis.label}
              </span>
              <span className="text-white/60 text-xs">{photos.length} photos</span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => navigate(`/dashboard/galleries/${id}/upload`)}
              className="bg-white text-gray-900 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-100 transition"
            >
              + Upload Photos
            </button>
            <a
              href={`/p/${gallery?.user?.username}/${gallery?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/20 transition"
            >
              View Public ↗
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings panel */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 mb-2">Gallery Settings</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Visibility</label>
              <select
                value={form.visibility}
                onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}
                className={INPUT}
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                className={INPUT + ' resize-none'}
                placeholder="Optional description..."
              />
            </div>
            <Button type="submit" loading={saving} className="w-full">Save Changes</Button>
          </form>
        </div>

        {/* Photos grid */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Photos <span className="text-gray-400 font-normal text-sm">({photos.length})</span></h2>
              <button
                onClick={() => navigate(`/dashboard/galleries/${id}/upload`)}
                className="text-sm text-indigo-600 font-medium hover:underline"
              >
                + Add More
              </button>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                <div className="text-4xl mb-3">📷</div>
                <p className="text-gray-500 text-sm font-medium mb-1">No photos yet</p>
                <button
                  onClick={() => navigate(`/dashboard/galleries/${id}/upload`)}
                  className="text-indigo-600 text-sm hover:underline font-medium"
                >
                  Upload photos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {photos.map((photo, idx) => (
                  <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                    <img
                      src={photo.thumb_url || SAMPLE_PHOTOS[idx % SAMPLE_PHOTOS.length]}
                      alt={photo.title || ''}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-75"
                      onError={e => { e.target.src = SAMPLE_PHOTOS[idx % SAMPLE_PHOTOS.length] }}
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => navigate(`/dashboard/photos/${photo.id}`)}
                        className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-red-600 transition"
                      >
                        Del
                      </button>
                    </div>
                    {photo.title && (
                      <div className="absolute bottom-0 inset-x-0 px-2 py-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">
                        <p className="text-white text-xs truncate">{photo.title}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
