import { useTranslation } from 'react-i18next';
import ConfirmModal from '../ui/ConfirmModal';
import Toast from '../ui/Toast';

/**
 * Modal បញ្ជាក់ + Toast លទ្ធផល/Error សម្រាប់ Export Excel (UX 11.9)
 * props: exporter (ត្រឡប់ពី useEventExcelExport)
 */
export default function ExcelExportDialog({ exporter }) {
  const { t } = useTranslation('events');
  return (
    <>
      <ConfirmModal
        open={exporter.confirmOpen}
        loading={exporter.busy}
        title={t('excel.title')}
        message={t('excel.message')}
        confirmLabel={t('excel.confirm')}
        cancelLabel={t('excel.cancel')}
        onConfirm={exporter.confirm}
        onCancel={exporter.cancel}
      />
      <Toast
        message={exporter.error || (exporter.toast ? t(`excel.toast.${exporter.toast}`) : '')}
        onClose={exporter.closeToast}
      />
    </>
  );
}
