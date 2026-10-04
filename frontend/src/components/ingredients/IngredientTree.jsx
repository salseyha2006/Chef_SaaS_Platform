import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TriCheckbox from '../ui/TriCheckbox';
import { ChevronRightIcon } from '../ui/Icons';
import { checkState, groupItems } from '../../utils/tree';

const INDENT = { 1: 8, 2: 24, 3: 40 }; // px (UX 8.1: Sub +16, Item +32)

function NodeRow({ level, name, count, state, open, onOpen, onBox, onBlockedTap }) {
  return (
    <div
      className={`flex min-h-[48px] items-center pr-2 ${level === 1 ? 'bg-slate-50' : 'bg-white'}`}
      style={{ paddingLeft: INDENT[level] }}
    >
      <label
        className="flex h-12 w-11 shrink-0 cursor-pointer items-center justify-center"
        onClick={state.disabled ? onBlockedTap : undefined}
      >
        <TriCheckbox
          checked={state.checked}
          indeterminate={state.indeterminate}
          disabled={state.disabled}
          onChange={onBox}
          label={name}
        />
      </label>
      {/* ចុចអក្សរ = ចុច Chevron (touch-friendly) */}
      <button
        type="button"
        aria-expanded={open}
        onClick={onOpen}
        className={`flex min-h-[48px] min-w-0 flex-1 items-center gap-2 text-left ${
          level === 1 ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
        }`}
      >
        <span className="truncate">{name}</span>
        <span className="ml-auto shrink-0 text-sm font-normal text-slate-400">{count}</span>
        <ChevronRightIcon className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
    </div>
  );
}

function ItemRow({ item, depth, selected, crumb, onToggle, onBlockedTap }) {
  const { t } = useTranslation('ingredients');
  const checked = item.isImported || selected.has(item.id);
  return (
    <li>
      <label
        className={`flex min-h-[48px] items-center gap-3 pr-3 ${
          item.isImported ? 'cursor-default' : 'cursor-pointer active:bg-slate-50'
        }`}
        style={{ paddingLeft: INDENT[depth] + 10 }}
        onClick={item.isImported ? onBlockedTap : undefined}
      >
        <TriCheckbox
          checked={checked}
          disabled={item.isImported}
          onChange={(next) => onToggle([item], next)}
          label={item.name}
        />
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-base ${item.isImported ? 'text-slate-400' : 'text-slate-800'}`}>
            {item.name}
          </span>
          {crumb && <span className="block truncate text-xs text-slate-400">{crumb}</span>}
        </span>
        {item.isImported && <span className="shrink-0 text-xs text-slate-400">{t('inStock')}</span>}
      </label>
    </li>
  );
}

/**
 * Tree 3 កម្រិត: Group → Sub → Item (Sub គ្មានឈ្មោះ → Item នៅក្រោម Group ផ្ទាល់)
 * props: groups (បានច្រោះ), selected:Set, searching, onToggle(items, nextChecked), onBlockedTap
 * Default: បិទទាំងអស់; Searching → បើកទាំងអស់ + Breadcrumb
 */
export default function IngredientTree({ groups, selected, searching, onToggle, onBlockedTap }) {
  const [expanded, setExpanded] = useState(() => new Set());
  const isOpen = (key) => searching || expanded.has(key);
  const toggleOpen = (key) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <ul className="space-y-3">
      {groups.map((g) => {
        const items = groupItems(g);
        const gState = checkState(items, selected);
        const gOpen = isOpen(g.key);
        return (
          <li key={g.key} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
            <NodeRow
              level={1}
              name={g.name}
              count={items.length}
              state={gState}
              open={gOpen}
              onOpen={() => toggleOpen(g.key)}
              onBox={(next) => onToggle(gState.selectable, next)}
              onBlockedTap={onBlockedTap}
            />
            {gOpen && (
              <ul className="divide-y divide-slate-50">
                {g.subs.map((s) => {
                  const crumbOf = () => (searching ? [g.name, s.name].filter(Boolean).join(' > ') : null);
                  if (!s.name) {
                    return s.items.map((i) => (
                      <ItemRow key={i.id} item={i} depth={2} selected={selected} crumb={crumbOf()}
                        onToggle={onToggle} onBlockedTap={onBlockedTap} />
                    ));
                  }
                  const sState = checkState(s.items, selected);
                  const sOpen = isOpen(s.key);
                  return (
                    <li key={s.key}>
                      <NodeRow
                        level={2}
                        name={s.name}
                        count={s.items.length}
                        state={sState}
                        open={sOpen}
                        onOpen={() => toggleOpen(s.key)}
                        onBox={(next) => onToggle(sState.selectable, next)}
                        onBlockedTap={onBlockedTap}
                      />
                      {sOpen && (
                        <ul className="divide-y divide-slate-50">
                          {s.items.map((i) => (
                            <ItemRow key={i.id} item={i} depth={3} selected={selected} crumb={crumbOf()}
                              onToggle={onToggle} onBlockedTap={onBlockedTap} />
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}