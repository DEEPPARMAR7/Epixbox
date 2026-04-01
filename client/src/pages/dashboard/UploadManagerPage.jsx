import { useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import { uploadPhotos } from '../../api/uploadApi'
import { formatFileSize } from '../../utils/formatters'

function FileItem({ file, progress, status }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xl flex-shrink-0">
        📷
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
        <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
        {status === 'uploading' && (
          <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      <span className={`text-xs font-medium flex-shrink-0 ${
        status === 'done' ? 'text-green-600' :
        status === 'error' ? 'text-red-500' :
        status === 'uploading' ? 'text-indigo-600' : 'text-gray-400'
      }`}>
        {status === 'done' ? '✓ Done' :
         status === 'error' ? '✗ Error' :
         status === 'uploading' ? `${progress}%` : 'Queued'}
      </span>
    </div>
  )
}

export default function UploadManagerPage() {
  const { id: galleryId } = useParams()
  const [queue, setQueue] = useState([]) // { file, id, progress, status }
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles) => {
    const newItems = acceptedFiles.map(file => ({
      file,
      id: `${file.name}-${Date.now()}`,
      progress: 0,
      status: 'queued',
    }))
    setQueue(prev => [...prev, ...newItems])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.heic', '.heif'] },
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
      toast.success(`${pending.length} photo${pending.length > 1 ? 's' : ''} uploaded!`)
    } catch (err) {
      setQueue(q => q.map(item =>
        pending.find(p => p.id === item.id) ? { ...item, status: 'error' } : item
      ))
      toast.error(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const queuedCount = queue.filter(q => q.status === 'queued').length

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link to={`/dashboard/galleries/${galleryId}/edit`} className="text-sm text-indigo-600 hover:underline">← Back to Gallery</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Upload Photos</h1>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition mb-6 ${
          isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-5xl mb-3">📤</div>
        <p className="text-base font-semibold text-gray-700">
          {isDragActive ? 'Drop your photos here!' : 'Drag & drop photos here'}
        </p>
        <p className="text-sm text-gray-400 mt-1">or click to browse — JPG, PNG, WEBP, TIFF, HEIC up to 50MB each</p>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
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
