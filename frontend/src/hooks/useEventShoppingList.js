import { useCallback, useEffect, useRef, useState } from 'react';
import { eventService } from '../services/eventService';
import { getErrorMessage } from '../utils/errors';

/** ទាញ Shopping List ពេល Mount និងពេល dep ប្តូរ (Dish/MenuSet/ចំនួនតុ). ត្រឡប់ { data, status, error, reload } */
export function useEventShoppingList(eventId, dep) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const reqRef = useRef(0);

  const load = useCallback(async () => {
    const id = ++reqRef.current;
    setStatus((s) => (s === 'ready' ? s : 'loading'));
    try {
      const list = await eventService.getShoppingList(eventId);
      if (id !== reqRef.current) return;
      setData(list);
      setError('');
      setStatus('ready');
    } catch (err) {
      if (id !== reqRef.current) return;
      setError(getErrorMessage(err));
      setStatus((s) => (s === 'ready' ? s : 'error'));
    }
  }, [eventId]);

  useEffect(() => {
    load();
    return () => { reqRef.current += 1; };
  }, [load, dep]);

  return { data, status, error, reload: load };
}
