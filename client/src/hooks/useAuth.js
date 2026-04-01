import useAuthStore from '../store/authStore'
import { login as apiLogin, logout as apiLogout } from '../api/authApi'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export function useAuth() {
  const { user, token, isAuthenticated, login, logout, updateUser } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (credentials) => {
    const data = await apiLogin(credentials)
    login(data.user, data.accessToken, data.refreshToken)
    navigate('/dashboard')
    return data
  }

  const handleLogout = async () => {
    try { await apiLogout() } catch {}
    logout()
    navigate('/login')
    toast.success('Logged out')
  }

  return { user, token, isAuthenticated, login: handleLogin, logout: handleLogout, updateUser }
}
