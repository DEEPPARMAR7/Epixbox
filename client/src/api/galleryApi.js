import axiosClient from './axiosClient'
export const getGalleries = () => axiosClient.get('/galleries').then(r => r.data)
export const createGallery = (data) => axiosClient.post('/galleries', data).then(r => r.data)
export const getGallery = (id) => axiosClient.get(`/galleries/${id}`).then(r => r.data)
export const updateGallery = (id, data) => axiosClient.put(`/galleries/${id}`, data).then(r => r.data)
export const deleteGallery = (id) => axiosClient.delete(`/galleries/${id}`).then(r => r.data)
export const setCoverPhoto = (id, photoId) => axiosClient.patch(`/galleries/${id}/cover`, { photoId }).then(r => r.data)
export const updateVisibility = (id, visibility) => axiosClient.put(`/galleries/${id}/visibility`, { visibility }).then(r => r.data)
