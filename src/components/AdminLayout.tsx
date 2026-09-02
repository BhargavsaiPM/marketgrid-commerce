import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AdminLayout() {
  const { session } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session || session.user.role !== 'admin') {
      alert('Access denied: You must be an admin to access this portal.');
      navigate('/');
    }
  }, [session, navigate]);

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="w-full">
      <Outlet />
    </div>
  );
}
