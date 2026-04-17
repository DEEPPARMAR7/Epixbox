import axiosClient from './axiosClient'

export const getGalleryAccessConfig = (galleryId) =>
  axiosClient.get(`/galleries/${galleryId}/access`).then((r) => r.data)

export const setGalleryPassword = (galleryId, payload) =>
  axiosClient.patch(`/galleries/${galleryId}/password`, payload).then((r) => r.data)

export const removeGalleryPassword = (galleryId) =>
  axiosClient.delete(`/galleries/${galleryId}/password`).then((r) => r.data)

export const setGalleryExpiry = (galleryId, payload) =>
  axiosClient.patch(`/galleries/${galleryId}/expiry`, payload).then((r) => r.data)

export const removeGalleryExpiry = (galleryId) =>
  axiosClient.delete(`/galleries/${galleryId}/expiry`).then((r) => r.data)
