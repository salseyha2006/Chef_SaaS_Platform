import { useEffect, useState } from 'react';

/** រាប់ថយក្រោយរហូតដល់ timestamp (ms)។ ត្រឡប់វិនាទីនៅសល់ (0 = ចប់) */
export function useCountdown(untilMs) {
  const calc = () => (untilMs ? Math.max(0, Math.ceil((untilMs - Date.now()) / 1000)) : 0);
  const [remaining, setRemaining] = useState(calc);

  useEffect(() => {
    setRemaining(calc());
    if (!untilMs) return undefined;
    const id = setInterval(() => {
      const r = calc();
      setRemaining(r);
      if (r === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [untilMs]);

  return remaining;
}

export const formatMMSS = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
