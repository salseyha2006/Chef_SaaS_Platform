import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '../ui/Icons';
import { formatPrice } from '../../utils/format';

/** ជួរស្តុក (8.3): ឈ្មោះ + ប្រភេទ | តម្លៃ / ខ្នាត | › */
export default function StockListRow({ item }) {
  const unit = item.unit?.abbreviation || item.unit?.name;
  return (
    <li>
      <Link to={`/ingredients/${encodeURIComponent(item.id)}`}
        className="flex min-h-[64px] items-center gap-3 px-4 py-2 active:bg-slate-50">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-medium text-slate-800">{item.name}</span>
          {item.category && <span className="block truncate text-sm text-slate-500">{item.category}</span>}
        </span>
        <span className="shrink-0 text-right font-semibold text-slate-900">
          {formatPrice(item.purchasePrice)}
          {unit && <span className="block text-xs font-normal text-slate-500">/ {unit}</span>}
        </span>
        <ChevronRightIcon className="shrink-0 text-slate-400" />
      </Link>
    </li>
  );
}