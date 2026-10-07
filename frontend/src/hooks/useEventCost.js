import { useCallback, useEffect, useRef, useState } from 'react';
import { eventService } from '../services/eventService';
import { ingredientService } from '../services/ingredientService';
import { getErrorMessage } from '../utils/errors';

/**
 * ទាញ Cost Calculation + Stock (សម្រាប់ Category). Stock បរាជ័យ → មិនបង្អាក់ (categoryById ទទេ → "ផ្សេងៗ")
 * dep: ប្តូរ → ទាញថ្មី (US-53 S3). ទាញថ្មីរាល់ពេល Mount (Tab បើកម្តងទៀត)
 * ត្រឡប់ { data, categoryById: Map<chefIngredientId, category>, status, error, reload }
 */
export function useEventCost(eventId, dep) {
  const [data, setData] = useState(null);
  const [categoryById, setCategoryById] = useState(() => new Map());
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const reqRef = useRef(0);

  const load = useCallback(async () => {
    const id = ++reqRef.current;
    setStatus((s) => (s === 'ready' ? s : 'loading'));
    try {
      const [cost, stock] = await Promise.all([
        eventService.getCost(eventId),
        ingredientService.getStock().catch(() => []),
      ]);
      if (id !== reqRef.current) return;
      setData(cost);
      setCategoryById(new Map(stock.map((s) => [s.id, s.category])));
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

  return { data, categoryById, status, error, reload: load };
}
