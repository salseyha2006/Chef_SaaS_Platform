import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />
    </div>
  );
}

/** ត្រូវ Login: បើមិនទាន់ → /login (ចងចាំទីតាំងដើម) */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <FullScreenSpinner />;
  if (status === 'guest') return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

/** សម្រាប់ Guest តែប៉ុណ្ណោះ (Login/Register): បើ Login រួច → ទំព័រដើម */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  if (status === 'loading') return <FullScreenSpinner />;
  if (status === 'authenticated') return <Navigate to="/" replace />;
  return <Outlet />;
}