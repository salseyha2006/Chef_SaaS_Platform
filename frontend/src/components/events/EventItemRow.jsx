import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BowlIcon, ReceiptIcon } from '../ui/Icons';
import { formatPrice } from '../../utils/format';

/**
 * ជួរ Dish/Menu Set ក្នុង Event (UX 11.4)
 * props: kind ('dish'|'menuSet'), to, name, imageUrl?, cost:number|null, archived:boolean, removeLabel, onRemove()
 */
export default function EventItemRow({ kind, to, name, imageUrl, cost, archived, removeLabel, onRemove }) {
  const { t } = useTranslation('events');
  const Fallback = kind === 'menuSet' ? ReceiptIcon : BowlIcon;
  return (
    <li className="flex items-center pr-1">
      <Link to={to} className="flex min-h-[64px] min-w-0 flex-1 items-center gap-3 py-2 pl-4 active:bg-slate-50">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-300">
          {imageUrl ? (
            <img src={imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <Fallback width={22} height={22} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-medium text-slate-800">{name}</span>
          <span className="block text-sm text-slate-500">
            {cost != null ? formatPrice(cost) : '—'}
            {archived && <span className="ml-2 text-amber-700">· {t('detail.archivedBadge')}</span>}
          </span>
        </span>
      </Link>
      <button type="button" onClick={onRemove} aria-label={removeLabel}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg text-slate-400 hover:bg-slate-100 hover:text-red-600 active:bg-slate-200">
        ✕
      </button>
    </li>
  );
}
