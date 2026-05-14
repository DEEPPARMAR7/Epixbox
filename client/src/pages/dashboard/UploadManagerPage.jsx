import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import { uploadPhotos } from '../../api/uploadApi'
import { getBilling } from '../../api/settingsApi'
import { formatFileSize } from '../../utils/formatters'

function FileItem({ file, progress, status }) {
  const isVideo = String(file.type || '').startsWith('video/')
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="w-10 h-10 bg-[#0a0f19] rounded flex items-center justify-center text-xl flex-shrink-0">
        {isVideo ? '🎬' : '📷'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-100 truncate">{file.name}</p>
        <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
        {status === 'uploading' && (
          <div className="mt-1.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-300 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      <span className={`text-xs font-medium flex-shrink-0 ${
        status === 'done' ? 'text-emerald-300' :
        status === 'error' ? 'text-red-300' :
        status === 'uploading' ? 'text-emerald-200' : 'text-slate-400'
      }`}>
        {status === 'done' ? '✓ Done' :
         status === 'error' ? '✗ Error' :
         status === 'uploading' ? `${progress}%` : 'Queued'}
      </span>
    </div>
  )
}

export default function UploadManagerPage() {
  const navigate = useNavigate()
  const { id: galleryId } = useParams()
  const [queue, setQueue] = useState([]) // { file, id, progress, status }
  const [uploading, setUploading] = useState(false)
  const [planLimits, setPlanLimits] = useState({ maxUploadFileSizeMb: 50, maxUploadBatch: 50 })

  useEffect(() => {
    let cancelled = false

    const loadLimits = async () => {
      try {
        const data = await getBilling()
        const tierLimits = data?.tier_limits
        if (!cancelled && tierLimits) {
          setPlanLimits({
            maxUploadFileSizeMb: Number(tierLimits.maxUploadFileSizeMb || 50),
            maxUploadBatch: Number(tierLimits.maxUploadBatch || 50),
          })
        }
      } catch {
        // Keep safe defaults when billing endpoint is unavailable.
      }
    }

    loadLimits()
    return () => {
      cancelled = true
    }
  }, [])

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections?.length) {
      const firstReason = fileRejections[0]?.errors?.[0]?.message
      toast.error(firstReason || 'Some files were rejected. Please check file type and size limits.')
    }

    if (!acceptedFiles?.length) return

    const remainingSlots = Math.max(0, planLimits.maxUploadBatch - queue.length)
    if (remainingSlots <= 0) {
      toast.error(`Queue is full. Your plan allows up to ${planLimits.maxUploadBatch} files per upload.`)
      return
    }

    const trimmed = acceptedFiles.slice(0, remainingSlots)
    if (trimmed.length < acceptedFiles.length) {
      toast.error(`Only ${remainingSlots} more file${remainingSlots === 1 ? '' : 's'} can be queued in this upload.`)
    }

    const newItems = acceptedFiles.map(file => ({
      file,
      id: `${file.name}-${Date.now()}`,
      progress: 0,
      status: 'queued',
    }))
    setQueue(prev => [...prev, ...newItems.slice(0, remainingSlots)])
  }, [planLimits.maxUploadBatch, queue.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.heic', '.heif'],
      'video/*': ['.mp4', '.mov', '.m4v', '.webm'],
    },
    maxSize: planLimits.maxUploadFileSizeMb * 1024 * 1024,
    multiple: true,
  })

  const handleUpload = async () => {
    const pending = queue.filter(q => q.status === 'queued')
    if (!pending.length) return toast.error('No files queued')
    setUploading(true)

    const formData = new FormData()
    formData.append('gallery_id', galleryId)
    pending.forEach(item => formData.append('photos', item.file))

    // Set all to uploading
    setQueue(q => q.map(item =>
      pending.find(p => p.id === item.id) ? { ...item, status: 'uploading' } : item
    ))

    try {
      await uploadPhotos(formData, (progressEvent) => {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setQueue(q => q.map(item =>
          pending.find(p => p.id === item.id) ? { ...item, progress: pct } : item
        ))
      })
      setQueue(q => q.map(item =>
        pending.find(p => p.id === item.id) ? { ...item, progress: 100, status: 'done' } : item
      ))
      toast.success(`${pending.length} file${pending.length > 1 ? 's' : ''} uploaded!`)
    } catch (err) {
      setQueue(q => q.map(item =>
        pending.find(p => p.id === item.id) ? { ...item, status: 'error' } : item
      ))

      if (err?.code === 'ECONNABORTED') {
        toast.error('Upload request timed out while processing. Refresh the gallery in a moment; files may still complete.')
        return
      }

      const payload = err?.response?.data || {}
      if (payload.code === 'GALLERY_ACCOUNT_MISMATCH' && payload.firstGalleryId) {
        toast('You switched accounts. Redirecting to your gallery upload screen...')
        navigate(`/dashboard/galleries/${payload.firstGalleryId}/upload`, { replace: true })
        return
      }

      if (payload.code === 'NO_GALLERY_FOR_ACCOUNT') {
        toast.error('Create a gallery in this account first, then upload files.')
        navigate('/dashboard/galleries', { replace: true })
        return
      }

      const fallbackMessage = err?.message || 'Upload failed'
      toast.error(err?.response?.data?.error || fallbackMessage)
    } finally {
      setUploading(false)
    }
  }

  const queuedCount = queue.filter(q => q.status === 'queued').length

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link to={`/dashboard/galleries/${galleryId}/edit`} className="text-sm text-emerald-300 hover:underline">← Back to Gallery</Link>
        <h1 className="text-2xl font-black text-white mt-2">Upload</h1>
        <p className="text-sm text-slate-400 mt-1">Drag files into your library and publish when ready.</p>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition mb-6 ${
          isDragActive ? 'border-emerald-300 bg-emerald-300/10' : 'border-white/20 bg-white/5 hover:border-emerald-300/50 hover:bg-white/10'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-5xl mb-3">📤</div>
        <p className="text-base font-semibold text-white">
          {isDragActive ? 'Drop your files here!' : 'Drag & drop photos or videos here'}
        </p>
        <p className="text-sm text-slate-400 mt-1">
          or click to browse — JPG, PNG, WEBP, TIFF, HEIC, MP4, MOV, M4V, WEBM up to {planLimits.maxUploadFileSizeMb}MB each
        </p>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">
              Upload Queue ({queue.length} file{queue.length !== 1 ? 's' : ''})
            </h2>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => setQueue([])}>Clear</Button>
              <Button size="sm" loading={uploading} disabled={queuedCount === 0} onClick={handleUpload}>
                Upload {queuedCount > 0 ? `${queuedCount} File${queuedCount !== 1 ? 's' : ''}` : 'Done'}
              </Button>
            </div>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {queue.map((item) => (
              <FileItem key={item.id} file={item.file} progress={item.progress} status={item.status} />
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
