import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const itemKey = item.variant_id ? `${item.id}-${item.variant_id}` : item.id
        const existing = get().items.find(i => {
          const iKey = i.variant_id ? `${i.id}-${i.variant_id}` : i.id
          return iKey === itemKey
        })
        if (existing) {
          set({ items: get().items.map(i => {
            const iKey = i.variant_id ? `${i.id}-${i.variant_id}` : i.id
            return iKey === itemKey ? { ...i, quantity: i.quantity + 1 } : i
          })})
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] })
        }
      },
      removeItem: (id, variantId) => set({ items: get().items.filter(i => {
        if (variantId) return !(i.id === id && i.variant_id === variantId)
        return i.id !== id
      })}),
      updateQuantity: (id, qty, variantId) =>
        set({ items: get().items.map(i => {
          const matches = variantId ? (i.id === id && i.variant_id === variantId) : (i.id === id)
          return matches ? { ...i, quantity: Math.max(1, qty) } : i
        })}),
      clearCart: () => set({ items: [] }),
      get totalCents() { return get().items.reduce((sum, i) => sum + (i.unit_price_cents || i.price_cents) * i.quantity, 0) },
    }),
    { name: 'cart-storage' }
  )
)

export default useCartStore
