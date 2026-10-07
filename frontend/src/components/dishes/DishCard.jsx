import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BowlIcon, ChevronRightIcon } from '../ui/Icons';
import { formatPrice } from '../../utils/format';

/**
 * Dish ក្នុង List/Grid (UX 9.1)
 * props: dish (UI Dish ពី toDish), view ('list' | 'grid')
 * List: ឈ្មោះ + Tag | ថ្លៃដើមសរុប | ›   ·   Grid: រូបភាព + ឈ្មោះ + ថ្លៃដើម
 */
export default function DishCard({ dish, view }) {
  const { t } = useTranslation('dishes');
  const cost = dish.totalCost != null ? formatPrice(dish.totalCost) : t('list.noCost');
  const to = `/dishes/${encodeURIComponent(dish.id)}`;

  if (view === 'grid') {
    return (
      <Link to={to}
        className="block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition active:bg-slate-50">
        <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-slate-300">
          {dish.imageUrl ? (
            <img src={dish.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <BowlIcon width={36} height={36} />
          )}
        </div>
        <div className="p-3">
          <p className="line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug text-slate-900">
            {dish.name}
          </p>
          <p className="mt-1 text-sm font-semibold text-emerald-700">{cost}</p>
        </div>
      </Link>
    );
  }

  return (
    <li>
      <Link to={to} className="flex min-h-[64px] items-center gap-3 px-4 py-2 active:bg-slate-50">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-medium text-slate-800">{dish.name}</span>
          {dish.tags.length > 0 && (
            <span className="block truncate text-sm text-slate-500">{dish.tags.join(' · ')}</span>
          )}
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-semibold text-slate-900">{cost}</span>
          <span className="block text-xs text-slate-500">{t('list.totalCost')}</span>
        </span>
        <ChevronRightIcon className="shrink-0 text-slate-400" />
      </Link>
    </li>
  );
}
