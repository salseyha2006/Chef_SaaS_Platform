import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate, formatPrice } from '../../utils/format';
import { TX_STATUS_TONE } from '../../utils/billing';
import StatusBadge from '../ui/StatusBadge';
import { AlertIcon, CheckCircleIcon, ChevronRightIcon, ClockIcon, ReceiptIcon } from '../ui/Icons';

const ICON = { success: CheckCircleIcon, failed: AlertIcon, pending: ClockIcon, refunded: ReceiptIcon };
const ICON_TONE = {
  success: 'bg-emerald-50 text-emerald-600',
  failed: 'bg-red-50 text-red-600',
  pending: 'bg-amber-50 text-amber-600',
  refunded: 'bg-slate-100 text-slate-500',
};

/** UX 6.2: Icon status | កាលបរិច្ឆេទ | ចំនួនទឹកប្រាក់ | Chevron */
export default function TransactionRow({ tx, lang }) {
  const { t } = useTranslation('billing');
  const Icon = ICON[tx.status] || ReceiptIcon;

  return (
    <Link
      to={`/billing/transactions/${tx.id}`}
      className="flex min-h-[72px] items-center gap-3 px-4 py-3 transition active:bg-slate-50"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          ICON_TONE[tx.status] || 'bg-slate-100 text-slate-500'
        }`}
      >
        <Icon width={20} height={20} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block break-words font-semibold text-slate-900">
          {tx.planName || t('history.fallbackTitle')}
        </span>
        <span className="block text-sm text-slate-500">{formatDate(tx.createdAt, lang)}</span>
      </span>

      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className={`font-semibold ${tx.status === 'refunded' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
          {formatPrice(tx.amount, tx.currency)}
        </span>
        {tx.status && (
          <StatusBadge tone={TX_STATUS_TONE[tx.status] || 'neutral'}>
            {t(`status.${tx.status}`, { defaultValue: tx.status })}
          </StatusBadge>
        )}
      </span>

      <ChevronRightIcon className="shrink-0 text-slate-400" />
    </Link>
  );
}