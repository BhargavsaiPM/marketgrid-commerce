import { useState, useEffect } from 'react';
import { vendorService } from '../services/vendorService';
import type { VendorDTO } from '../types/vendor.types';
import { Search, Filter, CheckCircle2, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AdminVendors() {
  const [activeTab, setActiveTab] = useState<'all' | 'kyc' | 'suspended'>('all');
  const [vendors, setVendors] = useState<VendorDTO[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      const data = await vendorService.getVendors();
      setVendors(data);
    };
    fetchVendors();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const pendingKYC = [
    { id: 'app1', name: 'Apex Gear Co.', appliedAt: '2023-10-24', status: 'Pending Review' },
    { id: 'app2', name: 'Velvet Threads', appliedAt: '2023-10-25', status: 'Pending Review' }
  ];

  const renderTabs = () => (
    <div className="flex gap-4 border-b border-outline-variant mb-6">
      <button
        onClick={() => setActiveTab('all')}
        className={`pb-2 px-1 text-sm font-bold transition-colors ${activeTab === 'all' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
      >
        All Vendors
      </button>
      <button
        onClick={() => setActiveTab('kyc')}
        className={`pb-2 px-1 text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'kyc' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
      >
        KYC Review Queue <span className="bg-tertiary text-on-surface px-1.5 py-0.5 rounded text-[10px]">2</span>
      </button>
      <button
        onClick={() => setActiveTab('suspended')}
        className={`pb-2 px-1 text-sm font-bold transition-colors ${activeTab === 'suspended' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
      >
        Suspended
      </button>
    </div>
  );

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

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Vendor Management</h1>
          <p className="text-on-surface-variant">Oversee vendor accounts, KYC applications, and settings.</p>
        </div>
      </div>

      {renderTabs()}

      <div className="glass-1 rounded-xl border border-outline-variant overflow-hidden flex flex-col mb-8">
        <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest/50">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-surface-container border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
          <button className="p-2 border border-outline-variant rounded-lg bg-surface hover:bg-surface-variant transition-colors flex items-center justify-center shrink-0">
            <Filter size={16} className="text-on-surface-variant" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-container text-on-surface-variant font-mono text-xs uppercase tracking-wider">
              {activeTab === 'all' && (
                <tr>
                  <th className="p-4 font-medium">Vendor</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              )}
              {activeTab === 'kyc' && (
                <tr>
                  <th className="p-4 font-medium">Applicant</th>
                  <th className="p-4 font-medium">Applied Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              )}
              {activeTab === 'suspended' && (
                <tr>
                  <th className="p-4 font-medium">Vendor</th>
                  <th className="p-4 font-medium">Suspension Date</th>
                  <th className="p-4 font-medium">Reason</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {activeTab === 'all' && vendors.map(vendor => (
                <tr key={vendor.id} className="hover:bg-surface-variant/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-on-surface">{vendor.name}</div>
                    <div className="text-xs text-on-surface-variant font-mono">{vendor.id}</div>
                  </td>
                  <td className="p-4 text-on-surface-variant">{vendor.type}</td>
                  <td className="p-4 text-on-surface-variant">{vendor.category}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded text-[10px] uppercase font-bold font-mono tracking-wider bg-secondary/20 text-secondary">
                      Active
                    </span>
                  </td>
                </tr>
              ))}

              {activeTab === 'kyc' && pendingKYC.map(app => (
                <tr key={app.id} className="hover:bg-surface-variant/30 transition-colors">
                  <td className="p-4 font-bold text-on-surface">{app.name}</td>
                  <td className="p-4 text-on-surface-variant font-mono">{app.appliedAt}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded text-[10px] uppercase font-bold font-mono tracking-wider bg-tertiary/20 text-tertiary">
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => showToast(`Approved ${app.name}`)}
                      className="w-8 h-8 rounded-full bg-secondary/10 text-secondary hover:bg-secondary hover:text-on-secondary flex items-center justify-center transition-colors"
                      aria-label="Approve"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <button
                      onClick={() => showToast(`Rejected ${app.name}`)}
                      className="w-8 h-8 rounded-full bg-error/10 text-error hover:bg-error hover:text-on-error flex items-center justify-center transition-colors"
                      aria-label="Reject"
                    >
                      <XCircle size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {activeTab === 'suspended' && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-on-surface-variant">No suspended vendors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Rules Section */}
      <div>
        <h2 className="text-xl font-headline font-bold text-on-surface mb-4">Commission Rules</h2>
        <div className="glass-1 rounded-xl border border-outline-variant overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
             <thead className="bg-surface-container text-on-surface-variant font-mono text-xs uppercase tracking-wider">
               <tr>
                 <th className="p-4 font-medium w-1/2">Category</th>
                 <th className="p-4 font-medium w-1/2">Commission Rate (%)</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-outline-variant/50">
               {['Electronics', 'Home & Living', 'Sports', 'Beauty'].map(cat => (
                 <tr key={cat}>
                   <td className="p-4 text-on-surface font-medium">{cat}</td>
                   <td className="p-4">
                     <input
                       type="number"
                       defaultValue={cat === 'Electronics' ? 8 : cat === 'Beauty' ? 15 : 12}
                       className="bg-surface-container border border-outline-variant text-on-surface rounded p-1.5 w-24 text-sm focus:outline-none focus:border-primary font-mono"
                     />
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
