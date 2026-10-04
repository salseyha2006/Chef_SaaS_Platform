import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRightIcon } from '../ui/Icons';

/**
 * Chips 2 ជួរ (UX 8.3; ប្រើឡើងវិញក្នុង 9.1)
 * items: [{ id, name, children?: [{ id, name }] }]
 * value: { parentId, subId } (null = ទាំងអស់) · onChange(value)
 * - ចុចឈ្មោះ → Filter Parent ទាំងមូល · ចុច ▾ → បើក/បិទ Row 2 (Parent នៅ Active)
 * - ចុច Parent ផ្សេង / "ទាំងអស់" → Row 2 បិទ · Sub ទទេ → គ្មាន ▾
 */
export default function NestedFilterChips({ items, value, onChange }) {
  const { t } = useTranslation('ingredients');
  const [expandedId, setExpandedId] = useState(null);
  const expanded = items.find((i) => i.id === expandedId);

  const base = 'min-h-[40px] text-[15px] font-medium transition';
  const on = 'bg-emerald-600 text-white';
  const off = 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200';
  const row = 'flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none]';

  const pickAll = () => { setExpandedId(null); onChange({ parentId: null, subId: null }); };
  const pickParent = (id) => {
    if (id !== expandedId) setExpandedId(null);
    onChange({ parentId: id, subId: null });
  };
  const toggleExpand = (id) => {
    setExpandedId((cur) => (cur === id ? null : id));
    if (value.parentId !== id) onChange({ parentId: id, subId: null });
  };

  return (
    <div className="space-y-2">
      <div className={row} role="group">
        <button type="button" onClick={pickAll}
          className={`${base} shrink-0 snap-start rounded-full px-4 ${!value.parentId ? on : off}`}>
          {t('stock.all')}
        </button>
        {items.map((it) => {
          const selected = value.parentId === it.id;
          const hasKids = it.children?.length > 0;
          return (
            <div key={it.id}
              className={`flex shrink-0 snap-start items-center rounded-full ${selected ? on : off}`}>
              <button type="button" onClick={() => pickParent(it.id)}
                className={`${base} pl-4 ${hasKids ? 'pr-1' : 'pr-4'}`}>
                {it.name}
              </button>
              {hasKids && (
                <button type="button" aria-label={t('stock.expand')} aria-expanded={expandedId === it.id}
                  onClick={() => toggleExpand(it.id)} className={`${base} pl-1 pr-3`}>
                  <ChevronRightIcon width={16} height={16}
                    className={expandedId === it.id ? '-rotate-90' : 'rotate-90'} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {expanded?.children?.length > 0 && (
        <div className={`${row} animate-slide-down`} role="group">
          <button type="button" onClick={() => onChange({ parentId: expanded.id, subId: null })}
            className={`${base} shrink-0 snap-start rounded-full px-4 ${!value.subId ? on : off}`}>
            {t('stock.allIn', { name: expanded.name })}
          </button>
          {expanded.children.map((c) => (
            <button key={c.id} type="button" onClick={() => onChange({ parentId: expanded.id, subId: c.id })}
              className={`${base} shrink-0 snap-start rounded-full px-4 ${value.subId === c.id ? on : off}`}>
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}