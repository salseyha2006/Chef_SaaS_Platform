import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { formatDate, formatPrice } from '../utils/format';
import PrimaryButton from '../components/ui/PrimaryButton';
import { CheckCircleIcon } from '../components/ui/Icons';

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-[15px] text-slate-500">{label}</dt>
      <dd className="break-all text-right text-[15px] font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

export default function PaymentSuccessPage() {
  const { t } = useTranslation('payment');
  const { t: ts } = useTranslation('subscription');
  const { lang } = useLanguage();
  const { state } = useLocation();
  const navigate = useNavigate();

  const s = state?.summary;
  if (!s) return <Navigate to="/subscription" replace />; // Refresh ទំព័រ → State បាត់

  const per = ts(`pricing.per.${s.billingCycle}`, { defaultValue: '' });

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-emerald-50 via-slate-50 to-slate-50 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="text-center">
          <span className="mx-auto flex h-20 w-20 animate-pop items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircleIcon width={44} height={44} />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">{t('success.title')}</h1>
        </div>

        <dl className="mt-8 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white px-5 shadow-card">
          <Row label={t('success.plan')} value={s.planName} />
          <Row label={t('success.amount')} value={`${formatPrice(s.amount, s.currency)}${per}`} />
          <Row label={t('success.paidAt')} value={formatDate(s.paidAt, lang)} />
          {s.renewsOn && <Row label={t('success.renewsOn')} value={formatDate(s.renewsOn, lang)} />}
          {s.reference && <Row label={t('success.reference')} value={s.reference} />}
        </dl>

        <p className="mt-4 text-center text-sm text-slate-500">{t('success.emailNote')}</p>
      </main>

      <div className="mx-auto w-full max-w-md pt-6">
        <PrimaryButton onClick={() => navigate('/', { replace: true })}>{t('success.home')}</PrimaryButton>
      </div>
    </div>
  );
}