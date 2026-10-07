import { useTranslation } from 'react-i18next';
import AuthInput from '../ui/AuthInput';

/**
 * ជួរកែបរិមាណក្នុង Quick Edit (UX 11.7)
 * props: line { id, name, unit, quantity }, error?: string, onChange(quantity), onRemove()
 */
export default function ReportLineRow({ line, error, onChange, onRemove }) {
  const { t } = useTranslation('events');
  return (
    <li id={`line-${line.id}`} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 truncate text-base font-semibold text-slate-900">{line.name}</p>
        <button type="button" onClick={onRemove} aria-label={t('report.removeAria', { name: line.name })}
          className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg text-slate-400 hover:bg-slate-100 hover:text-red-600 active:bg-slate-200">
          ✕
        </button>
      </div>
      <div className="mt-3 flex items-start gap-3">
        <AuthInput
          className="flex-1"
          inputMode="decimal"
          placeholder="0"
          aria-label={t('report.quantity')}
          value={line.quantity}
          error={error}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="flex h-[52px] shrink-0 items-center text-base text-slate-600">{line.unit}</span>
      </div>
    </li>
  );
}
