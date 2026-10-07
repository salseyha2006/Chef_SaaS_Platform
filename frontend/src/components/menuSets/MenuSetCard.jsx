import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRightIcon } from '../ui/Icons';
import { formatPrice } from '../../utils/format';

/**
 * ជួរកញ្ចប់ម៉ឺនុយ (UX 10.1): ឈ្មោះ + ចំនួនមុខម្ហូប (បើដឹង) | ថ្លៃដើមសរុប | ›
 * props: menuSet (UI MenuSet ពី toMenuSet). ត្រឡប់ <li> (Page ជា Wrapper <ul>)
 */
export default function MenuSetCard({ menuSet }) {
  const { t } = useTranslation('menuSets');
  const cost = menuSet.totalCost != null ? formatPrice(menuSet.totalCost) : t('list.noCost');
  return (
    <li>
      <Link to={`/menu-sets/${encodeURIComponent(menuSet.id)}`}
        className="flex min-h-[64px] items-center gap-3 px-4 py-2 active:bg-slate-50">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-medium text-slate-800">{menuSet.name}</span>
          {menuSet.dishCount != null && (
            <span className="block truncate text-sm text-slate-500">
              {t('list.dishCount', { count: menuSet.dishCount })}
            </span>
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
