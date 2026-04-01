import axios from 'axios'
import useAuthStore from '../store/authStore'

const getDefaultApiBase = () => {
  if (typeof window === 'undefined') return 'http://localhost:4000/api'
  const protocol = window.location.protocol
  const host = window.location.hostname
  return `${protocol}//${host}:4000/api`
}

const BASE = import.meta.env.VITE_API_BASE_URL || getDefaultApiBase()
const axiosClient = axios.create({ baseURL: BASE, timeout: 30000 })

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = useAuthStore.getState().refreshToken
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
