import { useCallback, useEffect, useRef, useState } from 'react';
import { eventService } from '../services/eventService';
import { getErrorMessage } from '../utils/errors';

/**
 * Checklist ទិញទំនិញ (US-60): ទាញពី Server (Persisted — S5), Optimistic Toggle + Rollback
 * ត្រឡប់ { items, eventName, status ('loading'|'ready'|'error'|'notfound'), error, actionError, clearActionError,
 *          pending:Set<id>, justCompleted:number (កើនពេលឡើង 100% ក្រោយ Server បញ្ជាក់ — S4), toggle(id), reload() }
 * ទាញថ្មីស្ងាត់ៗពេល Tab ត្រឡប់មកមើលឃើញវិញ (Sync ឆ្លងឧបករណ៍) លុះត្រាតែមាន Toggle កំពុងបញ្ជូន
 */
export function useEventChecklist(eventId) {
  const [items, setItems] = useState([]);
  const [eventName, setEventName] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pending, setPending] = useState(() => new Set());
  const [justCompleted, setJustCompleted] = useState(0);

  const itemsRef = useRef([]);
  const pendingRef = useRef(new Set());
  const reqRef = useRef(0);

  const applyItems = (next) => {
    itemsRef.current = next;
    setItems(next);
  };

  const load = useCallback(async (silent = false) => {
    const id = ++reqRef.current;
    if (!silent) setStatus((s) => (s === 'ready' ? s : 'loading'));
    try {
      const list = await eventService.getShoppingList(eventId);
      if (id !== reqRef.current) return;
      if (silent && pendingRef.current.size > 0) return; // កុំជាន់ Optimistic State
      itemsRef.current = list.items;
      setItems(list.items);
      setEventName(list.eventName);
      setError('');
      setStatus('ready');
    } catch (err) {
      if (id !== reqRef.current || silent) return;
      if (err.code === 'EVENT_NOT_FOUND') return setStatus('notfound');
      setError(getErrorMessage(err));
      setStatus((s) => (s === 'ready' ? s : 'error'));
    }
  }, [eventId]);

  useEffect(() => {
    load();
    return () => { reqRef.current += 1; };
  }, [load]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') load(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const toggle = useCallback(async (chefIngredientId) => {
    if (pendingRef.current.has(chefIngredientId)) return; // ការពារចុចជាន់ខណៈកំពុងបញ្ជូន
    const current = itemsRef.current.find((i) => i.chefIngredientId === chefIngredientId);
    if (!current) return;

    const next = !current.isPurchased;
    const wasComplete = itemsRef.current.length > 0 && itemsRef.current.every((i) => i.isPurchased);

    pendingRef.current.add(chefIngredientId);
    setPending(new Set(pendingRef.current));
    setActionError('');

    const optimistic = itemsRef.current.map((i) => (i.chefIngredientId === chefIngredientId ? { ...i, isPurchased: next } : i));
    applyItems(optimistic);
    const becameComplete = next && !wasComplete && optimistic.every((i) => i.isPurchased);

    try {
      await eventService.setPurchased(eventId, chefIngredientId, next);
      if (becameComplete) setJustCompleted((c) => c + 1); // S4: បន្ទាប់ពី Server បញ្ជាក់
    } catch (err) {
      applyItems(
        itemsRef.current.map((i) => (i.chefIngredientId === chefIngredientId ? { ...i, isPurchased: !next } : i)),
      );
      setActionError(getErrorMessage(err));
    } finally {
      pendingRef.current.delete(chefIngredientId);
      setPending(new Set(pendingRef.current));
    }
  }, [eventId]);

  const clearActionError = useCallback(() => setActionError(''), []);
  const reload = useCallback(() => load(false), [load]);

  return { items, eventName, status, error, actionError, clearActionError, pending, justCompleted, toggle, reload };
}
