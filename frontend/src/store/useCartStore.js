import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const items = get().items;
        // Use cartKey for unique identification (id + variant combo)
        const cartKey = item.cartKey || String(item.id);
        const existing = items.find((i) => (i.cartKey || String(i.id)) === cartKey);
        
        // Reward items: only 1 allowed, no quantity increase
        if (item.isReward) {
          const hasReward = items.some((i) => i.isReward);
          if (hasReward) return;
          set({ items: [...items, { ...item, cartKey, quantity: 1 }] });
          return;
        }
        
        if (existing) {
          if (existing.isReward) return;
          set({
            items: items.map((i) =>
              (i.cartKey || String(i.id)) === cartKey ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, cartKey, quantity: 1 }] });
        }
      },

      removeItem: (cartKey) => {
        set({ items: get().items.filter((i) => (i.cartKey || String(i.id)) !== cartKey) });
      },

      updateQuantity: (cartKey, quantity) => {
        const item = get().items.find((i) => (i.cartKey || String(i.id)) === cartKey);
        if (item?.isReward && quantity > 1) return;
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => (i.cartKey || String(i.id)) !== cartKey) });
        } else {
          set({
            items: get().items.map((i) =>
              (i.cartKey || String(i.id)) === cartKey ? { ...i, quantity } : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
