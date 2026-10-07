import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BottomSheet from '../ui/BottomSheet';
import AuthInput from '../ui/AuthInput';
import PrimaryButton from '../ui/PrimaryButton';
import { isValidDateInput } from '../../utils/event';

/**
 * Sheet ចម្លង Event: ឈ្មោះ (Prefill "<ឈ្មោះ> (ចម្លង)") + កាលបរិច្ឆេទថ្មី (ទទេ — បង្ខំឱ្យជ្រើស តាម US-51 Tech Note)
 * Mount តែពេលបើក. props: sourceName, loading, error (សារពី Server), onClose(), onSubmit({ name, eventDate:'YYYY-MM-DD' })
 */
export default function CloneEventSheet({ sourceName, loading, error, onClose, onSubmit }) {
  const { t } = useTranslation('events');
  const [name, setName] = useState(`${sourceName} ${t('clone.suffix')}`);
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState({});

  const submit = () => {
    const e = {};
    if (!name.trim()) e.name = t('form.validation.nameRequired');
    if (!date) e.date = t('form.validation.dateRequired');
    else if (!isValidDateInput(date)) e.date = t('form.validation.dateInvalid');
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit({ name: name.trim(), eventDate: date });
  };

  return (
    <BottomSheet open title={t('clone.title')} onClose={onClose} locked={loading}>
      <p className="mt-2 text-[15px] text-slate-600">{t('clone.hint')}</p>
      <div className="mt-5 space-y-4">
        <AuthInput label={t('clone.name')} value={name} error={errors.name} maxLength={120}
          onChange={(e) => { setName(e.target.value); setErrors({}); }} />
        <AuthInput label={t('clone.date')} type="date" value={date} error={errors.date}
          onChange={(e) => { setDate(e.target.value); setErrors({}); }} />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </div>
      <div className="mt-6 space-y-3">
        <PrimaryButton loading={loading} onClick={submit}>{t('clone.submit')}</PrimaryButton>
        <button type="button" onClick={onClose} disabled={loading}
          className="min-h-[48px] w-full rounded-xl text-base font-medium text-slate-600 active:bg-slate-100 disabled:opacity-50">
          {t('clone.cancel')}
        </button>
      </div>
    </BottomSheet>
  );
}
