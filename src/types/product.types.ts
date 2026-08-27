export interface ProductDTO {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  currency: 'USD';
  stockCount: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}
