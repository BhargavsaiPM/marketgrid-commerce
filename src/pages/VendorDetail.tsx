import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Store } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { productService } from '../services/productService';
import type { VendorDTO } from '../types/vendor.types';
import type { ProductDTO } from '../types/product.types';
import { ProductCard } from '../components/ProductCard';

export default function VendorDetail() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<VendorDTO | null>(null);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [v, p] = await Promise.all([
          vendorService.getVendorById(id),
          productService.getProductsByVendorId(id)
        ]);
        if (v) setVendor(v);
        setProducts(p);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant">Loading vendor storefront...</div>;
  }

  if (!vendor) {
    return <div className="p-8 text-center text-error">Vendor not found.</div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-12 w-full">
      <Link to="/vendors" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 w-fit">
        <ArrowLeft size={16} /> Back to Vendors
      </Link>

      <div className="glass-1 p-8 rounded-2xl border border-outline-variant flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 vendor-seam"></div>
        <div className="w-24 h-24 rounded-2xl bg-surface-container-highest border border-outline-variant flex items-center justify-center shrink-0 shadow-sm relative">
           <Store size={32} className="text-outline-variant opacity-50 absolute" />
           <span className="text-4xl font-bold text-primary relative z-10">{vendor.name.charAt(0)}</span>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">{vendor.name}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
            <span className="text-sm font-mono font-bold text-on-surface bg-surface-container px-2 py-1 rounded border border-outline-variant">
              {vendor.rating} ★ Rating
            </span>
            <span className="text-sm font-medium text-on-surface-variant bg-surface px-2 py-1 rounded border border-outline-variant">
              {vendor.category}
            </span>
            <span className="text-sm font-bold font-mono tracking-wider uppercase text-secondary bg-secondary/10 px-2 py-1 rounded border border-secondary/20">
              {vendor.type}
            </span>
          </div>
          <p className="text-on-surface-variant max-w-2xl">
            Welcome to the official {vendor.name} storefront on MarketGrid. Explore our latest premium products below.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-headline font-bold text-on-surface mb-6">Products from {vendor.name}</h2>
        {products.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant glass-1 rounded-xl border border-outline-variant">No products available at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} vendor={vendor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
