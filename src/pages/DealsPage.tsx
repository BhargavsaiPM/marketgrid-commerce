import { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { productService } from '../services/productService';
import { vendorService } from '../services/vendorService';
import type { ProductDTO } from '../types/product.types';
import type { VendorDTO } from '../types/vendor.types';
import { ProductCard } from '../components/ProductCard';

export default function DealsPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [vendors, setVendors] = useState<VendorDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProducts, fetchedVendors] = await Promise.all([
          productService.getProducts(),
          vendorService.getVendors()
        ]);

        // Filter to only products that have an originalPrice (deals)
        const deals = fetchedProducts.filter(p => p.originalPrice !== undefined);
        setProducts(deals);
        setVendors(fetchedVendors);
      } catch (error) {
        console.error("Failed to fetch deals data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-12 w-full">
      <div className="glass-1 p-10 rounded-2xl border border-outline-variant flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[200%] rounded-full bg-error blur-[100px] opacity-20 animate-[pulse_10s_ease-in-out_infinite]" />

        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-4 border border-error/20">
          <Tag size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface mb-4 tracking-tight">Flash Deals</h1>
        <p className="text-lg text-on-surface-variant max-w-2xl">
          Limited-time offers on premium products. Grab them before they're gone.
        </p>
      </div>

      <div className="vendor-seam w-full"></div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-headline font-bold text-on-surface flex items-center gap-2">
            Active Offers <span className="bg-error text-on-error text-xs font-mono font-bold px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
          </h2>
          <span className="text-sm font-mono text-on-surface-variant">{products.length} items</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-80 bg-surface-container-high rounded-xl animate-pulse border border-outline-variant" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant glass-1 rounded-xl border border-outline-variant flex flex-col items-center justify-center">
            <Tag size={48} className="text-outline-variant opacity-30 mb-4" />
            <p className="text-lg">No active deals right now.</p>
            <p className="text-sm mt-2">Check back later for new offers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => {
              const vendor = vendors.find(v => v.id === product.vendorId);
              return <ProductCard key={product.id} product={product} vendor={vendor} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
