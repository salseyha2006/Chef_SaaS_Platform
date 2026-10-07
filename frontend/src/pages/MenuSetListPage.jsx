import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMenuSets } from '../hooks/useMenuSets';
import PageHeader from '../components/PageHeader';
import TabSwitcher from '../components/ui/TabSwitcher';
import Toast from '../components/ui/Toast';
import MenuSetCard from '../components/menuSets/MenuSetCard';
import { PlusIcon, ReceiptIcon } from '../components/ui/Icons';

export default function MenuSetListPage() {
  const { t } = useTranslation('menuSets');
  const location = useLocation();
  const [tab, setTab] = useState('active'); // active | archived
  const archived = tab === 'archived';
  const { items, status, error, reload } = useMenuSets({ archived });

  const [toast, setToast] = useState(location.state?.toast || '');
  const closeToast = useCallback(() => setToast(''), []);

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-28">
      <PageHeader title={t('list.title')} backTo="/" backLabel={t('back')} />

      <main className="mx-auto max-w-md space-y-4 px-5 pt-5">
        <TabSwitcher
          tabs={[
            { key: 'active', label: t('list.tabs.active') },
            { key: 'archived', label: t('list.tabs.archived') },
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
              <ReceiptIcon width={28} height={28} />
            </span>
            <p className="mt-4 text-slate-600">{archived ? t('list.emptyArchived') : t('list.empty')}</p>
            {!archived && (
              <Link to="/menu-sets/new"
                className="mt-5 inline-flex h-12 items-center rounded-xl bg-emerald-600 px-6 font-semibold text-white shadow-btn active:bg-emerald-800">
                {t('list.emptyCta')}
              </Link>
            )}
          </div>
        )}

        {status === 'ready' && items.length > 0 && (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
            {items.map((m) => <MenuSetCard key={m.id} menuSet={m} />)}
          </ul>
        )}
      </main>

      <Link
        to="/menu-sets/new"
        aria-label={t('list.add')}
        className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-btn active:bg-emerald-800"
      >
        <PlusIcon width={26} height={26} />
      </Link>

      <Toast message={toast ? t(`toast.${toast}`) : ''} onClose={closeToast} />
    </div>
  );
}
