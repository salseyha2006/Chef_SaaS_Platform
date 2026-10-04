const TONES = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
};

/** Pill ស្ថានភាព។ props: tone (success|info|warning|danger|neutral) */
export default function StatusBadge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium ring-1 ring-inset ${
        TONES[tone] || TONES.neutral
      } ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}