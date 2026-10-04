import { useEffect, useId } from 'react';
import PrimaryButton from './PrimaryButton';

/** ប្រើឡើងវិញ: Logout, Discard, Delete ក្រោយៗ */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape' && !loading) onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      onClick={() => !loading && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-card"
      >
        <h2 id={titleId} className="text-xl font-bold text-slate-900">{title}</h2>
        {message && <p className="mt-2 text-[15px] text-slate-500">{message}</p>}
        <div className="mt-6 space-y-3">
          <PrimaryButton variant={destructive ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </PrimaryButton>
          <PrimaryButton variant="secondary" disabled={loading} onClick={onCancel}>
            {cancelLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
