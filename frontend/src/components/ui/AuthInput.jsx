import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from './Icons';

/**
 * variants: text | email | password
 * Icon នាំមុខដោយស្វ័យប្រវត្តិ (email → ✉, password → 🔒); ជំនួសបានដោយ prop `icon`
 */
export default function AuthInput({
  label,
  type = 'text',
  error,
  icon: CustomIcon,
  className = '',
  autoComplete,
  ...rest
}) {
  const id = useId();
  const { t } = useTranslation('login');
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  const inputType = isPassword ? (show ? 'text' : 'password') : type;
  const inputMode = type === 'email' ? 'email' : undefined;
  const ac = autoComplete || (type === 'email' ? 'email' : isPassword ? 'current-password' : undefined);
  const LeadIcon = CustomIcon || (type === 'email' ? MailIcon : isPassword ? LockIcon : null);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-[15px] font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {LeadIcon && (
          <span
            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
              error ? 'text-red-400' : 'text-slate-400'
            }`}
          >
            <LeadIcon />
          </span>
        )}
        <input
          id={id}
          type={inputType}
          inputMode={inputMode}
          autoComplete={ac}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`h-[52px] w-full rounded-xl border bg-white text-base text-slate-900 outline-none transition focus:ring-4 ${
            LeadIcon ? 'pl-12' : 'pl-4'
          } ${isPassword ? 'pr-12' : 'pr-4'} ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
              : 'border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-emerald-100'
          }`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? t('hidePassword') : t('showPassword')}
            className="absolute right-0 top-0 flex h-[52px] w-12 items-center justify-center rounded-r-xl text-slate-400 hover:text-slate-600"
          >
            {show ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
