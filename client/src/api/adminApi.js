import axiosClient from './axiosClient'

export const getAdminAnalytics = () => axiosClient.get('/admin/analytics').then(r => r.data)
export const getAdminUsers = (params) => axiosClient.get('/admin/users', { params }).then(r => r.data)
export const updateAdminUserStatus = (id, is_active) => axiosClient.patch(`/admin/users/${id}/status`, { is_active }).then(r => r.data)
export const updateAdminUserVerification = (id, email_verified) => axiosClient.patch(`/admin/users/${id}/verify`, { email_verified }).then(r => r.data)
