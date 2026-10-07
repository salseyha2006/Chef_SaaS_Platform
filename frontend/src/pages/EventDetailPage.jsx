import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { eventService } from '../services/eventService';
import { useEventExcelExport } from '../hooks/useEventExcelExport';
import { formatEventDate, fromDateInput, isUpcoming } from '../utils/event';
import { getErrorMessage } from '../utils/errors';
import PageHeader from '../components/PageHeader';
import ActionSheet from '../components/ui/ActionSheet';
import ConfirmModal from '../components/ui/ConfirmModal';
import StatusBadge from '../components/ui/StatusBadge';
import TabSwitcher from '../components/ui/TabSwitcher';
import Toast from '../components/ui/Toast';
import CalendarGlyph from '../components/ui/CalendarGlyph';
import EventItemRow from '../components/events/EventItemRow';
import EventItemPickerSheet from '../components/events/EventItemPickerSheet';
import CloneEventSheet from '../components/events/CloneEventSheet';
import EventCostTab from '../components/events/EventCostTab';
import EventShoppingTab from '../components/events/EventShoppingTab';
import ExcelExportDialog from '../components/events/ExcelExportDialog';
import { AlertIcon, MoreIcon, PlusIcon } from '../components/ui/Icons';

export default function EventDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation('events');
  const navigate = useNavigate();
  const location = useLocation();

  const [event, setEvent] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | notfound | error
  const [loadError, setLoadError] = useState('');
  const [banner, setBanner] = useState('');
  const [tab, setTab] = useState('dishes'); // dishes | cost | shopping
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneError, setCloneError] = useState('');
  const [removeTarget, setRemoveTarget] = useState(null); // { type:'dish'|'menuSet', id, name }
  const [busy, setBusy] = useState(null); // add | remove | clone
  const [toast, setToast] = useState(location.state?.toast || '');
  const closeToast = useCallback(() => setToast(''), []);

  // US-59: Export Excel (Hook ត្រូវនៅមុន early return)
  const hasData = Boolean(event && (event.dishes.length > 0 || event.menuSets.length > 0));
  const exporter = useEventExcelExport(id, hasData);

  // ទាញថ្មីរាល់ពេលចូល/ប្តូរ id
  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setEvent(await eventService.getById(id));
      setStatus('ready');
    } catch (err) {
      if (err.code === 'EVENT_NOT_FOUND') return setStatus('notfound');
      setLoadError(getErrorMessage(err));
      setStatus('error');
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Clone → ទៅ Detail ថ្មី (Component ដដែល, id ប្តូរ) → អាន Toast ពី state ហើយ Reset
  useEffect(() => {
    setToast(location.state?.toast || '');
    setBanner('');
    setTab('dishes');
    setCloneOpen(false);
  }, [location.key]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== US-52: បន្ថែម Dish / Menu Set
  const onAdd = async (selection) => {
    setBusy('add');
    setBanner('');
    try {
      setEvent(await eventService.addItems(id, selection));
      setPickerOpen(false);
      setToast('itemsAdded');
    } catch (err) {
      setPickerOpen(false);
      setBanner(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const onRemove = async () => {
    const target = removeTarget;
    if (!target) return;
    setBusy('remove');
    try {
      if (target.type === 'dish') await eventService.removeDish(id, target.id);
      else await eventService.removeMenuSet(id, target.id);
      setEvent(await eventService.getById(id));
      setRemoveTarget(null);
      setToast('removed');
    } catch (err) {
      setRemoveTarget(null);
      setBanner(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  // ===== US-51: Clone
  const onClone = async ({ name, eventDate }) => {
    setBusy('clone');
    setCloneError('');
    try {
      const copy = await eventService.clone(id, { name, eventDate: fromDateInput(eventDate) });
      navigate(`/events/${encodeURIComponent(copy.id)}`, { state: { toast: 'cloned' } });
    } catch (err) {
      setCloneError(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const leave = () => (location.key === 'default' ? navigate('/events', { replace: true }) : navigate(-1));

  if (status !== 'ready') {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        <PageHeader title={t('list.title')} backTo="/events" backLabel={t('back')} />
        <main className="mx-auto max-w-md px-5 pt-10 text-center text-slate-500">
          {status === 'loading' && (
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          )}
          {status === 'notfound' && (
            <>
              <p>{t('form.notFound')}</p>
              <Link to="/events" className="mt-4 inline-block font-medium text-emerald-700">{t('form.backToList')}</Link>
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

  const upcoming = isUpcoming(event.eventDate);
  const hasItems = event.dishes.length > 0 || event.menuSets.length > 0;
  const existingDishIds = new Set(event.dishes.map((d) => d.dishId));
  const existingMenuSetIds = new Set(event.menuSets.map((m) => m.menuSetId));
  const itemsKey = [
    event.tableCount,
    event.dishes.map((d) => d.dishId).join(','),
    event.menuSets.map((m) => m.menuSetId).join(','),
  ].join('|');

  const actions = [
    { key: 'edit', label: t('detail.menu.edit'), onSelect: () => navigate(`/events/${encodeURIComponent(event.id)}/edit`) },
    { key: 'clone', label: t('detail.menu.clone'), onSelect: () => { setCloneError(''); setCloneOpen(true); } },
    { key: 'excel', label: t('detail.menu.excel'), onSelect: exporter.request },
  ];

  const menuBtn = (
    <button type="button" onClick={() => setMenuOpen(true)} aria-label={t('detail.menu.title')}
      className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 active:bg-slate-200">
      <MoreIcon />
    </button>
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-12">
      <PageHeader title={event.name} onBack={leave} backLabel={t('back')} right={menuBtn} />

      <main className="mx-auto max-w-md space-y-5 px-5 pt-5">
        {banner && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{banner}</span>
          </div>
        )}

        {/* Summary */}
        <section className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            upcoming ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
          }`}>
            <CalendarGlyph width={24} height={24} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-slate-900">{formatEventDate(event.eventDate, i18n.language)}</p>
            <p className="text-sm text-slate-500">{t('list.tables', { count: event.tableCount })}</p>
          </div>
          <StatusBadge tone={upcoming ? 'success' : 'neutral'}>
            {upcoming ? t('list.status.upcoming') : t('list.status.past')}
          </StatusBadge>
        </section>

        <TabSwitcher
          tabs={[
            { key: 'dishes', label: t('detail.tabs.dishes') },
            { key: 'cost', label: t('detail.tabs.cost') },
            { key: 'shopping', label: t('detail.tabs.shopping') },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === 'dishes' && (
          <>
            <button type="button" onClick={() => setPickerOpen(true)}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 font-semibold text-emerald-700 active:bg-emerald-50">
              <PlusIcon width={20} height={20} />
              {t('detail.add')}
            </button>

            {!hasItems && (
              <p className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-slate-500 shadow-card">
                {t('detail.emptyItems')}
              </p>
            )}

            {event.menuSets.length > 0 && (
              <section aria-labelledby="sets-title" className="space-y-3">
                <h2 id="sets-title" className="text-lg font-semibold text-slate-900">{t('detail.menuSetsTitle')}</h2>
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
                  {event.menuSets.map((m) => (
                    <EventItemRow key={m.menuSetId} kind="menuSet"
                      to={`/menu-sets/${encodeURIComponent(m.menuSetId)}`}
                      name={m.name} cost={m.totalCost} archived={m.isArchived}
                      removeLabel={t('detail.removeAria', { name: m.name })}
                      onRemove={() => setRemoveTarget({ type: 'menuSet', id: m.menuSetId, name: m.name })} />
                  ))}
                </ul>
              </section>
            )}

            {event.dishes.length > 0 && (
              <section aria-labelledby="dishes-title" className="space-y-3">
                <h2 id="dishes-title" className="text-lg font-semibold text-slate-900">{t('detail.dishesTitle')}</h2>
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
                  {event.dishes.map((d) => (
                    <EventItemRow key={d.dishId} kind="dish"
                      to={`/dishes/${encodeURIComponent(d.dishId)}`}
                      name={d.name} imageUrl={d.imageUrl} cost={d.totalCost} archived={d.isArchived}
                      removeLabel={t('detail.removeAria', { name: d.name })}
                      onRemove={() => setRemoveTarget({ type: 'dish', id: d.dishId, name: d.name })} />
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        {tab === 'cost' && (
          <EventCostTab
            eventId={event.id}
            tableCount={event.tableCount}
            itemsKey={itemsKey}
            onAddDishes={() => setTab('dishes')}
          />
        )}

        {tab === 'shopping' && (
          <EventShoppingTab
            eventId={event.id}
            itemsKey={itemsKey}
            onAddDishes={() => setTab('dishes')}
          />
        )}
      </main>

      {pickerOpen && (
        <EventItemPickerSheet
          existingDishIds={existingDishIds}
          existingMenuSetIds={existingMenuSetIds}
          onClose={() => setPickerOpen(false)}
          onConfirm={onAdd}
        />
      )}

      {busy === 'add' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60" role="status" aria-label={t('detail.adding')}>
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
        </div>
      )}

      {cloneOpen && (
        <CloneEventSheet
          sourceName={event.name}
          loading={busy === 'clone'}
          error={cloneError}
          onClose={() => setCloneOpen(false)}
          onSubmit={onClone}
        />
      )}

      <ActionSheet open={menuOpen} title={t('detail.menu.title')} cancelLabel={t('detail.menu.cancel')}
        onClose={() => setMenuOpen(false)} actions={actions} />

      <ConfirmModal
        open={Boolean(removeTarget)}
        destructive
        loading={busy === 'remove'}
        title={t('detail.removeTitle', { name: removeTarget?.name ?? '' })}
        message={t('detail.removeMessage')}
        confirmLabel={t('detail.removeConfirm')}
        cancelLabel={t('detail.cancel')}
        onConfirm={onRemove}
        onCancel={() => setRemoveTarget(null)}
      />

      <Toast message={toast ? t(`toast.${toast}`) : ''} onClose={closeToast} />
      <ExcelExportDialog exporter={exporter} />
    </div>
  );
}
