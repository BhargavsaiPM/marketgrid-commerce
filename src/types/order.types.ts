export interface OrderDTO {
  id: string;
  customerId: string;
  vendorId: string;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

export interface VendorShipmentDTO {
  id: string;
  orderId: string;
  vendorId: string;
  trackingNumber: string;
  status: string;
}
