import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import { getGalleries, createGallery, deleteGallery } from '../../api/galleryApi'

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=70',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=70',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=70',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=70',
  'https://images.unsplash.com/photo-1502657877623-f66bf489d236?w=400&q=70',
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70',
]

const VISIBILITY_CONFIG = {
  public: { label: 'Public', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
  private: { label: 'Private', color: 'bg-red-100 text-red-700', dot: 'bg-red-400' },
  unlisted: { label: 'Unlisted', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
}

export default function GalleryOrganizerPage() {
  const navigate = useNavigate()
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', visibility: 'public' })
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchGalleries = () => {
    setLoading(true)
    getGalleries()
      .then(setGalleries)
      .catch(() => toast.error('Failed to load galleries'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchGalleries() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    setCreating(true)
    try {
      await createGallery(form)
      toast.success('Gallery created!')
      setShowCreate(false)
      setForm({ title: '', description: '', visibility: 'public' })
      fetchGalleries()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create gallery')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteGallery(deleteId)
      toast.success('Gallery deleted')
      setDeleteId(null)
      fetchGalleries()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete gallery')
    } finally {
      setDeleting(false)
    }
  }

  const INPUT = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white transition'

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Galleries</h1>
          <p className="text-gray-400 text-sm mt-1">{galleries.length} {galleries.length === 1 ? 'collection' : 'collections'}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Gallery
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🖼️</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No galleries yet</h3>
          <p className="text-gray-400 text-sm mb-6">Create your first gallery to organize your photos.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
          >
            + Create Gallery
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* Create new card */}
          <button
            onClick={() => setShowCreate(true)}
            className="group flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed border-gray-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/30 transition text-gray-400 hover:text-indigo-600"
          >
            <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center mb-2 text-xl font-light">+</div>
            <span className="text-sm font-semibold">New Gallery</span>
          </button>

          {galleries.map((g, i) => {
            const vis = VISIBILITY_CONFIG[g.visibility] || VISIBILITY_CONFIG.public
            return (
              <div key={g.id} className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition">
                {/* Cover image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={g.cover_url || COVER_IMAGES[i % COVER_IMAGES.length]}
                    alt={g.title}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    onError={e => { e.target.src = COVER_IMAGES[i % COVER_IMAGES.length] }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Visibility badge */}
                  <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${vis.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${vis.dot}`} />
                    {vis.label}
                  </span>

                  {/* Hover actions overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-2">
                    <button
                      onClick={() => navigate(`/dashboard/galleries/${g.id}/upload`)}
                      className="bg-white text-gray-900 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      Upload
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/galleries/${g.id}/edit`)}
                      className="bg-white text-gray-900 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(g.id)}
                      className="bg-red-500 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{g.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">{g.photos_count || 0} photos</p>
                    <Link
                      to={`/dashboard/galleries/${g.id}/edit`}
                      className="text-xs text-indigo-600 font-medium hover:underline"
                    >
                      Manage →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Gallery">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Summer Wedding 2024"
              className={INPUT}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional description..."
              rows={3}
              className={INPUT + ' resize-none'}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Visibility</label>
            <select
              value={form.visibility}
              onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}
              className={INPUT}
            >
              <option value="public">Public — visible on your portfolio</option>
              <option value="unlisted">Unlisted — only accessible by link</option>
              <option value="private">Private — only you can see it</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={creating}>Create Gallery</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Gallery" size="sm">
        <p className="text-sm text-gray-600 mb-6">
          This will permanently delete the gallery and all its photos. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete Gallery</Button>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
