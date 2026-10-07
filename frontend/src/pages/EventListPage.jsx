import { useCallback, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEvents } from '../hooks/useEvents';
import { isUpcoming } from '../utils/event';
import PageHeader from '../components/PageHeader';
import TabSwitcher from '../components/ui/TabSwitcher';
import Toast from '../components/ui/Toast';
import CalendarGlyph from '../components/ui/CalendarGlyph';
import EventCard from '../components/events/EventCard';
import { PlusIcon } from '../components/ui/Icons';

export default function EventListPage() {
  const { t } = useTranslation('events');
  const location = useLocation();
  const { items, status, error, reload } = useEvents();
  const [tab, setTab] = useState('upcoming'); // upcoming | past | all

  const [toast, setToast] = useState(location.state?.toast || '');
  const closeToast = useCallback(() => setToast(''), []);

  const visible = useMemo(() => {
    const byDate = (a, b) => new Date(a.eventDate) - new Date(b.eventDate);
    if (tab === 'upcoming') return items.filter((e) => isUpcoming(e.eventDate)).sort(byDate); // ជិតបំផុតមុន
    if (tab === 'past') return items.filter((e) => !isUpcoming(e.eventDate)).sort((a, b) => byDate(b, a));
    return [...items].sort((a, b) => byDate(b, a));
  }, [items, tab]);

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-28">
      <PageHeader title={t('list.title')} backTo="/" backLabel={t('back')} />

      <main className="mx-auto max-w-md space-y-4 px-5 pt-5">
        <TabSwitcher
          tabs={[
            { key: 'upcoming', label: t('list.tabs.upcoming') },
            { key: 'past', label: t('list.tabs.past') },
            { key: 'all', label: t('list.tabs.all') },
          ]}
          active={tab}
          onChange={setTab}
        />

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

        {status === 'ready' && items.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-card">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CalendarGlyph width={28} height={28} />
            </span>
            <p className="mt-4 text-slate-600">{t('list.empty')}</p>
            <Link to="/events/new"
              className="mt-5 inline-flex h-12 items-center rounded-xl bg-emerald-600 px-6 font-semibold text-white shadow-btn active:bg-emerald-800">
              {t('list.emptyCta')}
            </Link>
          </div>
        )}

        {status === 'ready' && items.length > 0 && visible.length === 0 && (
          <p className="py-10 text-center text-slate-500">{t('list.noMatch')}</p>
        )}

        {status === 'ready' && visible.length > 0 && (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
            {visible.map((e) => <EventCard key={e.id} event={e} />)}
          </ul>
        )}
      </main>

      <Link
        to="/events/new"
        aria-label={t('list.add')}
        className="fixed bottom-[max(calc(var(--bottom-nav-h,0px)_+_1.5rem),1.5rem,env(safe-area-inset-bottom))] right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-btn active:bg-emerald-800"
      >
        <PlusIcon width={26} height={26} />
      </Link>

      <Toast message={toast ? t(`toast.${toast}`) : ''} onClose={closeToast} />
    </div>
  );
}
