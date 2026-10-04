/** Checkbox + label (touch target ≥44px) */
export default function Checkbox({ checked, onChange, children, className = '', ...rest }) {
  return (
    <label className={`flex min-h-[44px] cursor-pointer items-start gap-3 py-1 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 accent-emerald-600"
        {...rest}
      />
      <span className="text-[15px] text-slate-600">{children}</span>
    </label>
  );
}