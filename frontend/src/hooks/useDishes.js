import { useCallback, useEffect, useRef, useState } from 'react';
import { dishService } from '../services/dishService';
import { getErrorMessage } from '../utils/errors';

/** បញ្ជីមុខម្ហូប. ប្តូរ archived → រក្សាបញ្ជីចាស់ខណៈផ្ទុក */
export function useDishes({ archived = false } = {}) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const reqRef = useRef(0);

  const load = useCallback(async () => {
    const id = ++reqRef.current;
    try {
      const list = await dishService.getList({ archived });
      if (id !== reqRef.current) return;
      setItems(list);
      setError('');
      setStatus('ready');
    } catch (err) {
      if (id !== reqRef.current) return;
      setError(getErrorMessage(err));
      setStatus((s) => (s === 'ready' ? s : 'error'));
    }
  }, [archived]);

  useEffect(() => {
    load();
    return () => { reqRef.current += 1; };
  }, [load]);

  return { items, status, error, reload: load };
}