import { ShoppingBag } from 'lucide-react';
import type { ProductDTO } from '../types/product.types';
import type { VendorDTO } from '../types/vendor.types';
import { useCartStore } from '../store/cartStore';

interface ProductCardProps {
  product: ProductDTO;
  vendor?: VendorDTO;
}

export function ProductCard({ product, vendor }: ProductCardProps) {
  const addItemToCart = useCartStore((state) => state.addItem);
  const isOutOfStock = product.status === 'OUT_OF_STOCK';

  const getStatusColor = (status: ProductDTO['status']) => {
    switch(status) {
      case 'IN_STOCK': return 'bg-secondary';
      case 'LOW_STOCK': return 'bg-tertiary';
      case 'OUT_OF_STOCK': return 'bg-error';
      default: return 'bg-outline';
    }
  };

  const getStatusLabel = (status: ProductDTO['status']) => {
    switch(status) {
      case 'IN_STOCK': return 'In Stock';
      case 'LOW_STOCK': return 'Low Stock';
      case 'OUT_OF_STOCK': return 'Out of Stock';
      default: return status;
    }
  };

  return (
    <div className="glass-1 rounded-xl border border-outline-variant overflow-hidden flex flex-col group relative h-full">
      {/* Image Placeholder */}
      <div className="aspect-square bg-surface-container-highest relative flex items-center justify-center p-4">
        <div className="w-24 h-24 rounded-full bg-surface-container opacity-50 absolute" />
        <ShoppingBag size={48} className="text-outline-variant relative z-10" />

        {/* Vendor Chip */}
        {vendor && (
          <div className="absolute top-3 left-3 bg-surface-container-lowest/80 backdrop-blur px-2 py-1 rounded text-xs font-medium text-on-surface border border-outline-variant shadow-sm truncate max-w-[120px]">
            {vendor.name}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-medium text-on-surface text-sm mb-2 line-clamp-2 min-h-[40px] leading-tight">
          {product.name}
        </h3>

        <div className="mt-auto">
          <div className="text-xl font-mono font-bold text-on-surface mb-3">
            ${product.price.toFixed(2)}
            {product.originalPrice && (
              <span className="text-sm font-normal text-on-surface-variant line-through ml-2">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${getStatusColor(product.status)}`} />
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-on-surface-variant">
                {getStatusLabel(product.status)}
              </span>
            </div>

            <button
              onClick={() => addItemToCart(product)}
              disabled={isOutOfStock}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isOutOfStock
                  ? 'bg-surface-variant text-outline cursor-not-allowed'
                  : 'bg-primary/10 text-primary hover:bg-primary hover:text-on-primary'
              }`}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
