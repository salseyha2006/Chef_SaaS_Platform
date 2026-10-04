import { useId } from 'react';

export default function TextArea({ label, error, rows = 4, className = '', ...rest }) {
  const id = useId();
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-[15px] font-medium text-slate-700">{label}</label>
      )}
      <textarea
        id={id}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:ring-4 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-emerald-100'
        }`}
        {...rest}
      />
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}