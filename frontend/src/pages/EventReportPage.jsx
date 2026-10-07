import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEventShoppingList } from '../hooks/useEventShoppingList';
import { useVendorPresets } from '../hooks/useVendorPresets';
import { eventService } from '../services/eventService';
import { getErrorMessage } from '../utils/errors';
import { FILTER_ALL, filterItems } from '../utils/vendor';
import { buildLines, lineFromStock, snapshot, toPdfPayload, validateLines } from '../utils/report';
import PageHeader from '../components/PageHeader';
import AuthInput from '../components/ui/AuthInput';
import ConfirmModal from '../components/ui/ConfirmModal';
import PrimaryButton from '../components/ui/PrimaryButton';
import StickyFooter from '../components/ui/StickyFooter';
import Toast from '../components/ui/Toast';
import PDFPreviewFrame from '../components/events/PDFPreviewFrame';
import ReportLineRow from '../components/events/ReportLineRow';
import IngredientPickerSheet from '../components/dishes/IngredientPickerSheet';
import { AlertIcon, PlusIcon } from '../components/ui/Icons';

export default function EventReportPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('template') || FILTER_ALL;
  const { t } = useTranslation('events');
  const navigate = useNavigate();
  const location = useLocation();

  const list = useEventShoppingList(id, 0);
  const presets = useVendorPresets();

  const [lines, setLines] = useState(null); // null = មិនទាន់ Init
  const [title, setTitle] = useState('');
  const [initial, setInitial] = useState({ title: '', lines: [] });
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState('');
  const closeToast = useCallback(() => setToast(''), []);

  // បន្ទាត់ដើមតាម Filter (Template ត្រូវបានលុប → ទាំងអស់)
  const base = useMemo(() => {
    if (!list.data) return null;
    return buildLines(filterItems(list.data.items, presets.items, filter));
  }, [list.data, presets.items, filter]);

  const baseTitle = useMemo(() => {
    if (!list.data) return '';
    const preset = presets.items.find((p) => p.id === filter);
    return preset ? `${list.data.eventName} · ${preset.name}` : list.data.eventName;
  }, [list.data, presets.items, filter]);

  // Init តែម្តង ពេល Shopping List + Template (ឬបរាជ័យ) ត្រៀមរួច
  useEffect(() => {
    if (lines !== null || !base || presets.status === 'loading') return;
    setLines(base);
    setTitle(baseTitle);
    setInitial({ title: baseTitle, lines: base });
  }, [lines, base, baseTitle, presets.status]);

  const dirty = lines !== null && snapshot(title, lines) !== snapshot(initial.title, initial.lines);
  const existingIds = useMemo(() => new Set((lines ?? []).map((l) => l.id)), [lines]);

  const touch = () => {
    setErrors({});
    setBanner('');
  };

  const setQuantity = (lineId, quantity) => {
    setLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, quantity } : l)));
    touch();
  };
  const removeLine = (lineId) => {
    setLines((prev) => prev.filter((l) => l.id !== lineId));
    touch();
  };
  const onPick = (picked) => {
    setLines((prev) => [...prev, ...picked.filter((p) => !existingIds.has(p.id)).map(lineFromStock)]);
    setPickerOpen(false);
    setEditing(true);
    touch();
  };
  const onReset = () => {
    setLines(initial.lines);
    setTitle(initial.title);
    touch();
  };

  // ===== US-58: Generate (Preview → PDF A4) — បញ្ជូន State Local ទៅ Backend
  const onGenerate = async () => {
    if (!lines || lines.length === 0 || generating) return;
    const errs = validateLines(lines);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setEditing(true);
      const first = lines.find((l) => errs[l.id]);
      setTimeout(() => document.getElementById(`line-${first.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return;
    }
    setGenerating(true);
    setBanner('');
    try {
      const result = await eventService.downloadReportPdf(id, toPdfPayload(title, lines));
      if (result === 'downloaded') setToast('downloaded');
    } catch (err) {
      setBanner(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const leave = () =>
    location.key === 'default' ? navigate(`/events/${encodeURIComponent(id)}`, { replace: true }) : navigate(-1);
  const onBack = () => (dirty ? setDiscardOpen(true) : leave());

  // ===== Loading / Error
  const loading = list.status === 'loading' || (list.status === 'ready' && lines === null);
  if (loading || list.status === 'error') {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        <PageHeader title={t('report.title')} onBack={leave} backLabel={t('back')} />
        <main className="mx-auto max-w-md px-5 pt-10 text-center text-slate-500">
          {loading && (
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          )}
          {list.status === 'error' && (
            <>
              <p>{list.error}</p>
              <button type="button" onClick={list.reload}
                className="mt-4 min-h-[44px] rounded-xl border border-slate-200 px-5 font-medium text-slate-800">
                {t('retry')}
              </button>
              <Link to="/events" className="mt-4 block font-medium text-emerald-700">{t('form.backToList')}</Link>
            </>
          )}
        </main>
      </div>
    );
  }

  const empty = lines.length === 0;

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-44">
      <PageHeader title={t('report.title')} onBack={onBack} backLabel={t('back')} />

      <main className="mx-auto max-w-md space-y-4 px-5 pt-5">
        {banner && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{banner}</span>
          </div>
        )}

        <p className="px-1 text-sm text-slate-500">{t('report.previewNote')}</p>

        {/* Mode bar */}
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setEditing((v) => !v)} aria-pressed={editing}
            className={`min-h-[44px] flex-1 rounded-xl border px-4 font-semibold transition ${
              editing ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-800'
            }`}>
            {editing ? t('report.doneEdit') : t('report.edit')}
          </button>
          {dirty && (
            <button type="button" onClick={onReset}
              className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-4 font-medium text-slate-700 active:bg-slate-100">
              {t('report.reset')}
            </button>
          )}
        </div>

        {editing ? (
          <>
            <p className="px-1 text-xs text-slate-400">{t('report.localNote')}</p>

            <AuthInput label={t('report.titleLabel')} value={title} maxLength={120}
              onChange={(e) => { setTitle(e.target.value); setBanner(''); }} />

            {empty ? (
              <p className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-slate-500 shadow-card">
                {t('report.empty')}
              </p>
            ) : (
              <ul className="space-y-3">
                {lines.map((l) => (
                  <ReportLineRow key={l.id} line={l}
                    error={errors[l.id] ? t(`report.validation.${errors[l.id]}`) : undefined}
                    onChange={(q) => setQuantity(l.id, q)} onRemove={() => removeLine(l.id)} />
                ))}
              </ul>
            )}

            <button type="button" onClick={() => setPickerOpen(true)}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 font-semibold text-emerald-700 active:bg-emerald-50">
              <PlusIcon width={20} height={20} />
              {t('report.add')}
            </button>
          </>
        ) : empty ? (
          <p className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-slate-500 shadow-card">
            {t('report.empty')}
          </p>
        ) : (
          <PDFPreviewFrame title={title} lines={lines} />
        )}
      </main>

      <StickyFooter>
        <PrimaryButton loading={generating} disabled={empty} onClick={onGenerate}>
          {t('report.generate')}
        </PrimaryButton>
      </StickyFooter>

      {pickerOpen && (
        <IngredientPickerSheet existingIds={existingIds} onClose={() => setPickerOpen(false)} onConfirm={onPick} />
      )}

      <ConfirmModal
        open={discardOpen}
        destructive
        title={t('form.discardTitle')}
        message={t('form.discardMessage')}
        confirmLabel={t('form.discardConfirm')}
        cancelLabel={t('form.keepEditing')}
        onConfirm={() => { setDiscardOpen(false); leave(); }}
        onCancel={() => setDiscardOpen(false)}
      />

      <Toast message={toast ? t(`report.toast.${toast}`) : ''} onClose={closeToast} />
    </div>
  );
}
