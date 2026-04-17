import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import CreatableSelect from 'react-select/creatable'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import { getPhoto, getPhotoDownloadUrl, updatePhoto, deletePhoto, addTags, removeTag } from '../../api/photoApi'
import { formatFileSize, formatDate } from '../../utils/formatters'

export default function PhotoDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })
  const [tags, setTags] = useState([])

  useEffect(() => {
    getPhoto(id)
      .then(p => {
        setPhoto(p)
        setForm({ title: p.title || '', description: p.description || '' })
        setTags((p.Tags || []).map(t => ({ value: t.id, label: t.name })))
      })
      .catch(() => toast.error('Photo not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updatePhoto(id, form)
      setPhoto(updated)
      toast.success('Photo saved!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleTagChange = async (newTags) => {
    const added = newTags.filter(t => !tags.find(ot => ot.value === t.value))
    const removed = tags.filter(t => !newTags.find(nt => nt.value === t.value))
    try {
      if (added.length) {
        const updated = await addTags(id, added.map(t => t.label))
        setTags((updated.Tags || []).map(t => ({ value: t.id, label: t.name })))
      }
      for (const r of removed) {
        await removeTag(id, r.value)
        setTags(prev => prev.filter(t => t.value !== r.value))
      }
    } catch {
      toast.error('Failed to update tags')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Permanently delete this photo?')) return
    try {
      await deletePhoto(id)
      toast.success('Photo deleted')
      navigate(-1)
    } catch {
      toast.error('Failed to delete photo')
    }
  }

  const handleDownload = async (variant = 'original') => {
    try {
      const data = await getPhotoDownloadUrl(id, variant)
      const response = await fetch(data.url)
      const blob = await response.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = data.filename || photo.filename_original || 'photo'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000)
      toast.success(`${variant === 'original' ? 'Original' : variant} download started`)
    } catch {
      toast.error('Failed to generate download link')
    }
  }

  const exifRows = photo ? [
    { label: 'Camera', value: [photo.exif_make, photo.exif_model].filter(Boolean).join(' ') || '—' },
    { label: 'Lens', value: photo.exif_lens || '—' },
    { label: 'Focal Length', value: photo.exif_focal_length || '—' },
    { label: 'Aperture', value: photo.exif_aperture || '—' },
    { label: 'Shutter Speed', value: photo.exif_shutter_speed || '—' },
    { label: 'ISO', value: photo.exif_iso || '—' },
    { label: 'Date Taken', value: photo.exif_taken_at ? formatDate(photo.exif_taken_at) : '—' },
    { label: 'Original File', value: photo.original_url ? 'Preserved' : 'Unavailable' },
  ] : []

  if (loading) return <DashboardLayout><div className="flex justify-center py-12"><Spinner /></div></DashboardLayout>
  if (!photo) return <DashboardLayout><p className="text-center text-slate-400 mt-12">Photo not found</p></DashboardLayout>

  const previewSrc = photo.display_url || photo.thumb_url || photo.medium_url || photo.large_url || photo.original_url || photo.url

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={() => navigate(-1)} className="text-sm font-semibold text-slate-300 hover:text-white">← Back to Library</button>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Photo</p>
          <h1 className="text-lg font-bold text-white">{photo.title || photo.filename_original}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr),360px]">
        <div className="rounded-xl border border-white/10 bg-[#0b1320] p-2">
          <div className="flex min-h-[520px] items-center justify-center overflow-hidden rounded-lg bg-black/30">
            {previewSrc ? (
              <img src={previewSrc} alt={photo.title || photo.filename_original || 'Photo'} className="max-h-[72vh] w-auto object-contain" />
            ) : (
              <p className="text-4xl text-slate-500">📷</p>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#0d1626] p-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Title</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Add title"
                className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full resize-none rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tags</label>
              <CreatableSelect
                isMulti
                value={tags}
                onChange={handleTagChange}
                placeholder="Add tags"
                classNamePrefix="select"
                styles={{
                  control: (base) => ({ ...base, borderColor: 'rgba(255,255,255,0.2)', borderRadius: '0.5rem', minHeight: '38px', backgroundColor: 'rgba(0,0,0,0.2)', color: '#ffffff' }),
                  menu: (base) => ({ ...base, backgroundColor: '#0d1626', color: '#fff' }),
                  singleValue: (base) => ({ ...base, color: '#fff' }),
                  input: (base) => ({ ...base, color: '#fff' }),
                }}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSave} loading={saving}>Save</Button>
              <Button variant="danger" onClick={handleDelete}>Delete</Button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button onClick={() => handleDownload('original')} className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-300/15">Download Original</button>
              <button onClick={() => handleDownload('large')} className="rounded-md border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">Large</button>
              <button onClick={() => handleDownload('medium')} className="rounded-md border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">Medium</button>
              <button onClick={() => handleDownload('thumb')} className="rounded-md border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">Thumb</button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0d1626] p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Info</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Dimensions</span><span className="text-slate-200">{photo.width && photo.height ? `${photo.width} × ${photo.height}` : '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">File Size</span><span className="text-slate-200">{formatFileSize(photo.file_size_bytes)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Taken</span><span className="text-slate-200">{photo.exif_taken_at ? formatDate(photo.exif_taken_at) : '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Original Preserved</span><span className="text-slate-200">{photo.s3_key_original ? 'Yes' : 'No'}</span></div>
              <details className="pt-1">
                <summary className="cursor-pointer text-slate-300">More EXIF</summary>
                <div className="mt-2 space-y-1">
                  {exifRows.map(row => (
                    <div key={row.label} className="flex justify-between gap-3">
                      <span className="text-slate-500">{row.label}</span>
                      <span className="text-right text-slate-300">{row.value}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  )
}
