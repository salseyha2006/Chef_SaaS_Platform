import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { unitService } from '../services/unitService';
import { categoryService } from '../services/categoryService';
import { useCatalogConfig } from '../hooks/useCatalogConfig';
import PageHeader from '../components/PageHeader';
import TabSwitcher from '../components/ui/TabSwitcher';
import ConfirmModal from '../components/ui/ConfirmModal';
import Toast from '../components/ui/Toast';
import PresetChecklist from '../components/catalog/PresetChecklist';
import UnitFormSheet from '../components/catalog/UnitFormSheet';
import CategoryFormSheet from '../components/catalog/CategoryFormSheet';
import { AlertIcon, PlusIcon } from '../components/ui/Icons';

const TABS = ['units', 'categories'];

export default function CatalogConfigPage() {
  const { t } = useTranslation('catalog');
  const [params, setParams] = useSearchParams();
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'units';

  const units = useCatalogConfig(unitService);
  const categories = useCatalogConfig(categoryService);
  const current = tab === 'units' ? units : categories;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [archiveRow, setArchiveRow] = useState(null);
  const [toast, setToast] = useState('');
  const closeToast = useCallback(() => setToast(''), []);

  const unitMeta = (u) =>
    [u.abbreviation, u.unitType && t(`unit.type.${u.unitType}`), u.conversionRate ? `× ${u.conversionRate}` : null]
      .filter(Boolean)
      .join(' · ');

  const onImport = async (row) => {
    if (await current.importPreset(row)) setToast('imported');
  };

  const onConfirmArchive = async () => {
    const row = archiveRow;
    const ok = await current.archive(row);
    setArchiveRow(null);
    if (ok) setToast('archived');
  };

  const tabs = TABS.map((key) => ({ key, label: t(`tabs.${key}`) }));

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-28">
      <PageHeader title={t('title')} backTo="/profile" backLabel={t('back')} />

      <main className="mx-auto max-w-md px-5 pt-5">
        <TabSwitcher tabs={tabs} active={tab} onChange={(key) => setParams({ tab: key }, { replace: true })} />

        <div className="mt-5">
          {current.error && current.status === 'ready' && (
            <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
              <span>{current.error}</span>
            </div>
          )}

          {current.status === 'loading' && (
            <div className="flex justify-center py-16">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
            </div>
          )}

          {current.status === 'error' && (
            <div className="rounded-2xl border border-red-100 bg-white p-6 text-center shadow-card">
              <p className="text-slate-600">{current.error}</p>
              <button
                type="button"
                onClick={current.reload}
                className="mt-4 min-h-[44px] rounded-xl border border-slate-200 px-5 font-medium text-slate-800 active:bg-slate-100"
              >
                {t('retry')}
              </button>
            </div>
          )}

          {current.status === 'ready' && (
            <PresetChecklist
              presetRows={current.presetRows}
              customRows={current.customRows}
              busyKey={current.busyKey}
              renderMeta={tab === 'units' ? unitMeta : undefined}
              onImport={onImport}
              onArchive={setArchiveRow}
              onBlockedTap={() => setToast('alreadyInUse')}
            />
          )}
        </div>
      </main>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-label={t(`add.${tab}`)}
        className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-btn active:bg-emerald-800"
      >
        <PlusIcon width={26} height={26} />
      </button>

      <UnitFormSheet
        open={sheetOpen && tab === 'units'}
        onClose={() => setSheetOpen(false)}
        onCreated={() => setToast('created')}
      />
      <CategoryFormSheet
        open={sheetOpen && tab === 'categories'}
        onClose={() => setSheetOpen(false)}
        onCreated={() => setToast('created')}
      />

      <ConfirmModal
        open={Boolean(archiveRow)}
        destructive
        loading={Boolean(archiveRow) && current.busyKey === archiveRow.key}
        title={t('archive.title', { name: archiveRow?.name })}
        message={t('archive.message')}
        confirmLabel={t('archive.confirm')}
        cancelLabel={t('cancel')}
        onConfirm={onConfirmArchive}
        onCancel={() => setArchiveRow(null)}
      />

      <Toast message={toast ? t(`toast.${toast}`) : ''} onClose={closeToast} />
    </div>
  );
}