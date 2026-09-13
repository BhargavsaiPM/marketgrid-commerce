import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Check, CreditCard, Truck, MapPin } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { vendorService } from '../services/vendorService';
import type { VendorDTO } from '../types/vendor.types';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { itemsByVendor, getVendorTotals, getGrandTotal, getTotalItemsCount, clearCart } = useCartStore();
  const [vendors, setVendors] = useState<Record<string, VendorDTO>>({});
  const [currentStep] = useState(2); // Start at address step visually

  useEffect(() => {
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

  const totalItems = getTotalItemsCount();
  const vendorTotals = getVendorTotals();
  const itemsSubtotal = getGrandTotal();

  // Calculate mock shipping: $5.99 flat per vendor
  const vendorCount = Object.keys(itemsByVendor).length;
  const totalShipping = vendorCount * 5.99;
  const estimatedTax = itemsSubtotal * 0.08;
  const finalTotal = itemsSubtotal + totalShipping + estimatedTax;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const mockOrderId = 'ord_' + Math.random().toString(36).substring(2, 9);
    clearCart();
    navigate(`/order/${mockOrderId}/confirmation`);
  };

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
          You need items in your cart to checkout.
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

  const steps = [
    { id: 1, name: 'Address' },
    { id: 2, name: 'Split Review' },
    { id: 3, name: 'Payment' },
    { id: 4, name: 'Confirm' }
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12 w-full">
      <div className="flex items-end justify-between border-b border-outline-variant pb-4">
        <h1 className="text-3xl font-headline font-bold text-on-surface">Checkout</h1>
      </div>

      {/* Stepper */}
      <div className="w-full py-4">
        <div className="flex items-center justify-between relative max-w-3xl mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-container rounded-full z-0"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500" style={{ width: '50%' }}></div>

          {steps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  isCompleted ? 'bg-primary text-on-primary' :
                  isCurrent ? 'bg-surface border-2 border-primary text-primary' :
                  'bg-surface-container border border-outline-variant text-on-surface-variant'
                }`}>
                  {isCompleted ? <Check size={16} /> : step.id}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-primary' : 'text-on-surface-variant'}`}>{step.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="lg:w-2/3 flex flex-col gap-8">

          {/* Address Section */}
          <section className="glass-1 rounded-xl border border-outline-variant overflow-hidden flex flex-col">
            <div className="p-4 border-b border-outline-variant bg-surface-container-lowest/50 flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              <h2 className="font-headline font-bold text-lg text-on-surface">Shipping Address</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-on-surface-variant">Full Name</label>
                <input required type="text" defaultValue="Sarah Jenkins" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-on-surface-variant">Street Address</label>
                <input required type="text" defaultValue="123 Commerce Blvd, Suite 400" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-on-surface-variant">City</label>
                <input required type="text" defaultValue="San Francisco" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-on-surface-variant">State/Province</label>
                <input required type="text" defaultValue="CA" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-on-surface-variant">Postal Code</label>
                <input required type="text" defaultValue="94105" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-on-surface-variant">Phone Number</label>
                <input required type="tel" defaultValue="+1 (555) 123-4567" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
              </div>
            </div>
          </section>

          {/* Split Review Section */}
          <section className="flex flex-col gap-6">
            <h2 className="font-headline font-bold text-xl text-on-surface">Split Fulfillment Review</h2>
            <p className="text-sm text-on-surface-variant mb-2">Your order will be fulfilled and shipped directly by the respective vendors.</p>

            {Object.entries(itemsByVendor).map(([vendorId, items], index) => {
              const vendor = vendors[vendorId];
              const vendorSubtotal = vendorTotals[vendorId] || 0;

              return (
                <div key={vendorId}>
                  <div className="glass-1 rounded-xl border border-outline-variant overflow-hidden flex flex-col">
                    <div className="bg-surface-container-low p-4 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-highest border border-outline-variant flex items-center justify-center text-lg font-bold text-primary shrink-0">
                          {vendor?.name?.charAt(0) || 'V'}
                        </div>
                        <div>
                          <h3 className="font-bold text-on-surface text-lg leading-tight">{vendor?.name || 'Loading vendor...'}</h3>
                          <div className="text-xs text-secondary flex items-center gap-1 mt-1"><Truck size={12}/> Est. Delivery: Oct 3-5</div>
                        </div>
                      </div>
                      <div className="text-right flex gap-6">
                        <div>
                          <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-mono">Shipping</div>
                          <div className="text-sm font-bold font-mono text-on-surface">$5.99</div>
                        </div>
                        <div>
                          <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-mono">Subtotal</div>
                          <div className="text-sm font-bold font-mono text-primary">${vendorSubtotal.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col divide-y divide-outline-variant/50 p-4">
                      {items.map(item => (
                        <div key={item.product.id} className="py-2 flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="font-medium text-sm text-on-surface">{item.product.name}</span>
                            <span className="text-xs text-on-surface-variant">Qty: {item.quantity}</span>
                          </div>
                          <span className="font-mono text-sm font-bold text-on-surface">${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {index < vendorCount - 1 && (
                    <div className="my-6 vendor-seam opacity-50"></div>
                  )}
                </div>
              );
            })}
          </section>

          {/* Payment Section */}
          <section className="glass-1 rounded-xl border border-outline-variant overflow-hidden flex flex-col mb-8">
            <div className="p-4 border-b border-outline-variant bg-surface-container-lowest/50 flex items-center gap-2">
              <CreditCard size={20} className="text-primary" />
              <h2 className="font-headline font-bold text-lg text-on-surface">Payment Method</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-on-surface-variant">Name on Card</label>
                <input required type="text" placeholder="Sarah Jenkins" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-on-surface-variant">Card Number</label>
                <input required type="text" placeholder="•••• •••• •••• 4242" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface font-mono focus:border-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-on-surface-variant">Expiry Date</label>
                <input required type="text" placeholder="MM/YY" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface font-mono focus:border-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-on-surface-variant">CVV</label>
                <input required type="text" placeholder="•••" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface font-mono focus:border-primary focus:outline-none" />
              </div>
            </div>
          </section>

        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:w-1/3 shrink-0">
          <div className="sticky top-24 glass-1 p-6 rounded-xl border border-outline-variant flex flex-col gap-6 shadow-floating">
            <h2 className="font-headline font-bold text-xl text-on-surface border-b border-outline-variant pb-4">Order Summary</h2>

            <div className="flex flex-col gap-4 font-mono text-sm">
              <div className="flex justify-between items-center text-on-surface">
                <span>Items ({totalItems})</span>
                <span>${itemsSubtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-on-surface">
                <span>Shipping ({vendorCount} shipments)</span>
                <span>${totalShipping.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-on-surface-variant pb-4 border-b border-outline-variant/50">
                <span>Estimated Tax</span>
                <span>${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-xl font-bold text-on-surface pt-2">
                <span>Total</span>
                <span className="text-primary">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button
                type="submit"
                className="w-full py-4 bg-primary text-on-primary rounded-lg font-bold text-center hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2 group"
              >
                Place Order
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="mt-2 text-xs text-on-surface-variant text-center leading-relaxed">
              By placing your order, you agree to MarketGrid's Terms of Service and Privacy Policy.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
