import type { ProductDTO } from '../types/product.types';
import productsData from '../mocks/products.json';

const products: ProductDTO[] = productsData as ProductDTO[];

const getLatency = () => Math.floor(Math.random() * 400) + 200;

export const productService = {
  getProducts: async (): Promise<ProductDTO[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(products), getLatency());
    });
  },

  getProductById: async (id: string): Promise<ProductDTO | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(products.find(p => p.id === id)), getLatency());
    });
  },

  getProductsByVendorId: async (vendorId: string): Promise<ProductDTO[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(products.filter(p => p.vendorId === vendorId)), getLatency());
    });
  },

  subscribeToProducts: (callback: (products: ProductDTO[]) => void, intervalMs: number = 5000) => {
    callback(products);
    const interval = setInterval(() => {
      callback(products);
    }, intervalMs);
    return () => clearInterval(interval);
  }
};
