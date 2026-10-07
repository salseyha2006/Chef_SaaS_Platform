import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { dishService } from '../../services/dishService';
import { menuSetService } from '../../services/menuSetService';
import { getErrorMessage } from '../../utils/errors';
import { normalizeName } from '../../utils/catalog';
import { formatPrice } from '../../utils/format';
import PageHeader from '../PageHeader';
import AuthInput from '../ui/AuthInput';
import PrimaryButton from '../ui/PrimaryButton';
import StickyFooter from '../ui/StickyFooter';
import TabSwitcher from '../ui/TabSwitcher';
import { SearchIcon } from '../ui/Icons';

/**
 * Picker ពេញអេក្រង់: Tab "មុខម្ហូប" | "កញ្ចប់ម៉ឺនុយ" (Multi-select). Mount តែពេលបើក → State Reset ស្វ័យប្រវត្តិ
 * props: existingDishIds: Set<string>, existingMenuSetIds: Set<string> (មានរួច → checked+disabled — US-52 S3),
 *        onClose(), onConfirm({ dishIds, menuSetIds })
 */
export default function EventItemPickerSheet({ existingDishIds, existingMenuSetIds, onClose, onConfirm }) {
  const { t } = useTranslation('events');
  const [tab, setTab] = useState('dishes'); // dishes | menuSets
  const [query, setQuery] = useState('');
  const [data, setData] = useState({ dishes: [], menuSets: [] });
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [pickedDishes, setPickedDishes] = useState(() => new Set());
  const [pickedSets, setPickedSets] = useState(() => new Set());

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [dishes, menuSets] = await Promise.all([dishService.getList(), menuSetService.getList()]);
      setData({ dishes, menuSets });
      setStatus('ready');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const isDishes = tab === 'dishes';
  const existing = isDishes ? existingDishIds : existingMenuSetIds;
  const picked = isDishes ? pickedDishes : pickedSets;
  const setPicked = isDishes ? setPickedDishes : setPickedSets;
  const source = isDishes ? data.dishes : data.menuSets;

  const visible = useMemo(() => {
    const q = normalizeName(query);
    return source.filter((x) => !q || normalizeName(x.name).includes(q));
  }, [source, query]);

  const toggle = (itemId) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });

  const count = pickedDishes.size + pickedSets.size;

  return (
    <div role="dialog" aria-modal="true" aria-label={t('picker.title')}
      className="fixed inset-0 z-40 overflow-y-auto bg-slate-50 pb-32">
      <PageHeader title={t('picker.title')} onBack={onClose} backLabel={t('back')} />

      <main className="mx-auto max-w-md space-y-4 px-5 pt-5">
        <TabSwitcher
          tabs={[
            { key: 'dishes', label: t('picker.tabs.dishes') },
            { key: 'menuSets', label: t('picker.tabs.menuSets') },
          ]}
          active={tab}
          onChange={(k) => { setTab(k); setQuery(''); }}
        />

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
            <button type="button" onClick={load}
              className="mt-4 min-h-[44px] rounded-xl border border-slate-200 px-5 font-medium text-slate-800 active:bg-slate-100">
              {t('retry')}
            </button>
          </div>
        )}

        {status === 'ready' && source.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-card">
            <p className="text-slate-600">{isDishes ? t('picker.emptyDishes') : t('picker.emptyMenuSets')}</p>
            <Link to={isDishes ? '/dishes/new' : '/menu-sets/new'}
              className="mt-5 inline-flex h-12 items-center rounded-xl bg-emerald-600 px-6 font-semibold text-white shadow-btn active:bg-emerald-800">
              {isDishes ? t('picker.emptyDishesCta') : t('picker.emptyMenuSetsCta')}
            </Link>
          </div>
        )}

        {status === 'ready' && source.length > 0 && visible.length === 0 && (
          <p className="py-10 text-center text-slate-500">{t('picker.noMatch')}</p>
        )}

        {status === 'ready' && visible.length > 0 && (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
            {visible.map((item) => {
              const already = existing.has(item.id);
              const checked = already || picked.has(item.id);
              return (
                <li key={item.id}>
                  <label className={`flex min-h-[64px] items-center gap-3 px-4 py-2 ${already ? 'opacity-60' : 'cursor-pointer active:bg-slate-50'}`}>
                    <input type="checkbox" checked={checked} disabled={already} onChange={() => toggle(item.id)}
                      className="h-5 w-5 shrink-0 rounded border-slate-300 accent-emerald-600" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-medium text-slate-800">{item.name}</span>
                      {already && <span className="block text-sm text-slate-500">{t('picker.alreadyAdded')}</span>}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-slate-700">
                      {item.totalCost != null ? formatPrice(item.totalCost) : '—'}
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
          <p className="shrink-0 text-[15px] font-medium text-slate-700">{t('picker.selected', { count })}</p>
          <PrimaryButton
            disabled={count === 0}
            onClick={() => onConfirm({ dishIds: [...pickedDishes], menuSetIds: [...pickedSets] })}
          >
            {t('picker.add')}
          </PrimaryButton>
        </div>
      </StickyFooter>
    </div>
  );
}
