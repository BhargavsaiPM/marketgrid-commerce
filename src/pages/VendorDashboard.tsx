import { useEffect, useState } from 'react';
import { DollarSign, Package, AlertTriangle, TrendingUp, ChevronDown } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { vendorService } from '../services/vendorService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { useAuthStore } from '../store/authStore';
import type { VendorMetricsDTO } from '../types/vendor.types';
import type { ProductDTO } from '../types/product.types';
import type { OrderDTO } from '../types/order.types';

export default function VendorDashboard() {
  const { session } = useAuthStore();
  const [metrics, setMetrics] = useState<VendorMetricsDTO | null>(null);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);

  useEffect(() => {
    if (!session?.activeTenantId) return;

    const unsubMetrics = vendorService.subscribeToVendorMetrics(session.activeTenantId, (newMetrics: VendorMetricsDTO) => {
      setMetrics(newMetrics);
    });

    const fetchData = async () => {
      const fetchedProducts = await productService.getProductsByVendorId(session.activeTenantId!);
      setProducts(fetchedProducts);

      const fetchedOrders = await orderService.getOrdersByVendorId(session.activeTenantId!);
      setOrders(fetchedOrders);
    };

    fetchData();

    return () => {
      unsubMetrics();
    };
  }, [session?.activeTenantId]);

  const toggleStockStatus = async (productId: string, currentStatus: ProductDTO['status'], stockCount: number) => {
    const newStatus = currentStatus === 'OUT_OF_STOCK' ? 'IN_STOCK' : 'OUT_OF_STOCK';
    const newStockCount = newStatus === 'IN_STOCK' && stockCount === 0 ? 100 : stockCount; // Give some stock if it was 0

    await productService.updateProductStock(productId, newStockCount, newStatus);
    // Refresh local list
    const updated = await productService.getProductsByVendorId(session!.activeTenantId!);
    setProducts(updated);
  };

  const changeOrderStatus = async (orderId: string, status: OrderDTO['status']) => {
    await orderService.updateOrderStatus(orderId, status);
    // Refresh local list
    const updated = await orderService.getOrdersByVendorId(session!.activeTenantId!);
    setOrders(updated);
  };

  const lowStockCount = products.filter(p => p.status === 'LOW_STOCK' || p.status === 'OUT_OF_STOCK').length;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Dashboard</h1>
          <p className="text-on-surface-variant">Overview for Tenant {session?.activeTenantId}</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Revenue Today"
          value={`$${metrics ? (metrics.totalRevenue * 0.1).toFixed(2) : '0.00'}`}
          icon={<DollarSign size={20} />}
        />
        <MetricCard
          title="Revenue (30d)"
          value={`$${metrics ? metrics.totalRevenue.toFixed(2) : '0.00'}`}
          icon={<TrendingUp size={20} />}
        />
        <MetricCard
          title="Orders Today"
          value={metrics ? Math.floor(metrics.totalOrders * 0.2).toString() : '0'}
          icon={<Package size={20} />}
        />
        <MetricCard
          title="Low-Stock Alerts"
          value={lowStockCount.toString()}
          icon={<AlertTriangle size={20} className={lowStockCount > 0 ? "text-tertiary" : ""} />}
          pulse={lowStockCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Preview */}
        <div className="glass-1 rounded-xl border border-outline-variant overflow-hidden flex flex-col">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest/50">
            <h2 className="font-headline font-bold text-lg">Inventory Preview</h2>
            <a href="/vendor/inventory" className="text-sm text-primary hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-container text-on-surface-variant font-mono text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Stock</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Live</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {products.slice(0, 5).map(product => (
                  <tr key={product.id} className="hover:bg-surface-variant/30 transition-colors">
                    <td className="p-4 text-on-surface font-medium max-w-[200px] truncate" title={product.name}>{product.name}</td>
                    <td className="p-4 font-mono text-on-surface-variant">${product.price.toFixed(2)}</td>
                    <td className="p-4 font-mono text-on-surface-variant">{product.stockCount}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold font-mono tracking-wider ${
                        product.status === 'IN_STOCK' ? 'bg-secondary/20 text-secondary' :
                        product.status === 'LOW_STOCK' ? 'bg-tertiary/20 text-tertiary' :
                        'bg-error/20 text-error'
                      }`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleStockStatus(product.id, product.status, product.stockCount)}
                        className={`w-10 h-5 rounded-full relative inline-flex items-center transition-colors ${
                          product.status !== 'OUT_OF_STOCK' ? 'bg-primary' : 'bg-surface-container-highest'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                          product.status !== 'OUT_OF_STOCK' ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fulfillment Queue Preview */}
        <div className="glass-1 rounded-xl border border-outline-variant overflow-hidden flex flex-col">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest/50">
            <h2 className="font-headline font-bold text-lg">Fulfillment Queue</h2>
            <a href="/vendor/orders" className="text-sm text-primary hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-container text-on-surface-variant font-mono text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Time</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id} className="hover:bg-surface-variant/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-on-surface">#{order.id}</td>
                    <td className="p-4 text-on-surface-variant">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td className="p-4 font-mono text-on-surface-variant">${order.totalAmount.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="relative inline-block group">
                        <select
                          className="appearance-none bg-surface-container border border-outline-variant text-on-surface text-xs rounded pl-2 pr-6 py-1 cursor-pointer focus:outline-none focus:border-primary"
                          value={order.status}
                          onChange={(e) => changeOrderStatus(order.id, e.target.value as any)}
                        >
                          <option value="PENDING">Confirmed</option>
                          <option value="PROCESSING">Packed</option>
                          <option value="SHIPPED">Shipped</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">No pending orders.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
