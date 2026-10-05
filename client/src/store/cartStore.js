import { create } from 'zustand';
import * as cartService from '../services/cartService';

const emptyCart = { items: [], summary: { itemCount: 0, subtotal: 0, discount: 0, total: 0 } };

export const useCartStore = create((set) => ({
  cart: emptyCart,
  loading: false,
  loaded: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const { cart } = await cartService.getCart();
      set({ cart });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false, loaded: true });
    }
  },

  // Mutations throw on failure; the caller shows the toast
  addItem: async (productId, quantity) => set({ cart: (await cartService.addItem(productId, quantity)).cart }),
  updateItem: async (productId, quantity) => set({ cart: (await cartService.updateItem(productId, quantity)).cart }),
  removeItem: async (productId) => set({ cart: (await cartService.removeItem(productId)).cart }),
  clearCart: async () => set({ cart: (await cartService.clearCart()).cart }),

  reset: () => set({ cart: emptyCart, error: null, loaded: false }),
}));