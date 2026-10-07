import { useCallback, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDishes } from '../hooks/useDishes';
import { useDishView } from '../hooks/useDishView';
import PageHeader from '../components/PageHeader';
import TabSwitcher from '../components/ui/TabSwitcher';
import ViewToggle from '../components/ui/ViewToggle';
import Toast from '../components/ui/Toast';
import NestedFilterChips from '../components/ingredients/NestedFilterChips';
import DishCard from '../components/dishes/DishCard';
import { BowlIcon, PlusIcon } from '../components/ui/Icons';

export default function DishListPage() {
  const { t } = useTranslation('dishes');
  const location = useLocation();
  const [tab, setTab] = useState('active'); // active | archived
  const archived = tab === 'archived';
  const { items, status, error, reload } = useDishes({ archived });
  const [view, setView] = useDishView();
  const [filter, setFilter] = useState({ parentId: null, subId: null }); // parentId = tag

  const [toast, setToast] = useState(location.state?.toast || '');
  const closeToast = useCallback(() => setToast(''), []);

  const changeTab = (key) => {
    setTab(key);
    setFilter({ parentId: null, subId: null });
  };

  // គ្មាន Endpoint បញ្ជី Tag (Gap #61) → បង្កើត Chip ពី Dish ទាំងអស់
  const chips = useMemo(() => {
    const tags = [...new Set(items.flatMap((d) => d.tags))].sort((a, b) => a.localeCompare(b, 'km'));
    return tags.map((tag) => ({ id: tag, name: tag }));
  }, [items]);

  const visible = useMemo(
    () => items.filter((d) => !filter.parentId || d.tags.includes(filter.parentId)),
    [items, filter.parentId],
  );

  const toggle = (
    <ViewToggle
      value={view}
      onChange={setView}
      labels={{ group: t('view.label'), list: t('view.list'), grid: t('view.grid') }}
      className="-mr-2"
    />
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-28">
      <PageHeader title={t('list.title')} backTo="/" backLabel={t('back')} right={toggle} />

      <main className="mx-auto max-w-md space-y-4 px-5 pt-5">
        <TabSwitcher
          tabs={[
            { key: 'active', label: t('list.tabs.active') },
            { key: 'archived', label: t('list.tabs.archived') },
          ]}
          active={tab}
          onChange={changeTab}
        />

        {chips.length > 0 && <NestedFilterChips items={chips} value={filter} onChange={setFilter} />}

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
              <BowlIcon width={28} height={28} />
            </span>
            <p className="mt-4 text-slate-600">{archived ? t('list.emptyArchived') : t('list.empty')}</p>
            {!archived && (
              <Link to="/dishes/new"
                className="mt-5 inline-flex h-12 items-center rounded-xl bg-emerald-600 px-6 font-semibold text-white shadow-btn active:bg-emerald-800">
                {t('list.emptyCta')}
              </Link>
            )}
          </div>
        )}

        {status === 'ready' && items.length > 0 && visible.length === 0 && (
          <p className="py-10 text-center text-slate-500">{t('list.noMatch')}</p>
        )}

        {status === 'ready' && visible.length > 0 && view === 'list' && (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
            {visible.map((d) => <DishCard key={d.id} dish={d} view="list" />)}
          </ul>
        )}

        {status === 'ready' && visible.length > 0 && view === 'grid' && (
          <div className="grid grid-cols-2 gap-3">
            {visible.map((d) => <DishCard key={d.id} dish={d} view="grid" />)}
          </div>
        )}
      </main>

      <Link
        to="/dishes/new"
        aria-label={t('list.add')}
        className="fixed bottom-[max(calc(var(--bottom-nav-h,0px)_+_1.5rem),1.5rem,env(safe-area-inset-bottom))] right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-btn active:bg-emerald-800"
      >
        <PlusIcon width={26} height={26} />
      </Link>

      <Toast message={toast ? t(`toast.${toast}`) : ''} onClose={closeToast} />
    </div>
  );
}
