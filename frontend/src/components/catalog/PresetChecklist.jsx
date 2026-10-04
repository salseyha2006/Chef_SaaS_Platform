import { useTranslation } from 'react-i18next';
import PresetCheckRow from './PresetCheckRow';

/** Checklist Preset + ផ្នែក "ដែលខ្ញុំបង្កើត" (ប្រើសម្រាប់ទាំង Unit និង Category) */
export default function PresetChecklist({
  presetRows, customRows, busyKey, renderMeta, onImport, onArchive, onBlockedTap,
}) {
  const { t } = useTranslation('catalog');

  const renderRow = (row) => (
    <PresetCheckRow
      key={row.key}
      name={row.name}
      meta={renderMeta?.(row.data)}
      checked={row.checked}
      busy={busyKey === row.key}
      onSelect={() => onImport(row)}
      onArchive={() => onArchive(row)}
      onBlockedTap={onBlockedTap}
    />
  );

  const listCls = 'divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card';
  const titleCls = 'mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-slate-500';

  return (
    <div className="space-y-6">
      {presetRows.length > 0 && (
        <section>
          <h2 className={titleCls}>{t('presetsTitle')}</h2>
          <ul className={listCls}>{presetRows.map(renderRow)}</ul>
        </section>
      )}
      {customRows.length > 0 && (
        <section>
          <h2 className={titleCls}>{t('customTitle')}</h2>
          <ul className={listCls}>{customRows.map(renderRow)}</ul>
        </section>
      )}
      {presetRows.length === 0 && customRows.length === 0 && (
        <p className="py-10 text-center text-slate-500">{t('empty')}</p>
      )}
    </div>
  );
}