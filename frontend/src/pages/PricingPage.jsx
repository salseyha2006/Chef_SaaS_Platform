import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../context/SubscriptionContext';
import { subscriptionService } from '../services/subscriptionService';
import { getErrorMessage } from '../utils/errors';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/ui/PrimaryButton';
import BillingCycleToggle from '../components/subscription/BillingCycleToggle';
import PlanCard from '../components/subscription/PlanCard';
import { AlertIcon } from '../components/ui/Icons';

export default function PricingPage() {
  const { t } = useTranslation('subscription');
  const navigate = useNavigate();
  const location = useLocation();
  const { subscription, state } = useSubscription();

  // កញ្ចប់ដែលកំពុងប្រើ (Paid ដែលមិនទាន់ផុត) → បិទប៊ូតុង
  const currentPlan = state && !state.isLocked && !state.isTrial ? subscription?.plan : null;

  const [cycle, setCycle] = useState(currentPlan?.billingCycle === 'yearly' ? 'yearly' : 'monthly');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPlans(await subscriptionService.getPlans()); // Backend តម្រៀប recommended↓ price↑
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => plans.filter((p) => p.billingCycle === cycle), [plans, cycle]);

  const goBack = () => (location.key === 'default' ? navigate('/', { replace: true }) : navigate(-1));
  const onSelect = (plan) => navigate(`/checkout/${plan.id}`); // Epic 5

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <PageHeader title={t('pricing.title')} onBack={goBack} backLabel={t('back')} />

      <main className="mx-auto max-w-md px-5 pt-6">
        <p className="text-[15px] text-slate-500">{t('pricing.subtitle')}</p>
        <BillingCycleToggle className="mt-5" value={cycle} onChange={setCycle} />

        {error && (
          <div className="mt-6 space-y-3">
            <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
              <span>{error}</span>
            </div>
            <PrimaryButton variant="secondary" onClick={load}>{t('pricing.retry')}</PrimaryButton>
          </div>
        )}

        {loading && (
          <div className="mt-8 space-y-6" aria-busy="true">
            {[0, 1].map((i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-100" />)}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-8 space-y-6">
            {visible.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-500">
                {t('pricing.empty')}
              </p>
            ) : (
              visible.map((plan) => (
                <PlanCard key={plan.id} plan={plan} isCurrent={currentPlan?.id === plan.id} onSelect={onSelect} />
              ))
            )}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">{t('pricing.footerNote')}</p>
      </main>
    </div>
  );
}