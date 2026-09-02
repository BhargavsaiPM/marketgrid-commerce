import type { OrderDTO } from '../types/order.types';

const orders: OrderDTO[] = [];

const getLatency = () => Math.floor(Math.random() * 400) + 200;

export const orderService = {
  updateOrderStatus: null as any,
  getOrdersByVendorId: null as any,
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

// Seed some mock orders for vendor testing
if (orders.length === 0) {
  orders.push(
    { id: 'o1', customerId: 'c1', vendorId: 'v1', totalAmount: 149.98, status: 'PENDING', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'o2', customerId: 'c2', vendorId: 'v1', totalAmount: 59.99, status: 'PROCESSING', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'o3', customerId: 'c3', vendorId: 'v2', totalAmount: 34.50, status: 'PENDING', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'o4', customerId: 'c4', vendorId: 'v3', totalAmount: 74.00, status: 'SHIPPED', createdAt: new Date(Date.now() - 172800000).toISOString() }
  );
}

// Added for vendor role experience
const updateOrderStatus = async (orderId: string, status: OrderDTO['status']): Promise<OrderDTO | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orderIndex = orders.findIndex(o => o.id === orderId);
      if (orderIndex > -1) {
        orders[orderIndex] = { ...orders[orderIndex], status };
        resolve(orders[orderIndex]);
      } else {
        resolve(undefined);
      }
    }, getLatency());
  });
};

const getOrdersByVendorId = async (vendorId: string): Promise<OrderDTO[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(orders.filter(o => o.vendorId === vendorId)), getLatency());
  });
};

orderService.updateOrderStatus = updateOrderStatus;
orderService.getOrdersByVendorId = getOrdersByVendorId;
