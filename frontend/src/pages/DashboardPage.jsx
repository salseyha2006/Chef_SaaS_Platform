import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { formatMonthYear, formatPrice } from '../utils/format';
import { isSameMonth } from '../utils/event';
import Avatar from '../components/ui/Avatar';
import CalendarGlyph from '../components/ui/CalendarGlyph';
import SubscriptionBadge from '../components/subscription/SubscriptionBadge';
import SummaryStatCard from '../components/dashboard/SummaryStatCard';
import EventCard from '../components/events/EventCard';
import { BasketIcon, BowlIcon, ReceiptIcon } from '../components/ui/Icons';

function Shortcut({ to, icon: Icon, children }) {
  return (
    <Link to={to}
      className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition active:bg-slate-50">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Icon width={22} height={22} />
      </span>
      <span className="text-center text-sm font-medium text-slate-800">{children}</span>
    </Link>
  );
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation('dashboard');
  const { chef } = useAuth();
  const { data, events, status, error, reload } = useDashboard();

  const monthEventCount = useMemo(
    () => (events ? events.filter((e) => isSameMonth(e.eventDate)).length : null),
    [events],
  );
  const monthLabel = formatMonthYear(new Date(), i18n.language);
  const dash = '—';

  const noEventsAtAll = events !== null && events.length === 0; // US-54 S3

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-10">
      <main className="mx-auto max-w-md space-y-6 px-5 pt-6">
        {/* Header */}
        <Link to="/profile" className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card active:bg-slate-50">
          <Avatar src={chef?.avatarUrl} name={chef?.displayName} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {t('greeting', { name: chef?.displayName || chef?.email || '' })}
            </p>
            <p className="truncate text-sm text-slate-500">{chef?.email}</p>
          </div>
        </Link>

        <SubscriptionBadge />

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

        {status === 'ready' && data && (
          <>
            {/* Summary Cards (US-54 S2) */}
            <section aria-label={t('stats.title')} className="grid grid-cols-2 gap-3">
              <SummaryStatCard label={t('stats.eventsMonth')} hint={monthLabel}
                value={monthEventCount === null ? dash : String(monthEventCount)} />
              <SummaryStatCard label={t('stats.spendingMonth')} hint={monthLabel} tone="money"
                value={formatPrice(data.monthlySpending)} />
              <SummaryStatCard label={t('stats.dishes')} value={String(data.dishCount)} />
              <SummaryStatCard label={t('stats.menuSets')} value={String(data.menuSetCount)} />
            </section>

            {/* Upcoming events (US-54 S1) */}
            <section aria-labelledby="upcoming-title" className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 id="upcoming-title" className="text-lg font-semibold text-slate-900">{t('upcoming.title')}</h2>
                {!noEventsAtAll && (
                  <Link to="/events" className="flex min-h-[44px] items-center text-sm font-medium text-emerald-700">
                    {t('upcoming.viewAll')}
                  </Link>
                )}
              </div>

              {data.upcomingEvents.length > 0 ? (
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
                  {data.upcomingEvents.map((e) => <EventCard key={e.id} event={e} />)}
                </ul>
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-card">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CalendarGlyph width={28} height={28} />
                  </span>
                  <p className="mt-4 text-slate-600">{noEventsAtAll ? t('upcoming.empty') : t('upcoming.none')}</p>
                  <Link to="/events/new"
                    className="mt-5 inline-flex h-12 items-center rounded-xl bg-emerald-600 px-6 font-semibold text-white shadow-btn active:bg-emerald-800">
                    {noEventsAtAll ? t('upcoming.emptyCta') : t('upcoming.create')}
                  </Link>
                </div>
              )}
            </section>
          </>
        )}

        {/* Shortcuts (Menu Sets មិនមែន Tab → ចូលតាមទីនេះ) */}
        <section aria-labelledby="shortcuts-title" className="space-y-3">
          <h2 id="shortcuts-title" className="text-lg font-semibold text-slate-900">{t('shortcuts.title')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Shortcut to="/ingredients" icon={BasketIcon}>{t('shortcuts.stock')}</Shortcut>
            <Shortcut to="/dishes" icon={BowlIcon}>{t('shortcuts.dishes')}</Shortcut>
            <Shortcut to="/menu-sets" icon={ReceiptIcon}>{t('shortcuts.menuSets')}</Shortcut>
            <Shortcut to="/events" icon={CalendarGlyph}>{t('shortcuts.events')}</Shortcut>
          </div>
          <Link to="/settings/catalog"
            className="flex min-h-[48px] items-center justify-center rounded-xl text-sm font-medium text-slate-600 active:bg-slate-100">
            {t('shortcuts.catalog')}
          </Link>
        </section>
      </main>
    </div>
  );
}
