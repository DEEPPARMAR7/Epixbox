import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  hasHydrated: true,
  login: (user, token = null, refreshToken = null) =>
    set({ user, token, refreshToken, isAuthenticated: Boolean(user) }),
  logout: () =>
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
  updateUser: (data) =>
    set((state) => ({ user: state.user ? { ...state.user, ...data } : state.user })),
  setHasHydrated: (value) => set({ hasHydrated: value }),
}))

export default useAuthStore
