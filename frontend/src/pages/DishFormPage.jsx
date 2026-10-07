import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { dishService } from '../services/dishService';
import { ingredientService } from '../services/ingredientService';
import { useDishes } from '../hooks/useDishes';
import { normalizeName } from '../utils/catalog';
import { parseDecimal } from '../utils/number';
import { formatPrice } from '../utils/format';
import { buildDishPayload, calcTotal, snapshotForm } from '../utils/dish';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import PageHeader from '../components/PageHeader';
import AuthInput from '../components/ui/AuthInput';
import TextArea from '../components/ui/TextArea';
import ConfirmModal from '../components/ui/ConfirmModal';
import PrimaryButton from '../components/ui/PrimaryButton';
import StickyFooter from '../components/ui/StickyFooter';
import TagPicker from '../components/dishes/TagPicker';
import DishIngredientRow from '../components/dishes/DishIngredientRow';
import IngredientPickerSheet from '../components/dishes/IngredientPickerSheet';
import { AlertIcon, PlusIcon } from '../components/ui/Icons';

const EMPTY = { name: '', description: '', imageUrl: '', tags: [], lines: [] };
const NO_ERRORS = { lines: {} };

const toLine = (stockItem, quantity = '') => ({
  chefIngredientId: stockItem.id,
  name: stockItem.name,
  unit: stockItem.unit?.abbreviation || stockItem.unit?.name || '',
  unitPrice: Number(stockItem.purchasePrice || 0),
  quantity,
});

