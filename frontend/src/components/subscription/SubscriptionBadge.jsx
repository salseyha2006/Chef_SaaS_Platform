import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../../context/SubscriptionContext';
import { useLanguage } from '../../hooks/useLanguage';
import { formatDate } from '../../utils/format';
import { AlertIcon, CheckCircleIcon, ChevronRightIcon, ClockIcon, SparklesIcon } from '../ui/Icons';

const TONES = {
  info: { box: 'border-sky-200 bg-sky-50 text-sky-900', icon: 'bg-sky-100 text-sky-600' },
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: 'bg-emerald-100 text-emerald-600' },
  warning: { box: 'border-amber-200 bg-amber-50 text-amber-900', icon: 'bg-amber-100 text-amber-600' },
  danger: { box: 'border-red-200 bg-red-50 text-red-900', icon: 'bg-red-100 text-red-600' },
};
const KIND_ICON = {
  trial: SparklesIcon, paid: CheckCircleIcon, canceled: ClockIcon, expired: AlertIcon, none: AlertIcon,
};

/** Global Badge: Trial "សល់ N ថ្ងៃ" / Paid "ផុតកំណត់ថ្ងៃទី..." · ពណ៌តាម tone · ប៉ះ → Pricing ឬ Manage */
export default function SubscriptionBadge({ className = '' }) {
  const { t } = useTranslation('subscription');
  const { lang } = useLanguage();
  const { subscription, state, status } = useSubscription();

  if (status === 'idle' || status === 'loading') {
    return <div aria-hidden className={`h-16 animate-pulse rounded-2xl bg-slate-100 ${className}`} />;
  }
  if (!state) return null; // បរាជ័យទាញ → លាក់ស្ងាត់

  const date = formatDate(state.endDate, lang);
  const planName = subscription?.plan?.name;
  const copy = {
    trial: { title: t('badge.trial', { days: state.daysRemaining }), hint: t('badge.trialLabel') },
    paid: { title: t('badge.paid', { date }), hint: planName },
    canceled: { title: t('badge.canceled', { date }), hint: planName },
    expired: { title: t('badge.expired'), hint: t('badge.expiredHint') },
    none: { title: t('badge.none'), hint: t('badge.expiredHint') },
  }[state.kind];

  const tone = TONES[state.tone] || TONES.info;
  const Icon = KIND_ICON[state.kind];
  const to = state.kind === 'paid' || state.kind === 'canceled' ? '/subscription' : '/pricing';

  return (
    <Link
      to={to}
      className={`flex min-h-[64px] items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition active:opacity-90 ${tone.box} ${className}`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}>
        <Icon width={20} height={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block break-words text-[15px] font-semibold leading-snug">{copy.title}</span>
        {copy.hint && <span className="block break-words text-sm leading-snug opacity-80">{copy.hint}</span>}
      </span>
      <ChevronRightIcon className="shrink-0 opacity-60" />
    </Link>
  );
}