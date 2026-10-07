import { useCallback, useEffect, useRef, useState } from 'react';
import { eventService } from '../services/eventService';
import { getErrorMessage } from '../utils/errors';

/** បញ្ជី Event ទាំងអស់ (Filter នៅ Page) */
export function useEvents() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const reqRef = useRef(0);

  const load = useCallback(async () => {
    const id = ++reqRef.current;
    try {
      const list = await eventService.getList();
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
