import { useTranslation } from 'react-i18next';
import PrimaryButton from '../ui/PrimaryButton';
import { AlertIcon } from '../ui/Icons';

/**
 * Full-screen (UX 5.2)។ status: 'processing' | 'failed'
 * failed → onRetry (ព្យាយាមម្តងទៀត) / onChangeMethod (ប្តូរមធ្យោបាយ)
 */
export default function PaymentProcessingOverlay({ status, message, onRetry, onChangeMethod }) {
  const { t } = useTranslation('payment');
  const failed = status === 'failed';

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
      aria-busy={!failed}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overscroll-none bg-white px-6 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
    >
      <div className="w-full max-w-sm text-center">
        {failed ? (
          <span className="mx-auto flex h-16 w-16 animate-pop items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertIcon width={34} height={34} />
          </span>
        ) : (
          <span className="mx-auto block h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
        )}

        <h2 className="mt-6 text-xl font-bold text-slate-900">
          {failed ? t('processing.failedTitle') : t('processing.title')}
        </h2>
        <p className="mt-2 text-[15px] text-slate-500">{failed ? message : t('processing.hint')}</p>

        {failed && (
          <div className="mt-8 space-y-3">
            <PrimaryButton onClick={onRetry}>{t('processing.retry')}</PrimaryButton>
            <PrimaryButton variant="secondary" onClick={onChangeMethod}>
              {t('processing.changeMethod')}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}