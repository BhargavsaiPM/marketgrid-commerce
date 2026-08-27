import { Routes, Route, Link } from 'react-router-dom';
import Storefront from './pages/Storefront';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import VendorDashboard from './pages/VendorDashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <nav className="mb-4 bg-white p-4 shadow rounded flex gap-4">
        <Link to="/" className="text-blue-500 hover:underline">Storefront</Link>
        <Link to="/catalog" className="text-blue-500 hover:underline">Catalog</Link>
        <Link to="/cart" className="text-blue-500 hover:underline">Cart</Link>
        <Link to="/vendor/dashboard" className="text-blue-500 hover:underline">Vendor Dashboard</Link>
      </nav>
      <main className="bg-white p-4 shadow rounded">
        <Routes>
          <Route path="/" element={<Storefront />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
