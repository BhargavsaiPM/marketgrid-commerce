import type { OrderDTO } from '../types/order.types';

const orders: OrderDTO[] = [];

const getLatency = () => Math.floor(Math.random() * 400) + 200;

export const orderService = {
  getOrders: async (): Promise<OrderDTO[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(orders), getLatency());
    });
  },

  getOrderById: async (id: string): Promise<OrderDTO | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(orders.find(o => o.id === id)), getLatency());
    });
  },

  subscribeToOrders: (callback: (orders: OrderDTO[]) => void, intervalMs: number = 5000) => {
    callback(orders);
    const interval = setInterval(() => {
      callback(orders);
    }, intervalMs);
    return () => clearInterval(interval);
  }
};
