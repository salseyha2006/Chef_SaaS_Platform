import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../context/SubscriptionContext';
import { paymentService } from '../services/paymentService';
import { subscriptionService } from '../services/subscriptionService';
import { isMethodSupported, PAYMENT_METHODS } from '../config/paymentMethods';
import { useLockNavigation } from '../hooks/useLockNavigation';
import { formatPrice } from '../utils/format';
import { getErrorMessage } from '../utils/errors';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/ui/PrimaryButton';
import PaymentMethodRadio from '../components/payment/PaymentMethodRadio';
import PaymentProcessingOverlay from '../components/payment/PaymentProcessingOverlay';
import { AlertIcon } from '../components/ui/Icons';

const PAYMENT_ERROR_CODES = ['PAYMENT_FAILED', 'PAYMENT_RETRY_FAILED'];
const RESET_TX_CODES = ['PAYMENT_RETRY_NOT_ALLOWED', 'TRANSACTION_NOT_FOUND'];

function buildSummary(plan, tx, sub) {
  return {
    planName: plan.name,
    billingCycle: plan.billingCycle,
    amount: tx?.amount ?? plan.price,
    currency: tx?.currency || plan.currency,
    paidAt: tx?.createdAt || new Date().toISOString(),
    renewsOn: sub?.endDate || null,
    reference: tx?.id || null,
  };
}

