import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function VendorPortalLayout() {
  const { session } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session || session.user.role !== 'vendor') {
      // Very simple alert "toast" as requested
      alert('Access denied: You must be a vendor to access the portal.');
      navigate('/');
    }
  }, [session, navigate]);

  if (!session || session.user.role !== 'vendor') {
    return null;
  }

  return (
    <div className="w-full">
      <Outlet />
    </div>
  );
}
