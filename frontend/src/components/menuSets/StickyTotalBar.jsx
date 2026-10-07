import { useEffect, useRef, useState } from 'react';
import StickyFooter from '../ui/StickyFooter';
import { formatPrice } from '../../utils/format';

/**
 * Sticky Footer បង្ហាញថ្លៃសរុប + Pulse ខ្លី ពេលលេខប្តូរ (US-49 S1–S3)
 * props: label, total:number, note?, children (ប៊ូតុង Save)
 * Animation = CSS transition ស្រាល; បិទតាម prefers-reduced-motion
 */
export default function StickyTotalBar({ label, total, note, children }) {
  const cents = Math.round(total * 100);
  const prev = useRef(cents);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (prev.current === cents) return undefined;
    prev.current = cents;
    setPulse(true);
    const timer = setTimeout(() => setPulse(false), 450);
    return () => clearTimeout(timer);
  }, [cents]);

  return (
    <StickyFooter>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[15px] text-slate-600">{label}</span>
        <span
          aria-live="polite"
          className={`inline-block origin-right text-xl font-bold tabular-nums transition duration-300 motion-reduce:transform-none motion-reduce:transition-none ${
            pulse ? 'scale-110 text-amber-600' : 'text-emerald-700'
          }`}
        >
          {formatPrice(total)}
        </span>
      </div>
      {children}
      {note && <p className="mt-1.5 text-center text-xs text-slate-400">{note}</p>}
    </StickyFooter>
  );
}
