import { useEffect, useState } from 'react';
import { Search, Filter, ChevronDown, CheckCircle2 } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuthStore } from '../store/authStore';
import type { OrderDTO } from '../types/order.types';
import { AnimatePresence, motion } from 'framer-motion';

export default function VendorOrders() {
  const { session } = useAuthStore();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.activeTenantId) return;

    const fetchData = async () => {
      const fetchedOrders = await orderService.getOrdersByVendorId(session.activeTenantId!);
      setOrders(fetchedOrders);
      setLoading(false);
    };

    fetchData();
  }, [session?.activeTenantId]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const changeOrderStatus = async (orderId: string, status: OrderDTO['status']) => {
    await orderService.updateOrderStatus(orderId, status);
    const updated = await orderService.getOrdersByVendorId(session!.activeTenantId!);
    setOrders(updated);
    showToast(`Order #${orderId} marked as ${status.replace('_', ' ')}`);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg shadow-floating border border-secondary"
          >
            <CheckCircle2 size={16} />
            <span className="text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface mb-1">Fulfillment Queue</h1>
          <p className="text-on-surface-variant">Process and track customer orders.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-outline-variant rounded-lg bg-surface hover:bg-surface-variant text-sm font-medium transition-colors">Export CSV</button>
        </div>
      </div>

      <div className="glass-1 rounded-xl border border-outline-variant overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest/50">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full bg-surface-container border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <button className="p-2 border border-outline-variant rounded-lg bg-surface hover:bg-surface-variant transition-colors flex items-center justify-center shrink-0">
              <Filter size={16} className="text-on-surface-variant" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-on-surface-variant">Status filter:</span>
            <select className="bg-surface-container border border-outline-variant text-on-surface rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary">
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-container text-on-surface-variant font-mono text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-medium cursor-pointer hover:text-on-surface">Order ID <ChevronDown size={12} className="inline ml-1" /></th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium cursor-pointer hover:text-on-surface">Date <ChevronDown size={12} className="inline ml-1" /></th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant">No orders found.</td></tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="hover:bg-surface-variant/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-on-surface">#{order.id}</td>
                    <td className="p-4 text-on-surface-variant">{order.customerId}</td>
                    <td className="p-4 text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-4 font-mono text-on-surface-variant">${order.totalAmount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold font-mono tracking-wider ${
                        order.status === 'DELIVERED' ? 'bg-secondary/20 text-secondary' :
                        order.status === 'SHIPPED' ? 'bg-primary/20 text-primary' :
                        order.status === 'PROCESSING' ? 'bg-tertiary/20 text-tertiary' :
                        order.status === 'CANCELLED' ? 'bg-error/20 text-error' :
                        'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="relative inline-block group">
                        <select
                          className="appearance-none bg-surface border border-outline-variant text-on-surface text-xs rounded-lg pl-3 pr-8 py-1.5 cursor-pointer focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm font-medium"
                          value={order.status}
                          onChange={(e) => changeOrderStatus(order.id, e.target.value as any)}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing (Packed)</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-outline-variant flex items-center justify-between bg-surface-container-lowest/50 text-sm">
          <div className="text-on-surface-variant font-mono">
            Showing {orders.length} of {orders.length} orders
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-outline-variant rounded bg-surface text-on-surface-variant disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-outline-variant rounded bg-surface text-on-surface-variant disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