export default function DishFormPage() {
  const { id } = useParams(); // មាន → Edit (US-39), គ្មាន → Create (US-37)
  const isEdit = Boolean(id);
  const { t } = useTranslation('dishes');
  const navigate = useNavigate();
  const location = useLocation();
  const { items: knownDishes } = useDishes(); // ប្រភព Tag ដែលមានស្រាប់ (Gap #61)

  const [form, setForm] = useState(EMPTY);
  const [baseline, setBaseline] = useState(() => snapshotForm(EMPTY));
  const [status, setStatus] = useState(isEdit ? 'loading' : 'ready'); // loading | ready | notfound | error
  const [loadError, setLoadError] = useState('');
  const [dropped, setDropped] = useState([]); // ឈ្មោះគ្រឿងផ្សំដែលមិនមានក្នុងស្តុកសកម្ម (Gap #66)
  const [errors, setErrors] = useState(NO_ERRORS);
  const [banner, setBanner] = useState('');
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const tagOptions = useMemo(
    () => [...new Set(knownDishes.flatMap((d) => d.tags))].sort((a, b) => a.localeCompare(b, 'km')),
    [knownDishes],
  );

  // ===== Edit: ទាញ Dish + Stock ហើយផ្គូផ្គងតាមឈ្មោះ (Contract គ្មាន chefIngredientId — Gap #66)
  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [detail, stock] = await Promise.all([dishService.getById(id), ingredientService.getStock()]);
      const lines = [];
      const missing = [];
      detail.costBreakdown.forEach((row) => {
        const hit = stock.find((s) =>
          row.chefIngredientId ? s.id === row.chefIngredientId : normalizeName(s.name) === normalizeName(row.ingredientName),
        );
        if (hit) lines.push(toLine(hit, String(row.quantityUsed)));
        else missing.push(row.ingredientName);
      });
      const next = {
        name: detail.name,
        description: detail.description,
        imageUrl: detail.imageUrl || '',
        tags: detail.tags,
        lines,
      };
      setForm(next);
      setBaseline(snapshotForm(next));
      setDropped(missing);
      setStatus('ready');
    } catch (err) {
      if (err.code === 'DISH_NOT_FOUND') return setStatus('notfound');
      setLoadError(getErrorMessage(err));
      setStatus('error');
    }
  }, [id]);

  useEffect(() => { if (isEdit) load(); }, [isEdit, load]);

  const dirty = snapshotForm(form) !== baseline;
  const total = useMemo(() => calcTotal(form.lines), [form.lines]);
  const existingIds = useMemo(() => new Set(form.lines.map((l) => l.chefIngredientId)), [form.lines]);

  const patch = (partial) => {
    setForm((f) => ({ ...f, ...partial }));
    setErrors(NO_ERRORS);
    setBanner('');
  };

  const setQuantity = (lineId, quantity) =>
    patch({ lines: form.lines.map((l) => (l.chefIngredientId === lineId ? { ...l, quantity } : l)) });
  const removeLine = (lineId) => patch({ lines: form.lines.filter((l) => l.chefIngredientId !== lineId) });

  const onPick = (picked) => {
    patch({ lines: [...form.lines, ...picked.filter((p) => !existingIds.has(p.id)).map((p) => toLine(p))] });
    setPickerOpen(false);
  };

  // ===== Validation (US-37 S3, S4)
  const validate = () => {
    const e = { lines: {} };
    if (!form.name.trim()) e.name = t('form.validation.nameRequired');
    if (form.lines.length === 0) e.ingredients = t('form.validation.ingredientsRequired');
    form.lines.forEach((l) => {
      const raw = String(l.quantity).trim();
      if (raw === '') e.lines[l.chefIngredientId] = t('form.validation.qtyRequired');
      else if (!(parseDecimal(raw) > 0)) e.lines[l.chefIngredientId] = t('form.validation.qtyPositive');
    });
    return e;
  };

  const applyApiErrors = (err) => {
    const fe = getFieldErrors(err);
    if (!fe) return setBanner(getErrorMessage(err));
    const next = { lines: {} };
    let other = '';
    Object.entries(fe).forEach(([field, msg]) => {
      const m = field.match(/^ingredients\.(\d+)\./); // សន្មត់ Path (Gap #68)
      if (m) {
        const line = form.lines[Number(m[1])];
        if (line) next.lines[line.chefIngredientId] = msg;
      } else if (['name', 'imageUrl', 'ingredients'].includes(field)) next[field] = msg;
      else other = msg;
    });
    setErrors(next);
    if (other) setBanner(other);
  };

  const onSave = async () => {
    if (saving) return;
    const e = validate();
    if (e.name || e.ingredients || Object.keys(e.lines).length) {
      setErrors(e);
      const firstLine = form.lines.find((l) => e.lines[l.chefIngredientId]);
      if (!e.name && firstLine) document.getElementById(`line-${firstLine.chefIngredientId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true);
    setBanner('');
    try {
      const payload = buildDishPayload(form);
      const saved = isEdit ? await dishService.update(id, payload) : await dishService.create(payload);
      // ទៅ Dish Detail (UX 9.2 → 9.4); replace ដើម្បី Back មិនត្រឡប់ Form
      navigate(`/dishes/${encodeURIComponent(saved.id)}`, {
        replace: true,
        state: { toast: isEdit ? 'updated' : 'created' },
      });
    } catch (err) {
      applyApiErrors(err);
    } finally {
      setSaving(false);
    }
  };

  const leave = () => {
    if (location.key !== 'default') return navigate(-1);
    return navigate(isEdit ? `/dishes/${encodeURIComponent(id)}` : '/dishes', { replace: true });
  };
  const onBack = () => (dirty ? setDiscardOpen(true) : leave());

  const title = isEdit ? t('form.titleEdit') : t('form.titleNew');

  if (status !== 'ready') {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        <PageHeader title={title} backTo="/dishes" backLabel={t('back')} />
        <main className="mx-auto max-w-md px-5 pt-10 text-center text-slate-500">
          {status === 'loading' && (
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          )}
          {status === 'notfound' && (
            <>
              <p>{t('form.notFound')}</p>
              <Link to="/dishes" className="mt-4 inline-block font-medium text-emerald-700">{t('form.backToList')}</Link>
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
    <div className="min-h-[100dvh] bg-slate-50 pb-44">
      <PageHeader title={title} onBack={onBack} backLabel={t('back')} />

      <main className="mx-auto max-w-md space-y-5 px-5 pt-6">
        {dropped.length > 0 && (
          <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[15px] text-amber-900">
            {t('form.droppedWarning', { names: dropped.join(', ') })}
          </div>
        )}

        {banner && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{banner}</span>
          </div>
        )}

        <AuthInput label={t('form.name')} placeholder={t('form.namePlaceholder')} value={form.name}
          error={errors.name} maxLength={120} onChange={(e) => patch({ name: e.target.value })} />

        <TextArea label={t('form.description')} rows={3} value={form.description}
          onChange={(e) => patch({ description: e.target.value })} />

        <AuthInput label={t('form.imageUrl')} type="url" inputMode="url" placeholder="https://" value={form.imageUrl}
          error={errors.imageUrl} autoComplete="off" onChange={(e) => patch({ imageUrl: e.target.value })} />

        <TagPicker label={t('form.tags')} value={form.tags} options={tagOptions} onChange={(tags) => patch({ tags })} />

        <section aria-labelledby="ingredients-title" className="space-y-3">
          <h2 id="ingredients-title" className="text-lg font-semibold text-slate-900">{t('form.ingredients')}</h2>

          {errors.ingredients && (
            <p role="alert" className="text-sm text-red-600">{errors.ingredients}</p>
          )}

          {form.lines.length > 0 && (
            <ul className="space-y-3">
              {form.lines.map((line) => (
                <DishIngredientRow key={line.chefIngredientId} line={line}
                  error={errors.lines[line.chefIngredientId]}
                  onChange={(q) => setQuantity(line.chefIngredientId, q)}
                  onRemove={() => removeLine(line.chefIngredientId)} />
              ))}
            </ul>
          )}

          <button type="button" onClick={() => setPickerOpen(true)}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 font-semibold text-emerald-700 active:bg-emerald-50">
            <PlusIcon width={20} height={20} />
            {t('form.addIngredient')}
          </button>
        </section>
      </main>

      <StickyFooter>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-[15px] text-slate-600">{t('form.totalCost')}</span>
          <span className="text-xl font-bold tabular-nums text-emerald-700" aria-live="polite">{formatPrice(total)}</span>
        </div>
        <PrimaryButton loading={saving} onClick={onSave}>{t('form.save')}</PrimaryButton>
        <p className="mt-1.5 text-center text-xs text-slate-400">{t('form.totalNote')}</p>
      </StickyFooter>

      {pickerOpen && (
        <IngredientPickerSheet existingIds={existingIds} onClose={() => setPickerOpen(false)} onConfirm={onPick} />
      )}

      <ConfirmModal
        open={discardOpen}
        destructive
        title={t('form.discardTitle')}
        message={t('form.discardMessage')}
        confirmLabel={t('form.discardConfirm')}
        cancelLabel={t('form.keepEditing')}
        onConfirm={() => { setDiscardOpen(false); leave(); }}
        onCancel={() => setDiscardOpen(false)}
      />
    </div>
  );
}
