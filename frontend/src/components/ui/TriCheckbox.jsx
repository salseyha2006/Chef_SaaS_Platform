import { useEffect, useRef } from 'react';

/** Checkbox 3 ស្ថានភាព (checked / indeterminate / unchecked). onChange(nextChecked) */
export default function TriCheckbox({ checked, indeterminate = false, disabled = false, onChange, label }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      aria-label={label}
      onChange={(e) => onChange?.(e.target.checked)}
      className="h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 accent-emerald-600 disabled:cursor-default"
    />
  );
}