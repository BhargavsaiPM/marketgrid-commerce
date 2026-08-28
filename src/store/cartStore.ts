import { create } from 'zustand';
import type { ProductDTO } from '../types/product.types';

export interface CartItem {
  product: ProductDTO;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: ProductDTO, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemsByVendor: () => Record<string, CartItem[]>;
  getVendorTotals: () => Record<string, number>;
  getGrandTotal: () => number;
  getTotalItemsCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existingItem = state.items.find(item => item.product.id === product.id);
      if (existingItem) {
        return {
          items: state.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return { items: [...state.items, { product, quantity }] };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter(item => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    set((state) => ({
      items: state.items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  getItemsByVendor: () => {
    const items = get().items;
    return items.reduce((acc, item) => {
      const vendorId = item.product.vendorId;
      if (!acc[vendorId]) acc[vendorId] = [];
      acc[vendorId].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);
  },

  getVendorTotals: () => {
    const items = get().items;
    return items.reduce((acc, item) => {
      const vendorId = item.product.vendorId;
      acc[vendorId] = (acc[vendorId] || 0) + item.product.price * item.quantity;
      return acc;
    }, {} as Record<string, number>);
  },

  getGrandTotal: () => {
    const items = get().items;
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },

  getTotalItemsCount: () => {
    const items = get().items;
    return items.reduce((count, item) => count + item.quantity, 0);
  },
}));