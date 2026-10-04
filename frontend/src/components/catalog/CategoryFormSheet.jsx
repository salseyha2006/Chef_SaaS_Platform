import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { categoryService } from '../../services/categoryService';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';
import BottomSheet from '../ui/BottomSheet';
import AuthInput from '../ui/AuthInput';
import PrimaryButton from '../ui/PrimaryButton';
import { AlertIcon } from '../ui/Icons';

/** បង្កើត Category ថ្មី (US-28 S2) — ប្រើឡើងវិញក្នុង Epic 8. props: open, defaultName, onClose, onCreated(category) */
export default function CategoryFormSheet({ open, defaultName = '', onClose, onCreated }) {
  const { t } = useTranslation('catalog');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [banner, setBanner] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(defaultName);
    setError('');
    setBanner('');
  }, [open, defaultName]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const value = name.trim();
    if (!value) return setError(t('category.validation.nameRequired'));

    setSaving(true);
    setBanner('');
    try {
      const category = await categoryService.create({ name: value });
      onCreated?.(category);
      onClose();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors?.name) setError(fieldErrors.name);
      else if (err.code === 'CATEGORY_EXISTS') setError(getErrorMessage(err));
      else setBanner(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={open} title={t('category.createTitle')} onClose={onClose} locked={saving}>
      <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
        {banner && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{banner}</span>
          </div>
        )}
        <AuthInput
          label={t('category.name')}
          placeholder={t('category.namePlaceholder')}
          value={name}
          error={error}
          onChange={(e) => { setName(e.target.value); setError(''); setBanner(''); }}
          autoFocus
        />
        <div className="space-y-3 pt-2">
          <PrimaryButton type="submit" loading={saving}>{t('save')}</PrimaryButton>
          <PrimaryButton variant="secondary" disabled={saving} onClick={onClose}>{t('cancel')}</PrimaryButton>
        </div>
      </form>
    </BottomSheet>
  );
}