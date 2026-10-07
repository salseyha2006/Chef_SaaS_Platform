import { useCallback, useEffect, useRef, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { eventService } from '../services/eventService';
import { getErrorMessage } from '../utils/errors';

/**
 * ទាញ Dashboard + បញ្ជី Event ទាំងអស់ស្របគ្នា
 * events: Event[] | null — បរាជ័យ → null (កាល "Event ខែនេះ" បង្ហាញ "—", Empty State មិនបែងចែក)
 * ត្រឡប់ { data, events, status, error, reload }
 */
export function useDashboard() {
  const [data, setData] = useState(null);
  const [events, setEvents] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const reqRef = useRef(0);

  const load = useCallback(async () => {
    const id = ++reqRef.current;
    try {
      const [dash, list] = await Promise.all([
        dashboardService.get(),
        eventService.getList().catch(() => null),
      ]);
      if (id !== reqRef.current) return;
      setData(dash);
      setEvents(list);
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

  return { data, events, status, error, reload: load };
}
