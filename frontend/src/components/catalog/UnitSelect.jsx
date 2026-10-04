import { useId } from 'react';
import { useTranslation } from 'react-i18next';

const CREATE = '__create__';

/** ជ្រើសខ្នាត + Option "＋ បង្កើតខ្នាតថ្មី" (US-26/US-33 S3). onCreate() បើក UnitFormSheet */
export default function UnitSelect({ label, value, units, error, placeholder, onChange, onCreate }) {
  const id = useId();
  const { t } = useTranslation('catalog');
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
        {units.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}{u.abbreviation && u.abbreviation !== u.name ? ` (${u.abbreviation})` : ''}
          </option>
        ))}
        <option value={CREATE}>＋ {t('add.units')}</option>
      </select>
      {error && <p role="alert" className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}