import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Store, Receipt, ArrowRight } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();

  // Use a fixed mock for simplicity and consistency
  const mockOrder = {
    id: id || 'ord_8f7b2m9',
    totalItems: 4,
    grandTotal: 345.50,
    vendorCount: 2,
    date: new Date().toLocaleDateString()
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-12 w-full mt-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass-1 rounded-2xl border border-outline-variant overflow-hidden flex flex-col items-center p-10 md:p-16 text-center shadow-floating relative"
      >
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[150%] rounded-full bg-secondary blur-[120px] opacity-10 pointer-events-none" style={{ zIndex: -1 }}></div>

        <div className="w-20 h-20 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-secondary" />
        </div>

        <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface mb-2 tracking-tight">Order Confirmed!</h1>
        <p className="text-lg text-on-surface-variant mb-8 max-w-lg">
          Thank you for your purchase. Your order has been securely processed and sent to the vendors for fulfillment.
        </p>

        <div className="w-full bg-surface-container-lowest/50 rounded-xl p-6 border border-outline-variant/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 text-left">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-on-surface-variant">Order ID</span>
            <span className="font-mono text-primary font-bold text-lg">#{mockOrder.id}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-on-surface-variant flex items-center gap-1.5"><Package size={14}/> Items</span>
            <span className="font-bold text-on-surface text-lg">{mockOrder.totalItems}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-on-surface-variant flex items-center gap-1.5"><Store size={14}/> Vendors</span>
            <span className="font-bold text-on-surface text-lg">{mockOrder.vendorCount}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-on-surface-variant flex items-center gap-1.5"><Receipt size={14}/> Total</span>
            <span className="font-mono text-on-surface font-bold text-lg">${mockOrder.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            to={`/order/${mockOrder.id}/track`}
            className="px-8 py-4 bg-primary text-on-primary rounded-lg font-bold text-lg hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2 group"
          >
            Track Your Order
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/catalog"
            className="px-8 py-4 bg-surface border border-outline-variant text-on-surface rounded-lg font-bold text-lg hover:bg-surface-variant transition-colors flex items-center justify-center"
          >
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
