import { useCallback, useState } from 'react';
import { safeStorage } from '../utils/storage';

const KEY = 'chef.dishView';
const VIEWS = ['list', 'grid'];

/** US-44 S2: ចងចាំ View Mode ចុងក្រោយ (Per Device) */
export function useDishView() {
  const [view, setViewState] = useState(() => {
    const v = safeStorage.get(KEY);
    return VIEWS.includes(v) ? v : 'list';
  });

  const setView = useCallback((v) => {
    if (!VIEWS.includes(v)) return;
    setViewState(v);
    safeStorage.set(KEY, v);
  }, []);

  return [view, setView];
}
