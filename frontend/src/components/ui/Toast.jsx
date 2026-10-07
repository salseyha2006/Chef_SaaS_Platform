import { useEffect } from 'react';
import { CheckCircleIcon } from './Icons';

/** Non-blocking toast; onClose ត្រូវ stable (useCallback) */
export default function Toast({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return undefined;
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [message, duration, onClose]);

  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-[max(calc(var(--bottom-nav-h,0px)_+_1rem),1.5rem,env(safe-area-inset-bottom))] z-50 mx-auto flex w-fit max-w-[90%] items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm text-white shadow-card animate-pop"
    >
      <CheckCircleIcon width={18} height={18} className="shrink-0 text-emerald-400" />
      <span>{message}</span>
    </div>
  );
}
