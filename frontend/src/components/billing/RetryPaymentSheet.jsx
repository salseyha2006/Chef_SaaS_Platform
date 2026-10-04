import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { paymentService } from '../../services/paymentService';
import { useLockNavigation } from '../../hooks/useLockNavigation';
import { formatPrice } from '../../utils/format';
import { getPaymentFailureMessage } from '../../utils/paymentErrors';
import BottomSheet from '../ui/BottomSheet';
import PrimaryButton from '../ui/PrimaryButton';
import PaymentMethodPicker, { pickDefaultKey, resolveMethodSelection } from '../payment/PaymentMethodPicker';
import PaymentProcessingOverlay from '../payment/PaymentProcessingOverlay';

/** props: open, transaction (failed), onClose, onSuccess() → Promise (ប្រើ Reload + បិទ Sheet) */
export default function RetryPaymentSheet({ open, transaction, onClose, onSuccess }) {
  const { t } = useTranslation('billing');
  const { t: tp } = useTranslation('payment');
  const [saved, setSaved] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectError, setSelectError] = useState('');
  const [phase, setPhase] = useState('select'); // select | processing | failed
  const [failureMsg, setFailureMsg] = useState('');
  const submitting = useRef(false);

  useLockNavigation(open && phase === 'processing');

  useEffect(() => {
    if (!open) return undefined;
    setPhase('select');
    setSelectError('');
    setFailureMsg('');
    let cancelled = false;
    paymentService
      .getSavedMethods()
      .then((list) => {
        if (cancelled) return;
        setSaved(list);
        setSelected(pickDefaultKey(list));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [open]);

  const pay = async () => {
    const sel = resolveMethodSelection(selected, saved);
    if (!sel) {
      setSelectError(tp('select.required'));
      return;
    }
    if (submitting.current) return;
    submitting.current = true;
    setSelectError('');
    setPhase('processing');
    try {
      await paymentService.retry(transaction.id, sel);
      await onSuccess();
    } catch (err) {
      setFailureMsg(getPaymentFailureMessage(err));
      setPhase('failed');
    } finally {
      submitting.current = false;
    }
  };

  const amount = formatPrice(transaction?.amount, transaction?.currency);

  return (
    <>
      <BottomSheet open={open} title={t('retrySheet.title')} onClose={onClose}>
        <p className="mt-1 mb-5 text-[15px] text-slate-500">{t('retrySheet.hint')}</p>
        <PaymentMethodPicker saved={saved} selected={selected} error={selectError}
          onSelect={(k) => { setSelected(k); setSelectError(''); }} />
        <div className="mt-6">
          <PrimaryButton onClick={pay}>{t('retrySheet.pay', { amount })}</PrimaryButton>
        </div>
      </BottomSheet>

      {open && phase !== 'select' && (
        <PaymentProcessingOverlay
          status={phase === 'failed' ? 'failed' : 'processing'}
          message={failureMsg}
          onRetry={pay}
          onChangeMethod={() => { setPhase('select'); setFailureMsg(''); }}
        />
      )}
    </>
  );
}