import { CreditCardIcon } from '../ui/Icons';

const LOGO = {
  ABA_PAYWAY: { label: 'ABA', cls: 'bg-sky-100 text-sky-700' },
  WING: { label: 'Wing', cls: 'bg-lime-100 text-lime-700' },
};

export function PaymentMethodLogo({ provider }) {
  const l = LOGO[provider];
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
        l ? l.cls : 'bg-slate-100 text-slate-600'
      }`}
    >
      {l ? l.label : <CreditCardIcon width={22} height={22} />}
    </span>
  );
}

/** Radio Card (touch ≥ 64px)។ props: name, provider, title, subtitle, badge, checked, disabled, onSelect */
export default function PaymentMethodRadio({
  name, provider, title, subtitle, badge, checked, disabled = false, onSelect,
}) {
  return (
    <label
      className={`flex min-h-[64px] items-center gap-3 rounded-2xl border bg-white px-4 py-3 transition focus-within:ring-4 focus-within:ring-emerald-200 ${
        checked ? 'border-emerald-500' : 'border-slate-200'
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer active:bg-slate-50'}`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
        className="sr-only"
      />
      <PaymentMethodLogo provider={provider} />
      <span className="min-w-0 flex-1">
        <span className="block break-words text-[15px] font-semibold text-slate-900">{title}</span>
        {subtitle && <span className="block text-sm text-slate-500">{subtitle}</span>}
      </span>
      {badge && (
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {badge}
        </span>
      )}
      <span
        aria-hidden
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? 'border-emerald-600' : 'border-slate-300'
        }`}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />}
      </span>
    </label>
  );
}