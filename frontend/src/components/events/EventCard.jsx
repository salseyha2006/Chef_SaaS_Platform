import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CalendarGlyph from '../ui/CalendarGlyph';
import { ChevronRightIcon } from '../ui/Icons';
import { formatEventDate, isUpcoming } from '../../utils/event';

/**
 * Card Event (UX 11.2): ឈ្មោះ | កាលបរិច្ឆេទ | ចំនួនតុ | Status
 * props: event (UI Event ពី toEvent). ត្រឡប់ <li> (Page ជា Wrapper <ul>)
 */
export default function EventCard({ event }) {
  const { t, i18n } = useTranslation('events');
  const upcoming = isUpcoming(event.eventDate);
  return (
    <li>
      <Link to={`/events/${encodeURIComponent(event.id)}`}
        className="flex min-h-[72px] items-center gap-3 px-4 py-3 active:bg-slate-50">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          upcoming ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
        }`}>
          <CalendarGlyph width={22} height={22} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-medium text-slate-800">{event.name}</span>
          <span className="block truncate text-sm text-slate-500">
            {formatEventDate(event.eventDate, i18n.language)} · {t('list.tables', { count: event.tableCount })}
          </span>
        </span>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
          upcoming ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
        }`}>
          {upcoming ? t('list.status.upcoming') : t('list.status.past')}
        </span>
        <ChevronRightIcon className="shrink-0 text-slate-400" />
      </Link>
    </li>
  );
}
