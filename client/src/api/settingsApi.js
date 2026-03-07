import axiosClient from './axiosClient'
export const getProfile = () => axiosClient.get('/settings/profile').then(r => r.data)
export const updateProfile = (data) => axiosClient.put('/settings/profile', data).then(r => r.data)
export const updatePassword = (data) => axiosClient.put('/settings/password', data).then(r => r.data)
export const uploadAvatar = (file) => {
  const fd = new FormData()
  fd.append('avatar', file)
  return axiosClient.post('/settings/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
}
export const getBilling = () => axiosClient.get('/settings/billing').then(r => r.data)
export const createBillingPortal = () => axiosClient.post('/settings/billing/portal').then(r => r.data)
