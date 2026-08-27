import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Storefront from './pages/Storefront';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import VendorDashboard from './pages/VendorDashboard';
import { useAuthStore } from './store/authStore';

function App() {
  const { login, logout, session } = useAuthStore();
  return (
    <div className="min-h-screen bg-background text-on-background">
      <Navbar />

      {/* Dev only role switcher */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 p-4 bg-surface-container rounded-lg border border-outline-variant shadow-floating opacity-50 hover:opacity-100 transition-opacity text-xs">
        <div className="font-bold mb-1">Dev Tools</div>
        <div className="flex gap-2">
          <button onClick={() => logout()} className={`px-2 py-1 rounded ${!session ? 'bg-primary text-on-primary' : 'bg-surface border border-outline'}`}>None</button>
          <button onClick={() => login('u3')} className={`px-2 py-1 rounded ${session?.user.role === 'customer' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline'}`}>Customer</button>
          <button onClick={() => login('u2')} className={`px-2 py-1 rounded ${session?.user.role === 'vendor' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline'}`}>Vendor</button>
          <button onClick={() => login('u1')} className={`px-2 py-1 rounded ${session?.user.role === 'admin' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline'}`}>Admin</button>
        </div>
      </div>

      <main className="max-w-[1280px] mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={<Storefront />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          {/* Catch all for testing nav links */}
          <Route path="*" element={<div className="p-8 text-center text-on-surface-variant">Page not implemented yet</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
