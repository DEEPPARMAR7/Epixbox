import axios from 'axios'
import useAuthStore from '../store/authStore'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
const axiosClient = axios.create({ baseURL: BASE, timeout: 30000 })

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {}
    const requestUrl = original.url || ''
    const isAuthEndpoint = requestUrl.includes('/auth/login')
      || requestUrl.includes('/auth/register')
      || requestUrl.includes('/auth/forgot-password')
      || requestUrl.includes('/auth/reset-password')
      || requestUrl.includes('/auth/refresh')

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }
        const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken })
        useAuthStore.getState().login(useAuthStore.getState().user, data.accessToken, data.refreshToken || refreshToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return axiosClient(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosClient
