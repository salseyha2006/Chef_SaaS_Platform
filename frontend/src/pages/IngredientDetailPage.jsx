import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ingredientService } from '../services/ingredientService';
import { useActiveUnits } from '../hooks/useActiveUnits';
import { useActiveCategories } from '../hooks/useActiveCategories';
import { normalizeName } from '../utils/catalog';
import { formatDecimal, parseDecimal } from '../utils/number';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import PageHeader from '../components/PageHeader';
import AuthInput from '../components/ui/AuthInput';
import ActionSheet from '../components/ui/ActionSheet';
import ConfirmModal from '../components/ui/ConfirmModal';
import CreatableSelect from '../components/ui/CreatableSelect';
import PrimaryButton from '../components/ui/PrimaryButton';
import Toast from '../components/ui/Toast';
import UnitFormSheet from '../components/catalog/UnitFormSheet';
import CategoryFormSheet from '../components/catalog/CategoryFormSheet';
import { AlertIcon, MoreIcon } from '../components/ui/Icons';

export default function IngredientDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation('ingredients');
  const { t: tc } = useTranslation('catalog');
  const navigate = useNavigate();
  const location = useLocation();
  const { units, reload: reloadUnits } = useActiveUnits();
  const { categories, loaded: catsLoaded, reload: reloadCategories } = useActiveCategories();

  const [item, setItem] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | notfound | error
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState(null);
  const [baseline, setBaseline] = useState(null);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [inUse, setInUse] = useState(0);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // archive | delete | discard
  const [sheet, setSheet] = useState(null); // unit | category
  const [toast, setToast] = useState('');
  const closeToast = useCallback(() => setToast(''), []);

  // គ្មាន GET /my-stock/:id (Gap #55) → ទាញ List ហើយរកតាម id
  const load = useCallback(async () => {
    try {
      const list = await ingredientService.getStock();
      const found = list.find((i) => i.id === id);
      if (!found) return setStatus('notfound');
      setItem(found);
      setStatus('ready');
    } catch (err) {
      setLoadError(getErrorMessage(err));
      setStatus('error');
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Reset Form ពី Item (+ ផ្គូផ្គង Category តាមឈ្មោះ ព្រោះ my-stock គ្មាន categoryId — Gap #57)
  useEffect(() => {
    if (!item || !catsLoaded) return;
    const categoryId =
      categories.find((c) => normalizeName(c.name) === normalizeName(item.category))?.id || '';
    const base = { price: Number(item.purchasePrice).toFixed(2), unitId: item.unit?.id || '', categoryId };
    setForm(base);
    setBaseline(base);
    setErrors({});
  }, [item, categories, catsLoaded]);

  const dirty = form && baseline && JSON.stringify(form) !== JSON.stringify(baseline);

  // ខ្នាតបច្ចុប្បន្នអាច Archive រួច → បន្ថែមក្នុងជម្រើស (ទិន្នន័យចាស់នៅតែបង្ហាញ — US-30 S2)
  const unitOptions = useMemo(() => {
    const list = [...units];
    if (item?.unit && !list.some((u) => u.id === item.unit.id)) list.push(item.unit);
    return list.map((u) => ({
      value: u.id,
      label: `${u.name}${u.abbreviation && u.abbreviation !== u.name ? ` (${u.abbreviation})` : ''}`,
    }));
  }, [units, item]);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  const setField = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors({});
    setBanner('');
  };

  const onSave = async () => {
    if (saving || !dirty) return;
    const e = {};
    const raw = String(form.price).trim();
    if (raw === '') e.price = t('pricing.validation.priceRequired');
    else if (!(parseDecimal(raw) > 0)) e.price = t('pricing.validation.pricePositive');
    if (!form.unitId) e.unit = t('pricing.validation.unitRequired');
    if (Object.keys(e).length) return setErrors(e);

    // ផ្ញើតែ Field ដែលផ្លាស់ប្តូរ
    const patch = {};
    if (form.price !== baseline.price) patch.purchasePrice = parseDecimal(raw);
    if (form.unitId !== baseline.unitId) patch.unitId = form.unitId;
    if (form.categoryId && form.categoryId !== baseline.categoryId) patch.categoryId = form.categoryId;

    setSaving(true);
    setBanner('');
    try {
      await ingredientService.updateStock(id, patch);
      await load();
      setToast('saved');
    } catch (err) {
      const fe = getFieldErrors(err);
      if (fe) setErrors({ price: fe.purchasePrice, unit: fe.unitId });
      else setBanner(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const goList = (toastKey) => navigate('/ingredients', { replace: true, state: { toast: toastKey } });

  const onArchive = async () => {
    setBusy(true);
    try {
      await ingredientService.archiveStock(id);
      goList('archived');
    } catch (err) {
      setConfirm(null);
      setBanner(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    setBusy(true);
    try {
      await ingredientService.deleteStock(id);
      goList('deleted');
    } catch (err) {
      setConfirm(null);
      if (err.code === 'INGREDIENT_IN_USE') setInUse(Number(err.params?.count) || 1); // US-36 S2
      else setBanner(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const leave = () => (location.key === 'default' ? navigate('/ingredients', { replace: true }) : navigate(-1));
  const onBack = () => (dirty ? setConfirm('discard') : leave());

  const menuBtn = (
    <button type="button" onClick={() => setMenuOpen(true)} aria-label={t('detail.menu.title')}
      className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 active:bg-slate-200">
      <MoreIcon />
    </button>
  );

  if (status !== 'ready') {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        <PageHeader title={t('stock.title')} backTo="/ingredients" backLabel={t('back')} />
        <main className="mx-auto max-w-md px-5 pt-10 text-center text-slate-500">
          {status === 'loading' && (
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          )}
          {status === 'notfound' && (
            <>
              <p>{t('detail.notFound')}</p>
              <Link to="/ingredients" className="mt-4 inline-block font-medium text-emerald-700">{t('detail.backToStock')}</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <p>{loadError}</p>
              <button type="button" onClick={load}
                className="mt-4 min-h-[44px] rounded-xl border border-slate-200 px-5 font-medium text-slate-800">
                {t('retry')}
              </button>
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-10">
      <PageHeader title={item.name} onBack={onBack} backLabel={t('back')} right={menuBtn} />

      <main className="mx-auto max-w-md space-y-5 px-5 pt-6">
        {inUse > 0 && (
          <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[15px] text-amber-900">
            <p>{t('detail.inUseWarning', { count: inUse })}</p>
            <button type="button" onClick={() => setConfirm('archive')} className="mt-2 min-h-[44px] font-semibold text-amber-900 underline">
              {t('detail.archiveInstead')}
            </button>
          </div>
        )}

        {banner && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{banner}</span>
          </div>
        )}

        {form && (
          <>
            <AuthInput
              label={t('detail.price')}
              inputMode="decimal"
              value={form.price}
              error={errors.price}
              onChange={(e) => setField({ price: e.target.value })}
              onBlur={() => setField({ price: formatDecimal(form.price) })}
            />
            <CreatableSelect
              label={t('detail.unit')}
              placeholder={t('pricing.unitPlaceholder')}
              createLabel={tc('add.units')}
              value={form.unitId}
              options={unitOptions}
              error={errors.unit}
              onChange={(unitId) => setField({ unitId })}
              onCreate={() => setSheet('unit')}
            />
            <CreatableSelect
              label={t('detail.category')}
              placeholder={t('detail.categoryPlaceholder')}
              createLabel={tc('add.categories')}
              value={form.categoryId}
              options={categoryOptions}
              onChange={(categoryId) => setField({ categoryId })}
              onCreate={() => setSheet('category')}
            />
            <PrimaryButton loading={saving} disabled={!dirty} onClick={onSave}>{t('detail.save')}</PrimaryButton>
          </>
        )}
      </main>

      <ActionSheet
        open={menuOpen}
        title={t('detail.menu.title')}
        cancelLabel={t('detail.menu.cancel')}
        onClose={() => setMenuOpen(false)}
        actions={[
          { key: 'archive', label: t('detail.menu.archive'), onSelect: () => setConfirm('archive') },
          { key: 'delete', label: t('detail.menu.delete'), destructive: true, onSelect: () => setConfirm('delete') },
        ]}
      />

      <UnitFormSheet
        open={sheet === 'unit'}
        onClose={() => setSheet(null)}
        onCreated={async (u) => { await reloadUnits(); setField({ unitId: u.id }); }}
      />
      <CategoryFormSheet
        open={sheet === 'category'}
        onClose={() => setSheet(null)}
        onCreated={async (c) => { await reloadCategories(); setField({ categoryId: c.id }); }}
      />

      <ConfirmModal
        open={confirm === 'archive'}
        loading={busy}
        title={t('detail.archiveTitle', { name: item.name })}
        message={t('detail.archiveMessage')}
        confirmLabel={t('detail.archiveConfirm')}
        cancelLabel={tc('cancel')}
        onConfirm={onArchive}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmModal
        open={confirm === 'delete'}
        destructive
        loading={busy}
        title={t('detail.deleteTitle', { name: item.name })}
        message={t('detail.deleteMessage')}
        confirmLabel={t('detail.deleteConfirm')}
        cancelLabel={tc('cancel')}
        onConfirm={onDelete}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmModal
        open={confirm === 'discard'}
        destructive
        title={t('pricing.discardTitle').replace(/.*/, t('detail.discardTitle'))}
        message={t('detail.discardMessage')}
        confirmLabel={t('detail.discardConfirm')}
        cancelLabel={t('pricing.keepEditing')}
        onConfirm={() => { setConfirm(null); leave(); }}
        onCancel={() => setConfirm(null)}
      />

      <Toast message={toast ? t(`toast.${toast}`) : ''} onClose={closeToast} />
    </div>
  );
}