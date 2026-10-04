import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { billingService } from '../../services/billingService';
import { getErrorMessage } from '../../utils/errors';
import BottomSheet from '../ui/BottomSheet';
import PrimaryButton from '../ui/PrimaryButton';
import TextArea from '../ui/TextArea';
import { AlertIcon } from '../ui/Icons';

/** props: open, transaction, onClose, onDone(updatedTx, reason), onStale() (ករណី 409 → Reload) */
export default function RefundRequestSheet({ open, transaction, onClose, onDone, onStale }) {
  const { t } = useTranslation('billing');
  const [reason, setReason] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) { setReason(''); setFieldError(''); setError(''); }
  }, [open]);

  const submit = async () => {
    const v = reason.trim();
    if (!v) return setFieldError(t('refund.validation.required'));
    if (v.length < 5) return setFieldError(t('refund.validation.short'));

    setSubmitting(true);
    setError('');
    try {
      const updated = await billingService.requestRefund(transaction.id, v);
      onDone(updated, v);
    } catch (err) {
      setError(getErrorMessage(err));
      if (err.code === 'REFUND_ALREADY_REQUESTED') onStale?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet open={open} title={t('refund.title')} onClose={onClose} locked={submitting}>
      <p className="mt-1 text-[15px] text-slate-500">{t('refund.hint')}</p>

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
          <span>{error}</span>
        </div>
      )}

      <TextArea
        className="mt-4"
        label={t('refund.reason')}
        placeholder={t('refund.placeholder')}
        value={reason}
        error={fieldError}
        maxLength={500}
        onChange={(e) => { setReason(e.target.value); setFieldError(''); }}
      />

      <div className="mt-5 space-y-3">
        <PrimaryButton loading={submitting} onClick={submit}>{t('refund.submit')}</PrimaryButton>
        <PrimaryButton variant="secondary" disabled={submitting} onClick={onClose}>
          {t('refund.cancel')}
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}