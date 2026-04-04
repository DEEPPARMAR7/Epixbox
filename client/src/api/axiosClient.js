import axios from 'axios'
import useAuthStore from '../store/authStore'

const AUTH_STORAGE_KEY = 'epixbox-auth'

const readPersistedAuth = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const writePersistedAuth = (auth) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

const clearPersistedAuth = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

const getDefaultApiBase = () => {
  if (typeof window === 'undefined') return 'http://localhost:4000/api'
  const protocol = window.location.protocol
  const host = window.location.hostname
  return `${protocol}//${host}:4000/api`
}

const BASE = import.meta.env.VITE_API_BASE_URL || getDefaultApiBase()
const axiosClient = axios.create({ baseURL: BASE, timeout: 30000 })

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token || readPersistedAuth()?.accessToken
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
        const storeState = useAuthStore.getState()
        const persistedAuth = readPersistedAuth()
        const refreshToken = storeState.refreshToken || persistedAuth?.refreshToken
        if (!refreshToken) throw new Error('Missing refresh token')

        const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken })
        const nextRefresh = data.refreshToken || refreshToken

        if (storeState.user) {
          useAuthStore.getState().login(storeState.user, data.accessToken, nextRefresh)
        }

        if (persistedAuth?.user) {
          writePersistedAuth({
            user: persistedAuth.user,
            accessToken: data.accessToken,
            refreshToken: nextRefresh,
          })
        }

        original.headers.Authorization = `Bearer ${data.accessToken}`
        return axiosClient(original)
      } catch {
        useAuthStore.getState().logout()
        clearPersistedAuth()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosClient
