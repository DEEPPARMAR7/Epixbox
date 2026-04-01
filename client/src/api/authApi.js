import axiosClient from './axiosClient'
export const register = (data) => axiosClient.post('/auth/register', data).then(r => r.data)
export const login = (data) => axiosClient.post('/auth/login', data).then(r => r.data)
export const logout = () => axiosClient.post('/auth/logout').then(r => r.data)
export const getMe = () => axiosClient.get('/auth/me').then(r => r.data)
export const forgotPassword = (email) => axiosClient.post('/auth/forgot-password', { email }).then(r => r.data)
export const resetPassword = (token, password) => axiosClient.post('/auth/reset-password', { token, password }).then(r => r.data)
