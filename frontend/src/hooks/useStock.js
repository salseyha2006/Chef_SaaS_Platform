import { useCallback, useEffect, useRef, useState } from 'react';
import { ingredientService } from '../services/ingredientService';
import { getErrorMessage } from '../utils/errors';

/** ស្តុកគ្រឿងផ្សំ (Filter តាម categoryId ពី Server). ប្តូរ Filter → រក្សាបញ្ជីចាស់ខណៈផ្ទុក */
export function useStock(categoryId) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const reqRef = useRef(0);

  const load = useCallback(async () => {
    const id = ++reqRef.current;
    try {
      const list = await ingredientService.getStock(categoryId);
      if (id !== reqRef.current) return;
      setItems(list);
      setError('');
      setStatus('ready');
    } catch (err) {
      if (id !== reqRef.current) return;
      setError(getErrorMessage(err));
      setStatus((s) => (s === 'ready' ? s : 'error'));
    }
  }, [categoryId]);

  useEffect(() => {
    load();
    return () => { reqRef.current += 1; };
  }, [load]);

  return { items, status, error, reload: load };
}