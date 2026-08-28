import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useState, useEffect } from 'react';
import { vendorService } from '../services/vendorService';
import type { VendorDTO } from '../types/vendor.types';

export default function CartPage() {
  const { itemsByVendor, updateQuantity, removeItem, getVendorTotals, getGrandTotal, getTotalItemsCount } = useCartStore();
  const [vendors, setVendors] = useState<Record<string, VendorDTO>>({});

  useEffect(() => {
    // Fetch vendor details for the vendors currently in the cart
    const fetchVendors = async () => {
      const vendorIds = Object.keys(itemsByVendor);
      const fetchedVendors: Record<string, VendorDTO> = {};

      for (const id of vendorIds) {
        if (!vendors[id]) {
          const vendor = await vendorService.getVendorById(id);
          if (vendor) fetchedVendors[id] = vendor;
        }
      }

      if (Object.keys(fetchedVendors).length > 0) {
        setVendors(prev => ({ ...prev, ...fetchedVendors }));
      }
    };

    fetchVendors();
  }, [itemsByVendor, vendors]);

  const vendorTotals = getVendorTotals();
  const grandTotal = getGrandTotal();
  const totalItems = getTotalItemsCount();

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  // Empty State
  if (totalItems === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto mt-12 glass-1 p-12 rounded-2xl border border-outline-variant text-center flex flex-col items-center justify-center min-h-[400px]"
      >
        <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-outline-variant" />
        </div>
        <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Your cart is empty</h2>
        <p className="text-on-surface-variant mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. Explore our catalog to find premium products from verified vendors.
        </p>
        <Link
          to="/catalog"
          className="px-6 py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-all shadow-[0_4px_14px_rgba(108,99,255,0.2)] flex items-center gap-2 group"
        >
          Browse Catalog
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12 w-full">
      {/* Main Cart Area */}
      <div className="lg:w-2/3 flex flex-col gap-8">
        <div className="flex items-end justify-between border-b border-outline-variant pb-4">
          <h1 className="text-3xl font-headline font-bold text-on-surface">Your Cart</h1>
          <span className="text-on-surface-variant font-mono">{totalItems} items</span>
        </div>

        <AnimatePresence mode="popLayout">
          {Object.entries(itemsByVendor).map(([vendorId, items], index) => {
            const vendor = vendors[vendorId];
            const vendorTotal = vendorTotals[vendorId] || 0;

            return (
              <motion.div
                key={vendorId}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="flex flex-col"
              >
                {/* Vendor Group Card */}
                <div className="glass-1 rounded-xl border border-outline-variant overflow-hidden flex flex-col">
                  {/* Vendor Header */}
                  <div className="bg-surface-container-low p-4 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-highest border border-outline-variant flex items-center justify-center text-lg font-bold text-primary shrink-0">
                        {vendor?.name?.charAt(0) || 'V'}
                      </div>
                      <div>
                        <h3 className="font-bold text-on-surface text-lg leading-tight">{vendor?.name || 'Loading vendor...'}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {vendor && <span className="text-xs bg-surface-variant px-1.5 py-0.5 rounded font-mono text-on-surface-variant">{vendor.rating} ★</span>}
                          <span className="text-xs text-secondary flex items-center gap-1"><Truck size={12}/> Ships in 1-2 days</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-mono">Subtotal</div>
                      <div className="text-xl font-bold font-mono text-primary">${vendorTotal.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="flex flex-col divide-y divide-outline-variant/50">
                    {items.map(item => (
                      <div key={item.product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                        {/* Item Image Placeholder */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-surface-container border border-outline-variant shrink-0 flex items-center justify-center relative overflow-hidden">
                          <ShoppingBag size={24} className="text-outline-variant opacity-50" />
                          <div className="absolute bottom-1 right-1 text-[8px] font-mono text-outline-variant/70 uppercase">IMG</div>
                        </div>

                        {/* Item Details */}
                        <div className="flex-grow flex flex-col gap-1 w-full">
                          <div className="flex justify-between items-start gap-4">
                            <h4 className="font-medium text-on-surface line-clamp-2">{item.product.name}</h4>
                            <div className="font-bold font-mono text-on-surface shrink-0">${item.product.price.toFixed(2)}</div>
                          </div>

                          <div className="text-xs text-on-surface-variant mt-1">
                            Status: <span className={item.product.status === 'IN_STOCK' ? 'text-secondary' : 'text-tertiary'}>
                              {item.product.status.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center glass-2 rounded-lg border border-outline-variant overflow-hidden h-9">
                              <button
                                onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                                className="w-9 h-full flex items-center justify-center text-on-surface hover:bg-surface-variant hover:text-primary transition-colors disabled:opacity-50"
                              >
                                <Minus size={14} />
                              </button>
                              <div className="w-10 h-full flex items-center justify-center font-mono text-sm bg-surface-container-lowest font-medium border-x border-outline-variant/50">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                                disabled={item.product.status === 'OUT_OF_STOCK'}
                                className="w-9 h-full flex items-center justify-center text-on-surface hover:bg-surface-variant hover:text-primary transition-colors disabled:opacity-50"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-md transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Animated Vendor Seam Separator (except after the last one) */}
                {index < Object.entries(itemsByVendor).length - 1 && (
                  <div className="my-8 vendor-seam"></div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:w-1/3 shrink-0">
        <div className="sticky top-24 glass-1 p-6 rounded-xl border border-outline-variant flex flex-col gap-6 shadow-floating">
          <h2 className="font-headline font-bold text-xl text-on-surface border-b border-outline-variant pb-4">Order Summary</h2>

          <div className="flex flex-col gap-4 font-mono text-sm">
            <div className="flex justify-between items-center text-on-surface">
              <span>Subtotal ({totalItems} items)</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-on-surface-variant">
              <span>Estimated Shipping</span>
              <span className="text-xs italic text-right">Calculated at checkout</span>
            </div>

            <div className="flex justify-between items-center text-on-surface-variant pb-4 border-b border-outline-variant/50">
              <span>Estimated Tax</span>
              <span>${(grandTotal * 0.08).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-lg font-bold text-on-surface pt-2">
              <span>Total</span>
              <span className="text-primary">${(grandTotal * 1.08).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <Link
              to="/checkout"
              className="w-full py-4 bg-primary text-on-primary rounded-lg font-bold text-center hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2 group"
            >
              Proceed to Checkout
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link to="/catalog" className="w-full py-3 bg-transparent border border-outline text-on-surface rounded-lg font-medium text-center hover:bg-surface-variant transition-colors text-sm">
              Continue Shopping
            </Link>
          </div>

          <div className="mt-2 text-xs text-on-surface-variant text-center leading-relaxed">
            By proceeding to checkout, you agree to our Terms of Service and Privacy Policy. Secure payment processing provided by Stripe.
          </div>
        </div>
      </div>
    </div>
  );
}
