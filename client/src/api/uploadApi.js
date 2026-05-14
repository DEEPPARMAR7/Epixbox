import axiosClient from './axiosClient'
export const uploadPhotos = (formData, onUploadProgress) =>
  axiosClient.post('/upload/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // Upload + server-side image processing can exceed the global 30s axios timeout.
    timeout: 10 * 60 * 1000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    onUploadProgress,
  }).then(r => r.data)
export const getPresignedUrl = (filename, contentType, galleryId) =>
  axiosClient.get('/upload/presign', { params: { filename, contentType, galleryId } }).then(r => r.data)
