/**
 * កាតស្ថិតិសង្ខេប (UX 11.1)
 * props: label, value (string), hint?, tone ('default'|'money')
 */
export default function SummaryStatCard({ label, value, hint, tone = 'default' }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 truncate text-2xl font-bold tabular-nums ${tone === 'money' ? 'text-emerald-700' : 'text-slate-900'}`}>
        {value}
      </p>
      {hint && <p className="mt-0.5 truncate text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
