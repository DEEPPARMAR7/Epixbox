import axios from 'axios'
import useAuthStore from '../store/authStore'

const AUTH_NO_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password']

const getRequestPath = (config) => {
  const rawUrl = config?.url || ''
  try {
    return new URL(rawUrl, config?.baseURL || BASE).pathname
  } catch {
    return rawUrl
  }
}

const isAuthPath = (config, paths) => {
  const requestPath = getRequestPath(config)
  return paths.some((path) => requestPath.endsWith(path))
}

const getDefaultApiBase = () => {
  if (typeof window === 'undefined') return 'http://localhost:4000/api'
  const protocol = window.location.protocol
  const host = window.location.hostname
  return `${protocol}//${host}:4000/api`
}

const BASE = import.meta.env.VITE_API_BASE_URL || getDefaultApiBase()
const axiosClient = axios.create({ baseURL: BASE, timeout: 30000, withCredentials: true })

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && original && isAuthPath(original, ['/auth/me'])) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && original && !original._retry && !isAuthPath(original, AUTH_NO_REFRESH_PATHS)) {
      original._retry = true
      try {
        await axios.post(`${BASE}/auth/refresh`, {}, { withCredentials: true })
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
