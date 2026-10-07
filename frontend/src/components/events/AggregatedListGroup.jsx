import { useId } from 'react';

/**
 * ក្រុម Collapsible (Parent Header + Children) — UX 11.5/11.7 (Read-only)
 * props: title, subtitle?, total (string ដែលបានទ្រង់ទ្រាយ), open:boolean, onToggle(), children
 * Touch target Header ≥ 52px; ចុចទាំង Header = Toggle
 */
export default function AggregatedListGroup({ title, subtitle, total, open, onToggle, children }) {
  const panelId = useId();
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={panelId}
        className="flex min-h-[56px] w-full items-center gap-3 bg-slate-50 px-4 py-2 text-left active:bg-slate-100">
        <span aria-hidden="true"
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>▶</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-bold text-slate-900">{title}</span>
          {subtitle && <span className="block text-xs text-slate-500">{subtitle}</span>}
        </span>
        <span className="shrink-0 text-base font-bold tabular-nums text-emerald-700">{total}</span>
      </button>
      {open && <ul id={panelId} className="divide-y divide-slate-100">{children}</ul>}
    </section>
  );
}
