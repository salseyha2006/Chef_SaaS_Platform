import { useTranslation } from 'react-i18next';
import { BowlIcon, PlusIcon } from '../ui/Icons';
import { formatPrice } from '../../utils/format';

/**
 * ជួរ Dish ក្នុង Tab "បញ្ជីទាំងអស់" (UX 10.2)
 * props: dish (UI Dish ពី toDish), added:boolean, onAdd()
 * added → "✓ បានបន្ថែម" (ចុចមិនបាន — US-45 S3 ការពារស្ទួន)
 */
export default function DishPickRow({ dish, added, onAdd }) {
  const { t } = useTranslation('menuSets');
  return (
    <li className="flex min-h-[64px] items-center gap-3 px-4 py-2">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-300">
        {dish.imageUrl ? (
          <img src={dish.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <BowlIcon width={22} height={22} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-medium text-slate-800">{dish.name}</span>
        <span className="block text-sm text-slate-500">
          {dish.totalCost != null ? formatPrice(dish.totalCost) : t('list.noCost')}
        </span>
      </span>
      {added ? (
        <span className="flex min-h-[44px] shrink-0 items-center px-2 text-sm font-semibold text-emerald-700">
          {t('form.added')}
        </span>
      ) : (
        <button type="button" onClick={onAdd} aria-label={t('form.addAria', { name: dish.name })}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-btn transition active:scale-95 active:bg-emerald-800">
          <PlusIcon width={20} height={20} />
        </button>
      )}
    </li>
  );
}
