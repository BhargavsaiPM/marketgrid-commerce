import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, ChevronDown, User, Package, Box, LogOut, Menu, X, Settings } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import vendorsData from '../../mocks/vendors.json';
import productsData from '../../mocks/products.json';

const Navbar = () => {
  const location = useLocation();
  const { getTotalItemsCount } = useCartStore();
  const { session, logout } = useAuthStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State for desktop dropdowns
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const role = session?.user?.role || 'customer';
  const cartCount = getTotalItemsCount();

  const handleDropdownEnter = (menu: string) => setActiveDropdown(menu);
  const handleDropdownLeave = () => setActiveDropdown(null);

  // Helper to check active state based on route

  // Custom nav item component with proper styling and active state
  const NavItem = ({ label, path, hasDropdown = false, onMouseEnter, onMouseLeave, isNeutral = false }: any) => {
    // Determine active state - strict rules per requirement
    let active = false;

    if (!isNeutral) {
      if (label === 'Categories' && location.pathname === '/catalog') active = true;
      else if (label === 'Vendors' && location.pathname === '/vendors') active = true;
      else if (label === 'Deals' && location.pathname === '/deals') active = true;
      else if (label === 'Dashboard' && location.pathname === '/vendor/dashboard') active = true;
      else if (label === 'Overview' && location.pathname === '/admin/overview') active = true;
      // Add more specific route matches here as they are built out
    }

    return (
      <div
        className="relative flex h-full items-center"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Link
          to={path}
          className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
            active && !isNeutral ? 'text-primary' : 'text-on-surface hover:text-primary'
          }`}
        >
          {label}
          {hasDropdown && <ChevronDown size={14} className="opacity-70" />}
        </Link>
        {active && !isNeutral && (
          <motion.div
            layoutId="activeNavIndicator"
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    );
  };

  const renderCustomerNav = () => (
    <>
      <div className="flex h-full items-center" onMouseLeave={handleDropdownLeave}>
        <NavItem
          label="Categories"
          path="/catalog"
          hasDropdown
          onMouseEnter={() => handleDropdownEnter('categories')}
        />
        <AnimatePresence>
          {activeDropdown === 'categories' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 mt-2 w-[600px] glass-1 rounded-xl shadow-floating border border-outline-variant overflow-hidden z-50"
            >
              <div className="flex bg-surface-container-low">
                <div className="w-1/3 p-6 bg-surface-container">
                  <h3 className="text-lg font-headline font-semibold text-on-surface mb-2">Explore everything</h3>
                  <p className="text-sm text-on-surface-variant mb-4">Discover millions of products across thousands of trusted vendors.</p>
                  <Link to="/catalog" className="text-primary text-sm font-medium hover:underline">See full catalog &rarr;</Link>
                </div>
                <div className="w-2/3 p-6 grid grid-cols-2 gap-4">
                  {['Electronics', 'Home & Living', 'Sports', 'Beauty', 'Fashion', 'Automotive'].map(cat => (
                    <Link key={cat} to={`/catalog?category=${cat}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-variant transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors text-on-surface-variant">
                        <Box size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-on-surface">{cat}</div>
                        <div className="text-xs text-on-surface-variant font-mono">1,200+ items</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex h-full items-center" onMouseLeave={handleDropdownLeave}>
        <NavItem
          label="Vendors"
          path="/vendors"
          hasDropdown
          onMouseEnter={() => handleDropdownEnter('vendors')}
        />
        <AnimatePresence>
          {activeDropdown === 'vendors' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 mt-2 w-[600px] glass-1 rounded-xl shadow-floating border border-outline-variant overflow-hidden z-50"
            >
              <div className="flex bg-surface-container-low">
                <div className="w-1/3 p-6 bg-surface-container">
                  <h3 className="text-lg font-headline font-semibold text-on-surface mb-2">Our Top Partners</h3>
                  <p className="text-sm text-on-surface-variant mb-4">Shop directly from verified brands and boutique creators.</p>
                  <Link to="/vendors" className="text-primary text-sm font-medium hover:underline">See all vendors &rarr;</Link>
                </div>
                <div className="w-2/3 p-6 grid grid-cols-2 gap-4">
                  {vendorsData.map(vendor => (
                    <Link key={vendor.id} to={`/vendor/${vendor.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-variant transition-colors">
                      <div className="w-10 h-10 rounded bg-surface border border-outline-variant flex items-center justify-center text-lg font-bold text-primary">
                        {vendor.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-on-surface truncate w-32">{vendor.name}</div>
                        <div className="text-xs text-on-surface-variant font-mono">{vendor.rating} ★</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex h-full items-center" onMouseLeave={handleDropdownLeave}>
        <NavItem
          label="Deals"
          path="/deals"
          hasDropdown
          onMouseEnter={() => handleDropdownEnter('deals')}
        />
        <AnimatePresence>
          {activeDropdown === 'deals' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 mt-2 w-[600px] glass-1 rounded-xl shadow-floating border border-outline-variant overflow-hidden z-50"
            >
              <div className="flex bg-surface-container-low">
                <div className="w-1/3 p-6 bg-surface-container">
                  <h3 className="text-lg font-headline font-semibold text-on-surface mb-2">Flash Sales</h3>
                  <p className="text-sm text-on-surface-variant mb-4">Limited time offers from premium vendors.</p>
                  <Link to="/deals" className="text-primary text-sm font-medium hover:underline">View all deals &rarr;</Link>
                </div>
                <div className="w-2/3 p-6 flex flex-col gap-3">
                  {productsData.slice(0, 3).map(product => (
                    <Link key={product.id} to={`/product/${product.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-variant transition-colors border border-transparent hover:border-outline-variant">
                      <div>
                        <div className="text-sm font-medium text-on-surface">{product.name}</div>
                        <div className="text-xs text-on-surface-variant">Ends in 24h</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-primary">${product.price.toFixed(2)}</div>
                        <div className="text-xs text-on-surface-variant line-through">${(product.price * 1.2).toFixed(2)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex h-full items-center">
        <NavItem label="Sell on MarketGrid" path="/sell" isNeutral />
      </div>
    </>
  );

  const renderVendorNav = () => (
    <>
      <NavItem label="Dashboard" path="/vendor/dashboard" />

      <div className="relative flex h-full items-center" onMouseLeave={handleDropdownLeave}>
        <NavItem label="Inventory" path="/vendor/inventory" hasDropdown onMouseEnter={() => handleDropdownEnter('inventory')} />
        <AnimatePresence>
          {activeDropdown === 'inventory' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 mt-2 w-48 glass-1 rounded-lg shadow-floating border border-outline-variant py-2 z-50 flex flex-col"
            >
              <Link to="/vendor/inventory" className="px-4 py-2 text-sm text-on-surface hover:bg-surface-variant hover:text-primary transition-colors">Manage Stock</Link>
              <Link to="/vendor/inventory/bulk" className="px-4 py-2 text-sm text-on-surface hover:bg-surface-variant hover:text-primary transition-colors">Bulk Upload</Link>
              <Link to="/vendor/inventory/reports" className="px-4 py-2 text-sm text-on-surface hover:bg-surface-variant hover:text-primary transition-colors">Low-Stock Report</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative flex h-full items-center" onMouseLeave={handleDropdownLeave}>
        <NavItem label="Orders" path="/vendor/orders" hasDropdown onMouseEnter={() => handleDropdownEnter('orders')} />
        <AnimatePresence>
          {activeDropdown === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 mt-2 w-48 glass-1 rounded-lg shadow-floating border border-outline-variant py-2 z-50 flex flex-col"
            >
              <Link to="/vendor/orders" className="px-4 py-2 text-sm text-on-surface hover:bg-surface-variant hover:text-primary transition-colors">All Orders</Link>
              <Link to="/vendor/orders/pending" className="px-4 py-2 text-sm text-on-surface hover:bg-surface-variant hover:text-primary transition-colors">Pending Fulfillment</Link>
              <Link to="/vendor/orders/completed" className="px-4 py-2 text-sm text-on-surface hover:bg-surface-variant hover:text-primary transition-colors">Completed</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NavItem label="Analytics" path="/vendor/analytics" />
    </>
  );

  const renderAdminNav = () => (
    <>
      <NavItem label="Overview" path="/admin/overview" />

      <div className="relative flex h-full items-center" onMouseLeave={handleDropdownLeave}>
        <NavItem label="Vendors" path="/admin/vendors" hasDropdown onMouseEnter={() => handleDropdownEnter('admin-vendors')} />
        <AnimatePresence>
          {activeDropdown === 'admin-vendors' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 mt-2 w-48 glass-1 rounded-lg shadow-floating border border-outline-variant py-2 z-50 flex flex-col"
            >
              <Link to="/admin/vendors" className="px-4 py-2 text-sm text-on-surface hover:bg-surface-variant hover:text-primary transition-colors">All Vendors</Link>
              <Link to="/admin/vendors/kyc" className="px-4 py-2 text-sm text-on-surface hover:bg-surface-variant hover:text-primary transition-colors">KYC Review Queue</Link>
              <Link to="/admin/vendors/suspended" className="px-4 py-2 text-sm text-on-surface hover:bg-surface-variant hover:text-primary transition-colors">Suspended</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative flex h-full items-center" onMouseLeave={handleDropdownLeave}>
        <NavItem label="Users" path="/admin/users" hasDropdown onMouseEnter={() => handleDropdownEnter('admin-users')} />
        <AnimatePresence>
          {activeDropdown === 'admin-users' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 mt-2 w-48 glass-1 rounded-lg shadow-floating border border-outline-variant py-2 z-50 flex flex-col"
            >
              <Link to="/admin/users/customers" className="px-4 py-2 text-sm text-on-surface hover:bg-surface-variant hover:text-primary transition-colors">Customers</Link>
              <Link to="/admin/users/vendors" className="px-4 py-2 text-sm text-on-surface hover:bg-surface-variant hover:text-primary transition-colors">Vendors</Link>
              <Link to="/admin/users/admins" className="px-4 py-2 text-sm text-on-surface hover:bg-surface-variant hover:text-primary transition-colors">Admins</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NavItem label="Reports" path="/admin/reports" />
    </>
  );

  return (
    <nav className="sticky top-0 z-40 w-full bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant transition-colors duration-300">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">

        {/* Left: Logo */}
        <div className="flex items-center gap-8 h-full">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm group-hover:scale-105 transition-transform">
              M
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-on-surface">MARKETGRID</span>
          </Link>

          {/* Desktop Middle Nav */}
          <div className="hidden lg:flex h-full items-center gap-1 relative">
            {role === 'customer' && renderCustomerNav()}
            {role === 'vendor' && renderVendorNav()}
            {role === 'admin' && renderAdminNav()}
          </div>
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-4">

          {/* Search */}
          <div className="relative flex items-center">
            <AnimatePresence>
              {isSearchOpen && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  type="text"
                  placeholder="Search..."
                  className="absolute right-8 h-9 bg-surface-container border border-outline-variant rounded-full px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                />
              )}
            </AnimatePresence>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface transition-colors z-10 bg-surface-container-lowest"
            >
              <Search size={18} />
            </button>
          </div>

          {/* Cart */}
          <Link to="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface transition-colors">
            <ShoppingCart size={18} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.div
                  key={cartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-primary flex items-center justify-center px-1"
                >
                  <span className="text-[10px] font-bold text-on-primary font-mono">{cartCount}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          <div className="w-px h-6 bg-outline-variant hidden sm:block"></div>

          {/* Auth Area */}
          <div className="hidden sm:flex items-center gap-3">
            {!session ? (
              <Link to="/login" className="px-5 py-2 rounded-full bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                Sign In
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                {/* Tenant Switcher for Vendor/Admin */}
                {(role === 'vendor' || role === 'admin') && (
                  <button className="px-4 py-2 rounded-full border border-outline-variant bg-surface text-on-surface text-sm font-medium hover:bg-surface-variant transition-colors flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    {role === 'vendor' ? 'Tenant: v1' : 'Admin View'}
                  </button>
                )}

                {/* Avatar Menu */}
                <div className="relative" onMouseLeave={() => setActiveDropdown(null)}>
                  <button
                    className="w-9 h-9 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center text-on-surface hover:ring-2 hover:ring-primary/50 transition-all"
                    onMouseEnter={() => setActiveDropdown('avatar')}
                  >
                    <User size={16} />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === 'avatar' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 mt-2 w-48 glass-1 rounded-lg shadow-floating border border-outline-variant py-2 z-50 flex flex-col"
                      >
                        <div className="px-4 py-2 border-b border-outline-variant mb-2">
                          <div className="text-sm font-bold text-on-surface truncate">{session.user.name}</div>
                          <div className="text-xs text-on-surface-variant truncate">{session.user.email}</div>
                        </div>
                        <Link to="/account/orders" className="px-4 py-2 text-sm text-on-surface hover:bg-surface-variant hover:text-primary transition-colors flex items-center gap-2">
                          <Package size={14} /> Orders
                        </Link>
                        <Link to="/account" className="px-4 py-2 text-sm text-on-surface hover:bg-surface-variant hover:text-primary transition-colors flex items-center gap-2">
                          <Settings size={14} /> Account
                        </Link>
                        <button
                          onClick={() => logout()}
                          className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container hover:text-on-error-container transition-colors flex items-center gap-2 mt-2 border-t border-outline-variant pt-2"
                        >
                          <LogOut size={14} /> Log out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-surface-variant text-on-surface transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>
      </div>

      {/* Vendor Seam Line at bottom of nav */}
      <div className="vendor-seam opacity-50"></div>
    </nav>
  );
};


export default Navbar;
