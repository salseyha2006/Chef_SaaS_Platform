import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
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

/**
 * US-10: ក្រោយ Login /auth/login មិនផ្តល់ hasCompletedOnboarding (Gap #8)
 * → ហៅ /auth/me ម្តង។ false → /onboarding។ បរាជ័យ → មិនរារាំង User
 */
export function OnboardingGate() {
  const { chef, refreshMe } = useAuth();
  const [checking, setChecking] = useState(chef?.hasCompletedOnboarding === undefined);

  useEffect(() => {
    if (!checking) return undefined;
    let cancelled = false;
    refreshMe()
      .catch(() => {})
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) return <FullScreenSpinner />;
  if (chef?.hasCompletedOnboarding === false) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

/**
 * US-17 Scenario 1: Expired → បង្ហាញទំព័រ Lockout រួសរាយ
 * Scenario 2: User ជ្រើស "មើលទិន្នន័យ (View-only)" → ឆ្លងបាន (Backend ទប់ស្កាត់ Action សរសេរ)
 */
export function SubscriptionGate() {
  const { status, state, viewOnly } = useSubscription();
  if (status === 'idle' || status === 'loading') return <FullScreenSpinner />;
  if (state?.isLocked && !viewOnly) return <Navigate to="/subscription-expired" replace />;
  return <Outlet />;
}