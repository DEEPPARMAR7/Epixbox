import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),
      logout: () =>
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
      updateUser: (data) =>
        set((state) => ({ user: { ...state.user, ...data } })),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export default useAuthStore
