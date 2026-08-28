import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { productService } from '../services/productService';
import type { VendorDTO } from '../types/vendor.types';
import type { ProductDTO } from '../types/product.types';
import { ProductCard } from '../components/ProductCard';

export default function Storefront() {
  const [vendors, setVendors] = useState<VendorDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedVendors, fetchedProducts] = await Promise.all([
          vendorService.getVendors(),
          productService.getProducts()
        ]);
        setVendors(fetchedVendors);
        // Take a few featured products for the storefront
        setProducts(fetchedProducts.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch storefront data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="flex flex-col gap-12 pb-12 w-full">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="relative w-full rounded-2xl overflow-hidden glass-1 border border-outline-variant p-10 md:p-20 text-center flex flex-col items-center justify-center min-h-[400px]"
      >
        {/* Gradient Aurora Background - positioned behind the glass */}
        <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden mix-blend-screen" style={{ zIndex: -1 }}>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] rounded-full bg-primary blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute top-[10%] right-[-10%] w-[40%] h-[120%] rounded-full bg-secondary blur-[120px] animate-[pulse_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute bottom-[-30%] left-[20%] w-[60%] h-[100%] rounded-full bg-primary-container blur-[90px] animate-[pulse_12s_ease-in-out_infinite]" />
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-bold text-on-surface mb-6 tracking-tight max-w-3xl">
          The future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">digital commerce</span> is here
        </h1>
        <p className="text-lg md:text-xl text-on-surface-variant mb-10 max-w-2xl font-body">
          Connect directly with premium vendors. High-volume trading and boutique storefronts in one seamless platform.
        </p>
        <Link
          to="/catalog"
          className="px-8 py-4 bg-primary text-on-primary rounded-lg font-bold text-lg hover:bg-primary/90 transition-all shadow-[0_10px_20px_rgba(108,99,255,0.2)] flex items-center gap-2 group"
        >
          Explore Catalog
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.section>

      {/* Featured Vendors */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-headline font-bold text-on-surface">Featured Vendors</h2>
          <Link to="/vendors" className="text-primary font-medium hover:underline flex items-center gap-1">
            See all <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-[300px] h-40 bg-surface-container-high rounded-xl animate-pulse shrink-0 border border-outline-variant" />
            ))}
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {vendors.map(vendor => (
              <motion.div
                key={vendor.id}
                whileHover={{ y: prefersReducedMotion ? 0 : -5 }}
                className="glass-1 p-6 rounded-xl border border-outline-variant min-w-[300px] shrink-0 snap-start flex flex-col group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-highest border border-outline-variant flex items-center justify-center text-xl font-bold text-primary">
                    {vendor.name.charAt(0)}
                  </div>
                  <div className="bg-surface-container px-2 py-1 rounded text-xs font-mono text-on-surface-variant">
                    {vendor.rating} ★
                  </div>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-1">{vendor.name}</h3>
                <p className="text-sm text-on-surface-variant mb-6 flex-grow">{vendor.type} • {vendor.category}</p>
                <Link
                  to={`/vendor/${vendor.id}`}
                  className="text-primary text-sm font-medium flex items-center gap-1 group-hover:underline"
                >
                  Visit storefront <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Product Row */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-headline font-bold text-on-surface">Live Catalog</h2>
          <Link to="/catalog" className="text-primary font-medium hover:underline flex items-center gap-1">
            Browse all <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-80 bg-surface-container-high rounded-xl animate-pulse border border-outline-variant" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {products.map(product => {
              const vendor = vendors.find(v => v.id === product.vendorId);
              return <ProductCard key={product.id} product={product} vendor={vendor} />;
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-12 pt-8">
        <div className="vendor-seam mb-8"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-outline-variant flex items-center justify-center text-surface-container-lowest font-bold text-xs">M</div>
              <span className="font-display font-bold text-on-surface">MARKETGRID</span>
            </div>
            <p className="text-sm text-on-surface-variant max-w-sm">
              The premium B2B and D2C commerce infrastructure.
            </p>
          </div>

          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-on-surface-variant mb-1">Platform</h4>
              <Link to="/catalog" className="text-sm text-on-surface hover:text-primary transition-colors">Catalog</Link>
              <Link to="/vendors" className="text-sm text-on-surface hover:text-primary transition-colors">Vendors</Link>
              <Link to="/deals" className="text-sm text-on-surface hover:text-primary transition-colors">Flash Sales</Link>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-on-surface-variant mb-1">Resources</h4>
              <a href="#" className="text-sm text-on-surface hover:text-primary transition-colors">Support</a>
              <a href="#" className="text-sm text-on-surface hover:text-primary transition-colors">API Docs</a>
              <a href="#" className="text-sm text-on-surface hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-outline pt-4 border-t border-outline-variant">
          &copy; {new Date().getFullYear()} MarketGrid Inc. All rights reserved.
        </div>
      </footer>

      {/* Required CSS for hide-scrollbar utility */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
