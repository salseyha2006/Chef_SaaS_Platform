import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/format';
import { groupByCategory, OTHER_KEY, sortFlat } from '../../utils/shopping';
import TabSwitcher from '../ui/TabSwitcher';
import AggregatedListGroup from './AggregatedListGroup';
import ShoppingItemRow from './ShoppingItemRow';

/**
 * បញ្ជីគ្រឿងផ្សំ: Toggle តាមក្រុម (Category) ⇄ បញ្ជីរាប (UX 11.5/11.7, Read-only)
 * props: items (ShoppingItem[]), categoryById: Map<chefIngredientId, categoryName>
 * ប្រើ key={...} ពីខាងក្រៅ ដើម្បី Reset ក្រុមដែលបិទ ពេល Filter ប្តូរ
 */
export default function ShoppingListView({ items, categoryById }) {
  const { t } = useTranslation('events');
  const [view, setView] = useState('grouped'); // grouped | flat
  const [closed, setClosed] = useState(() => new Set());

  const groups = useMemo(() => groupByCategory(items, categoryById), [items, categoryById]);
  const flat = useMemo(() => sortFlat(items), [items]);

  const toggleGroup = (key) =>
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="space-y-4">
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
    </div>
  );
}
