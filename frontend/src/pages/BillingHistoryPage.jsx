import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { billingService } from '../services/billingService';
import { useLanguage } from '../hooks/useLanguage';
import { formatMonthYear } from '../utils/format';
import { groupByMonth } from '../utils/billing';
import { getErrorMessage } from '../utils/errors';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/ui/PrimaryButton';
import TransactionRow from '../components/billing/TransactionRow';
import { AlertIcon, ChevronRightIcon, ReceiptIcon, StoreIcon } from '../components/ui/Icons';

const PAGE_SIZE = 20;
const FILTERS = ['all', 'success', 'failed', 'refunded'];

export default function BillingHistoryPage() {
  const { t } = useTranslation('billing');
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setTxs(await billingService.getTransactions());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(
    () => (filter === 'all' ? txs : txs.filter((x) => x.status === filter)),
    [txs, filter],
  );
  const groups = useMemo(() => groupByMonth(filtered.slice(0, limit)), [filtered, limit]);

  const changeFilter = (f) => { setFilter(f); setLimit(PAGE_SIZE); };
  const hasMore = filtered.length > limit;

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-10">
      <PageHeader title={t('history.title')} backTo="/profile" backLabel={t('back')} />

      <main className="mx-auto max-w-md px-5 pt-5">
        <Link
          to="/billing/info"
          className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 shadow-card active:bg-slate-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <StoreIcon width={20} height={20} />
          </span>
          <span className="flex-1 text-base font-medium text-slate-800">{t('history.infoLink')}</span>
          <ChevronRightIcon className="text-slate-400" />
        </Link>

        {/* Filter Chips (Scroll Snap) */}
        <div className="-mx-5 mt-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1" role="group" aria-label={t('history.title')}>
          {FILTERS.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => changeFilter(f)}
                className={`min-h-[44px] shrink-0 snap-start rounded-full border px-4 text-[15px] font-medium transition ${
                  active
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 active:bg-slate-50'
                }`}
              >
                {t(`history.filters.${f}`)}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="mt-6 space-y-3" aria-busy="true">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-[72px] animate-pulse rounded-2xl bg-slate-100" />)}
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 space-y-3">
            <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
              <span>{error || t('history.loadError')}</span>
            </div>
            <PrimaryButton variant="secondary" onClick={load}>{t('history.retry')}</PrimaryButton>
          </div>
        )}

        {/* Scenario 2: Empty State */}
        {!loading && !error && txs.length === 0 && (
          <div className="mt-10 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ReceiptIcon width={30} height={30} />
            </span>
            <h2 className="mt-4 text-lg font-bold text-slate-900">{t('history.empty')}</h2>
            <p className="mt-1 text-[15px] text-slate-500">{t('history.emptyHint')}</p>
            <div className="mt-6">
              <PrimaryButton onClick={() => navigate('/pricing')}>{t('history.choosePlan')}</PrimaryButton>
            </div>
          </div>
        )}

        {!loading && !error && txs.length > 0 && filtered.length === 0 && (
          <p className="mt-10 text-center text-[15px] text-slate-500">{t('history.emptyFiltered')}</p>
        )}

        {!loading && !error && groups.map((g) => (
          <section key={g.key} aria-label={formatMonthYear(g.items[0].createdAt, lang)}>
            <h2 className="px-1 pb-2 pt-6 text-sm font-semibold text-slate-500">
              {formatMonthYear(g.items[0].createdAt, lang)}
            </h2>
            <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
              {g.items.map((tx) => <TransactionRow key={tx.id} tx={tx} lang={lang} />)}
            </div>
          </section>
        ))}

        {/* Scenario 4: ផ្ទុកបន្ថែម */}
        {!loading && !error && hasMore && (
          <div className="mt-6">
            <PrimaryButton variant="secondary" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
              {t('history.loadMore')}
            </PrimaryButton>
          </div>
        )}
      </main>
    </div>
  );
}