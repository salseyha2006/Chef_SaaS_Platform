import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { dishService } from '../services/dishService';
import { menuSetService } from '../services/menuSetService';
import { normalizeName } from '../utils/catalog';
import { buildMenuSetPayload, calcTotal, snapshotForm } from '../utils/menuSet';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import PageHeader from '../components/PageHeader';
import AuthInput from '../components/ui/AuthInput';
import ConfirmModal from '../components/ui/ConfirmModal';
import PrimaryButton from '../components/ui/PrimaryButton';
import TabSwitcher from '../components/ui/TabSwitcher';
import StickyTotalBar from '../components/menuSets/StickyTotalBar';
import DishPickRow from '../components/menuSets/DishPickRow';
import SelectedDishRow from '../components/menuSets/SelectedDishRow';
import { AlertIcon, SearchIcon } from '../components/ui/Icons';

export default function MenuSetFormPage() {
  const { id } = useParams(); // មាន → Edit (US-47), គ្មាន → Create (US-45)
  const isEdit = Boolean(id);
  const { t } = useTranslation('menuSets');
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]); // [{ dishId, name, imageUrl, cost }]
  const [baseline, setBaseline] = useState(() => snapshotForm('', []));
  const [dishes, setDishes] = useState([]); // Dish សកម្មទាំងអស់ (UI Dish)
  const [status, setStatus] = useState('loading'); // loading | ready | notfound | error
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState('all'); // all | selected
  const [query, setQuery] = useState('');
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [saving, setSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [list, detail] = await Promise.all([
        dishService.getList(),
        isEdit ? menuSetService.getById(id) : Promise.resolve(null),
      ]);
      setDishes(list);
      if (detail) {
        if (detail.isArchived) {
          navigate(`/menu-sets/${encodeURIComponent(id)}`, { replace: true });
          return;
        }
        const sel = detail.dishes.map((d) => ({ dishId: d.dishId, name: d.name, imageUrl: d.imageUrl, cost: d.cost }));
        setName(detail.name);
        setSelected(sel);
        setBaseline(snapshotForm(detail.name, sel));
        setTab('selected');
      }
      setStatus('ready');
    } catch (err) {
      if (err.code === 'MENU_SET_NOT_FOUND') return setStatus('notfound');
      setLoadError(getErrorMessage(err));
      setStatus('error');
    }
  }, [id, isEdit, navigate]);

  useEffect(() => { load(); }, [load]);

  const dirty = snapshotForm(name, selected) !== baseline;
  const total = useMemo(() => calcTotal(selected), [selected]); // Real-time ក្នុង Client (US-49)
  const addedIds = useMemo(() => new Set(selected.map((s) => s.dishId)), [selected]);

  const visible = useMemo(() => {
    const q = normalizeName(query);
    return dishes.filter((d) => !q || normalizeName(d.name).includes(q));
  }, [dishes, query]);

  const clearFeedback = () => {
    setErrors({});
    setBanner('');
  };

  const addDish = (dish) => {
    if (addedIds.has(dish.id)) return; // US-45 S3
    setSelected((prev) => [
      ...prev,
      { dishId: dish.id, name: dish.name, imageUrl: dish.imageUrl, cost: dish.totalCost ?? 0 },
    ]);
    clearFeedback();
  };

  const removeDish = (dishId) => {
    setSelected((prev) => prev.filter((d) => d.dishId !== dishId));
    clearFeedback();
  };

  const moveDish = (index, delta) => {
    setSelected((prev) => {
      const to = index + delta;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  };

  const applyApiErrors = (err) => {
    const fe = getFieldErrors(err);
    if (!fe) return setBanner(getErrorMessage(err));
    const next = {};
    let other = '';
    Object.entries(fe).forEach(([field, msg]) => {
      if (field === 'name' || field === 'dishIds') next[field] = msg;
      else other = msg;
    });
    setErrors(next);
    if (other) setBanner(other);
  };

  const onSave = async () => {
    if (saving) return;
    const e = {};
    if (!name.trim()) e.name = t('form.validation.nameRequired');
    if (selected.length === 0) e.dishIds = t('form.validation.dishesRequired'); // US-45 S2
    if (e.name || e.dishIds) {
      setErrors(e);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true);
    setBanner('');
    try {
      const payload = buildMenuSetPayload(name, selected);
      const saved = isEdit ? await menuSetService.update(id, payload) : await menuSetService.create(payload);
      navigate(`/menu-sets/${encodeURIComponent(saved?.id ?? id)}`, {
        replace: true,
        state: { toast: isEdit ? 'updated' : 'created' },
      });
    } catch (err) {
      applyApiErrors(err); // MENU_SET_DISHES_INVALID → Banner
    } finally {
      setSaving(false);
    }
  };

  const leave = () => {
    if (location.key !== 'default') return navigate(-1);
    return navigate(isEdit ? `/menu-sets/${encodeURIComponent(id)}` : '/menu-sets', { replace: true });
  };
  const onBack = () => (dirty ? setDiscardOpen(true) : leave());

  const title = isEdit ? t('form.titleEdit') : t('form.titleNew');

  if (status !== 'ready') {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        <PageHeader title={title} backTo="/menu-sets" backLabel={t('back')} />
        <main className="mx-auto max-w-md px-5 pt-10 text-center text-slate-500">
          {status === 'loading' && (
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          )}
          {status === 'notfound' && (
            <>
              <p>{t('detail.notFound')}</p>
              <Link to="/menu-sets" className="mt-4 inline-block font-medium text-emerald-700">{t('detail.backToList')}</Link>
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

      <main className="mx-auto max-w-md space-y-4 px-5 pt-6">
        {banner && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{banner}</span>
          </div>
        )}

        <AuthInput label={t('form.name')} placeholder={t('form.namePlaceholder')} value={name}
          error={errors.name} maxLength={120}
          onChange={(e) => { setName(e.target.value); clearFeedback(); }} />

        <TabSwitcher
          tabs={[
            { key: 'all', label: t('form.tabs.all') },
            { key: 'selected', label: t('form.tabs.selected', { count: selected.length }) },
          ]}
          active={tab}
          onChange={setTab}
        />

        {errors.dishIds && <p role="alert" className="text-sm text-red-600">{errors.dishIds}</p>}

        {tab === 'all' && (
          <>
            <AuthInput type="search" icon={SearchIcon} placeholder={t('form.searchPlaceholder')}
              value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />

            {dishes.length === 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-card">
                <p className="text-slate-600">{t('form.allEmpty')}</p>
                <Link to="/dishes/new"
                  className="mt-5 inline-flex h-12 items-center rounded-xl bg-emerald-600 px-6 font-semibold text-white shadow-btn active:bg-emerald-800">
                  {t('form.allEmptyCta')}
                </Link>
              </div>
            )}

            {dishes.length > 0 && visible.length === 0 && (
              <p className="py-10 text-center text-slate-500">{t('form.noMatch')}</p>
            )}

            {visible.length > 0 && (
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
                {visible.map((d) => (
                  <DishPickRow key={d.id} dish={d} added={addedIds.has(d.id)} onAdd={() => addDish(d)} />
                ))}
              </ul>
            )}
          </>
        )}

        {tab === 'selected' && (
          selected.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-card">
              <p className="text-slate-600">{t('form.selectedEmpty')}</p>
              <button type="button" onClick={() => setTab('all')}
                className="mt-5 min-h-[48px] rounded-xl border border-slate-200 px-6 font-semibold text-slate-800 active:bg-slate-100">
                {t('form.selectedEmptyCta')}
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
              {selected.map((d, i) => (
                <SelectedDishRow key={d.dishId} dish={d} index={i} count={selected.length}
                  onMove={(delta) => moveDish(i, delta)} onRemove={() => removeDish(d.dishId)} />
              ))}
            </ul>
          )
        )}
      </main>

      <StickyTotalBar label={t('form.totalCost')} total={total} note={t('form.totalNote')}>
        <PrimaryButton loading={saving} onClick={onSave}>{t('form.save')}</PrimaryButton>
      </StickyTotalBar>

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
