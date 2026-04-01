import axiosClient from './axiosClient'
export const uploadPhotos = (formData, onUploadProgress) =>
  axiosClient.post('/upload/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
    // Large RAW/JPEG uploads + server-side processing can exceed default API timeout.
    timeout: 5 * 60 * 1000,
  }).then(r => r.data)
export const getPresignedUrl = (filename, contentType, galleryId) =>
  axiosClient.get('/upload/presign', { params: { filename, contentType, galleryId } }).then(r => r.data)
