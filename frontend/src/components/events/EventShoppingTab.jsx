import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEventShoppingList } from '../../hooks/useEventShoppingList';
import { useVendorPresets } from '../../hooks/useVendorPresets';
import { useStock } from '../../hooks/useStock';
import { useEventExcelExport } from '../../hooks/useEventExcelExport';
import { vendorPresetService } from '../../services/vendorPresetService';
import { getErrorMessage } from '../../utils/errors';
import { formatPrice } from '../../utils/format';
import { countByFilter, FILTER_ALL, filterItems } from '../../utils/vendor';
import ConfirmModal from '../ui/ConfirmModal';
import PrimaryButton from '../ui/PrimaryButton';
import ProgressBar from '../ui/ProgressBar';
import StickyFooter from '../ui/StickyFooter';
import Toast from '../ui/Toast';
import ExcelExportDialog from './ExcelExportDialog';
import ShoppingListView from './ShoppingListView';
import TemplateDropdownManager from './TemplateDropdownManager';
import VendorTemplateSheet from './VendorTemplateSheet';
import { AlertIcon, ChevronRightIcon } from '../ui/Icons';

/**
 * Tab "បញ្ជីទិញ" (UX 11.6/11.7): Dropdown Template + បញ្ជីគ្រឿងផ្សំ Filter ក្នុង Client
 * + កាល Progress → Checklist (US-60) + Footer បង្កើត PDF / នាំចេញ Excel
 * props: eventId, itemsKey (ប្តូរ → ទាញថ្មី), onAddDishes()
 */
export default function EventShoppingTab({ eventId, itemsKey, onAddDishes }) {
  const { t } = useTranslation('events');
  const navigate = useNavigate();
  const { data, status, error, reload } = useEventShoppingList(eventId, itemsKey);
  const presets = useVendorPresets();
  const stock = useStock(); // គ្រប់ Category → ប្រើទាំង Category Map និង Template Form

  const [filter, setFilter] = useState(FILTER_ALL);
  const [sheet, setSheet] = useState(null); // { preset: UI VendorPreset | null }
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');
  const [sheetBanner, setSheetBanner] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [tabError, setTabError] = useState('');
  const [toast, setToast] = useState('');
  const closeToast = useCallback(() => setToast(''), []);

  const categoryById = useMemo(() => new Map(stock.items.map((s) => [s.id, s.category])), [stock.items]);
  const items = data?.items ?? [];
  const exporter = useEventExcelExport(eventId, items.length > 0);
  const purchasedCount = useMemo(() => items.filter((i) => i.isPurchased).length, [items]);
  const counts = useMemo(() => countByFilter(items, presets.items), [items, presets.items]);
  const filtered = useMemo(() => filterItems(items, presets.items, filter), [items, presets.items, filter]);
  const filteredTotal = useMemo(() => filtered.reduce((s, i) => s + i.totalPrice, 0), [filtered]);

  const openSheet = (preset) => {
    setNameError('');
    setSheetBanner('');
    setSheet({ preset });
  };

  const onSubmit = async ({ name, ids }) => {
    setSaving(true);
    setNameError('');
    setSheetBanner('');
    try {
      if (sheet.preset) {
        await vendorPresetService.update(sheet.preset.id, { name, chefIngredientIds: ids });
        setToast('updated');
      } else {
        const created = await vendorPresetService.create({ name, chefIngredientIds: ids });
        setFilter(created.id); // ប្តូរទៅ Template ថ្មីភ្លាម
        setToast('created');
      }
      await presets.reload();
      setSheet(null);
    } catch (err) {
      if (err.code === 'VENDOR_PRESET_EXISTS') setNameError(getErrorMessage(err));
      else setSheetBanner(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    const target = deleteTarget;
    if (!target) return;
    setDeleting(true);
    setTabError('');
    try {
      await vendorPresetService.remove(target.id);
      await presets.reload();
      if (filter === target.id) setFilter(FILTER_ALL);
      setDeleteTarget(null);
      setToast('deleted');
    } catch (err) {
      setDeleteTarget(null);
      setTabError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-16">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-6 text-center shadow-card">
        <p className="text-slate-600">{error}</p>
        <button type="button" onClick={reload}
          className="mt-4 min-h-[44px] rounded-xl border border-slate-200 px-5 font-medium text-slate-800 active:bg-slate-100">
          {t('retry')}
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-card">
        <p className="text-slate-600">{t('shopping.empty')}</p>
        <button type="button" onClick={onAddDishes}
          className="mt-5 min-h-[48px] rounded-xl bg-emerald-600 px-6 font-semibold text-white shadow-btn active:bg-emerald-800">
          {t('shopping.emptyCta')}
        </button>
        <ExcelExportDialog exporter={exporter} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tabError && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
          <span>{tabError}</span>
        </div>
      )}

      <Link
        to={`/events/${encodeURIComponent(eventId)}/checklist`}
        className="block space-y-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-card active:bg-slate-50"
      >
        <span className="flex items-center gap-3">
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-slate-900">{t('shopping.checklistTitle')}</span>
            <span className="block text-sm text-slate-500">
              {t('shopping.checklistProgress', { done: purchasedCount, total: items.length })}
            </span>
          </span>
          <ChevronRightIcon className="shrink-0 text-slate-400" />
        </span>
        <ProgressBar value={items.length ? (purchasedCount / items.length) * 100 : 0} label={t('checklist.progressAria')} />
      </Link>

      <TemplateDropdownManager
        presets={presets.items}
        value={filter}
        counts={counts}
        onChange={setFilter}
        onCreate={() => openSheet(null)}
        onEdit={(p) => openSheet(p)}
        onDelete={(p) => setDeleteTarget(p)}
      />

      <p className="px-1 text-sm text-slate-500">
        {t('shopping.summary', { count: filtered.length, total: formatPrice(filteredTotal) })}
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-slate-500 shadow-card">
          {t('shopping.noMatch')}
        </p>
      ) : (
        <ShoppingListView key={filter} items={filtered} categoryById={categoryById} />
      )}

      {sheet && (
        <VendorTemplateSheet
          preset={sheet.preset}
          stockItems={stock.items}
          stockStatus={stock.status}
          saving={saving}
          nameError={nameError}
          banner={sheetBanner}
          onClose={() => setSheet(null)}
          onSubmit={onSubmit}
        />
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        destructive
        loading={deleting}
        title={t('vendor.deleteTitle', { name: deleteTarget?.name ?? '' })}
        message={t('vendor.deleteMessage')}
        confirmLabel={t('vendor.deleteConfirm')}
        cancelLabel={t('vendor.cancel')}
        onConfirm={onDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {filtered.length > 0 && (
        <>
          <div className="h-40" aria-hidden="true" />
          <StickyFooter>
            <div className="space-y-2">
              <PrimaryButton
                onClick={() =>
                  navigate(`/events/${encodeURIComponent(eventId)}/report?template=${encodeURIComponent(filter)}`)
                }
              >
                {t('shopping.generatePdf')}
              </PrimaryButton>
              <button type="button" onClick={exporter.request}
                className="min-h-[48px] w-full rounded-xl border border-slate-200 bg-white text-base font-semibold text-slate-800 active:bg-slate-100">
                {t('shopping.exportExcel')}
              </button>
            </div>
          </StickyFooter>
        </>
      )}

      <ExcelExportDialog exporter={exporter} />
      <Toast message={toast ? t(`vendor.toast.${toast}`) : ''} onClose={closeToast} />
    </div>
  );
}
