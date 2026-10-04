/** Tab ផ្ដេក (ប្រើឡើងវិញ: Epic 7, 10, 11). tabs: [{ key, label }] */
export default function TabSwitcher({ tabs, active, onChange, className = '' }) {
  return (
    <div role="tablist" className={`grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-slate-100 p-1 ${className}`}>
      {tabs.map((tab) => {
        const selected = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.key)}
            className={`min-h-[44px] rounded-lg px-3 text-[15px] font-semibold transition ${
              selected ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}