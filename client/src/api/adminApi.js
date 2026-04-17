import axiosClient from './axiosClient'

export const getAdminAnalytics = () => axiosClient.get('/admin/analytics').then(r => r.data)
export const getAdminUsers = (params) => axiosClient.get('/admin/users', { params }).then(r => r.data)
export const updateAdminUserStatus = (id, is_active) => axiosClient.patch(`/admin/users/${id}/status`, { is_active }).then(r => r.data)
export const updateAdminUserVerification = (id, email_verified) => axiosClient.patch(`/admin/users/${id}/verify`, { email_verified }).then(r => r.data)
export const deleteAdminUser = (id) => axiosClient.delete(`/admin/users/${id}`).then(r => r.data)
export const resetAdminUserPassword = (id) => axiosClient.post(`/admin/users/${id}/reset-password`).then(r => r.data)

export const getAdminMediaOverview = () => axiosClient.get('/admin/media/overview').then(r => r.data)
export const getAdminPhotos = (params) => axiosClient.get('/admin/media/photos', { params }).then(r => r.data)
export const deleteAdminPhoto = (id) => axiosClient.delete(`/admin/media/photos/${id}`).then(r => r.data)

export const getAdminTransactions = (params) => axiosClient.get('/admin/payments/transactions', { params }).then(r => r.data)
export const getAdminTransactionDetail = (id) => axiosClient.get(`/admin/payments/transactions/${id}`).then(r => r.data)
export const updateAdminTransactionStatus = (id, status) => axiosClient.patch(`/admin/payments/transactions/${id}/status`, { status }).then(r => r.data)
export const updateAdminTransactionShipping = (id, payload) => axiosClient.patch(`/admin/payments/transactions/${id}/shipping`, payload).then(r => r.data)
export const createAdminTransactionRefund = (id, payload) => axiosClient.post(`/admin/payments/transactions/${id}/refunds`, payload).then(r => r.data)

export const getAdminSystemOverview = () => axiosClient.get('/admin/system/overview').then(r => r.data)
