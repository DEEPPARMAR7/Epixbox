import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import { getGallery, updateGallery } from '../../api/galleryApi'
import { getPhotos, deletePhoto } from '../../api/photoApi'
import {
  getGalleryAccessConfig,
  setGalleryPassword,
  removeGalleryPassword,
  setGalleryExpiry,
  removeGalleryExpiry,
} from '../../api/galleryAccessApi'

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=70',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&q=70',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&q=70',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300&q=70',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&q=70',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=70',
]

const VISIBILITY_CONFIG = {
  public: { label: 'Public', color: 'text-emerald-200 bg-emerald-500/20 border-emerald-300/30' },
  private: { label: 'Private', color: 'text-red-200 bg-red-500/20 border-red-300/30' },
  unlisted: { label: 'Unlisted', color: 'text-amber-200 bg-amber-500/20 border-amber-300/30' },
}

const INPUT = 'w-full px-3 py-2.5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-transparent text-sm bg-white/5 text-white transition'

function toDateTimeLocal(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function GalleryEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [gallery, setGallery] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', visibility: 'public' })
  const [accessLoading, setAccessLoading] = useState(true)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [expirySaving, setExpirySaving] = useState(false)
  const [accessConfig, setAccessConfig] = useState(null)
  const [passwordForm, setPasswordForm] = useState({ password: '', hint: '' })
  const [expiryForm, setExpiryForm] = useState({ expires_at: '', download_limit: '' })

  const loadAccessConfig = async () => {
    setAccessLoading(true)
    try {
      const config = await getGalleryAccessConfig(id)
      setAccessConfig(config)
      setPasswordForm((prev) => ({ ...prev, hint: config?.password_hint || '' }))
      setExpiryForm({
        expires_at: toDateTimeLocal(config?.expiry_date),
        download_limit: config?.download_limit ?? '',
      })
    } catch {
      toast.error('Failed to load access controls')
    } finally {
      setAccessLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([getGallery(id), getPhotos({ galleryId: id }), getGalleryAccessConfig(id)])
      .then(([g, p, config]) => {
        setGallery(g)
        setPhotos(p)
        setForm({ title: g.title || '', description: g.description || '', visibility: g.visibility || 'public' })
        setAccessConfig(config)
        setPasswordForm({ password: '', hint: config?.password_hint || '' })
        setExpiryForm({
          expires_at: toDateTimeLocal(config?.expiry_date),
          download_limit: config?.download_limit ?? '',
        })
      })
      .catch(() => toast.error('Failed to load gallery'))
      .finally(() => {
        setLoading(false)
        setAccessLoading(false)
      })
  }, [id])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateGallery(id, form)
      setGallery(updated)
      toast.success('Gallery saved!')
    } catch {
      toast.error('Failed to save')
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
    } catch {
      toast.error('Failed to delete photo')
    }
  }

  const handleSetPassword = async (e) => {
    e.preventDefault()
    if (!passwordForm.password.trim()) {
      toast.error('Password is required')
      return
    }
    setPasswordSaving(true)
    try {
      await setGalleryPassword(id, { password: passwordForm.password.trim(), hint: passwordForm.hint.trim() || null })
      setPasswordForm((prev) => ({ ...prev, password: '' }))
      await loadAccessConfig()
      toast.success('Gallery password saved')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save password')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleRemovePassword = async () => {
    if (!confirm('Remove password protection for this gallery?')) return
    setPasswordSaving(true)
    try {
      await removeGalleryPassword(id)
      await loadAccessConfig()
      toast.success('Password protection removed')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to remove password')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleSetExpiry = async (e) => {
    e.preventDefault()
    if (!expiryForm.expires_at) {
      toast.error('Expiry date is required')
      return
    }
    setExpirySaving(true)
    try {
      const payload = {
        expires_at: new Date(expiryForm.expires_at).toISOString(),
        download_limit: expiryForm.download_limit === '' ? null : Number(expiryForm.download_limit),
      }
      await setGalleryExpiry(id, payload)
      await loadAccessConfig()
      toast.success('Expiry settings saved')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save expiry settings')
    } finally {
      setExpirySaving(false)
    }
  }

  const handleRemoveExpiry = async () => {
    if (!confirm('Remove expiry and download limit for this gallery?')) return
    setExpirySaving(true)
    try {
      await removeGalleryExpiry(id)
      await loadAccessConfig()
      toast.success('Expiry removed')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to remove expiry')
    } finally {
      setExpirySaving(false)
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
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/dashboard/galleries" className="hover:text-emerald-300 transition">Library</Link>
        <span>/</span>
        <span className="text-slate-200 font-medium truncate">{gallery?.title}</span>
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
              className="bg-emerald-300 text-[#06210f] text-sm font-extrabold uppercase tracking-wide px-4 py-2 rounded-xl hover:bg-emerald-200 transition"
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
          <form onSubmit={handleSave} className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">Site Settings</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Title</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Visibility</label>
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
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Description</label>
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

          <div className="mt-6 bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Client Access Control</h2>

            {accessLoading ? (
              <div className="text-sm text-slate-300">Loading access settings...</div>
            ) : (
              <>
                <form onSubmit={handleSetPassword} className="space-y-3 border border-white/10 rounded-xl p-4 bg-white/5">
                  <p className="text-sm font-semibold text-white">Gallery Password</p>
                  <p className="text-xs text-slate-300">
                    Status: {accessConfig?.password_protected ? 'Protected' : 'Open'}
                  </p>
                  <input
                    type="password"
                    placeholder={accessConfig?.password_protected ? 'Set new password' : 'Set password'}
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, password: e.target.value }))}
                    className={INPUT}
                  />
                  <input
                    type="text"
                    placeholder="Password hint (optional)"
                    value={passwordForm.hint}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, hint: e.target.value }))}
                    className={INPUT}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" loading={passwordSaving} className="flex-1">
                      {accessConfig?.password_protected ? 'Update Password' : 'Enable Password'}
                    </Button>
                    {accessConfig?.password_protected && (
                      <button
                        type="button"
                        onClick={handleRemovePassword}
                        disabled={passwordSaving}
                        className="px-4 py-2 rounded-lg bg-red-500/15 border border-red-400/30 text-red-200 text-sm font-semibold hover:bg-red-500/25 disabled:opacity-60"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </form>

                <form onSubmit={handleSetExpiry} className="space-y-3 border border-white/10 rounded-xl p-4 bg-white/5">
                  <p className="text-sm font-semibold text-white">Expiry & Download Limits</p>
                  <p className="text-xs text-slate-300">
                    Remaining downloads: {accessConfig?.downloads_remaining ?? 'Unlimited'}
                  </p>
                  <input
                    type="datetime-local"
                    value={expiryForm.expires_at}
                    onChange={(e) => setExpiryForm((prev) => ({ ...prev, expires_at: e.target.value }))}
                    className={INPUT}
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Download limit (optional)"
                    value={expiryForm.download_limit}
                    onChange={(e) => setExpiryForm((prev) => ({ ...prev, download_limit: e.target.value }))}
                    className={INPUT}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" loading={expirySaving} className="flex-1">Save Expiry</Button>
                    {accessConfig?.expiry_date && (
                      <button
                        type="button"
                        onClick={handleRemoveExpiry}
                        disabled={expirySaving}
                        className="px-4 py-2 rounded-lg bg-red-500/15 border border-red-400/30 text-red-200 text-sm font-semibold hover:bg-red-500/25 disabled:opacity-60"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Photos grid */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Photos <span className="text-slate-400 font-normal text-sm">({photos.length})</span></h2>
              <button
                onClick={() => navigate(`/dashboard/galleries/${id}/upload`)}
                className="text-sm text-emerald-300 font-medium hover:underline"
              >
                + Add More
              </button>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-white/20 rounded-xl">
                <div className="text-4xl mb-3">📷</div>
                <p className="text-slate-300 text-sm font-medium mb-1">No photos yet</p>
                <button
                  onClick={() => navigate(`/dashboard/galleries/${id}/upload`)}
                  className="text-emerald-300 text-sm hover:underline font-medium"
                >
                  Upload photos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {photos.map((photo, idx) => (
                  <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-[#0a0f19] border border-white/10">
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
