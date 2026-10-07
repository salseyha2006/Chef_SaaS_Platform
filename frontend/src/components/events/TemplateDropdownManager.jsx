import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BottomSheet from '../ui/BottomSheet';
import { FILTER_ALL, FILTER_UNCATEGORIZED } from '../../utils/vendor';

/**
 * Dropdown ជ្រើស Template + គ្រប់គ្រង (✏️ កែ / 🗑️ លុប / + បង្កើត) ក្នុង Bottom Sheet
 * props: presets (UI VendorPreset[]), value ('all'|'uncategorized'|presetId),
 *        counts { all, uncategorized, byPreset:{[id]:n} }, onChange(value),
 *        onCreate(), onEdit(preset), onDelete(preset)
 */
export default function TemplateDropdownManager({ presets, value, counts, onChange, onCreate, onEdit, onDelete }) {
  const { t } = useTranslation('events');
  const [open, setOpen] = useState(false);

  const currentLabel =
    value === FILTER_ALL
      ? t('shopping.all')
      : value === FILTER_UNCATEGORIZED
        ? t('shopping.uncategorized')
        : presets.find((p) => p.id === value)?.name ?? t('shopping.all');

  const act = (fn) => {
    setOpen(false);
    fn();
  };

  const rowBase = 'flex min-h-[52px] flex-1 items-center gap-3 px-4 text-left active:bg-slate-50';
  const dot = (active) => (
    <span aria-hidden="true"
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
        active ? 'border-emerald-600' : 'border-slate-300'
      }`}>
      {active && <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />}
    </span>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog"
        className="flex min-h-[52px] w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-left shadow-sm active:bg-slate-50">
        <span className="shrink-0 text-sm text-slate-500">{t('shopping.filterLabel')}</span>
        <span className="min-w-0 flex-1 truncate font-semibold text-slate-900">{currentLabel}</span>
        <span aria-hidden="true" className="text-slate-400">▾</span>
      </button>

      <BottomSheet open={open} title={t('vendor.title')} onClose={() => setOpen(false)}>
        <ul className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
          <li className="flex">
            <button type="button" className={rowBase} onClick={() => { onChange(FILTER_ALL); setOpen(false); }}>
              {dot(value === FILTER_ALL)}
              <span className="flex-1 font-medium text-slate-800">{t('shopping.all')}</span>
              <span className="text-sm text-slate-500">{counts.all}</span>
            </button>
          </li>

          {presets.map((p) => (
            <li key={p.id} className="flex items-center">
              <button type="button" className={rowBase} onClick={() => { onChange(p.id); setOpen(false); }}>
                {dot(value === p.id)}
                <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{p.name}</span>
                <span className="text-sm text-slate-500">{counts.byPreset[p.id] ?? 0}</span>
              </button>
              <button type="button" onClick={() => act(() => onEdit(p))} aria-label={t('vendor.editAria', { name: p.name })}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg hover:bg-slate-100 active:bg-slate-200">
                ✏️
              </button>
              <button type="button" onClick={() => act(() => onDelete(p))} aria-label={t('vendor.deleteAria', { name: p.name })}
                className="mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg hover:bg-slate-100 active:bg-slate-200">
                🗑️
              </button>
            </li>
          ))}

          <li className="flex">
            <button type="button" className={rowBase} onClick={() => { onChange(FILTER_UNCATEGORIZED); setOpen(false); }}>
              {dot(value === FILTER_UNCATEGORIZED)}
              <span className="flex-1 font-medium text-slate-800">{t('shopping.uncategorized')}</span>
              <span className="text-sm text-slate-500">{counts.uncategorized}</span>
            </button>
          </li>
        </ul>

        <button type="button" onClick={() => act(onCreate)}
          className="mt-4 min-h-[52px] w-full rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 font-semibold text-emerald-700 active:bg-emerald-50">
          + {t('vendor.create')}
        </button>
      </BottomSheet>
    </>
  );
}
