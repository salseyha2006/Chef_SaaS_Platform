import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEventChecklist } from '../hooks/useEventChecklist';
import { useStock } from '../hooks/useStock';
import { groupByCategory, OTHER_KEY } from '../utils/shopping';
import PageHeader from '../components/PageHeader';
import ProgressBar from '../components/ui/ProgressBar';
import TabSwitcher from '../components/ui/TabSwitcher';
import Toast from '../components/ui/Toast';
import CheckoffRow from '../components/events/CheckoffRow';
import { AlertIcon } from '../components/ui/Icons';

export default function EventChecklistPage() {
  const { id } = useParams();
  const { t } = useTranslation('events');
  const navigate = useNavigate();
  const location = useLocation();
  const list = useEventChecklist(id);
  const stock = useStock(); // សម្រាប់ Category (ផ្គូផ្គងតាម id)

  const [filter, setFilter] = useState('all'); // all | pending
  const [toast, setToast] = useState('');
  const closeToast = useCallback(() => setToast(''), []);

  // S4: ទិញគ្រប់ ១០០% → សារជោគជ័យ
  useEffect(() => {
    if (list.justCompleted > 0) setToast('completed');
  }, [list.justCompleted]);

  const categoryById = useMemo(() => new Map(stock.items.map((s) => [s.id, s.category])), [stock.items]);

  const total = list.items.length;
  const done = useMemo(() => list.items.filter((i) => i.isPurchased).length, [list.items]);
  const percent = total ? Math.round((done / total) * 100) : 0; // S3: គណនា Frontend
  const complete = total > 0 && done === total;

  // Group តាម Category → ក្នុងក្រុម: មិនទាន់ទិញមុន ទិញរួចនៅក្រោម (S1), Undo → ត្រឡប់ទីតាំងដើម (S2)
  const groups = useMemo(() => {
    return groupByCategory(list.items, categoryById)
      .map((g) => {
        const pendingRows = g.items.filter((i) => !i.isPurchased);
        const doneRows = g.items.filter((i) => i.isPurchased);
        return {
          key: g.key,
          done: doneRows.length,
          count: g.items.length,
          rows: filter === 'pending' ? pendingRows : [...pendingRows, ...doneRows],
        };
      })
      .filter((g) => g.rows.length > 0);
  }, [list.items, categoryById, filter]);

  const leave = () =>
    location.key === 'default' ? navigate(`/events/${encodeURIComponent(id)}`, { replace: true }) : navigate(-1);

  if (list.status !== 'ready') {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        <PageHeader title={t('checklist.title')} onBack={leave} backLabel={t('back')} />
        <main className="mx-auto max-w-md px-5 pt-10 text-center text-slate-500">
          {list.status === 'loading' && (
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          )}
          {list.status === 'notfound' && (
            <>
              <p>{t('form.notFound')}</p>
              <Link to="/events" className="mt-4 inline-block font-medium text-emerald-700">{t('form.backToList')}</Link>
            </>
          )}
          {list.status === 'error' && (
            <>
              <p>{list.error}</p>
              <button type="button" onClick={list.reload}
                className="mt-4 min-h-[44px] rounded-xl border border-slate-200 px-5 font-medium text-slate-800">
                {t('retry')}
              </button>
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-10">
      <PageHeader title={t('checklist.title')} onBack={leave} backLabel={t('back')} />

      <main className="mx-auto max-w-md space-y-4 px-5 pt-5">
        {list.actionError && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span className="flex-1">{list.actionError}</span>
            <button type="button" onClick={list.clearActionError} aria-label={t('checklist.dismiss')}
              className="-my-2 -mr-2 flex h-11 w-11 items-center justify-center text-red-700">✕</button>
          </div>
        )}

        {total === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-card">
            <p className="text-slate-600">{t('checklist.empty')}</p>
            <Link to={`/events/${encodeURIComponent(id)}`}
              className="mt-5 inline-flex h-12 items-center rounded-xl bg-emerald-600 px-6 font-semibold text-white shadow-btn active:bg-emerald-800">
              {t('checklist.emptyCta')}
            </Link>
          </div>
        ) : (
          <>
            {/* Progress (S3) */}
            <section className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-sm text-slate-500">{list.eventName}</p>
                <p className="shrink-0 text-lg font-bold tabular-nums text-emerald-700" aria-live="polite">{percent}%</p>
              </div>
              <ProgressBar value={percent} label={t('checklist.progressAria')} />
              <p className="text-sm text-slate-600">{t('checklist.progress', { done, total })}</p>
            </section>

            {complete && (
              <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center font-semibold text-emerald-800">
                {t('checklist.completeBanner')}
              </div>
            )}

            <TabSwitcher
              tabs={[
                { key: 'all', label: t('checklist.filter.all', { count: total }) },
                { key: 'pending', label: t('checklist.filter.pending', { count: total - done }) },
              ]}
              active={filter}
              onChange={setFilter}
            />

            {groups.length === 0 && (
              <p className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-slate-500 shadow-card">
                {t('checklist.nothingLeft')}
              </p>
            )}

            {groups.map((g) => (
              <section key={g.key} className="space-y-2">
                <h2 className="flex items-baseline justify-between px-1 text-sm font-semibold text-slate-500">
                  <span>{g.key === OTHER_KEY ? t('cost.other') : g.key}</span>
                  <span className="tabular-nums">{g.done}/{g.count}</span>
                </h2>
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 shadow-card">
                  {g.rows.map((item) => (
                    <CheckoffRow key={item.chefIngredientId} item={item}
                      busy={list.pending.has(item.chefIngredientId)}
                      onToggle={() => list.toggle(item.chefIngredientId)} />
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </main>

      <Toast message={toast ? t(`checklist.toast.${toast}`) : ''} onClose={closeToast} />
    </div>
  );
}
