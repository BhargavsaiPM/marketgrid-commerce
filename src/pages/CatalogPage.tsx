import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/productService';
import { vendorService } from '../services/vendorService';
import type { ProductDTO } from '../types/product.types';
import type { VendorDTO } from '../types/vendor.types';

export default function CatalogPage() {
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
        setProducts(fetchedProducts);
        setVendors(fetchedVendors);
      } catch (error) {
        console.error("Failed to fetch catalog data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12 w-full">
      {/* Sidebar Filters */}
      <aside className="lg:w-1/4 xl:w-1/5 shrink-0">
        <div className="sticky top-24 glass-1 p-6 rounded-xl border border-outline-variant flex flex-col gap-6 max-h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar">
          <div className="flex items-center gap-2 mb-2 pb-4 border-b border-outline-variant">
            <Filter size={18} className="text-primary" />
            <h2 className="font-headline font-bold text-lg text-on-surface">Filters</h2>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3 font-mono">Categories</h3>
            <div className="flex flex-col gap-2">
              {['Electronics', 'Home & Living', 'Sports', 'Beauty'].map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 rounded-sm border border-outline-variant group-hover:border-primary flex items-center justify-center transition-colors">
                    {/* Checkbox logic would go here */}
                  </div>
                  <span className="text-sm text-on-surface group-hover:text-primary transition-colors">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="vendor-seam opacity-50"></div>

          {/* Vendors */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3 font-mono">Vendors</h3>
            <div className="flex flex-col gap-2">
              {vendors.map(vendor => (
                <label key={vendor.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 rounded-sm border border-outline-variant group-hover:border-primary flex items-center justify-center transition-colors"></div>
                  <span className="text-sm text-on-surface group-hover:text-primary transition-colors truncate">{vendor.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="vendor-seam opacity-50"></div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3 font-mono">Price Range</h3>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm text-on-surface focus:outline-none focus:border-primary" />
              <span className="text-on-surface-variant">-</span>
              <input type="number" placeholder="Max" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm text-on-surface focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div className="vendor-seam opacity-50"></div>

          {/* Stock Status */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3 font-mono">Availability</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">In Stock</button>
              <button className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant text-xs font-medium hover:bg-surface-variant transition-colors">Low Stock</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Grid Area */}
      <main className="lg:w-3/4 xl:w-4/5 flex flex-col gap-6">
        {/* Toolbar */}
        <div className="glass-1 p-4 rounded-xl border border-outline-variant flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-on-surface-variant">
            Showing <span className="font-bold text-on-surface font-mono">{products.length}</span> results
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm hover:bg-surface-variant transition-colors">
              <SlidersHorizontal size={14} /> Filters
            </button>

            <div className="relative ml-auto sm:ml-0">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm hover:bg-surface-variant transition-colors group">
                Sort by: Featured <ChevronDown size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-80 bg-surface-container-high rounded-xl animate-pulse border border-outline-variant" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => {
              const vendor = vendors.find(v => v.id === product.vendorId);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} vendor={vendor} />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2 glass-1 p-2 rounded-lg border border-outline-variant">
              <button className="px-3 py-1.5 rounded bg-surface-container-lowest text-on-surface-variant text-sm border border-transparent hover:border-outline-variant disabled:opacity-50" disabled>Previous</button>
              <button className="w-8 h-8 rounded bg-primary text-on-primary text-sm font-medium flex items-center justify-center">1</button>
              <button className="w-8 h-8 rounded hover:bg-surface-variant text-on-surface text-sm font-medium flex items-center justify-center transition-colors">2</button>
              <button className="w-8 h-8 rounded hover:bg-surface-variant text-on-surface text-sm font-medium flex items-center justify-center transition-colors">3</button>
              <span className="text-on-surface-variant px-1">...</span>
              <button className="px-3 py-1.5 rounded bg-surface-container-lowest text-on-surface text-sm border border-outline-variant hover:bg-surface-variant transition-colors">Next</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
