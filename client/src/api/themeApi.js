import axiosClient from './axiosClient'

export const getThemes = () => axiosClient.get('/themes').then((r) => r.data)
export const getThemeById = (id) => axiosClient.get(`/themes/${encodeURIComponent(String(id || ''))}`).then((r) => r.data)
