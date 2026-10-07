import { useTranslation } from 'react-i18next';
import { BowlIcon } from '../ui/Icons';
import { formatPrice } from '../../utils/format';

const btn =
  'flex h-11 w-11 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:text-slate-300 disabled:hover:bg-transparent';

/**
 * ជួរ Dish ក្នុងកញ្ចប់ + ប៊ូតុង ▲ ▼ ✕ (ជំនួស Drag/Swipe — មិនដំឡើង Library)
 * props: dish { dishId, name, imageUrl, cost }, index, count, onMove(delta: -1|1), onRemove()
 */
export default function SelectedDishRow({ dish, index, count, onMove, onRemove }) {
  const { t } = useTranslation('menuSets');
  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="w-5 shrink-0 text-center text-sm font-medium text-slate-400">{index + 1}</span>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-300">
          {dish.imageUrl ? (
            <img src={dish.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <BowlIcon width={22} height={22} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-medium text-slate-800">{dish.name}</span>
          <span className="block text-sm text-slate-500">{formatPrice(dish.cost)}</span>
        </span>
      </div>
      <div className="mt-1 flex justify-end gap-1">
        <button type="button" className={btn} disabled={index === 0} onClick={() => onMove(-1)}
          aria-label={t('form.moveUp', { name: dish.name })}>▲</button>
        <button type="button" className={btn} disabled={index === count - 1} onClick={() => onMove(1)}
          aria-label={t('form.moveDown', { name: dish.name })}>▼</button>
        <button type="button" className={`${btn} hover:text-red-600`} onClick={onRemove}
          aria-label={t('form.removeAria', { name: dish.name })}>✕</button>
      </div>
    </li>
  );
}
