import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import CreatableSelect from 'react-select/creatable'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import { getPhoto, updatePhoto, deletePhoto, addTags, removeTag } from '../../api/photoApi'
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

  const exifRows = photo ? [
    { label: 'Camera', value: [photo.exif_make, photo.exif_model].filter(Boolean).join(' ') || '—' },
    { label: 'Lens', value: photo.exif_lens || '—' },
    { label: 'Focal Length', value: photo.exif_focal_length || '—' },
    { label: 'Aperture', value: photo.exif_aperture || '—' },
    { label: 'Shutter Speed', value: photo.exif_shutter_speed || '—' },
    { label: 'ISO', value: photo.exif_iso || '—' },
    { label: 'Date Taken', value: photo.exif_taken_at ? formatDate(photo.exif_taken_at) : '—' },
  ] : []

  if (loading) return <DashboardLayout><div className="flex justify-center py-12"><Spinner /></div></DashboardLayout>
  if (!photo) return <DashboardLayout><p className="text-center text-gray-500 mt-12">Photo not found</p></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-indigo-600 hover:underline">← Back</button>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{photo.title || photo.filename_original}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Photo Preview */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
          <p className="text-gray-600 text-6xl">📷</p>
        </div>

        {/* Edit Panel */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Add a title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Add a description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <CreatableSelect
                isMulti
                value={tags}
                onChange={handleTagChange}
                placeholder="Add tags..."
                classNamePrefix="select"
                styles={{
                  control: (base) => ({ ...base, borderColor: '#d1d5db', borderRadius: '0.5rem', minHeight: '38px' }),
                }}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} loading={saving}>Save</Button>
              <Button variant="danger" onClick={handleDelete}>Delete Photo</Button>
            </div>
          </div>

          {/* EXIF Data */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Photo Information</h3>
            <div className="space-y-2">
              {exifRows.map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="text-gray-900 font-medium">{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dimensions</span>
                <span className="text-gray-900 font-medium">
                  {photo.width && photo.height ? `${photo.width} × ${photo.height}` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">File Size</span>
                <span className="text-gray-900 font-medium">{formatFileSize(photo.file_size_bytes)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
