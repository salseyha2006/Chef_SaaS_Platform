import { useCallback, useEffect, useRef, useState } from 'react';
import { vendorPresetService } from '../services/vendorPresetService';
import { getErrorMessage } from '../utils/errors';

/** បញ្ជី Vendor Preset. reload() ត្រឡប់ Promise (ប្រើ await ក្រោយ Create/Update/Delete) */
export function useVendorPresets() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const reqRef = useRef(0);

  const load = useCallback(async () => {
    const id = ++reqRef.current;
    try {
      const list = await vendorPresetService.getList();
      if (id !== reqRef.current) return;
      setItems(list);
      setError('');
      setStatus('ready');
    } catch (err) {
      if (id !== reqRef.current) return;
      setError(getErrorMessage(err));
      setStatus((s) => (s === 'ready' ? s : 'error'));
    }
  }, []);

  useEffect(() => {
    load();
    return () => { reqRef.current += 1; };
  }, [load]);

  return { items, status, error, reload: load };
}
