import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { menuSetService } from '../services/menuSetService';
import { formatPrice } from '../utils/format';
import { getErrorMessage } from '../utils/errors';
import PageHeader from '../components/PageHeader';
import ActionSheet from '../components/ui/ActionSheet';
import ConfirmModal from '../components/ui/ConfirmModal';
import StatusBadge from '../components/ui/StatusBadge';
import Toast from '../components/ui/Toast';
import { AlertIcon, BowlIcon, ChevronRightIcon, MoreIcon } from '../components/ui/Icons';

export default function MenuSetDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation('menuSets');
  const navigate = useNavigate();
  const location = useLocation();

  const [menuSet, setMenuSet] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | notfound | error
  const [loadError, setLoadError] = useState('');
  const [banner, setBanner] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // archive | delete
  const [busy, setBusy] = useState(null); // archive | delete
  const [toast, setToast] = useState(location.state?.toast || '');
  const closeToast = useCallback(() => setToast(''), []);

  // ទាញថ្មីរាល់ពេលចូល (ថ្លៃ Dish ប្រែតាមស្តុក — US-42)
  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setMenuSet(await menuSetService.getById(id));
      setStatus('ready');
    } catch (err) {
      if (err.code === 'MENU_SET_NOT_FOUND') return setStatus('notfound');
      setLoadError(getErrorMessage(err));
      setStatus('error');
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const onArchive = async () => {
    setBusy('archive');
    try {
      await menuSetService.archive(id);
      navigate('/menu-sets', { replace: true, state: { toast: 'archived' } });
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
      await menuSetService.remove(id);
      navigate('/menu-sets', { replace: true, state: { toast: 'deleted' } });
    } catch (err) {
      setConfirm(null);
      setBanner(getErrorMessage(err)); // INVALID_REFERENCE → "កំពុងប្រើប្រាស់"
    } finally {
      setBusy(null);
    }
  };

  const leave = () => (location.key === 'default' ? navigate('/menu-sets', { replace: true }) : navigate(-1));

  if (status !== 'ready') {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        <PageHeader title={t('list.title')} backTo="/menu-sets" backLabel={t('back')} />
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

  const editTo = `/menu-sets/${encodeURIComponent(menuSet.id)}/edit`;

  // Archived: លុបបានតែប៉ុណ្ណោះ (គ្មាន Restore — Gap #81)
  const actions = menuSet.isArchived
    ? [{ key: 'delete', label: t('detail.menu.delete'), destructive: true, onSelect: () => setConfirm('delete') }]
    : [
        { key: 'edit', label: t('detail.menu.edit'), onSelect: () => navigate(editTo) },
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
      <PageHeader title={menuSet.name} onBack={leave} backLabel={t('back')} right={menuBtn} />

      <main className="mx-auto max-w-md space-y-5 px-5 pt-5">
        {banner && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{banner}</span>
          </div>
        )}

        {/* Total cost summary */}
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">{t('detail.total')}</p>
              <p className="text-3xl font-bold tabular-nums text-emerald-700">
                {menuSet.totalCost != null ? formatPrice(menuSet.totalCost) : t('list.noCost')}
              </p>
            </div>
            {menuSet.isArchived && <StatusBadge tone="neutral">{t('detail.archivedBadge')}</StatusBadge>}
          </div>
          <p className="mt-2 text-sm text-slate-500">{t('list.dishCount', { count: menuSet.dishCount })}</p>
        </section>

        {/* Dishes (read view) */}
        <section aria-labelledby="dishes-title" className="space-y-3">
          <h2 id="dishes-title" className="text-lg font-semibold text-slate-900">{t('detail.dishes')}</h2>
          {menuSet.dishes.length > 0 ? (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
              {menuSet.dishes.map((d, i) => (
                <li key={d.dishId}>
                  <Link to={`/dishes/${encodeURIComponent(d.dishId)}`}
                    className="flex min-h-[64px] items-center gap-3 px-4 py-2 active:bg-slate-50">
                    <span className="w-5 shrink-0 text-center text-sm font-medium text-slate-400">{i + 1}</span>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-300">
                      {d.imageUrl ? (
                        <img src={d.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <BowlIcon width={22} height={22} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-base font-medium text-slate-800">{d.name}</span>
                    <span className="shrink-0 font-semibold text-slate-900">{formatPrice(d.cost)}</span>
                    <ChevronRightIcon className="shrink-0 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-slate-500 shadow-card">
              {t('detail.noDishes')}
            </p>
          )}
        </section>

        {!menuSet.isArchived && (
          <Link to={editTo}
            className="flex h-[52px] w-full items-center justify-center rounded-xl bg-emerald-600 text-base font-semibold text-white shadow-btn active:bg-emerald-800">
            {t('detail.edit')}
          </Link>
        )}
      </main>

      <ActionSheet open={menuOpen} title={t('detail.menu.title')} cancelLabel={t('detail.menu.cancel')}
        onClose={() => setMenuOpen(false)} actions={actions} />

      <ConfirmModal
        open={confirm === 'archive'}
        loading={busy === 'archive'}
        title={t('detail.archiveTitle', { name: menuSet.name })}
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
        title={t('detail.deleteTitle', { name: menuSet.name })}
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
