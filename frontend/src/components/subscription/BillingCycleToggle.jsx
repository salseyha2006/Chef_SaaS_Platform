import { useTranslation } from 'react-i18next';

/** US-13 Scenario 2: Monthly ⇄ Yearly។ props: value ('monthly'|'yearly'), onChange, savePercent */
export default function BillingCycleToggle({ value, onChange, savePercent = 20, className = '' }) {
  const { t } = useTranslation('subscription');
  const items = [
    { value: 'monthly', label: t('pricing.monthly') },
    { value: 'yearly', label: t('pricing.yearly', { percent: savePercent }) },
  ];

  return (
    <div
      role="radiogroup"
      aria-label={t('pricing.cycleLabel')}
      className={`grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 ${className}`}
    >
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(it.value)}
            className={`min-h-[48px] rounded-xl px-2 text-sm font-semibold leading-snug transition ${
              active ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}