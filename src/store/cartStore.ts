import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartStore {
    itemCount: number
    setItemCount: (count: number) => void
    incrementCount: () => void
    decrementCount: () => void
}

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            itemCount: 0,
            setItemCount: (count) => set({ itemCount: count }),
            incrementCount: () => set((state) => ({ itemCount: state.itemCount + 1 })),
            decrementCount: () => set((state) => ({ itemCount: Math.max(0, state.itemCount - 1) })),
        }),
        {
            name: 'cart-store',
        }
    )
)
