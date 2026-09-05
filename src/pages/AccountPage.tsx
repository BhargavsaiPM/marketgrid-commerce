import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { MapPin, Bell, Shield, Lock, CreditCard, Clock, Link as LinkIcon, FileText, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export default function AccountPage() {
  const { session } = useAuthStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!session) {
    return <div className="p-12 text-center">Please log in to view your account.</div>;
  }

  const { user } = session;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-4xl mx-auto relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg shadow-floating border border-secondary"
          >
            <span className="text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Account Settings</h1>
          <p className="text-on-surface-variant">Manage your profile, preferences, and security.</p>
        </div>
        <div className="px-3 py-1 bg-surface-container rounded-lg border border-outline-variant font-mono text-sm uppercase font-bold text-primary">
          {user.role}
        </div>
      </div>

      {/* Shared Section: Profile */}
      <section className="glass-1 rounded-xl border border-outline-variant overflow-hidden">
        <div className="p-4 border-b border-outline-variant bg-surface-container-lowest/50">
          <h2 className="font-headline font-bold text-lg text-on-surface">Profile Details</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface-variant">Full Name</label>
            <input type="text" defaultValue={user.name} className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface-variant">Email Address</label>
            <input type="email" defaultValue={user.email} className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-medium text-on-surface-variant">Mobile Number</label>
            <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full md:w-1/2 bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
          </div>
        </div>
      </section>

      {/* Shared Section: Location */}
      <section className="glass-1 rounded-xl border border-outline-variant overflow-hidden">
        <div className="p-4 border-b border-outline-variant bg-surface-container-lowest/50 flex justify-between items-center">
          <h2 className="font-headline font-bold text-lg text-on-surface">Location</h2>
          <button
            onClick={() => showToast('Location access requested')}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            <MapPin size={16} /> Use my current location
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-medium text-on-surface-variant">Street Address</label>
            <input type="text" defaultValue="123 Commerce Blvd, Suite 400" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface-variant">City</label>
            <input type="text" defaultValue="San Francisco" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
          </div>
          <div className="flex gap-6">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="text-sm font-medium text-on-surface-variant">State</label>
              <input type="text" defaultValue="CA" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label className="text-sm font-medium text-on-surface-variant">Postal Code</label>
              <input type="text" defaultValue="94105" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Shared Section: Settings */}
      <section className="glass-1 rounded-xl border border-outline-variant overflow-hidden">
        <div className="p-4 border-b border-outline-variant bg-surface-container-lowest/50">
          <h2 className="font-headline font-bold text-lg text-on-surface">Account Settings</h2>
        </div>
        <div className="p-6 flex flex-col gap-8">
          {/* Theme */}
          <div>
            <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2"><Shield size={16} /> Theme Preference</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="theme" defaultChecked className="text-primary focus:ring-primary" />
                <span className="text-sm text-on-surface-variant">System Default</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="theme" className="text-primary focus:ring-primary" />
                <span className="text-sm text-on-surface-variant">Daylight Grid (Light)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="theme" className="text-primary focus:ring-primary" />
                <span className="text-sm text-on-surface-variant">Obsidian Flux (Dark)</span>
              </label>
            </div>
          </div>

          <div className="w-full h-px bg-outline-variant/50"></div>

          {/* Notifications */}
          <div>
            <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2"><Bell size={16} /> Notification Preferences</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-outline-variant text-primary focus:ring-primary bg-surface-container" />
                <span className="text-sm text-on-surface-variant">Order updates and shipping statuses</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-outline-variant text-primary focus:ring-primary bg-surface-container" />
                <span className="text-sm text-on-surface-variant">Promotions and special offers</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary bg-surface-container" />
                <span className="text-sm text-on-surface-variant">Vendor announcements and platform news</span>
              </label>
            </div>
          </div>

          <div className="w-full h-px bg-outline-variant/50"></div>

          {/* Password */}
          <div>
            <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2"><Lock size={16} /> Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="password" placeholder="Current Password" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
              <input type="password" placeholder="New Password" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
              <button className="md:col-span-2 w-fit px-6 py-2 bg-surface-container-high border border-outline-variant text-on-surface rounded-lg font-medium text-sm hover:bg-surface-variant transition-colors">
                Update Password
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- ROLE SPECIFIC SECTIONS --- */}

      {user.role === 'customer' && (
        <section className="glass-1 rounded-xl border border-outline-variant overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-lowest/50">
            <h2 className="font-headline font-bold text-lg text-on-surface">Saved Addresses</h2>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="p-4 rounded-lg border border-outline-variant bg-surface-container flex justify-between items-start">
              <div>
                <div className="font-bold text-sm text-on-surface flex items-center gap-2">Home <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-mono uppercase tracking-wider">Default</span></div>
                <div className="text-sm text-on-surface-variant mt-1">123 Commerce Blvd, Suite 400<br/>San Francisco, CA 94105</div>
              </div>
              <div className="flex gap-3 text-sm">
                <button className="text-primary hover:underline font-medium">Edit</button>
                <button className="text-error hover:underline font-medium">Delete</button>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-outline-variant bg-surface-container flex justify-between items-start">
              <div>
                <div className="font-bold text-sm text-on-surface">Work</div>
                <div className="text-sm text-on-surface-variant mt-1">999 Market St, Floor 12<br/>San Francisco, CA 94103</div>
              </div>
              <div className="flex gap-3 text-sm">
                <button className="text-primary hover:underline font-medium">Edit</button>
                <button className="text-error hover:underline font-medium">Delete</button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between">
              <div className="text-sm text-on-surface-variant">Looking for your past purchases?</div>
              <Link to="/account/orders" className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
                <Package size={16} /> View Order History
              </Link>
            </div>
          </div>
        </section>
      )}

      {user.role === 'vendor' && (
        <section className="glass-1 rounded-xl border border-outline-variant overflow-hidden border-secondary/30">
          <div className="p-4 border-b border-outline-variant bg-surface-container-lowest/50 flex justify-between items-center">
            <h2 className="font-headline font-bold text-lg text-on-surface">Business Details</h2>
            <span className="text-[10px] uppercase font-bold font-mono tracking-wider px-2 py-1 rounded border bg-secondary/10 text-secondary border-secondary/20">Vendor Profile</span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-on-surface-variant">Store Name</label>
              <input type="text" defaultValue="Lumen Electronics" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-on-surface-variant">Tax / GST ID</label>
              <input type="text" defaultValue="XX-123456789" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface font-mono focus:border-primary focus:outline-none" />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2 mt-2">
              <label className="text-sm font-medium text-on-surface-variant flex items-center gap-2"><CreditCard size={14} /> Payout Bank Details</label>
              <div className="flex items-center justify-between p-3 rounded-lg border border-outline-variant bg-surface-container">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-surface-variant rounded border border-outline-variant flex items-center justify-center text-[8px] font-bold">BANK</div>
                  <span className="font-mono text-sm tracking-widest text-on-surface">•••• •••• •••• 4821</span>
                </div>
                <button
                  onClick={() => showToast('Payout update flow initiated')}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Update
                </button>
              </div>
            </div>

            <div className="w-full h-px bg-outline-variant/50 md:col-span-2 my-2"></div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-on-surface-variant">Support Email</label>
              <input type="email" defaultValue="support@lumenelec.com" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-on-surface-variant">Support Phone</label>
              <input type="tel" defaultValue="1-800-555-0199" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none" />
            </div>
          </div>
        </section>
      )}

      {user.role === 'admin' && (
        <section className="glass-1 rounded-xl border border-outline-variant overflow-hidden border-tertiary/30">
          <div className="p-4 border-b border-outline-variant bg-surface-container-lowest/50 flex justify-between items-center">
            <h2 className="font-headline font-bold text-lg text-on-surface">Platform Access</h2>
            <span className="text-[10px] uppercase font-bold font-mono tracking-wider px-2 py-1 rounded border bg-tertiary/10 text-tertiary border-tertiary/20">Admin Config</span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg border border-outline-variant bg-surface-container flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Admin Level</span>
              <span className="text-lg font-bold text-on-surface flex items-center gap-2"><Shield size={18} className="text-tertiary" /> Super Admin</span>
            </div>
            <div className="p-4 rounded-lg border border-outline-variant bg-surface-container flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Last Login</span>
              <span className="text-lg font-bold text-on-surface font-mono flex items-center gap-2"><Clock size={18} className="text-secondary" /> {new Date().toISOString().split('T')[0]} 08:42</span>
            </div>

            <div className="md:col-span-2 pt-2">
              <Link to="/admin/audit-log" className="flex items-center justify-between p-4 rounded-lg border border-outline-variant bg-surface-container hover:bg-surface-variant transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface border border-outline-variant flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                    <FileText size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-on-surface">Platform Audit Log</div>
                    <div className="text-xs text-on-surface-variant">View all administrative actions and security events.</div>
                  </div>
                </div>
                <LinkIcon size={16} className="text-on-surface-variant group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
