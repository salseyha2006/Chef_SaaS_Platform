import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/format';
import { formatQuantity, unitLabel } from '../../utils/shopping';

/**
 * ជួរគ្រឿងផ្សំ (UX 11.5 Level 3): ឈ្មោះ + (ក្នុង 1 តុ) | បរិមាណសរុប | តម្លៃប៉ាន់ស្មាន
 * props: item (UI ShoppingItem ពី toShoppingItem). ត្រឡប់ <li>
 */
export default function ShoppingItemRow({ item }) {
  const { t } = useTranslation('events');
  const unit = unitLabel(item.unit);
  return (
    <li className="flex min-h-[60px] items-center gap-3 px-4 py-2.5">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-slate-800">{item.ingredientName}</span>
        <span className="block text-xs text-slate-500">
          {t('cost.perTable', { qty: formatQuantity(item.quantityPerTable), unit })}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-[15px] font-semibold tabular-nums text-slate-900">
          {formatQuantity(item.totalQuantity)} {unit}
        </span>
        <span className="block text-sm tabular-nums text-slate-500">{formatPrice(item.totalPrice)}</span>
      </span>
    </li>
  );
}
