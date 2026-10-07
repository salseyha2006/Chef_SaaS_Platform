/**
 * Progress Bar (UX 12.1). props: value (0–100), label (aria-label)
 * ១០០% → បៃតងចាស់. Transition បិទពេល prefers-reduced-motion
 */
export default function ProgressBar({ value, label }) {
  const v = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} aria-label={label}
      className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none ${
          v === 100 ? 'bg-emerald-600' : 'bg-emerald-500'
        }`}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
