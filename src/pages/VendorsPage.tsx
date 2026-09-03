import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Store } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import type { VendorDTO } from '../types/vendor.types';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<VendorDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      const data = await vendorService.getVendors();
      setVendors(data);
      setLoading(false);
    };
    fetchVendors();
  }, []);

  const getTierBadgeColor = (type: VendorDTO['type']) => {
    switch(type) {
      case 'Tier-1': return 'bg-primary/20 text-primary border-primary/20';
      case 'Boutique': return 'bg-tertiary/20 text-tertiary border-tertiary/20';
      case 'Verified': return 'bg-secondary/20 text-secondary border-secondary/20';
      default: return 'bg-surface-container text-on-surface-variant border-outline-variant';
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-on-surface mb-2">Our Vendors</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl">
            Shop directly from our curated network of premium brands, boutique creators, and verified high-volume sellers.
          </p>
        </div>
      </div>

      <div className="vendor-seam w-full"></div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-48 bg-surface-container-high rounded-xl animate-pulse border border-outline-variant" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vendors.map(vendor => (
            <div key={vendor.id} className="glass-1 p-6 rounded-xl border border-outline-variant flex flex-col group hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-surface-container-highest border border-outline-variant flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden group-hover:border-primary/50 transition-colors">
                    <Store size={24} className="text-outline-variant opacity-50 absolute" />
                    <span className="text-2xl font-bold text-primary relative z-10">{vendor.name.charAt(0)}</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold font-headline text-on-surface leading-tight mb-1 group-hover:text-primary transition-colors">{vendor.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                        {vendor.rating} ★
                      </span>
                      <span className={`text-[10px] uppercase font-bold font-mono tracking-wider px-2 py-0.5 rounded border ${getTierBadgeColor(vendor.type)}`}>
                        {vendor.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-grow mb-6">
                <p className="text-sm text-on-surface-variant border-l-2 border-outline-variant pl-3 ml-2">
                  Specializing in premium {vendor.category.toLowerCase()} products.
                </p>
              </div>

              <Link
                to={`/vendor/${vendor.id}`}
                className="w-full py-3 bg-surface border border-outline-variant text-on-surface rounded-lg font-medium text-center hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 group/btn"
              >
                Visit storefront
                <ArrowRight size={16} className="text-on-surface-variant group-hover/btn:text-primary group-hover/btn:translate-x-1 transition-all" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
