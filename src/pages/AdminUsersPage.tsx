import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, Shield, User, Store, CheckCircle2, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AdminUsersPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current tab from URL path
  let currentTab = 'customers';
  if (location.pathname.includes('/vendors')) currentTab = 'vendors';
  else if (location.pathname.includes('/admins')) currentTab = 'admins';

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const setTab = (tab: string) => {
    navigate(`/admin/users/${tab}`);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const mockUsers = {
    customers: [
      { id: 'c1', name: 'Sarah Jenkins', email: 'sarah@example.com', role: 'customer', status: 'Active', joined: '2023-01-15' },
      { id: 'c2', name: 'Mike Thompson', email: 'mike@example.com', role: 'customer', status: 'Active', joined: '2023-03-22' },
      { id: 'c3', name: 'Elena Rodriguez', email: 'elena@example.com', role: 'customer', status: 'Inactive', joined: '2023-05-10' },
      { id: 'c4', name: 'David Kim', email: 'david@example.com', role: 'customer', status: 'Active', joined: '2023-06-01' },
    ],
    vendors: [
      { id: 'v1', name: 'Lumen Electronics', email: 'admin@lumenelec.com', role: 'vendor', status: 'Active', joined: '2022-11-05' },
      { id: 'v2', name: 'Aurora Home Goods', email: 'hello@aurorahome.com', role: 'vendor', status: 'Active', joined: '2022-12-12' },
      { id: 'v3', name: 'Vertex Sportswear', email: 'sales@vertexsports.com', role: 'vendor', status: 'Suspended', joined: '2023-02-18' },
      { id: 'v4', name: 'Nimbus Beauty Co.', email: 'contact@nimbusbeauty.com', role: 'vendor', status: 'Active', joined: '2023-04-30' },
    ],
    admins: [
      { id: 'a1', name: 'Admin Root', email: 'admin@marketgrid.com', role: 'admin', status: 'Active', joined: '2022-01-01' },
      { id: 'a2', name: 'System Moderator', email: 'mod@marketgrid.com', role: 'admin', status: 'Active', joined: '2022-06-15' },
      { id: 'a3', name: 'Support Lead', email: 'support@marketgrid.com', role: 'admin', status: 'Active', joined: '2022-08-20' },
    ]
  };

  const activeUsers = mockUsers[currentTab as keyof typeof mockUsers] || [];

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
          <h1 className="text-3xl font-headline font-bold text-on-surface">User Management</h1>
          <p className="text-on-surface-variant">Manage platform access, roles, and account status.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-outline-variant mb-6">
        <button
          onClick={() => setTab('customers')}
          className={`pb-2 px-1 text-sm font-bold transition-colors flex items-center gap-2 ${currentTab === 'customers' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          <User size={16} /> Customers
        </button>
        <button
          onClick={() => setTab('vendors')}
          className={`pb-2 px-1 text-sm font-bold transition-colors flex items-center gap-2 ${currentTab === 'vendors' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          <Store size={16} /> Vendors
        </button>
        <button
          onClick={() => setTab('admins')}
          className={`pb-2 px-1 text-sm font-bold transition-colors flex items-center gap-2 ${currentTab === 'admins' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          <Shield size={16} /> Admins
        </button>
      </div>

      <div className="glass-1 rounded-xl border border-outline-variant overflow-hidden flex flex-col mb-8">
        <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest/50">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder={`Search ${currentTab}...`}
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
              <tr>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {activeUsers.map(user => (
                <tr key={user.id} className="hover:bg-surface-variant/30 transition-colors">
                  <td className="p-4 font-bold text-on-surface">{user.name}</td>
                  <td className="p-4 text-on-surface-variant">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold font-mono tracking-wider ${
                      user.role === 'admin' ? 'bg-primary/20 text-primary' :
                      user.role === 'vendor' ? 'bg-tertiary/20 text-tertiary' :
                      'bg-secondary/20 text-secondary'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold font-mono tracking-wider ${
                      user.status === 'Active' ? 'bg-secondary/20 text-secondary' :
                      user.status === 'Suspended' ? 'bg-error/20 text-error' :
                      'bg-surface-container-highest text-on-surface-variant'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-on-surface-variant font-mono">{user.joined}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    {user.status === 'Active' ? (
                      <button
                        onClick={() => showToast(`Suspended ${user.name}`)}
                        className="w-8 h-8 rounded-full bg-error/10 text-error hover:bg-error hover:text-on-error flex items-center justify-center transition-colors"
                        title="Suspend User"
                      >
                        <XCircle size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => showToast(`Activated ${user.name}`)}
                        className="w-8 h-8 rounded-full bg-secondary/10 text-secondary hover:bg-secondary hover:text-on-secondary flex items-center justify-center transition-colors"
                        title="Activate User"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {activeUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
