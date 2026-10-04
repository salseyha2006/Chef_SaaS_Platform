import { useId } from 'react';

const CREATE = '__create__';

/**
 * <select> ទូទៅ + Option "＋ បង្កើតថ្មី" ចុងបញ្ជី (US-26/28)
 * options: [{ value, label }]; onCreate() បើក Sheet បង្កើត
 */
export default function CreatableSelect({
  label, value, options, placeholder, createLabel, error, onChange, onCreate,
}) {
  const id = useId();
  return (
    <div>
      {label && <label htmlFor={id} className="mb-1.5 block text-[15px] font-medium text-slate-700">{label}</label>}
      <select
        id={id}
        value={value}
        aria-invalid={!!error}
        onChange={(e) => (e.target.value === CREATE ? onCreate() : onChange(e.target.value))}
        className={`h-[52px] w-full rounded-xl border bg-white px-3 text-base text-slate-900 outline-none transition focus:ring-4 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-emerald-100'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        <option value={CREATE}>＋ {createLabel}</option>
      </select>
      {error && <p role="alert" className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}