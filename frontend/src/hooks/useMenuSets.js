import { useCallback, useEffect, useRef, useState } from 'react';
import { menuSetService } from '../services/menuSetService';
import { getErrorMessage } from '../utils/errors';

/** បញ្ជីកញ្ចប់ម៉ឺនុយ. ប្តូរ archived → រក្សាបញ្ជីចាស់ខណៈផ្ទុក */
export function useMenuSets({ archived = false } = {}) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const reqRef = useRef(0);

  const load = useCallback(async () => {
    const id = ++reqRef.current;
    try {
      const list = await menuSetService.getList({ archived });
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
