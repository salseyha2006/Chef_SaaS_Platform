import { useTranslation } from 'react-i18next';
import AuthInput from '../ui/AuthInput';
import { formatPrice } from '../../utils/format';
import { lineCost } from '../../utils/dish';

/**
 * ជួរគ្រឿងផ្សំក្នុង Form Dish (UX 9.2)
 * props: line { chefIngredientId, name, unit, unitPrice, quantity }, error, onChange(quantity), onRemove()
 */
export default function DishIngredientRow({ line, error, onChange, onRemove }) {
  const { t } = useTranslation('dishes');
  const cost = lineCost(line);
  return (
    <li id={`line-${line.chefIngredientId}`} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-900">{line.name}</p>
          <p className="text-sm text-slate-500">{formatPrice(line.unitPrice)} / {line.unit}</p>
        </div>
        <button type="button" onClick={onRemove} aria-label={t('form.removeIngredient', { name: line.name })}
          className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg text-slate-400 hover:bg-slate-100 hover:text-red-600 active:bg-slate-200">
          ✕
        </button>
      </div>
      <div className="mt-3 flex items-start gap-3">
        <AuthInput
          className="flex-1"
          inputMode="decimal"
          placeholder="0"
          aria-label={t('form.quantity')}
          value={line.quantity}
          error={error}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="flex h-[52px] shrink-0 items-center text-base text-slate-600">{line.unit}</span>
      </div>
      {cost > 0 && <p className="mt-2 text-right text-sm text-slate-500">= {formatPrice(cost)}</p>}
    </li>
  );
}
