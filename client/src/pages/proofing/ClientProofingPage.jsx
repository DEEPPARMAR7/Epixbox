import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Spinner from '../../components/common/Spinner'
import {
  getClientSession,
  submitSelection,
  submitComment,
} from '../../api/proofingApi'

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-xl transition ${
            star <= (hover || value) ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star === value ? 0 : star)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function CommentModal({ photo, sessionToken, onClose }) {
  const [comments, setComments] = useState(photo.comments || [])
  const [body, setBody] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    try {
      const newComment = await submitComment(sessionToken, {
        photo_id: photo.id,
        body: body.trim(),
        author_name: authorName.trim() || 'Client',
      })
      setComments((prev) => [...prev, newComment])
      setBody('')
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900">Comments{photo.title ? ` — ${photo.title}` : ''}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No comments yet.</p>
          ) : (
            comments.map((c, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700">
                  {c.author_name || 'Client'}
                  {c.is_photographer && (
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Photographer</span>
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">{c.body}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <textarea
            placeholder="Add a comment..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PhotoCard({ photo, sessionToken, onUpdate }) {
  const [commentOpen, setCommentOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  const handleStarChange = async (stars) => {
    setUpdating(true)
    try {
      await submitSelection(sessionToken, {
        photo_id: photo.id,
        star_rating: stars,
        is_selected: photo.is_selected,
      })
      onUpdate(photo.id, { star_rating: stars })
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  const handleToggleSelect = async () => {
    setUpdating(true)
    try {
      await submitSelection(sessionToken, {
        photo_id: photo.id,
        star_rating: photo.star_rating || 0,
        is_selected: !photo.is_selected,
      })
      onUpdate(photo.id, { is_selected: !photo.is_selected })
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <div
        className={`rounded-xl overflow-hidden border-2 transition ${
          photo.is_selected ? 'border-indigo-500 shadow-lg shadow-indigo-100' : 'border-gray-200'
        }`}
      >
        <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-300 text-5xl relative">
          📷
          {photo.is_selected && (
            <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              ✓
            </div>
          )}
        </div>

        <div className="p-3 bg-white">
          {photo.title && <p className="text-sm font-medium text-gray-700 mb-2 truncate">{photo.title}</p>}

          <div className="flex items-center justify-between">
            <StarRating value={photo.star_rating || 0} onChange={handleStarChange} />
            <div className="flex gap-1">
              <button
                onClick={() => setCommentOpen(true)}
                className="text-xs text-gray-400 hover:text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50 transition flex items-center gap-1"
              >
                <span>💬</span>
                {(photo.comments?.length || 0) > 0 && (
                  <span className="text-indigo-600 font-medium">{photo.comments.length}</span>
                )}
              </button>
              <button
                onClick={handleToggleSelect}
                disabled={updating}
                className={`text-xs px-2 py-1 rounded font-medium transition ${
                  photo.is_selected
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {photo.is_selected ? 'Selected' : 'Select'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {commentOpen && (
        <CommentModal
          photo={photo}
          sessionToken={sessionToken}
          onClose={() => setCommentOpen(false)}
        />
      )}
    </>
  )
}

export default function ClientProofingPage() {
  const { token } = useParams()
  const [session, setSession] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getClientSession(token)
      .then(({ session: s, photos: ph }) => {
        setSession(s)
        setPhotos(ph)
      })
      .catch(() => setError('This proofing link is invalid or has expired.'))
      .finally(() => setLoading(false))
  }, [token])

  const handleUpdate = (photoId, updates) => {
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, ...updates } : p)))
  }

  const selectedCount = photos.filter((p) => p.is_selected).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Photo Review — {session?.gallery?.title || 'Gallery'}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-bold text-gray-900">{session?.gallery?.title || 'Photo Review'}</h1>
              <p className="text-sm text-gray-500">
                {photos.length} photos · Select your favorites
              </p>
            </div>
            {selectedCount > 0 && (
              <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                {selectedCount} photo{selectedCount !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        {session && (
          <div className="max-w-7xl mx-auto px-4 pt-6">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-800">
              <p className="font-medium mb-1">How to review your photos:</p>
              <ul className="list-disc list-inside space-y-0.5 text-indigo-700">
                <li>Click <strong>Select</strong> to mark photos you want</li>
                <li>Use the <strong>★ stars</strong> to rate your favorites</li>
                {session.allow_comments && <li>Click <strong>💬</strong> to leave feedback on any photo</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Photo Grid */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {photos.length === 0 ? (
            <p className="text-center text-gray-400 py-20">No photos in this gallery.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  sessionToken={token}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer summary */}
        {selectedCount > 0 && (
          <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-600 shadow-lg">
            You've selected <span className="font-semibold text-indigo-600">{selectedCount}</span> photo{selectedCount !== 1 ? 's' : ''}.
            Your selections are saved automatically.
          </div>
        )}
      </div>
    </>
  )
}
