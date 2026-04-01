import axiosClient from './axiosClient'
export const getPhotos = (params) => axiosClient.get('/photos', { params }).then(r => r.data)
export const getPhoto = (id) => axiosClient.get(`/photos/${id}`).then(r => r.data)
export const updatePhoto = (id, data) => axiosClient.put(`/photos/${id}`, data).then(r => r.data)
export const deletePhoto = (id) => axiosClient.delete(`/photos/${id}`).then(r => r.data)
export const bulkDelete = (ids) => axiosClient.post('/photos/bulk-delete', { ids }).then(r => r.data)
export const bulkMove = (ids, galleryId) => axiosClient.post('/photos/bulk-move', { ids, galleryId }).then(r => r.data)
export const addTags = (id, tags) => axiosClient.post(`/photos/${id}/tags`, { tags }).then(r => r.data)
export const removeTag = (id, tagId) => axiosClient.delete(`/photos/${id}/tags/${tagId}`).then(r => r.data)
