const Glyph = ({ children }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const GLYPHS = {
  list: (
    <Glyph><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></Glyph>
  ),
  grid: (
    <Glyph>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </Glyph>
  ),
};

/**
 * ប៊ូតុងប្តូរ List ⇄ Grid
 * props: value ('list'|'grid'), onChange(value), labels: { list, grid, group }
 */
export default function ViewToggle({ value, onChange, labels, className = '' }) {
  return (
    <div role="group" aria-label={labels.group}
      className={`flex items-center rounded-xl bg-slate-100 p-0.5 ${className}`}>
      {['list', 'grid'].map((key) => {
        const active = value === key;
        return (
          <button key={key} type="button" aria-pressed={active} aria-label={labels[key]}
            onClick={() => onChange(key)}
            className={`flex h-11 w-11 items-center justify-center rounded-[10px] transition ${
              active ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {GLYPHS[key]}
          </button>
        );
      })}
    </div>
  );
}