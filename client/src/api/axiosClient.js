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
  if (typeof window === 'undefined') return 'http://localhost:4000/api/v1'
  const protocol = window.location.protocol
  const host = window.location.hostname
  return `${protocol}//${host}:4000/api/v1`
}

const BASE = import.meta.env.VITE_API_BASE_URL || getDefaultApiBase()
const AUTH_STORAGE_KEY = 'epixbox-auth'
const axiosClient = axios.create({ baseURL: BASE, timeout: 30000, withCredentials: true })

const refreshAuthToken = async () => {
  const auth = useAuthStore.getState()
  const refreshToken = auth.refreshToken
  if (!refreshToken) {
    throw new Error('Refresh token required')
  }

  const response = await axios.post(`${BASE}/auth/refresh`, { refreshToken }, { withCredentials: true })
  const { accessToken, refreshToken: nextRefreshToken } = response.data

  if (auth.user) {
    useAuthStore.getState().login(auth.user, accessToken, nextRefreshToken)
  }

  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      parsed.accessToken = accessToken
      parsed.refreshToken = nextRefreshToken
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed))
    }
  } catch {
    // ignore localStorage update failures
  }

  return { accessToken, refreshToken: nextRefreshToken }
}

// Add Authorization header with token
axiosClient.interceptors.request.use((config) => {
  const auth = useAuthStore.getState()
  const token = auth.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && original && isAuthPath(original, ['/auth/me'])) {
      useAuthStore.getState().logout()
      localStorage.removeItem(AUTH_STORAGE_KEY)
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && original && !original._retry && !isAuthPath(original, AUTH_NO_REFRESH_PATHS)) {
      original._retry = true
      try {
        await refreshAuthToken()
        return axiosClient(original)
      } catch {
        useAuthStore.getState().logout()
        localStorage.removeItem(AUTH_STORAGE_KEY)
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosClient
