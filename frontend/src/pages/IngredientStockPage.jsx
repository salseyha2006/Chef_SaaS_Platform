import { useCallback, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStock } from '../hooks/useStock';
import { useActiveCategories } from '../hooks/useActiveCategories';
import { normalizeName } from '../utils/catalog';
import PageHeader from '../components/PageHeader';
import AuthInput from '../components/ui/AuthInput';
import Toast from '../components/ui/Toast';
import NestedFilterChips from '../components/ingredients/NestedFilterChips';
import StockListRow from '../components/ingredients/StockListRow';
import { BasketIcon, PlusIcon, SearchIcon } from '../components/ui/Icons';

const SORTS = {
  name: (a, b) => a.name.localeCompare(b.name, 'km'),
  priceAsc: (a, b) => a.purchasePrice - b.purchasePrice,
  priceDesc: (a, b) => b.purchasePrice - a.purchasePrice,
};

export default function IngredientStockPage() {
  const { t } = useTranslation('ingredients');
  const location = useLocation();
  const { categories } = useActiveCategories();

  const [filter, setFilter] = useState({ parentId: null, subId: null });
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('name');
  const { items, status, error, reload } = useStock(filter.subId ?? filter.parentId ?? undefined);

  const [toast, setToast] = useState(location.state?.toast || '');
  const closeToast = useCallback(() => setToast(''), []);

  const chips = useMemo(
    () => categories.map((c) => ({ id: c.id, name: c.name, children: c.children || [] })),
    [categories],
  );

  const visible = useMemo(() => {
    const q = normalizeName(query);
    return items.filter((i) => !q || normalizeName(i.name).includes(q)).sort(SORTS[sort]);
  }, [items, query, sort]);

  const filtering = Boolean(filter.parentId || query.trim());

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-28">
      <PageHeader title={t('stock.title')} backTo="/" backLabel={t('back')} />

      <main className="mx-auto max-w-md space-y-4 px-5 pt-5">
        {chips.length > 0 && <NestedFilterChips items={chips} value={filter} onChange={setFilter} />}

        <AuthInput
          type="search"
          icon={SearchIcon}
          placeholder={t('stock.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />

        <div className="flex items-center justify-between gap-3">
          <label htmlFor="sort" className="text-sm text-slate-500">{t('stock.sort.label')}</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-[15px] text-slate-800 outline-none focus:border-emerald-600"
          >
            {Object.keys(SORTS).map((k) => <option key={k} value={k}>{t(`stock.sort.${k}`)}</option>)}
          </select>
        </div>

        {status === 'loading' && (
          <div className="flex justify-center py-16">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-red-100 bg-white p-6 text-center shadow-card">
            <p className="text-slate-600">{error}</p>
            <button type="button" onClick={reload}
              className="mt-4 min-h-[44px] rounded-xl border border-slate-200 px-5 font-medium text-slate-800 active:bg-slate-100">
              {t('retry')}
            </button>
          </div>
        )}

        {status === 'ready' && items.length === 0 && !filtering && (
          <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-card">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <BasketIcon width={28} height={28} />
            </span>
            <p className="mt-4 text-slate-600">{t('stock.empty')}</p>
            <Link to="/ingredients/browse"
              className="mt-5 inline-flex h-12 items-center rounded-xl bg-emerald-600 px-6 font-semibold text-white shadow-btn active:bg-emerald-800">
              {t('stock.emptyCta')}
            </Link>
          </div>
        )}

        {status === 'ready' && visible.length === 0 && (items.length > 0 || filtering) && (
          <p className="py-10 text-center text-slate-500">{t('stock.noMatch')}</p>
        )}

        {status === 'ready' && visible.length > 0 && (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
            {visible.map((item) => <StockListRow key={item.id} item={item} />)}
          </ul>
        )}
      </main>

      <Link
        to="/ingredients/browse"
        aria-label={t('stock.add')}
        className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-btn active:bg-emerald-800"
      >
        <PlusIcon width={26} height={26} />
      </Link>

      <Toast message={toast ? t(`toast.${toast}`) : ''} onClose={closeToast} />
    </div>
  );
}