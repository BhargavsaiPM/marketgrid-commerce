import { useEffect, useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { productService } from '../services/productService';
import { useAuthStore } from '../store/authStore';
import type { ProductDTO } from '../types/product.types';

export default function VendorInventory() {
  const { session } = useAuthStore();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.activeTenantId) return;

    const fetchData = async () => {
      const fetchedProducts = await productService.getProductsByVendorId(session.activeTenantId!);
      setProducts(fetchedProducts);
      setLoading(false);
    };

    fetchData();
  }, [session?.activeTenantId]);

  const toggleStockStatus = async (productId: string, currentStatus: ProductDTO['status'], stockCount: number) => {
    const newStatus = currentStatus === 'OUT_OF_STOCK' ? 'IN_STOCK' : 'OUT_OF_STOCK';
    const newStockCount = newStatus === 'IN_STOCK' && stockCount === 0 ? 100 : stockCount;

    await productService.updateProductStock(productId, newStockCount, newStatus);
    const updated = await productService.getProductsByVendorId(session!.activeTenantId!);
    setProducts(updated);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface mb-1">Inventory Management</h1>
          <p className="text-on-surface-variant">Manage your product catalog and stock levels.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-outline-variant rounded-lg bg-surface hover:bg-surface-variant text-sm font-medium transition-colors">Import CSV</button>
          <button className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">Add Product</button>
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
                placeholder="Search products..."
                className="w-full bg-surface-container border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <button className="p-2 border border-outline-variant rounded-lg bg-surface hover:bg-surface-variant transition-colors flex items-center justify-center shrink-0">
              <Filter size={16} className="text-on-surface-variant" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-on-surface-variant mr-2">Bulk Actions:</span>
            <select className="bg-surface-container border border-outline-variant text-on-surface text-sm rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:border-primary appearance-none pr-8">
              <option value="">Select action...</option>
              <option value="mark_in_stock">Mark In Stock</option>
              <option value="mark_out_of_stock">Mark Out of Stock</option>
              <option value="delete">Delete Selected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-container text-on-surface-variant font-mono text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary" />
                </th>
                <th className="p-4 font-medium cursor-pointer hover:text-on-surface">Product <ChevronDown size={12} className="inline ml-1" /></th>
                <th className="p-4 font-medium cursor-pointer hover:text-on-surface">SKU</th>
                <th className="p-4 font-medium cursor-pointer hover:text-on-surface">Price <ChevronDown size={12} className="inline ml-1" /></th>
                <th className="p-4 font-medium cursor-pointer hover:text-on-surface">Stock</th>
                <th className="p-4 font-medium cursor-pointer hover:text-on-surface">Status</th>
                <th className="p-4 font-medium text-right">Live</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-on-surface-variant">Loading inventory...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-on-surface-variant">No products found.</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="hover:bg-surface-variant/30 transition-colors">
                    <td className="p-4 text-center">
                      <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary" />
                    </td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-surface-container border border-outline-variant flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-mono text-outline-variant">IMG</span>
                      </div>
                      <div className="font-medium text-on-surface max-w-[300px] truncate" title={product.name}>{product.name}</div>
                    </td>
                    <td className="p-4 font-mono text-on-surface-variant">SKU-{product.id.split('-')[0].toUpperCase() || product.id.toUpperCase()}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-outline-variant flex items-center justify-between bg-surface-container-lowest/50 text-sm">
          <div className="text-on-surface-variant font-mono">
            Showing {products.length} of {products.length} items
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
