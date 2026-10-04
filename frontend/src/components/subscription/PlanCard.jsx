import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/format';
import PrimaryButton from '../ui/PrimaryButton';
import { CheckIcon, SparklesIcon } from '../ui/Icons';

/** props: plan (UI Plan), isCurrent, onSelect(plan) · ប៊ូតុងនៅក្នុង Card ជានិច្ច មិនត្រូវលាក់ */
export default function PlanCard({ plan, isCurrent = false, onSelect }) {
  const { t } = useTranslation('subscription');
  const per = t(`pricing.per.${plan.billingCycle}`, { defaultValue: '' });

  return (
    <article
      className={`relative rounded-2xl border bg-white p-5 shadow-card ${
        plan.isRecommended ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-100'
      }`}
    >
      {plan.isRecommended && (
        <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-btn">
          <SparklesIcon width={14} height={14} />
          {t('pricing.recommended')}
        </span>
      )}

      <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight text-slate-900">
          {formatPrice(plan.price, plan.currency)}
        </span>
        <span className="text-slate-500">{per}</span>
      </p>

      {plan.features.length > 0 && (
        <ul className="mt-4 space-y-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-[15px] text-slate-700">
              <CheckIcon width={18} height={18} className="mt-1 shrink-0 text-emerald-600" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}

      <PrimaryButton
        className="mt-5"
        variant={plan.isRecommended ? 'primary' : 'secondary'}
        disabled={isCurrent}
        onClick={() => onSelect(plan)}
      >
        {isCurrent ? t('pricing.current') : t('pricing.select')}
      </PrimaryButton>
    </article>
  );
}