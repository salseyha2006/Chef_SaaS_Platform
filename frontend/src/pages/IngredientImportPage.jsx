import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ingredientService } from '../services/ingredientService';
import { useIngredientPresets } from '../hooks/useIngredientPresets';
import { useActiveUnits } from '../hooks/useActiveUnits';
import { filterTree, groupItems } from '../utils/tree';
import { normalizeName } from '../utils/catalog';
import { parseDecimal } from '../utils/number';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import PageHeader from '../components/PageHeader';
import AuthInput from '../components/ui/AuthInput';
import ConfirmModal from '../components/ui/ConfirmModal';
import PrimaryButton from '../components/ui/PrimaryButton';
import StickyFooter from '../components/ui/StickyFooter';
import Toast from '../components/ui/Toast';
import IngredientTree from '../components/ingredients/IngredientTree';
import PricingList from '../components/ingredients/PricingList';
import UnitFormSheet from '../components/catalog/UnitFormSheet';
import { AlertIcon, SearchIcon } from '../components/ui/Icons';

export default function IngredientImportPage() {
  const { t } = useTranslation('ingredients');
  const navigate = useNavigate();
  const location = useLocation();
  const { groups, status, error, reload } = useIngredientPresets();
  const { units, reload: reloadUnits } = useActiveUnits();

  const [step, setStep] = useState('select'); // select (8.1) | pricing (8.2)
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [rows, setRows] = useState({});
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [saving, setSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [unitFor, setUnitFor] = useState(null); // ingredientId ដែលកំពុងបង្កើតខ្នាត
  const [toast, setToast] = useState('');
  const closeToast = useCallback(() => setToast(''), []);

  const searching = query.trim() !== '';
  const visible = useMemo(() => filterTree(groups, query), [groups, query]);
  const selectedItems = useMemo(
    () => groups.flatMap(groupItems).filter((i) => selected.has(i.id) && !i.isImported),
    [groups, selected],
  );
  const dirty = selectedItems.some((i) => String(rows[i.id]?.price ?? '').trim() !== '');

  const onToggle = (items, next) =>
    setSelected((prev) => {
      const set = new Set(prev);
      items.forEach((i) => (next ? set.add(i.id) : set.delete(i.id)));
      return set;
    });

  const resetFlow = () => {
    setSelected(new Set());
    setRows({});
    setErrors({});
    setBanner('');
    setQuery('');
    setStep('select');
  };

  /** 8.1 → 8.2: បំពេញខ្នាតស្រាប់តាម defaultUnit (ផ្គូផ្គងតាមឈ្មោះ) */
  const goPricing = () => {
    const byName = new Map(units.map((u) => [normalizeName(u.name), u.id]));
    setRows((prev) =>
      Object.fromEntries(
        selectedItems.map((i) => [
          i.id,
          prev[i.id] || { price: '', unitId: byName.get(normalizeName(i.defaultUnit?.name)) || '' },
        ]),
      ),
    );
    setErrors({});
    setBanner('');
    setStep('pricing');
  };

  const setRow = (id, patch) => {
    setRows((r) => ({ ...r, [id]: { ...r[id], ...patch } }));
    setErrors((er) => ({ ...er, [id]: {} }));
    setBanner('');
  };

  const validate = () => {
    const out = {};
    selectedItems.forEach((i) => {
      const r = rows[i.id] || {};
      const raw = String(r.price ?? '').trim();
      const e = {};
      if (raw === '') e.price = t('pricing.validation.priceRequired');
      else if (!(parseDecimal(raw) > 0)) e.price = t('pricing.validation.pricePositive'); // US-33 Tech Note
      if (!r.unitId) e.unit = t('pricing.validation.unitRequired');
      if (Object.keys(e).length) out[i.id] = e;
    });
    return out;
  };

  const onSave = async () => {
    if (saving) return;
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v); // US-33 S2: ចង្អុលជួរជាក់លាក់
      const first = selectedItems.find((i) => v[i.id]);
      document.getElementById(`row-${first.id}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    const payload = selectedItems.map((i) => ({
      ingredientId: i.id,
      purchasePrice: parseDecimal(rows[i.id].price),
      unitId: rows[i.id].unitId,
    }));

    setSaving(true);
    setBanner('');
    try {
      const created = await ingredientService.importItems(payload);
      await reload(); // US-32 S3: Sync Tree ភ្លាម
      resetFlow();
      setToast(t('toast.imported', { count: created.length }));
    } catch (err) {
      // ⚠️ ទម្រង់ field ក្នុង Array (items.N.purchasePrice) ជាការសន្មត់ (Gap #52)
      const fe = getFieldErrors(err);
      const next = {};
      if (fe) {
        Object.entries(fe).forEach(([field, msg]) => {
          const m = field.match(/^items\.(\d+)\.(purchasePrice|unitId)$/);
          const item = m && payload[Number(m[1])];
          if (item) next[item.ingredientId] = { ...next[item.ingredientId], [m[2] === 'purchasePrice' ? 'price' : 'unit']: msg };
        });
      }
      if (Object.keys(next).length) setErrors(next);
      else setBanner(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onUnitCreated = async (unit) => {
    await reloadUnits();
    if (unitFor) setRow(unitFor, { unitId: unit.id }); // US-33 S3: ភ្ជាប់ភ្លាម
  };

  const leave = () => (location.key === 'default' ? navigate('/profile', { replace: true }) : navigate(-1));
  const onBack = () => {
    if (step === 'select') return leave();
    return dirty ? setDiscardOpen(true) : resetFlow(); // US-33 S4
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-32">
      <PageHeader
        title={step === 'select' ? t('browse.title') : t('pricing.title')}
        onBack={onBack}
        backLabel={t('back')}
      />

      <main className="mx-auto max-w-md px-5 pt-5">
        {step === 'select' && (
          <>
            <AuthInput
              type="search"
              icon={SearchIcon}
              placeholder={t('browse.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />

            <div className="mt-4">
              {status === 'loading' && (
                <div className="flex justify-center py-16">
                  <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
                </div>
              )}
              {status === 'error' && (
                <div className="rounded-2xl border border-red-100 bg-white p-6 text-center shadow-card">
                  <p className="text-slate-600">{error}</p>
                  <button type="button" onClick={reload}
                    className="mt-4 min-h-[44px] rounded-xl border border-slate-200 px-5 font-medium text-slate-800 active:bg-slate-100">
                    {t('retry')}
                  </button>
                </div>
              )}
              {status === 'ready' && visible.length === 0 && (
                <p className="py-10 text-center text-slate-500">
                  {searching ? t('browse.noResults') : t('browse.empty')}
                </p>
              )}
              {status === 'ready' && visible.length > 0 && (
                <IngredientTree
                  groups={visible}
                  selected={selected}
                  searching={searching}
                  onToggle={onToggle}
                  onBlockedTap={() => setToast(t('inStockHint'))}
                />
              )}
            </div>
          </>
        )}

        {step === 'pricing' && (
          <>
            <p className="rounded-xl bg-sky-50 px-4 py-3 text-[15px] text-sky-900">{t('pricing.note')}</p>
            {banner && (
              <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
                <span>{banner}</span>
              </div>
            )}
            <div className="mt-4">
              <PricingList
                items={selectedItems}
                rows={rows}
                errors={errors}
                units={units}
                onChange={setRow}
                onCreateUnit={setUnitFor}
              />
            </div>
          </>
        )}
      </main>

      <StickyFooter>
        {step === 'select' ? (
          <div className="flex items-center gap-4">
            <span className="shrink-0 text-[15px] font-medium text-slate-700">
              {t('selectedCount', { count: selectedItems.length })}
            </span>
            <PrimaryButton disabled={selectedItems.length === 0} onClick={goPricing}>
              {t('browse.next')}
            </PrimaryButton>
          </div>
        ) : (
          <PrimaryButton loading={saving} onClick={onSave}>{t('pricing.save')}</PrimaryButton>
        )}
      </StickyFooter>

      <UnitFormSheet open={Boolean(unitFor)} onClose={() => setUnitFor(null)} onCreated={onUnitCreated} />

      <ConfirmModal
        open={discardOpen}
        destructive
        title={t('pricing.discardTitle')}
        message={t('pricing.discardMessage')}
        confirmLabel={t('pricing.discardConfirm')}
        cancelLabel={t('pricing.keepEditing')}
        onConfirm={() => { setDiscardOpen(false); resetFlow(); }}
        onCancel={() => setDiscardOpen(false)}
      />

      <Toast message={toast} onClose={closeToast} />
    </div>
  );
}