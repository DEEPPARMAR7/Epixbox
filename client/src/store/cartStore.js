import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find(i => i.id === item.id)
        if (existing) {
          set({ items: get().items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) })
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] })
        }
      },
      removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
      updateQuantity: (id, qty) =>
        set({ items: get().items.map(i => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i) }),
      clearCart: () => set({ items: [] }),
      get totalCents() { return get().items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0) },
    }),
    { name: 'cart-storage' }
  )
)

export default useCartStore
