import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { billingService } from '../services/billingService';
import { getErrorMessage } from '../utils/errors';
import PageHeader from '../components/PageHeader';
import AuthInput from '../components/ui/AuthInput';
import ConfirmModal from '../components/ui/ConfirmModal';
import PrimaryButton from '../components/ui/PrimaryButton';
import Toast from '../components/ui/Toast';
import { AlertIcon, StoreIcon } from '../components/ui/Icons';

const EMPTY = { billingName: '', shopAddress: '', phoneNumber: '' };
const clean = (f) => ({
  billingName: f.billingName.trim(),
  shopAddress: f.shopAddress.trim(),
  phoneNumber: f.phoneNumber.trim(),
});

export default function BillingInfoPage() {
  const { t } = useTranslation('billing');
  const { chef } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initial = useMemo(() => ({ ...EMPTY, ...billingService.getCachedInfo(chef?.id) }), [chef?.id]);
  const [form, setForm] = useState(initial);
  const [baseline, setBaseline] = useState(initial);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [saving, setSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [toast, setToast] = useState('');
  const closeToast = useCallback(() => setToast(''), []);

  const dirty = JSON.stringify(clean(form)) !== JSON.stringify(clean(baseline));

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
    setBanner('');
  };

  const validate = (f) => {
    const e = {};
    if (!f.billingName) e.billingName = t('info.validation.nameRequired');
    else if (f.billingName.length < 2) e.billingName = t('info.validation.nameShort');
    if (!f.shopAddress) e.shopAddress = t('info.validation.addressRequired');
    else if (f.shopAddress.length < 2) e.shopAddress = t('info.validation.addressShort');
    if (f.phoneNumber && f.phoneNumber.length < 6) e.phoneNumber = t('info.validation.phoneShort');
    return e;
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    const values = clean(form);
    const v = validate(values);
    if (Object.keys(v).length) return setErrors(v); // Scenario 3: មិន Save

    setSaving(true);
    setBanner('');
    try {
      await billingService.updateInfo(chef?.id, values);
      setForm(values);
      setBaseline(values);
      setToast('infoSaved');
    } catch (err) {
      if (err.code === 'VALIDATION_FAILED' && Array.isArray(err.errors) && err.errors.length) {
        const map = {};
        err.errors.forEach((x) => {
          map[x.field] = getErrorMessage({ code: x.code, params: x.params, message: x.message });
        });
        setErrors(map);
      } else {
        setBanner(getErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  const leave = () => (location.key === 'default' ? navigate('/profile', { replace: true }) : navigate(-1));
  const onBack = () => (dirty ? setDiscardOpen(true) : leave());

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-10">
      <PageHeader title={t('info.title')} onBack={onBack} backLabel={t('back')} />

      <main className="mx-auto max-w-md px-5 pt-6">
        <p className="rounded-xl bg-sky-50 px-4 py-3 text-[15px] text-sky-900">{t('info.snapshotNote')}</p>

        <form onSubmit={onSave} noValidate className="mt-5 space-y-5">
          {banner && (
            <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
              <span>{banner}</span>
            </div>
          )}

          <AuthInput
            label={t('info.name')}
            icon={StoreIcon}
            autoComplete="organization"
            placeholder={t('info.namePlaceholder')}
            value={form.billingName}
            error={errors.billingName}
            onChange={setField('billingName')}
          />
          <AuthInput
            label={t('info.address')}
            autoComplete="street-address"
            placeholder={t('info.addressPlaceholder')}
            value={form.shopAddress}
            error={errors.shopAddress}
            onChange={setField('shopAddress')}
          />
          <AuthInput
            label={`${t('info.phone')} ${t('info.optional')}`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t('info.phonePlaceholder')}
            value={form.phoneNumber}
            error={errors.phoneNumber}
            onChange={setField('phoneNumber')}
          />

          <PrimaryButton type="submit" loading={saving} disabled={!dirty}>
            {t('info.save')}
          </PrimaryButton>
        </form>
      </main>

      <ConfirmModal
        open={discardOpen}
        destructive
        title={t('info.discardTitle')}
        message={t('info.discardMessage')}
        confirmLabel={t('info.discardConfirm')}
        cancelLabel={t('info.keepEditing')}
        onConfirm={() => { setDiscardOpen(false); leave(); }}
        onCancel={() => setDiscardOpen(false)}
      />

      <Toast message={toast ? t(`toast.${toast}`) : ''} onClose={closeToast} />
    </div>
  );
}