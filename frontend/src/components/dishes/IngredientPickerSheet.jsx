import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStock } from '../../hooks/useStock';
import { useActiveCategories } from '../../hooks/useActiveCategories';
import { normalizeName } from '../../utils/catalog';
import { formatPrice } from '../../utils/format';
import PageHeader from '../PageHeader';
import AuthInput from '../ui/AuthInput';
import PrimaryButton from '../ui/PrimaryButton';
import StickyFooter from '../ui/StickyFooter';
import NestedFilterChips from '../ingredients/NestedFilterChips';
import { SearchIcon } from '../ui/Icons';

/**
 * Picker ពេញអេក្រង់ ជ្រើសពី Stock (Multi-select). Mount តែពេលបើក → State Reset ស្វ័យប្រវត្តិ
 * props: existingIds: Set<string> (បានបន្ថែមរួច → checked+disabled), onClose(), onConfirm(items: StockItem[])
 */
export default function IngredientPickerSheet({ existingIds, onClose, onConfirm }) {
  const { t } = useTranslation('dishes');
  const { categories } = useActiveCategories();
  const [filter, setFilter] = useState({ parentId: null, subId: null });
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(() => new Map()); // id → StockItem
  const { items, status, error, reload } = useStock(filter.subId ?? filter.parentId ?? undefined);

  const chips = useMemo(
    () => categories.map((c) => ({ id: c.id, name: c.name, children: c.children || [] })),
    [categories],
  );

  const visible = useMemo(() => {
    const q = normalizeName(query);
    return items
      .filter((i) => !q || normalizeName(i.name).includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, 'km'));
  }, [items, query]);

  const filtering = Boolean(filter.parentId || query.trim());

  const toggle = (item) =>
    setPicked((prev) => {
      const next = new Map(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.set(item.id, item);
      return next;
    });

  return (
    <div role="dialog" aria-modal="true" aria-label={t('picker.title')}
      className="fixed inset-0 z-40 overflow-y-auto bg-slate-50 pb-32">
      <PageHeader title={t('picker.title')} onBack={onClose} backLabel={t('back')} />

      <main className="mx-auto max-w-md space-y-4 px-5 pt-5">
        {chips.length > 0 && <NestedFilterChips items={chips} value={filter} onChange={setFilter} />}

        <AuthInput type="search" icon={SearchIcon} placeholder={t('picker.searchPlaceholder')}
          value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />

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

        {/* Stock ទទេ → CTA ទៅ Browse Presets (UX 9.3 Edge case) */}
        {status === 'ready' && items.length === 0 && !filtering && (
          <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-card">
            <p className="text-slate-600">{t('picker.empty')}</p>
            <Link to="/ingredients/browse"
              className="mt-5 inline-flex h-12 items-center rounded-xl bg-emerald-600 px-6 font-semibold text-white shadow-btn active:bg-emerald-800">
              {t('picker.emptyCta')}
            </Link>
          </div>
        )}

        {status === 'ready' && visible.length === 0 && (items.length > 0 || filtering) && (
          <p className="py-10 text-center text-slate-500">{t('picker.noMatch')}</p>
        )}

        {status === 'ready' && visible.length > 0 && (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
            {visible.map((item) => {
              const already = existingIds.has(item.id);
              const checked = already || picked.has(item.id);
              const unit = item.unit?.abbreviation || item.unit?.name;
              return (
                <li key={item.id}>
                  <label className={`flex min-h-[64px] items-center gap-3 px-4 py-2 ${already ? 'opacity-60' : 'cursor-pointer active:bg-slate-50'}`}>
                    <input type="checkbox" checked={checked} disabled={already} onChange={() => toggle(item)}
                      className="h-5 w-5 shrink-0 rounded border-slate-300 accent-emerald-600" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-medium text-slate-800">{item.name}</span>
                      <span className="block truncate text-sm text-slate-500">
                        {already ? t('picker.alreadyAdded') : item.category}
                      </span>
                    </span>
                    <span className="shrink-0 text-right text-sm text-slate-700">
                      {formatPrice(item.purchasePrice)}
                      {unit && <span className="block text-xs text-slate-500">/ {unit}</span>}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <StickyFooter>
        <div className="flex items-center gap-4">
          <p className="shrink-0 text-[15px] font-medium text-slate-700">
            {t('picker.selected', { count: picked.size })}
          </p>
          <PrimaryButton disabled={picked.size === 0} onClick={() => onConfirm([...picked.values()])}>
            {t('picker.add')}
          </PrimaryButton>
        </div>
      </StickyFooter>
    </div>
  );
}
