import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEventCost } from '../../hooks/useEventCost';
import { formatPrice } from '../../utils/format';
import { groupByCategory, OTHER_KEY, sortFlat } from '../../utils/shopping';
import TabSwitcher from '../ui/TabSwitcher';
import AggregatedListGroup from './AggregatedListGroup';
import ShoppingItemRow from './ShoppingItemRow';

/**
 * Tab "ការគណនាចំណាយ" (UX 11.5): ថវិកាសរុប + បញ្ជីគ្រឿងផ្សំបូករួម × ចំនួនតុ
 * props: eventId, tableCount, itemsKey (string ប្តូរពេល Dish/MenuSet/ចំនួនតុប្តូរ → ទាញថ្មី), onAddDishes()
 * Mount តែពេល Tab សកម្ម → ទាញថ្មីរាល់ពេលបើក (US-53 S3)
 */
export default function EventCostTab({ eventId, tableCount, itemsKey, onAddDishes }) {
  const { t } = useTranslation('events');
  const { data, categoryById, status, error, reload } = useEventCost(eventId, itemsKey);
  const [view, setView] = useState('grouped'); // grouped | flat
  const [closed, setClosed] = useState(() => new Set()); // key ក្រុមដែលបិទ (Default បើកទាំងអស់)

  const groups = useMemo(() => (data ? groupByCategory(data.items, categoryById) : []), [data, categoryById]);
  const flat = useMemo(() => (data ? sortFlat(data.items) : []), [data]);

  const toggleGroup = (key) =>
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-16">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-6 text-center shadow-card">
        <p className="text-slate-600">{error}</p>
        <button type="button" onClick={reload}
          className="mt-4 min-h-[44px] rounded-xl border border-slate-200 px-5 font-medium text-slate-800 active:bg-slate-100">
          {t('retry')}
        </button>
      </div>
    );
  }

  if (data.items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-card">
        <p className="text-slate-600">{t('cost.empty')}</p>
        <button type="button" onClick={onAddDishes}
          className="mt-5 min-h-[48px] rounded-xl bg-emerald-600 px-6 font-semibold text-white shadow-btn active:bg-emerald-800">
          {t('cost.emptyCta')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total Budget (US-53 S2) */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <p className="text-sm text-slate-500">{t('cost.grandTotal')}</p>
        <p className="text-3xl font-bold tabular-nums text-emerald-700" aria-live="polite">
          {formatPrice(data.grandTotal)}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {t('cost.summary', { count: data.items.length, tables: tableCount })}
        </p>
      </section>

      <TabSwitcher
        tabs={[
          { key: 'grouped', label: t('cost.view.grouped') },
          { key: 'flat', label: t('cost.view.flat') },
        ]}
        active={view}
        onChange={setView}
      />

      {view === 'grouped' ? (
        <div className="space-y-3">
          {groups.map((g) => (
            <AggregatedListGroup
              key={g.key}
              title={g.key === OTHER_KEY ? t('cost.other') : g.key}
              subtitle={t('cost.groupCount', { count: g.items.length })}
              total={formatPrice(g.total)}
              open={!closed.has(g.key)}
              onToggle={() => toggleGroup(g.key)}
            >
              {g.items.map((item) => <ShoppingItemRow key={item.chefIngredientId} item={item} />)}
            </AggregatedListGroup>
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
          {flat.map((item) => <ShoppingItemRow key={item.chefIngredientId} item={item} />)}
        </ul>
      )}

      <p className="px-1 text-center text-xs text-slate-400">{t('cost.note')}</p>
    </div>
  );
}
