import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../../context/SubscriptionContext';
import ConfirmModal from '../ui/ConfirmModal';

/** Modal ណែនាំ Upgrade (មិនមែន Error ធម្មតា) — បើកពេល api.js ផ្ញើ 'subscription:required' */
export default function UpgradePrompt() {
  const { t } = useTranslation('subscription');
  const navigate = useNavigate();
  const { promptOpen, closePrompt } = useSubscription();

  return (
    <ConfirmModal
      open={promptOpen}
      title={t('upgradePrompt.title')}
      message={t('upgradePrompt.message')}
      confirmLabel={t('upgradePrompt.confirm')}
      cancelLabel={t('upgradePrompt.cancel')}
      onConfirm={() => {
        closePrompt();
        navigate('/pricing');
      }}
      onCancel={closePrompt}
    />
  );
}