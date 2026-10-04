import { useCallback, useEffect, useRef, useState } from 'react';
import { ingredientService } from '../services/ingredientService';
import { getErrorMessage } from '../utils/errors';

/** ផ្ទុក Preset Tree (US-32 S3: reload() ក្រោយ Import ដើម្បី Sync ភ្លាម) */
export function useIngredientPresets() {
  const [groups, setGroups] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const reqRef = useRef(0);

  const reload = useCallback(async () => {
    const id = ++reqRef.current;
    try {
      const tree = await ingredientService.getPresets();
      if (id !== reqRef.current) return;
      setGroups(tree);
      setError('');
      setStatus('ready');
    } catch (err) {
      if (id !== reqRef.current) return;
      setError(getErrorMessage(err));
      setStatus((s) => (s === 'ready' ? s : 'error'));
    }
  }, []);

  useEffect(() => {
    reload();
    return () => { reqRef.current += 1; };
  }, [reload]);

  return { groups, status, error, reload };
}