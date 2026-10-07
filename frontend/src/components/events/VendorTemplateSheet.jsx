import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { normalizeName } from '../../utils/catalog';
import PageHeader from '../PageHeader';
import AuthInput from '../ui/AuthInput';
import PrimaryButton from '../ui/PrimaryButton';
import StickyFooter from '../ui/StickyFooter';
import { AlertIcon, SearchIcon } from '../ui/Icons';

/**
 * Form ពេញអេក្រង់ បង្កើត/កែ Template: ឈ្មោះ + Checkbox គ្រឿងផ្សំពី Stock (Group តាម Category)
 * Mount តែពេលបើក. props: preset (UI VendorPreset | null), stockItems, stockStatus ('loading'|'ready'|'error'),
 *        saving, nameError, banner, onClose(), onSubmit({ name, ids })
 */
export default function VendorTemplateSheet({ preset, stockItems, stockStatus, saving, nameError, banner, onClose, onSubmit }) {
  const { t } = useTranslation('events');
  const [name, setName] = useState(preset?.name ?? '');
  const [picked, setPicked] = useState(() => new Set(preset?.ingredients.map((i) => i.id) ?? []));
  const [query, setQuery] = useState('');
  const [errors, setErrors] = useState({});

  const stockIds = useMemo(() => new Set(stockItems.map((s) => s.id)), [stockItems]);
  // គ្រឿងផ្សំក្នុង Template ដែលលែងមានក្នុងស្តុកសកម្ម → នឹងត្រូវដកចេញពេល Save (Gap #112)
  const dropped = stockStatus === 'ready' && preset ? preset.ingredients.filter((i) => !stockIds.has(i.id)).length : 0;
  const selectedCount = stockItems.filter((s) => picked.has(s.id)).length;

  const groups = useMemo(() => {
    const q = normalizeName(query);
    const map = new Map();
    stockItems
      .filter((s) => !q || normalizeName(s.name).includes(q))
      .forEach((s) => {
        const key = s.category || '';
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(s);
      });
    return [...map.entries()]
      .map(([key, items]) => ({ key, items: items.sort((a, b) => a.name.localeCompare(b.name, 'km')) }))
      .sort((a, b) => (a.key === '') - (b.key === '') || a.key.localeCompare(b.key, 'km'));
  }, [stockItems, query]);

  const toggle = (id) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const submit = () => {
    const e = {};
    if (!name.trim()) e.name = t('vendor.validation.nameRequired');
    if (selectedCount === 0) e.ingredients = t('vendor.validation.ingredientsRequired');
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit({ name: name.trim(), ids: stockItems.filter((s) => picked.has(s.id)).map((s) => s.id) });
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={preset ? t('vendor.formTitleEdit') : t('vendor.formTitleNew')}
      className="fixed inset-0 z-40 overflow-y-auto bg-slate-50 pb-36">
      <PageHeader title={preset ? t('vendor.formTitleEdit') : t('vendor.formTitleNew')} onBack={onClose} backLabel={t('back')} />

      <main className="mx-auto max-w-md space-y-4 px-5 pt-5">
        {banner && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{banner}</span>
          </div>
        )}

        {dropped > 0 && (
          <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[15px] text-amber-900">
            {t('vendor.droppedWarning', { count: dropped })}
          </div>
        )}

        <AuthInput label={t('vendor.name')} placeholder={t('vendor.namePlaceholder')} value={name} maxLength={60}
          error={errors.name || nameError} onChange={(e) => { setName(e.target.value); setErrors({}); }} />

        <AuthInput type="search" icon={SearchIcon} placeholder={t('vendor.searchPlaceholder')}
          value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />

        {errors.ingredients && <p role="alert" className="text-sm text-red-600">{errors.ingredients}</p>}

        {stockStatus === 'loading' && (
          <div className="flex justify-center py-10">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          </div>
        )}

        {stockStatus === 'ready' && stockItems.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-card">
            <p className="text-slate-600">{t('vendor.stockEmpty')}</p>
            <Link to="/ingredients/browse"
              className="mt-5 inline-flex h-12 items-center rounded-xl bg-emerald-600 px-6 font-semibold text-white shadow-btn active:bg-emerald-800">
              {t('vendor.stockEmptyCta')}
            </Link>
          </div>
        )}

        {groups.map((g) => (
          <section key={g.key || '__none__'} className="space-y-2">
            <h3 className="px-1 text-sm font-semibold text-slate-500">{g.key || t('vendor.noCategory')}</h3>
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
              {g.items.map((s) => (
                <li key={s.id}>
                  <label className="flex min-h-[56px] cursor-pointer items-center gap-3 px-4 py-2 active:bg-slate-50">
                    <input type="checkbox" checked={picked.has(s.id)} onChange={() => toggle(s.id)}
                      className="h-5 w-5 shrink-0 rounded border-slate-300 accent-emerald-600" />
                    <span className="min-w-0 flex-1 truncate text-base font-medium text-slate-800">{s.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <StickyFooter>
        <div className="flex items-center gap-4">
          <p className="shrink-0 text-[15px] font-medium text-slate-700">{t('vendor.selected', { count: selectedCount })}</p>
          <PrimaryButton loading={saving} onClick={submit}>{t('vendor.save')}</PrimaryButton>
        </div>
      </StickyFooter>
    </div>
  );
}
