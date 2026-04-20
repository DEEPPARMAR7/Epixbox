import axiosClient from './axiosClient'
const safeUsername = (username) => encodeURIComponent(String(username || '').trim().toLowerCase())

export const getPhotographerProfile = (username) => axiosClient.get(`/portfolio/${safeUsername(username)}`).then(r => r.data)
export const getPublicGalleries = (username, token) => {
	const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
	return axiosClient.get(`/portfolio/${safeUsername(username)}/galleries`, config).then(r => r.data);
}
export const getPublicGallery = (username, slug, accessToken) => {
	const config = accessToken ? { headers: { 'x-gallery-access-token': accessToken } } : undefined
	return axiosClient.get(`/portfolio/${safeUsername(username)}/galleries/${encodeURIComponent(String(slug || ''))}`, config).then(r => r.data)
}
export const getPublicPhoto = (username, photoId, accessToken) => {
	const config = accessToken ? { headers: { 'x-gallery-access-token': accessToken } } : undefined
	return axiosClient.get(`/portfolio/${safeUsername(username)}/photos/${encodeURIComponent(String(photoId || ''))}`, config).then(r => r.data)
}
export const verifyGalleryPassword = (galleryId, password) =>
	axiosClient.post(`/galleries/${galleryId}/verify-password`, { password }).then(r => r.data)
