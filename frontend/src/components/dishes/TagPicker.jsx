import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeName } from '../../utils/catalog';

/**
 * ជ្រើស/បង្កើត Tag (US-43 S1, S3)
 * props: label, value: string[], options: string[] (Tag ដែលមានស្រាប់), onChange(next)
 */
export default function TagPicker({ label, value, options, onChange }) {
  const { t } = useTranslation('dishes');
  const [draft, setDraft] = useState('');

  const all = useMemo(() => {
    const seen = new Set();
    return [...options, ...value].filter((tag) => {
      const k = normalizeName(tag);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [options, value]);

  const has = (tag) => value.some((v) => normalizeName(v) === normalizeName(tag));
  const toggle = (tag) => onChange(has(tag) ? value.filter((v) => normalizeName(v) !== normalizeName(tag)) : [...value, tag]);

  const add = () => {
    const tag = draft.trim();
    if (!tag) return;
    if (!has(tag)) {
      // ប្រើអក្សរដើមរបស់ Tag ដែលមានស្រាប់ បើវាយដូចគ្នា (មិនប្រកាន់អក្សរធំតូច)
      const existing = all.find((a) => normalizeName(a) === normalizeName(tag));
      onChange([...value, existing || tag]);
    }
    setDraft('');
  };

  return (
    <div>
      <span className="mb-1.5 block text-[15px] font-medium text-slate-700">{label}</span>
      {all.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label={label}>
          {all.map((tag) => {
            const on = has(tag);
            return (
              <button key={tag} type="button" aria-pressed={on} onClick={() => toggle(tag)}
                className={`min-h-[40px] rounded-full px-4 text-[15px] font-medium transition ${
                  on ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200'
                }`}>
                {tag}
              </button>
            );
          })}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          maxLength={40}
          placeholder={t('form.tagPlaceholder')}
          aria-label={t('form.tagPlaceholder')}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-base outline-none transition hover:border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
        />
        <button type="button" onClick={add} disabled={!draft.trim()}
          className="min-h-[48px] shrink-0 rounded-xl border border-slate-200 bg-white px-4 font-medium text-slate-800 active:bg-slate-100 disabled:text-slate-400">
          {t('form.tagAdd')}
        </button>
      </div>
    </div>
  );
}
