import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import AuthLayout from '../components/AuthLayout';
import PrimaryButton from '../components/ui/PrimaryButton';
import { ShieldCheckIcon } from '../components/ui/Icons';

/** Graceful Lockout: រូបរាងរួសរាយ (មិនមែន Error ក្រហម) */
export default function SubscriptionExpiredPage() {
  const { t } = useTranslation('subscription');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { status, state, enterViewOnly } = useSubscription();
  const [loggingOut, setLoggingOut] = useState(false);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
      </div>
    );
  }
  // មិនទាន់ផុតកំណត់ (ឬទាញមិនបាន) → មិនត្រូវនៅទីនេះ
  if (!state?.isLocked) return <Navigate to="/" replace />;

  const onLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const onViewOnly = () => {
    enterViewOnly();
    navigate('/', { replace: true });
  };

  return (
    <AuthLayout
      title={t('expired.title')}
      subtitle={t('expired.description')}
      icon={<ShieldCheckIcon width={28} height={28} />}
      footer={
        <button
          type="button"
          disabled={loggingOut}
          onClick={onLogout}
          className="min-h-[44px] px-4 text-[15px] font-medium text-slate-500 underline-offset-2 hover:underline disabled:opacity-50"
        >
          {t('expired.logout')}
        </button>
      }
    >
      <p className="mt-4 text-[15px] text-slate-600">{t('expired.hint')}</p>
      <div className="mt-6 space-y-3">
        <PrimaryButton onClick={() => navigate('/pricing')}>{t('expired.choose')}</PrimaryButton>
        <PrimaryButton variant="secondary" onClick={onViewOnly}>{t('expired.viewOnly')}</PrimaryButton>
      </div>
    </AuthLayout>
  );
}