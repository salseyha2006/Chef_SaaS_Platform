import { useTranslation } from 'react-i18next';
import { isMethodSupported, PAYMENT_METHODS } from '../../config/paymentMethods';
import PaymentMethodRadio from './PaymentMethodRadio';
import { AlertIcon } from '../ui/Icons';

/** Key ដំបូង: Saved Default ដែលគាំទ្រ */
export function pickDefaultKey(saved) {
  const d = saved.find((s) => s.isDefault && isMethodSupported(s.provider));
  return d ? `saved:${d.id}` : null;
}

/** 'saved:<id>' | 'ABA_PAYWAY' → { paymentMethod, savedPaymentMethodId? } */
export function resolveMethodSelection(selected, saved) {
  if (!selected) return null;
  if (selected.startsWith('saved:')) {
    const s = saved.find((x) => `saved:${x.id}` === selected);
    return s ? { paymentMethod: s.provider, savedPaymentMethodId: s.id } : null;
  }
  return { paymentMethod: selected };
}

/** បញ្ជីជ្រើស Payment Method (Saved + ផ្សេងទៀត)។ props: saved, selected, onSelect(key), error */
export default function PaymentMethodPicker({ saved, selected, onSelect, error }) {
  const { t } = useTranslation('payment');
  return (
    <div>
      {saved.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-sm text-slate-500">{t('select.saved')}</p>
          <div className="space-y-3" role="radiogroup" aria-label={t('select.saved')}>
            {saved.map((s) => {
              const supported = isMethodSupported(s.provider);
              return (
                <PaymentMethodRadio
                  key={s.id}
                  name="retry-method"
                  provider={s.provider}
                  title={`${s.brand || t(`methods.${s.provider}`)} •••• ${s.last4}`}
                  subtitle={t(`methods.${s.provider}`)}
                  badge={!supported ? t('select.soon') : s.isDefault ? t('select.default') : null}
                  disabled={!supported}
                  checked={selected === `saved:${s.id}`}
                  onSelect={() => onSelect(`saved:${s.id}`)}
                />
              );
            })}
          </div>
        </div>
      )}

      <div>
        {saved.length > 0 && <p className="mb-2 text-sm text-slate-500">{t('select.other')}</p>}
        <div className="space-y-3" role="radiogroup" aria-label={t('select.title')}>
          {PAYMENT_METHODS.map((m) => (
            <PaymentMethodRadio
              key={m.id}
              name="retry-method"
              provider={m.id}
              title={t(`methods.${m.id}`)}
              badge={m.supported ? null : t('select.soon')}
              disabled={!m.supported}
              checked={selected === m.id}
              onSelect={() => onSelect(m.id)}
            />
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-red-600">
          <AlertIcon width={16} height={16} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}