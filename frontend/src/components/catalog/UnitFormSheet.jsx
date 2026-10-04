import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { unitService } from '../../services/unitService';
import { UNIT_TYPES } from '../../config/unitTypes';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';
import BottomSheet from '../ui/BottomSheet';
import AuthInput from '../ui/AuthInput';
import PrimaryButton from '../ui/PrimaryButton';
import { AlertIcon } from '../ui/Icons';

const EMPTY = { name: '', abbreviation: '', unitType: 'weight', conversionRate: '' };
const parseRate = (v) => Number(String(v).trim().replace(',', '.'));

/**
 * បង្កើត Unit ថ្មី (US-26 S2/S3, US-27)
 * ប្រើឡើងវិញ: FAB ក្នុង Epic 7 និង Inline "Create new: X" ក្នុង Form គ្រឿងផ្សំ (Epic 8)
 * props: open, defaultName, onClose, onCreated(unit)
 */
export default function UnitFormSheet({ open, defaultName = '', onClose, onCreated }) {
  const { t } = useTranslation('catalog');
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({ ...EMPTY, name: defaultName });
    setErrors({});
    setBanner('');
  }, [open, defaultName]);

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
    setBanner('');
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t('unit.validation.nameRequired');
    if (form.conversionRate.trim() === '') e.conversionRate = t('unit.validation.rateRequired'); // US-27 S2
    else if (!(parseRate(form.conversionRate) > 0)) e.conversionRate = t('unit.validation.ratePositive'); // US-27 S3
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const v = validate();
    if (Object.keys(v).length) return setErrors(v);

    const name = form.name.trim();
    setSaving(true);
    setBanner('');
    try {
      const unit = await unitService.create({
        name,
        abbreviation: form.abbreviation.trim() || name, // Contract តម្រូវ abbreviation (Gap #45)
        unitType: form.unitType,
        conversionRate: parseRate(form.conversionRate),
      });
      onCreated?.(unit);
      onClose();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) setErrors(fieldErrors);
      else if (err.code === 'UNIT_EXISTS') setErrors({ name: getErrorMessage(err) });
      else setBanner(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const base = UNIT_TYPES.find((x) => x.value === form.unitType)?.baseAbbr;

  return (
    <BottomSheet open={open} title={t('unit.createTitle')} onClose={onClose} locked={saving}>
      <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
        {banner && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{banner}</span>
          </div>
        )}

        <AuthInput label={t('unit.name')} placeholder={t('unit.namePlaceholder')} value={form.name}
          error={errors.name} onChange={setField('name')} autoFocus />

        <div>
          <p className="mb-1.5 text-[15px] font-medium text-slate-700">{t('unit.type.label')}</p>
          <div role="radiogroup" className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
            {UNIT_TYPES.map((x) => (
              <button
                key={x.value}
                type="button"
                role="radio"
                aria-checked={form.unitType === x.value}
                onClick={() => setForm((f) => ({ ...f, unitType: x.value }))}
                className={`min-h-[44px] rounded-lg text-[15px] font-semibold transition ${
                  form.unitType === x.value ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
                }`}
              >
                {t(`unit.type.${x.value}`)}
              </button>
            ))}
          </div>
        </div>

        <AuthInput label={`${t('unit.abbreviation')} ${t('optional')}`} placeholder={t('unit.abbreviationPlaceholder')}
          value={form.abbreviation} onChange={setField('abbreviation')} />

        <div>
          <AuthInput
            label={t('unit.rate')}
            inputMode="decimal"
            placeholder="0.5"
            value={form.conversionRate}
            error={errors.conversionRate}
            onChange={setField('conversionRate')}
          />
          <p className="mt-1.5 text-sm text-slate-500">
            {t('unit.rateHint', {
              name: form.name.trim() || t('unit.thisUnit'),
              rate: form.conversionRate.trim() || '?',
              base,
            })}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <PrimaryButton type="submit" loading={saving}>{t('save')}</PrimaryButton>
          <PrimaryButton variant="secondary" disabled={saving} onClick={onClose}>{t('cancel')}</PrimaryButton>
        </div>
      </form>
    </BottomSheet>
  );
}