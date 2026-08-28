import { create } from 'zustand';
import type { ProductDTO } from '../types/product.types';

export interface CartItem {
  product: ProductDTO;
  quantity: number;
}

export interface CartState {
  itemsByVendor: Record<string, CartItem[]>;
  addItem: (product: ProductDTO, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getVendorTotals: () => Record<string, number>;
  getGrandTotal: () => number;
  getTotalItemsCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  itemsByVendor: {},

  addItem: (product, quantity = 1) => {
    set((state) => {
      const vendorId = product.vendorId;
      const vendorItems = state.itemsByVendor[vendorId] || [];
      const existingItemIndex = vendorItems.findIndex(item => item.product.id === product.id);

      let newVendorItems;
      if (existingItemIndex >= 0) {
        newVendorItems = [...vendorItems];
        newVendorItems[existingItemIndex] = {
          ...newVendorItems[existingItemIndex],
          quantity: newVendorItems[existingItemIndex].quantity + quantity,
        };
      } else {
        newVendorItems = [...vendorItems, { product, quantity }];
      }

      return {
        itemsByVendor: {
          ...state.itemsByVendor,
          [vendorId]: newVendorItems,
        },
      };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const newItemsByVendor: Record<string, CartItem[]> = {};

      for (const [vendorId, items] of Object.entries(state.itemsByVendor)) {
        const filteredItems = items.filter(item => item.product.id !== productId);
        if (filteredItems.length > 0) {
          newItemsByVendor[vendorId] = filteredItems;
        }
      }

      return { itemsByVendor: newItemsByVendor };
    });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    set((state) => {
      const newItemsByVendor: Record<string, CartItem[]> = {};

      for (const [vendorId, items] of Object.entries(state.itemsByVendor)) {
        newItemsByVendor[vendorId] = items.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        );
      }

      return { itemsByVendor: newItemsByVendor };
    });
  },

  clearCart: () => set({ itemsByVendor: {} }),

  getVendorTotals: () => {
    const { itemsByVendor } = get();
    const totals: Record<string, number> = {};

    for (const [vendorId, items] of Object.entries(itemsByVendor)) {
      totals[vendorId] = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }

    return totals;
  },

  getGrandTotal: () => {
    const { itemsByVendor } = get();
    let total = 0;

    for (const items of Object.values(itemsByVendor)) {
      total += items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }

    return total;
  },

  getTotalItemsCount: () => {
    const { itemsByVendor } = get();
    let count = 0;

    for (const items of Object.values(itemsByVendor)) {
      count += items.reduce((sum, item) => sum + item.quantity, 0);
    }

    return count;
  }
}));
