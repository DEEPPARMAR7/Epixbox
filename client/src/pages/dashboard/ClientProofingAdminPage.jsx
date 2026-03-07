import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import { getSessions, createSession, deleteSession, sendInvite } from '../../api/proofingApi'
import { getGalleries } from '../../api/galleryApi'
import { formatDate } from '../../utils/formatters'

export default function ClientProofingAdminPage() {
  const [sessions, setSessions] = useState([])
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ gallery_id: '', client_name: '', client_email: '', message: '' })

  const load = () => {
    Promise.all([getSessions(), getGalleries()])
      .then(([s, g]) => { setSessions(s); setGalleries(g) })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.gallery_id) return toast.error('Select a gallery')
    setCreating(true)
    try {
      await createSession(form)
      toast.success('Proofing session created!')
      setShowCreate(false)
      setForm({ gallery_id: '', client_name: '', client_email: '', message: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create session')
    } finally {
      setCreating(false)
    }
  }

  const handleSendInvite = async (id) => {
    try {
      await sendInvite(id)
      toast.success('Invite email sent!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this proofing session?')) return
    try {
      await deleteSession(id)
      setSessions(s => s.filter(x => x.id !== id))
      toast.success('Session deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const copyLink = (token) => {
    const link = `${window.location.origin}/proof/${token}`
    navigator.clipboard.writeText(link)
    toast.success('Link copied!')
  }

  const BASE_URL = window.location.origin

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Client Proofing</h1>
        <Button onClick={() => setShowCreate(true)}>+ New Session</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-5xl mb-4">✅</p>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No proofing sessions yet</h3>
          <p className="text-gray-400 text-sm mb-6">Create a session to share photos with clients for review.</p>
          <Button onClick={() => setShowCreate(true)}>Create Session</Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {sessions.map((s, idx) => (
            <div key={s.id} className={`p-5 ${idx !== sessions.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">
                    {s.client_name || 'Unnamed Client'}
                    {s.client_email && <span className="text-sm text-gray-400 font-normal ml-2">({s.client_email})</span>}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Gallery: {s.Gallery?.title || '—'} · Created {formatDate(s.created_at)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      readOnly
                      value={`${BASE_URL}/proof/${s.share_token}`}
                      className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-1 w-64 truncate"
                    />
                    <button
                      onClick={() => copyLink(s.share_token)}
                      className="text-xs text-indigo-600 hover:underline flex-shrink-0"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {s.client_email && (
                    <Button variant="outline" size="sm" onClick={() => handleSendInvite(s.id)}>
                      Send Email
                    </Button>
                  )}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(s.id)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Proofing Session">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gallery *</label>
            <select
              value={form.gallery_id}
              onChange={e => setForm(f => ({ ...f, gallery_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">Select a gallery...</option>
              {galleries.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
            <input
              value={form.client_name}
              onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
              placeholder="e.g. Sarah & Mike"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
            <input
              type="email"
              value={form.client_email}
              onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
              placeholder="client@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message to Client</label>
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Please review and select your favorites..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={creating}>Create Session</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
