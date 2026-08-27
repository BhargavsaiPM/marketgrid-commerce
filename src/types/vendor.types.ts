export interface VendorDTO {
  id: string;
  name: string;
  type: 'Tier-1' | 'Boutique' | 'Verified';
  category: string;
  rating: number;
}

export interface VendorMetricsDTO {
  vendorId: string;
  totalOrders: number;
  totalRevenue: number;
}
