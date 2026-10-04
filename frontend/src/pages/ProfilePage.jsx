import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import LanguageSwitch from '../components/LanguageSwitch';
import SubscriptionBadge from '../components/subscription/SubscriptionBadge';
import Avatar from '../components/ui/Avatar';
import ConfirmModal from '../components/ui/ConfirmModal';
import Toast from '../components/ui/Toast';
import {
  ChevronRightIcon, CreditCardIcon, GlobeIcon, HelpIcon, LockIcon, LogOutIcon, UserIcon,
  ReceiptIcon, StoreIcon, TagIcon, BasketIcon
} from '../components/ui/Icons';

function Row({ to, state, icon: Icon, children, trailing }) {
  const inner = (
    <>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon width={20} height={20} />
      </span>
      <span className="flex-1 text-left text-base font-medium text-slate-800">{children}</span>
      {trailing ?? <ChevronRightIcon className="text-slate-400" />}
    </>
  );
  const cls = 'flex min-h-[56px] w-full items-center gap-3 px-4 py-2 transition active:bg-slate-50';
  return to ? <Link to={to} state={state} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>;
}

export default function ProfilePage() {
  const { t } = useTranslation('profile');
  const { t: ts } = useTranslation('subscription');
  const { t: tb } = useTranslation('billing');
  const { t: tc } = useTranslation('catalog');
  const { t: ti } = useTranslation('ingredients');
  const { chef, logout, syncLanguage } = useAuth();
  const location = useLocation();

  const [toast, setToast] = useState(location.state?.toast || '');
  const closeToast = useCallback(() => setToast(''), []);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const onLogout = async () => {
    setLoggingOut(true);
    await logout(); // status → guest → ProtectedRoute នាំទៅ /login
  };

  const isGoogleOnly = chef?.authProvider === 'google'; // មានតែក្រោយ /auth/me; បើមិនទាន់ដឹង បង្ហាញ "ផ្លាស់ប្តូរ"

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-10">
      <PageHeader title={t('title')} backTo="/" backLabel={t('back')} />

      <main className="mx-auto max-w-md px-5 pt-6">
        <section className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <Avatar src={chef?.avatarUrl} name={chef?.displayName} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-xl font-bold text-slate-900">{chef?.displayName}</p>
            <p className="truncate text-[15px] text-slate-500">{chef?.email}</p>
          </div>
        </section>

        <SubscriptionBadge className="mt-5" />

        <section className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
          <Row to="/profile/edit" icon={UserIcon}>{t('menu.edit')}</Row>
          <Row to="/subscription" icon={CreditCardIcon}>{ts('menu.title')}</Row>
          <Row to="/billing" icon={ReceiptIcon}>{tb('menu.history')}</Row>
          <Row to="/billing/info" icon={StoreIcon}>{tb('menu.info')}</Row>
          <Row to="/settings/catalog" icon={TagIcon}>{tc('menu.title')}</Row>
          
          {/* ប្តូរពី /ingredients/browse ទៅជា /ingredients (Stock) */}
          <Row to="/ingredients" icon={BasketIcon}>{ti('menu.stock')}</Row>
          
          <Row to="/profile/password" icon={LockIcon}>
            {isGoogleOnly ? t('menu.setPassword') : t('menu.password')}
          </Row>
          <Row icon={GlobeIcon} trailing={<LanguageSwitch hideIcon onChange={syncLanguage} />}>
            {t('menu.language')}
          </Row>
          <Row to="/onboarding" state={{ replay: true }} icon={HelpIcon}>{t('menu.tutorial')}</Row>
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="flex min-h-[56px] w-full items-center gap-3 px-4 py-2 text-red-600 transition active:bg-red-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <LogOutIcon width={20} height={20} />
            </span>
            <span className="text-base font-medium">{t('menu.logout')}</span>
          </button>
        </section>
      </main>

      <ConfirmModal
        open={confirmOpen}
        destructive
        loading={loggingOut}
        title={t('logoutConfirm.title')}
        message={t('logoutConfirm.message')}
        confirmLabel={t('logoutConfirm.confirm')}
        cancelLabel={t('logoutConfirm.cancel')}
        onConfirm={onLogout}
        onCancel={() => setConfirmOpen(false)}
      />

      <Toast message={toast ? t(`toast.${toast}`) : ''} onClose={closeToast} />
    </div>
  );
}