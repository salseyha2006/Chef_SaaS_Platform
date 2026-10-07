import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BasketIcon, BowlIcon, CalendarIcon } from '../ui/Icons';

const glyph = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const HomeGlyph = (p) => (
  <svg width="22" height="22" {...glyph} {...p}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v10h5v-6h4v6h5V10" />
  </svg>
);

const DotsGlyph = (p) => (
  <svg width="22" height="22" {...glyph} {...p}>
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
  </svg>
);

const TABS = [
  { to: '/', key: 'home', icon: HomeGlyph },
  { to: '/ingredients', key: 'stock', icon: BasketIcon },
  { to: '/dishes', key: 'dishes', icon: BowlIcon },
  { to: '/events', key: 'events', icon: CalendarIcon },
  { to: '/profile', key: 'more', icon: DotsGlyph },
];

/**
 * Bottom Navigation (UX 11.1): 🏠 Home | 🥕 Stock | 🍜 Dishes | 📅 Events | ⚙️ More
 * Fixed + Safe-area. Touch target ≥ 44px (កម្ពស់ 64px). z-30 (ក្រោម Sheet/Modal z-40/50)
 */
export default function BottomNavBar() {
  const { t } = useTranslation('dashboard');
  return (
    <nav aria-label={t('nav.label')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex h-16 max-w-md">
        {TABS.map(({ to, key, icon: Icon }) => (
          <li key={key} className="flex-1">
            <NavLink to={to} end
              className={({ isActive }) =>
                `flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 text-[11px] transition-colors ${
                  isActive ? 'font-semibold text-emerald-700' : 'font-medium text-slate-500 active:text-slate-700'
                }`
              }>
              <Icon width={22} height={22} />
              <span className="max-w-full truncate px-1">{t(`nav.${key}`)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
