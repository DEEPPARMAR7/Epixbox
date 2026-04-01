import axiosClient from './axiosClient'
export const getPhotographerProfile = (username) => axiosClient.get(`/portfolio/${username}`).then(r => r.data)
export const getPublicGalleries = (username) => axiosClient.get(`/portfolio/${username}/galleries`).then(r => r.data)
export const getPublicGallery = (username, slug) => axiosClient.get(`/portfolio/${username}/galleries/${slug}`).then(r => r.data)
export const getPublicPhoto = (username, photoId) => axiosClient.get(`/portfolio/${username}/photos/${photoId}`).then(r => r.data)
