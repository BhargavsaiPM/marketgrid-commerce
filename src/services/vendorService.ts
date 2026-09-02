import type { VendorDTO, VendorMetricsDTO } from '../types/vendor.types';
import vendorsData from '../mocks/vendors.json';

const vendors: VendorDTO[] = vendorsData as VendorDTO[];

const getLatency = () => Math.floor(Math.random() * 400) + 200;

export const vendorService = {
  subscribeToVendorMetrics: null as any,
  getVendors: async (): Promise<VendorDTO[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(vendors), getLatency());
    });
  },

  getVendorById: async (id: string): Promise<VendorDTO | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(vendors.find(v => v.id === id)), getLatency());
    });
  },

  subscribeToVendors: (callback: (vendors: VendorDTO[]) => void, intervalMs: number = 5000) => {
    callback(vendors);
    const interval = setInterval(() => {
      callback(vendors);
    }, intervalMs);
    return () => clearInterval(interval);
  }
};

// Added for vendor role experience
const subscribeToVendorMetrics = (vendorId: string, callback: (metrics: VendorMetricsDTO) => void, intervalMs: number = 5000) => {
  const generateMetrics = () => ({
    vendorId,
    totalOrders: Math.floor(Math.random() * 50) + 10,
    totalRevenue: Math.floor(Math.random() * 5000) + 1000,
  });

  callback(generateMetrics());
  const interval = setInterval(() => {
    callback(generateMetrics());
  }, intervalMs);

  return () => clearInterval(interval);
};

vendorService.subscribeToVendorMetrics = subscribeToVendorMetrics;