export default function CheckoutPage() {
  const { t, i18n } = useTranslation('payment');
  const { t: ts } = useTranslation('subscription');
  const { planId } = useParams();
  const navigate = useNavigate();
  const { refresh } = useSubscription();

  const [plan, setPlan] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // loading | ready | notFound | error
  const [reloadKey, setReloadKey] = useState(0);
  const [saved, setSaved] = useState([]);
  const [selected, setSelected] = useState(null); // 'ABA_PAYWAY' | 'saved:<id>'
  const [selectError, setSelectError] = useState('');
  const [phase, setPhase] = useState('select'); // select | processing | failed
  const [failureMsg, setFailureMsg] = useState('');
  const [failedTxId, setFailedTxId] = useState(null); // មាន → Retry ជំនួស Upgrade ថ្មី
  const submitting = useRef(false);

  useLockNavigation(phase === 'processing');

  // ទាញ Plan (មិនមាន GET plan by id → រកក្នុង /subscription/plans) + Saved methods
  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    subscriptionService
      .getPlans()
      .then((plans) => {
        if (cancelled) return;
        const found = plans.find((p) => p.id === planId) || null;
        setPlan(found);
        setLoadState(found ? 'ready' : 'notFound');
      })
      .catch(() => { if (!cancelled) setLoadState('error'); });
    paymentService
      .getSavedMethods()
      .then((list) => { if (!cancelled) setSaved(list); })
      .catch(() => {}); // មិន Block Checkout
    return () => { cancelled = true; };
  }, [planId, reloadKey]);

  // Scenario 2: ជ្រើស Saved Default (ដែលគាំទ្រ) ជាមុន
  useEffect(() => {
    const def = saved.find((s) => s.isDefault && isMethodSupported(s.provider));
    if (def) setSelected((prev) => prev ?? `saved:${def.id}`);
  }, [saved]);

  const pick = (key) => {
    setSelected(key);
    setSelectError('');
  };

  const resolveSelection = () => {
    if (!selected) return null;
    if (selected.startsWith('saved:')) {
      const s = saved.find((x) => `saved:${x.id}` === selected);
      return s ? { paymentMethod: s.provider, savedPaymentMethodId: s.id } : null;
    }
    return { paymentMethod: selected };
  };

  const failureMessage = (err) => {
    if (PAYMENT_ERROR_CODES.includes(err.code)) {
      const key = `reasons.${err.params?.reason}`;
      return err.params?.reason && i18n.exists(`payment:${key}`) ? t(key) : t('processing.failedGeneric');
    }
    return getErrorMessage(err);
  };

  const pay = useCallback(async () => {
    const sel = resolveSelection();
    if (!sel) {
      setSelectError(t('select.required')); // Scenario 3
      return;
    }
    if (submitting.current || !plan) return;
    submitting.current = true;
    setSelectError('');
    setPhase('processing');

    try {
      let tx;
      let sub = null;
      if (failedTxId) {
        tx = await paymentService.retry(failedTxId, sel);
        sub = await subscriptionService.getMe().catch(() => null); // Retry មិនផ្តល់ Subscription
      } else {
        const res = await paymentService.upgrade({ planId: plan.id, ...sel });
        tx = res.transaction;
        sub = res.subscription;
      }
      await refresh(); // Badge/Gate ធ្វើបច្ចុប្បន្នភាព
      navigate('/payment/success', { replace: true, state: { summary: buildSummary(plan, tx, sub) } });
    } catch (err) {
      const txId = err.params?.transactionId || err.errors?.[0]?.transactionId;
      if (txId) setFailedTxId(txId);
      else if (RESET_TX_CODES.includes(err.code)) setFailedTxId(null);
      setFailureMsg(failureMessage(err));
      setPhase('failed');
    } finally {
      submitting.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, saved, plan, failedTxId, refresh, navigate, t]);

  const header = <PageHeader title={t('title')} backTo="/pricing" backLabel={t('back')} />;

  if (loadState === 'loading') {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        {header}
        <div className="mx-auto max-w-md space-y-4 px-5 pt-6" aria-busy="true">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (loadState !== 'ready') {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        {header}
        <main className="mx-auto max-w-md space-y-3 px-5 pt-6">
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{loadState === 'notFound' ? t('load.notFound') : t('load.error')}</span>
          </div>
          {loadState === 'error' && (
            <PrimaryButton variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>
              {t('load.retry')}
            </PrimaryButton>
          )}
          <Link to="/pricing" className="flex min-h-[48px] items-center justify-center text-[15px] font-semibold text-emerald-700">
            {t('load.choosePlan')}
          </Link>
        </main>
      </div>
    );
  }

  const amount = formatPrice(plan.price, plan.currency);
  const per = ts(`pricing.per.${plan.billingCycle}`, { defaultValue: '' });

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-40">
      {header}

      <main className="mx-auto max-w-md px-5 pt-6">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">{t('summary.title')}</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{t('summary.plan', { name: plan.name })}</p>
          <p className="text-[15px] text-slate-600">{amount}{per}</p>
        </section>

        <h2 className="mb-3 mt-7 text-base font-semibold text-slate-800">{t('select.title')}</h2>

        {saved.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-sm text-slate-500">{t('select.saved')}</p>
            <div className="space-y-3" role="radiogroup" aria-label={t('select.saved')}>
              {saved.map((s) => {
                const supported = isMethodSupported(s.provider);
                return (
                  <PaymentMethodRadio
                    key={s.id}
                    name="payment-method"
                    provider={s.provider}
                    title={`${s.brand || t(`methods.${s.provider}`)} •••• ${s.last4}`}
                    subtitle={t(`methods.${s.provider}`)}
                    badge={!supported ? t('select.soon') : s.isDefault ? t('select.default') : null}
                    disabled={!supported}
                    checked={selected === `saved:${s.id}`}
                    onSelect={() => pick(`saved:${s.id}`)}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div>
          {saved.length > 0 && <p className="mb-2 text-sm text-slate-500">{t('select.other')}</p>}
          <div className="space-y-3" role="radiogroup" aria-label={t('select.title')}>
            {PAYMENT_METHODS.map((m) => (
              <PaymentMethodRadio
                key={m.id}
                name="payment-method"
                provider={m.id}
                title={t(`methods.${m.id}`)}
                badge={m.supported ? null : t('select.soon')}
                disabled={!m.supported}
                checked={selected === m.id}
                onSelect={() => pick(m.id)}
              />
            ))}
          </div>
        </div>

        {selectError && (
          <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-red-600">
            <AlertIcon width={16} height={16} className="shrink-0" />
            {selectError}
          </p>
        )}
      </main>

      {/* Sticky Footer: មិនត្រូវលាក់ក្រោម Home Indicator */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-100 bg-white/95 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto max-w-md">
          <PrimaryButton onClick={pay}>{t('select.pay', { amount })}</PrimaryButton>
        </div>
      </div>

      {phase !== 'select' && (
        <PaymentProcessingOverlay
          status={phase === 'failed' ? 'failed' : 'processing'}
          message={failureMsg}
          onRetry={pay}
          onChangeMethod={() => { setPhase('select'); setFailureMsg(''); }}
        />
      )}
    </div>
  );
}