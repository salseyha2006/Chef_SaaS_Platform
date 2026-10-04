import { useTranslation } from 'react-i18next';
import AuthInput from '../ui/AuthInput';
import UnitSelect from '../catalog/UnitSelect';
import { formatDecimal } from '../../utils/number';

/** ជួរកំណត់តម្លៃ + ខ្នាត (8.2). rows: { [id]: {price, unitId} }, errors: { [id]: {price, unit} } */
export default function PricingList({ items, rows, errors, units, onChange, onCreateUnit }) {
  const { t } = useTranslation('ingredients');
  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const row = rows[item.id] || { price: '', unitId: '' };
        const err = errors[item.id] || {};
        return (
          <li key={item.id} id={`row-${item.id}`} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
            <p className="mb-3 truncate text-base font-semibold text-slate-900">{item.name}</p>
            <div className="grid grid-cols-2 gap-3">
              <AuthInput
                label={t('pricing.price')}
                inputMode="decimal"
                placeholder={t('pricing.pricePlaceholder')}
                value={row.price}
                error={err.price}
                onChange={(e) => onChange(item.id, { price: e.target.value })}
                onBlur={() => onChange(item.id, { price: formatDecimal(row.price) })}
              />
              <UnitSelect
                label={t('pricing.unit')}
                placeholder={t('pricing.unitPlaceholder')}
                value={row.unitId}
                units={units}
                error={err.unit}
                onChange={(unitId) => onChange(item.id, { unitId })}
                onCreate={() => onCreateUnit(item.id)}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}