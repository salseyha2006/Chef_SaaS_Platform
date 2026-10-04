import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../context/SubscriptionContext';
import { useLanguage } from '../hooks/useLanguage';
import { formatDate, formatPrice } from '../utils/format';
import { getErrorMessage } from '../utils/errors';
import PageHeader from '../components/PageHeader';
import ConfirmModal from '../components/ui/ConfirmModal';
import PrimaryButton from '../components/ui/PrimaryButton';
import StatusBadge from '../components/ui/StatusBadge';
import Toast from '../components/ui/Toast';
import { AlertIcon } from '../components/ui/Icons';

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-[15px] text-slate-500">{label}</dt>
      <dd className="text-right text-[15px] font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

export default function SubscriptionPage() {
  const { t } = useTranslation('subscription');
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const { subscription, state, status, cancel, resume, refresh } = useSubscription();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const closeToast = useCallback(() => setToast(''), []);

  const header = <PageHeader title={t('manage.title')} backTo="/profile" backLabel={t('back')} />;

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        {header}
        <div className="flex justify-center pt-24">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        {header}
        <main className="mx-auto max-w-md space-y-3 px-5 pt-6">
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{t('manage.loadError')}</span>
          </div>
          <PrimaryButton variant="secondary" onClick={refresh}>{t('pricing.retry')}</PrimaryButton>
        </main>
      </div>
    );
  }

  const { kind } = state;
  const plan = subscription?.plan;
  const endDate = formatDate(state.endDate, lang);
  const planName = kind === 'trial' ? t('manage.trialPlan') : plan?.name || t('manage.noPlan');
  const dateLabel = kind === 'paid' ? t('manage.nextRenewal') : t('manage.endsOn');

  const run = async (action, toastKey) => {
    setBusy(true);
    setError('');
    try {
      await action();
      setToast(toastKey);
    } catch (err) {
      setError(getErrorMessage(err));
      if (err.code === 'SUBSCRIPTION_EXPIRED_CANNOT_RESUME') refresh();
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-10">
      {header}

      <main className="mx-auto max-w-md px-5 pt-6">
        {error && (
          <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{error}</span>
          </div>
        )}

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-slate-500">{t('manage.currentPlan')}</p>
              <h2 className="break-words text-xl font-bold text-slate-900">{planName}</h2>
              {kind !== 'trial' && plan && (
                <p className="text-[15px] text-slate-500">
                  {formatPrice(plan.price, plan.currency)} {t(`pricing.per.${plan.billingCycle}`, { defaultValue: '' })}
                </p>
              )}
            </div>
            <StatusBadge tone={state.tone}>{t(`manage.status.${kind}`)}</StatusBadge>
          </div>

          <dl className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
            {endDate && <InfoRow label={dateLabel} value={endDate} />}
            {kind !== 'expired' && kind !== 'none' && (
              <InfoRow label={t('manage.daysLeft')} value={t('manage.daysValue', { days: state.daysRemaining })} />
            )}
          </dl>
        </section>

        {kind === 'trial' && <p className="mt-4 text-[15px] text-slate-500">{t('manage.trialNote')}</p>}
        {kind === 'canceled' && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-[15px] text-amber-900">
            {t('manage.canceledNote', { date: endDate })}
          </p>
        )}

        <div className="mt-6 space-y-3">
          {(kind === 'trial' || kind === 'expired' || kind === 'none') && (
            <PrimaryButton onClick={() => navigate('/pricing')}>{t('manage.choosePlan')}</PrimaryButton>
          )}

          {kind === 'canceled' && (
            <PrimaryButton loading={busy} onClick={() => run(resume, 'resumed')}>
              {t('manage.resume')}
            </PrimaryButton>
          )}

          {kind === 'paid' && (
            <PrimaryButton variant="secondary" className="!text-red-600" onClick={() => setConfirmOpen(true)}>
              {t('manage.cancelAuto')}
            </PrimaryButton>
          )}

          {(kind === 'paid' || kind === 'canceled') && (
            <Link to="/pricing" className="flex min-h-[48px] items-center justify-center text-[15px] font-semibold text-emerald-700">
              {t('manage.changePlan')}
            </Link>
          )}
        </div>
      </main>

      <ConfirmModal
        open={confirmOpen}
        destructive
        loading={busy}
        title={t('cancel.title')}
        message={t('cancel.message', { date: endDate })}
        confirmLabel={t('cancel.confirm')}
        cancelLabel={t('cancel.keep')}
        onConfirm={() => run(cancel, 'canceled')}
        onCancel={() => setConfirmOpen(false)}
      />

      <Toast message={toast ? t(`toast.${toast}`) : ''} onClose={closeToast} />
    </div>
  );
}