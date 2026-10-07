import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { eventService } from '../services/eventService';
import { buildEventPayload, isValidDateInput, snapshotForm, toDateInput } from '../utils/event';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import PageHeader from '../components/PageHeader';
import AuthInput from '../components/ui/AuthInput';
import ConfirmModal from '../components/ui/ConfirmModal';
import PrimaryButton from '../components/ui/PrimaryButton';
import StickyFooter from '../components/ui/StickyFooter';
import { AlertIcon } from '../components/ui/Icons';

const EMPTY = { name: '', eventDate: '', tableCount: '' };

export default function EventFormPage() {
  const { id } = useParams(); // មាន → Edit (US-50 S4), គ្មាន → Create (S1)
  const isEdit = Boolean(id);
  const { t } = useTranslation('events');
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(EMPTY);
  const [baseline, setBaseline] = useState(() => snapshotForm(EMPTY));
  const [status, setStatus] = useState(isEdit ? 'loading' : 'ready'); // loading | ready | notfound | error
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [saving, setSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const ev = await eventService.getById(id);
      const next = { name: ev.name, eventDate: toDateInput(ev.eventDate), tableCount: String(ev.tableCount) };
      setForm(next);
      setBaseline(snapshotForm(next));
      setStatus('ready');
    } catch (err) {
      if (err.code === 'EVENT_NOT_FOUND') return setStatus('notfound');
      setLoadError(getErrorMessage(err));
      setStatus('error');
    }
  }, [id]);

  useEffect(() => { if (isEdit) load(); }, [isEdit, load]);

  const dirty = snapshotForm(form) !== baseline;

  const patch = (partial) => {
    setForm((f) => ({ ...f, ...partial }));
    setErrors({});
    setBanner('');
  };

  // ===== Validation (US-50 S2, S3)
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t('form.validation.nameRequired');
    if (!form.eventDate) e.eventDate = t('form.validation.dateRequired');
    else if (!isValidDateInput(form.eventDate)) e.eventDate = t('form.validation.dateInvalid');
    const raw = String(form.tableCount).trim();
    if (raw === '') e.tableCount = t('form.validation.tableRequired');
    else if (!/^\d+$/.test(raw) || Number(raw) <= 0) e.tableCount = t('form.validation.tablePositive');
    return e;
  };

  const applyApiErrors = (err) => {
    const fe = getFieldErrors(err);
    if (!fe) return setBanner(getErrorMessage(err));
    const next = {};
    let other = '';
    Object.entries(fe).forEach(([field, msg]) => {
      if (['name', 'eventDate', 'tableCount'].includes(field)) next[field] = msg;
      else other = msg;
    });
    setErrors(next);
    if (other) setBanner(other);
  };

  const onSave = async () => {
    if (saving) return;
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true);
    setBanner('');
    try {
      const payload = buildEventPayload(form);
      const saved = isEdit ? await eventService.update(id, payload) : await eventService.create(payload);
      // ទៅ Event Detail (UX 11.3 → 11.4)
      navigate(`/events/${encodeURIComponent(saved.id)}`, {
        replace: true,
        state: { toast: isEdit ? 'updated' : 'created' },
      });
    } catch (err) {
      if (err.code === 'EVENT_NOT_FOUND') setStatus('notfound');
      else applyApiErrors(err);
    } finally {
      setSaving(false);
    }
  };

  const leave = () => {
    if (location.key !== 'default') return navigate(-1);
    return navigate(isEdit ? `/events/${encodeURIComponent(id)}` : '/events', { replace: true });
  };
  const onBack = () => (dirty ? setDiscardOpen(true) : leave());

  const title = isEdit ? t('form.titleEdit') : t('form.titleNew');

  if (status !== 'ready') {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        <PageHeader title={title} backTo="/events" backLabel={t('back')} />
        <main className="mx-auto max-w-md px-5 pt-10 text-center text-slate-500">
          {status === 'loading' && (
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          )}
          {status === 'notfound' && (
            <>
              <p>{t('form.notFound')}</p>
              <Link to="/events" className="mt-4 inline-block font-medium text-emerald-700">{t('form.backToList')}</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <p>{loadError}</p>
              <button type="button" onClick={load}
                className="mt-4 min-h-[44px] rounded-xl border border-slate-200 px-5 font-medium text-slate-800">
                {t('retry')}
              </button>
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-36">
      <PageHeader title={title} onBack={onBack} backLabel={t('back')} />

      <main className="mx-auto max-w-md space-y-5 px-5 pt-6">
        {banner && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{banner}</span>
          </div>
        )}

        <AuthInput label={t('form.name')} placeholder={t('form.namePlaceholder')} value={form.name}
          error={errors.name} maxLength={120} onChange={(e) => patch({ name: e.target.value })} />

        {/* Date picker native (UX 11.3) */}
        <AuthInput label={t('form.date')} type="date" value={form.eventDate}
          error={errors.eventDate} onChange={(e) => patch({ eventDate: e.target.value })} />

        <AuthInput label={t('form.tableCount')} inputMode="numeric" placeholder="0" maxLength={5}
          value={form.tableCount} error={errors.tableCount}
          onChange={(e) => patch({ tableCount: e.target.value })} />
      </main>

      <StickyFooter>
        <PrimaryButton loading={saving} onClick={onSave}>{t('form.save')}</PrimaryButton>
      </StickyFooter>

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
    </div>
  );
}
