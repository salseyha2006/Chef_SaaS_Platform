import { useId } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ជួរ Preset (US-29/30)
 * - checked → Checkbox disabled; ចុច → onBlockedTap (Toast "កំពុងប្រើរួចហើយ")
 * - checked → ប៊ូតុង "លាក់" (Archive)
 */
export default function PresetCheckRow({ name, meta, checked, busy, onSelect, onArchive, onBlockedTap }) {
  const { t } = useTranslation('catalog');
  const id = useId();

  return (
    <li className="flex min-h-[56px] items-center gap-1 pl-4 pr-2">
      <label
        htmlFor={id}
        onClick={checked ? onBlockedTap : undefined}
        className={`flex min-w-0 flex-1 items-center gap-3 py-2 ${checked ? 'cursor-default' : 'cursor-pointer'}`}
      >
        {busy ? (
          <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        ) : (
          <input
            id={id}
            type="checkbox"
            checked={checked}
            disabled={checked}
            onChange={onSelect}
            className="h-5 w-5 shrink-0 rounded border-slate-300 accent-emerald-600"
          />
        )}
        <span className="min-w-0">
          <span className="block truncate text-base font-medium text-slate-800">{name}</span>
          {meta && <span className="block truncate text-sm text-slate-500">{meta}</span>}
        </span>
      </label>

      {checked && !busy && (
        <button
          type="button"
          onClick={onArchive}
          className="min-h-[44px] rounded-lg px-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-red-600 active:bg-slate-200"
        >
          {t('hide')}
        </button>
      )}
    </li>
  );
}