import axiosClient from './axiosClient'
export const getPhotographerProfile = (username) => axiosClient.get(`/portfolio/${username}`).then(r => r.data)
export const getPublicGalleries = (username) => axiosClient.get(`/portfolio/${username}/galleries`).then(r => r.data)
export const getPublicGallery = (username, slug, accessToken) => {
	const config = accessToken ? { headers: { 'x-gallery-access-token': accessToken } } : undefined
	return axiosClient.get(`/portfolio/${username}/galleries/${slug}`, config).then(r => r.data)
}
export const getPublicPhoto = (username, photoId, accessToken) => {
	const config = accessToken ? { headers: { 'x-gallery-access-token': accessToken } } : undefined
	return axiosClient.get(`/portfolio/${username}/photos/${photoId}`, config).then(r => r.data)
}
export const verifyGalleryPassword = (galleryId, password) =>
	axiosClient.post(`/galleries/${galleryId}/verify-password`, { password }).then(r => r.data)
