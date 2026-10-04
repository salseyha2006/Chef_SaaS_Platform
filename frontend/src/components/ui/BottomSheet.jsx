import { useEffect, useId } from 'react';

/** Modal ពីខាងក្រោម (Mobile) / កណ្តាល (sm+)។ locked=true → មិនបិទដោយ Backdrop/Esc */
export default function BottomSheet({ open, title, onClose, locked = false, children }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape' && !locked) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, locked, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4"
      onClick={() => !locked && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-card sm:rounded-3xl"
      >
        <h2 id={titleId} className="text-xl font-bold text-slate-900">{title}</h2>
        {children}
      </div>
    </div>
  );
}