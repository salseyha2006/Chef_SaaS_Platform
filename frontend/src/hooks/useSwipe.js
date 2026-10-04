import { useRef } from 'react';

/** Swipe ផ្ដេក (touch + mouse) ដោយ Pointer Events។ ប្រើជាមួយ style touchAction: 'pan-y' */
export function useSwipe({ onLeft, onRight, threshold = 50 }) {
  const start = useRef(null);
  return {
    onPointerDown: (e) => { start.current = { x: e.clientX, y: e.clientY }; },
    onPointerUp: (e) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      (dx < 0 ? onLeft : onRight)?.();
    },
    onPointerCancel: () => { start.current = null; },
  };
}
