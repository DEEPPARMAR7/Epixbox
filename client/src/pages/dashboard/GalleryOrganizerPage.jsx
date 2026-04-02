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
  public: { label: 'Public', color: 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-300/30', dot: 'bg-emerald-300' },
  private: { label: 'Private', color: 'bg-red-500/20 text-red-200 ring-1 ring-red-300/30', dot: 'bg-red-300' },
  unlisted: { label: 'Unlisted', color: 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-300/30', dot: 'bg-amber-300' },
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
    } catch {
      toast.error('Failed to delete gallery')
    } finally {
      setDeleting(false)
    }
  }

  const INPUT = 'w-full px-3 py-2.5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-transparent text-sm bg-white/5 text-white transition'
  const publicCount = galleries.filter(g => g.visibility === 'public').length
  const privateCount = galleries.filter(g => g.visibility === 'private').length
  const unlistedCount = galleries.filter(g => g.visibility === 'unlisted').length

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Organize</h1>
          <p className="text-slate-400 text-sm mt-1">{galleries.length} {galleries.length === 1 ? 'item' : 'items'} in your library</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-emerald-300 text-[#06210f] px-5 py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-wide hover:bg-emerald-200 transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Gallery
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
          >
            + Create
          </button>
          <button
            onClick={fetchGalleries}
            className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
          >
            Refresh
          </button>
          <div className="ml-auto flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-emerald-200 ring-1 ring-emerald-300/30">Public {publicCount}</span>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-amber-200 ring-1 ring-amber-300/30">Unlisted {unlistedCount}</span>
            <span className="rounded-full bg-red-500/20 px-2.5 py-1 text-red-200 ring-1 ring-red-300/30">Private {privateCount}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-white/20 rounded-2xl bg-white/5">
          <div className="w-16 h-16 bg-emerald-300/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🖼️</div>
          <h3 className="text-lg font-bold text-white mb-2">No galleries yet</h3>
          <p className="text-slate-400 text-sm mb-6">Create your first gallery to organize your photos.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-emerald-300 text-[#06210f] px-6 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wide hover:bg-emerald-200 transition"
          >
            + Create Gallery
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* Create new card */}
          <button
            onClick={() => setShowCreate(true)}
            className="group flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed border-white/20 rounded-2xl hover:border-emerald-300/40 hover:bg-emerald-300/10 transition text-slate-400 hover:text-emerald-200"
          >
            <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center mb-2 text-xl font-light">+</div>
            <span className="text-sm font-semibold">New Gallery</span>
          </button>

          {galleries.map((g, i) => {
            const vis = VISIBILITY_CONFIG[g.visibility] || VISIBILITY_CONFIG.public
            return (
              <div key={g.id} className="group relative bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-white/25 transition">
                {/* Cover image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-900/60">
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
                  <h3 className="font-bold text-white text-sm truncate">{g.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-400">{g.photos_count || 0} photos</p>
                    <Link
                      to={`/dashboard/galleries/${g.id}/edit`}
                      className="text-xs text-emerald-300 font-medium hover:underline"
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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Title *</label>
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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional description..."
              rows={3}
              className={INPUT + ' resize-none'}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Visibility</label>
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
        <p className="text-sm text-slate-300 mb-6">
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
