import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { dishService } from '../services/dishService';
import { formatPrice } from '../utils/format';
import { getErrorMessage } from '../utils/errors';
import PageHeader from '../components/PageHeader';
import ActionSheet from '../components/ui/ActionSheet';
import ConfirmModal from '../components/ui/ConfirmModal';
import StatusBadge from '../components/ui/StatusBadge';
import Toast from '../components/ui/Toast';
import CostBreakdownTable from '../components/dishes/CostBreakdownTable';
import { AlertIcon, BowlIcon, MoreIcon } from '../components/ui/Icons';

export default function DishDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation('dishes');
  const navigate = useNavigate();
  const location = useLocation();

  const [dish, setDish] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | notfound | error
  const [loadError, setLoadError] = useState('');
  const [banner, setBanner] = useState('');
  const [inUse, setInUse] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // archive | delete
  const [busy, setBusy] = useState(null); // duplicate | archive | delete
  const [toast, setToast] = useState(location.state?.toast || '');
  const closeToast = useCallback(() => setToast(''), []);

  // ទាញថ្មីរាល់ពេលចូល/ប្តូរ id (ថ្លៃដើម Dynamic — US-42 S2)
  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setDish(await dishService.getById(id));
      setStatus('ready');
    } catch (err) {
      if (err.code === 'DISH_NOT_FOUND') return setStatus('notfound');
      setLoadError(getErrorMessage(err));
      setStatus('error');
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Duplicate → ទៅ Detail ថ្មី (Component ដដែល, id ប្តូរ) → អាន Toast ពី state
  useEffect(() => {
    setToast(location.state?.toast || '');
    setBanner('');
    setInUse(0);
  }, [location.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDuplicate = async () => {
    setBusy('duplicate');
    setBanner('');
    try {
      const copy = await dishService.duplicate(id);
      navigate(`/dishes/${encodeURIComponent(copy.id)}`, { state: { toast: 'duplicated' } });
    } catch (err) {
      setBanner(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const onArchive = async () => {
    setBusy('archive');
    try {
      await dishService.archive(id);
      navigate('/dishes', { replace: true, state: { toast: 'archived' } });
    } catch (err) {
      setConfirm(null);
      setBanner(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const onDelete = async () => {
    setBusy('delete');
    try {
      await dishService.remove(id);
      navigate('/dishes', { replace: true, state: { toast: 'deleted' } });
    } catch (err) {
      setConfirm(null);
      if (err.code === 'DISH_IN_USE') setInUse(Number(err.params?.count) || 1);
      else setBanner(getErrorMessage(err)); // INVALID_REFERENCE → "កំពុងប្រើប្រាស់"
    } finally {
      setBusy(null);
    }
  };

  const leave = () => (location.key === 'default' ? navigate('/dishes', { replace: true }) : navigate(-1));

  if (status !== 'ready') {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        <PageHeader title={t('list.title')} backTo="/dishes" backLabel={t('back')} />
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

  const editTo = `/dishes/${encodeURIComponent(dish.id)}/edit`;

  // Dish ដែល Archived: មើល + លុបបានតែប៉ុណ្ណោះ (Gap #63 គ្មាន Restore)
  const actions = dish.isArchived
    ? [{ key: 'delete', label: t('detail.menu.delete'), destructive: true, onSelect: () => setConfirm('delete') }]
    : [
        { key: 'edit', label: t('detail.menu.edit'), onSelect: () => navigate(editTo) },
        { key: 'duplicate', label: t('detail.menu.duplicate'), onSelect: onDuplicate },
        { key: 'archive', label: t('detail.menu.archive'), onSelect: () => setConfirm('archive') },
        { key: 'delete', label: t('detail.menu.delete'), destructive: true, onSelect: () => setConfirm('delete') },
      ];

  const menuBtn = (
    <button type="button" onClick={() => setMenuOpen(true)} aria-label={t('detail.menu.title')}
      className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 active:bg-slate-200">
      <MoreIcon />
    </button>
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-12">
      <PageHeader title={dish.name} onBack={leave} backLabel={t('back')} right={menuBtn} />

      <main className="mx-auto max-w-md space-y-5 px-5 pt-5">
        {inUse > 0 && (
          <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[15px] text-amber-900">
            <p>{t('detail.inUseWarning', { count: inUse })}</p>
            {!dish.isArchived && (
              <button type="button" onClick={() => setConfirm('archive')}
                className="mt-2 min-h-[44px] font-semibold text-amber-900 underline">
                {t('detail.archiveInstead')}
              </button>
            )}
          </div>
        )}

        {banner && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{banner}</span>
          </div>
        )}

        {/* Summary */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
          {dish.imageUrl ? (
            <img src={dish.imageUrl} alt="" className="aspect-[16/9] w-full object-cover" />
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center bg-slate-100 text-slate-300">
              <BowlIcon width={48} height={48} />
            </div>
          )}
          <div className="space-y-3 p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{t('detail.total')}</p>
                <p className="text-3xl font-bold tabular-nums text-emerald-700">
                  {dish.totalCost != null ? formatPrice(dish.totalCost) : t('list.noCost')}
                </p>
              </div>
              {dish.isArchived && <StatusBadge tone="neutral">{t('detail.archivedBadge')}</StatusBadge>}
            </div>
            {dish.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {dish.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{tag}</span>
                ))}
              </div>
            )}
            {dish.description && <p className="whitespace-pre-line text-[15px] text-slate-600">{dish.description}</p>}
          </div>
        </section>

        {/* Cost Breakdown */}
        <section aria-labelledby="breakdown-title" className="space-y-3">
          <h2 id="breakdown-title" className="text-lg font-semibold text-slate-900">{t('detail.breakdown')}</h2>
          {dish.costBreakdown.length > 0 ? (
            <CostBreakdownTable rows={dish.costBreakdown} total={dish.totalCost ?? 0} />
          ) : (
            <p className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-slate-500 shadow-card">
              {t('detail.noBreakdown')}
            </p>
          )}
        </section>

        {!dish.isArchived && (
          <Link to={editTo}
            className="flex h-[52px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-base font-semibold text-slate-800 shadow-sm active:bg-slate-100">
            {t('detail.menu.edit')}
          </Link>
        )}
      </main>

      {busy === 'duplicate' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/60" role="status" aria-label={t('detail.duplicating')}>
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
        </div>
      )}

      <ActionSheet open={menuOpen} title={t('detail.menu.title')} cancelLabel={t('detail.menu.cancel')}
        onClose={() => setMenuOpen(false)} actions={actions} />

      <ConfirmModal
        open={confirm === 'archive'}
        loading={busy === 'archive'}
        title={t('detail.archiveTitle', { name: dish.name })}
        message={t('detail.archiveMessage')}
        confirmLabel={t('detail.archiveConfirm')}
        cancelLabel={t('detail.cancel')}
        onConfirm={onArchive}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmModal
        open={confirm === 'delete'}
        destructive
        loading={busy === 'delete'}
        title={t('detail.deleteTitle', { name: dish.name })}
        message={t('detail.deleteMessage')}
        confirmLabel={t('detail.deleteConfirm')}
        cancelLabel={t('detail.cancel')}
        onConfirm={onDelete}
        onCancel={() => setConfirm(null)}
      />

      <Toast message={toast ? t(`toast.${toast}`) : ''} onClose={closeToast} />
    </div>
  );
}
