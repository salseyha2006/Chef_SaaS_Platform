import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../context/SubscriptionContext';
import { billingService } from '../services/billingService';
import { useLanguage } from '../hooks/useLanguage';
import { formatDateTime, formatPrice } from '../utils/format';
import { canDownloadInvoice, canRequestRefund, canRetryPayment, REFUND_TONE, TX_STATUS_TONE } from '../utils/billing';
import { getErrorMessage } from '../utils/errors';
import PageHeader from '../components/PageHeader';
import InfoRow from '../components/ui/InfoRow';
import PrimaryButton from '../components/ui/PrimaryButton';
import StatusBadge from '../components/ui/StatusBadge';
import Toast from '../components/ui/Toast';
import RefundRequestSheet from '../components/billing/RefundRequestSheet';
import RetryPaymentSheet from '../components/billing/RetryPaymentSheet';
import { AlertIcon, DownloadIcon } from '../components/ui/Icons';

export default function TransactionDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation('billing');
  const { t: tp } = useTranslation('payment');
  const { lang } = useLanguage();
  const { refresh: refreshSubscription } = useSubscription();

  const [tx, setTx] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | notFound | error
  const [banner, setBanner] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [retryOpen, setRetryOpen] = useState(false);
  const [toast, setToast] = useState('');
  const closeToast = useCallback(() => setToast(''), []);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setState('loading');
    try {
      setTx(await billingService.getTransaction(id));
      setState('ready');
    } catch (err) {
      if (!quiet) setState(err.code === 'TRANSACTION_NOT_FOUND' ? 'notFound' : 'error');
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const onDownload = async () => {
    setBanner('');
    setDownloading(true);
    try {
      const r = await billingService.downloadInvoice(tx);
      if (r === 'downloaded') setToast('downloaded');
    } catch (err) {
      setBanner(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  const onRefundDone = (updated, reason) => {
    setTx((p) => ({
      ...p,
      refundStatus: updated?.refundStatus || 'requested',
      refundReason: updated?.refundReason || reason,
    }));
    setRefundOpen(false);
    setToast('refundRequested');
  };

  const onRetrySuccess = async () => {
    await refreshSubscription(); // Badge/Gate ធ្វើបច្ចុប្បន្នភាព
    await load(true);
    setRetryOpen(false);
    setToast('paid');
  };

  const header = <PageHeader title={t('detail.title')} backTo="/billing" backLabel={t('back')} />;

  if (state === 'loading') {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        {header}
        <div className="mx-auto max-w-md space-y-4 px-5 pt-6" aria-busy="true">
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (state !== 'ready') {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        {header}
        <main className="mx-auto max-w-md space-y-3 px-5 pt-6">
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{state === 'notFound' ? t('detail.notFound') : t('detail.loadError')}</span>
          </div>
          {state === 'error' && (
            <PrimaryButton variant="secondary" onClick={() => load()}>{t('history.retry')}</PrimaryButton>
          )}
        </main>
      </div>
    );
  }

  const methodLabel = tx.provider ? tp(`methods.${tx.provider}`, { defaultValue: tx.provider }) : '—';

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-10">
      {header}

      <main className="mx-auto max-w-md px-5 pt-6">
        {banner && (
          <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{banner}</span>
          </div>
        )}

        <section className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-card">
          <p className="text-3xl font-bold tracking-tight text-slate-900">{formatPrice(tx.amount, tx.currency)}</p>
          {tx.status && (
            <StatusBadge className="mt-3" tone={TX_STATUS_TONE[tx.status] || 'neutral'}>
              {t(`status.${tx.status}`, { defaultValue: tx.status })}
            </StatusBadge>
          )}
        </section>

        <dl className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white px-5 shadow-card">
          <InfoRow label={t('detail.plan')} value={tx.planName || '—'} />
          <InfoRow label={t('detail.method')} value={methodLabel} />
          <InfoRow label={t('detail.id')} value={tx.id} breakAll />
          <InfoRow label={t('detail.date')} value={formatDateTime(tx.createdAt, lang)} />
          {tx.invoiceNumber && <InfoRow label={t('detail.invoiceNo')} value={tx.invoiceNumber} breakAll />}
        </dl>

        {tx.refundStatus && (
          <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <StatusBadge tone={REFUND_TONE[tx.refundStatus] || 'neutral'}>
              {t(`refundStatus.${tx.refundStatus}`, { defaultValue: tx.refundStatus })}
            </StatusBadge>
            <p className="mt-2 text-[15px] text-slate-600">
              {t(`detail.refundNote.${tx.refundStatus}`, { defaultValue: '' })}
            </p>
            {tx.refundReason && (
              <p className="mt-2 break-words text-sm text-slate-500">
                {t('detail.refundReason')}: {tx.refundReason}
              </p>
            )}
          </section>
        )}

        <div className="mt-6 space-y-3">
          {canDownloadInvoice(tx) && (
            <PrimaryButton loading={downloading} onClick={onDownload}>
              <DownloadIcon width={20} height={20} />
              {t('detail.download')}
            </PrimaryButton>
          )}

          {canRetryPayment(tx) && (
            <PrimaryButton onClick={() => setRetryOpen(true)}>{t('detail.retry')}</PrimaryButton>
          )}

          {canRequestRefund(tx) && (
            <button
              type="button"
              onClick={() => setRefundOpen(true)}
              className="flex min-h-[48px] w-full items-center justify-center text-[15px] font-semibold text-emerald-700"
            >
              {t('detail.requestRefund')}
            </button>
          )}

          <Link to="/billing" className="sr-only">{t('history.title')}</Link>
        </div>
      </main>

      <RefundRequestSheet
        open={refundOpen}
        transaction={tx}
        onClose={() => setRefundOpen(false)}
        onDone={onRefundDone}
        onStale={() => load(true)}
      />
      <RetryPaymentSheet
        open={retryOpen}
        transaction={tx}
        onClose={() => setRetryOpen(false)}
        onSuccess={onRetrySuccess}
      />

      <Toast message={toast ? t(`toast.${toast}`) : ''} onClose={closeToast} />
    </div>
  );
}