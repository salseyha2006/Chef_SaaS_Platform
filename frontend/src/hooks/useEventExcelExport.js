import { useCallback, useState } from 'react';
import { eventService } from '../services/eventService';
import { getErrorMessage } from '../utils/errors';

/**
 * លំហូរ Export Excel (US-59): request() → ពិនិត្យទិន្នន័យ (S3) → Modal បញ្ជាក់ → confirm() → ទាញយក
 * hasData: Event មាន Dish/Menu Set ឬអត់ (ដឹងពី Caller) — false → toast 'noData' (មិនបង្កើតឯកសារទទេ)
 * ត្រឡប់ { request, confirm, cancel, confirmOpen, busy, toast, error, closeToast }
 */
export function useEventExcelExport(eventId, hasData) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(''); // exported | noData
  const [error, setError] = useState('');

  const request = useCallback(() => {
    setError('');
    if (!hasData) {
      setToast('noData');
      return;
    }
    setConfirmOpen(true);
  }, [hasData]);

  const confirm = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const result = await eventService.downloadReportExcel(eventId);
      setConfirmOpen(false);
      if (result === 'downloaded') setToast('exported');
    } catch (err) {
      setConfirmOpen(false);
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [eventId]);

  const cancel = useCallback(() => setConfirmOpen(false), []);
  const closeToast = useCallback(() => {
    setToast('');
    setError('');
  }, []);

  return { request, confirm, cancel, confirmOpen, busy, toast, error, closeToast };
}
