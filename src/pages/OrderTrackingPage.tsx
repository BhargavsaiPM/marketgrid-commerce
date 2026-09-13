import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Package, Check, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [expandedVendor, setExpandedVendor] = useState<string | null>('v1'); // Default expand first vendor

  const mockOrder = {
    id: id || 'ord_8f7b2m9',
    placedDate: new Date().toLocaleDateString(),
    grandTotal: 345.50,
  };

  const mockShipments = [
    {
      vendorId: 'v1',
      vendorName: 'Lumen Electronics',
      status: 'SHIPPED',
      currentStep: 3, // 1: Confirmed, 2: Packed, 3: Shipped, 4: Out for Delivery, 5: Delivered
      estimatedDelivery: 'Oct 5, 2026',
      items: [
        { name: 'Aria Wireless Earbuds Pro', price: 89.99, qty: 1 },
        { name: 'Nova 4K Action Camera', price: 129.99, qty: 1 }
      ]
    },
    {
      vendorId: 'v2',
      vendorName: 'Vertex Sportswear',
      status: 'PACKED',
      currentStep: 2,
      estimatedDelivery: 'Oct 7, 2026',
      items: [
        { name: 'TrailFlex Running Shoes', price: 74.00, qty: 1 },
        { name: 'Aero Mesh Gym Shorts', price: 24.99, qty: 2 }
      ]
    }
  ];

  const trackingSteps = [
    { id: 1, label: 'Confirmed' },
    { id: 2, label: 'Packed' },
    { id: 3, label: 'Shipped' },
    { id: 4, label: 'Out for Delivery' },
    { id: 5, label: 'Delivered' }
  ];

  const toggleExpand = (vendorId: string) => {
    setExpandedVendor(expandedVendor === vendorId ? null : vendorId);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12 w-full mt-4">
      <Link to="/account/orders" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 w-fit">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="glass-1 rounded-xl border border-outline-variant p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest/50">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface flex items-center gap-3">
            Tracking Order <span className="font-mono text-primary">#{mockOrder.id}</span>
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">Placed on {mockOrder.placedDate} • Total: <span className="font-mono font-bold">${mockOrder.grandTotal.toFixed(2)}</span></p>
        </div>
        <div className="px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg flex items-center gap-2 text-sm font-medium">
          <Package size={16} className="text-on-surface-variant" />
          Split Shipment ({mockShipments.length} packages)
        </div>
      </div>

      <div className="flex flex-col">
        {mockShipments.map((shipment, index) => {
          const isExpanded = expandedVendor === shipment.vendorId;

          return (
            <div key={shipment.vendorId} className="flex flex-col">
              <div className="glass-1 rounded-xl border border-outline-variant overflow-hidden flex flex-col">

                {/* Vendor Header */}
                <div
                  className="bg-surface-container-low p-4 flex items-center justify-between border-b border-outline-variant cursor-pointer hover:bg-surface-container transition-colors"
                  onClick={() => toggleExpand(shipment.vendorId)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest border border-outline-variant flex items-center justify-center text-lg font-bold text-primary shrink-0">
                      {shipment.vendorName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface leading-tight flex items-center gap-2">
                        Shipment from {shipment.vendorName}
                      </h3>
                      <div className="text-xs text-secondary font-bold font-mono uppercase tracking-wider mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        {shipment.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-right mr-4">
                      <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-mono">Est. Delivery</div>
                      <div className="text-sm font-bold text-on-surface">{shipment.estimatedDelivery}</div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-surface border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Horizontal Stepper Lane */}
                <div className="p-6 md:p-8 bg-surface-container-lowest/30">
                  <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto">
                    {/* Background track line */}
                    <div className="absolute left-[10%] right-[10%] top-4 h-0.5 bg-outline-variant/30 z-0"></div>

                    {/* Active track line */}
                    <div
                      className="absolute left-[10%] top-4 h-0.5 bg-primary z-0 transition-all duration-1000 ease-out"
                      style={{ width: `${Math.max(0, (shipment.currentStep - 1) * 20)}%` }}
                    ></div>

                    {trackingSteps.map((step) => {
                      const isCompleted = step.id < shipment.currentStep;
                      const isCurrent = step.id === shipment.currentStep;


                      return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-3 w-1/5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-sm ${
                            isCompleted ? 'bg-primary text-on-primary ring-2 ring-primary ring-offset-2 ring-offset-background' :
                            isCurrent ? 'bg-surface border-2 border-primary text-primary ' :
                            'bg-surface-container border border-outline-variant text-on-surface-variant'
                          }`}>
                            {isCompleted ? <Check size={16} /> : (isCurrent ? <MapPin size={14} /> : step.id)}
                          </div>
                          <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider text-center max-w-[80px] leading-tight ${
                            isCurrent ? 'text-primary' :
                            isCompleted ? 'text-on-surface' :
                            'text-on-surface-variant opacity-70'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expandable Line Items */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-outline-variant p-4 bg-surface-container/30 flex flex-col gap-2">
                        <div className="text-xs uppercase font-mono font-bold tracking-wider text-on-surface-variant mb-2 px-2">Items in this shipment</div>
                        {shipment.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-surface-container border border-outline-variant flex items-center justify-center shrink-0">
                                <span className="text-[8px] font-mono text-outline-variant">IMG</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-sm text-on-surface">{item.name}</span>
                                <span className="text-xs text-on-surface-variant">Qty: {item.qty}</span>
                              </div>
                            </div>
                            <span className="font-mono text-sm font-bold text-on-surface">${(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Vendor Seam Separator (except after the last one) */}
              {index < mockShipments.length - 1 && (
                <div className="my-8 vendor-seam"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
