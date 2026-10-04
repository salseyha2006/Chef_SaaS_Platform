import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { getErrorMessage } from '../utils/errors';
import PageHeader from '../components/PageHeader';
import AuthInput from '../components/ui/AuthInput';
import PasswordStrength from '../components/ui/PasswordStrength';
import PrimaryButton from '../components/ui/PrimaryButton';
import { AlertIcon } from '../components/ui/Icons';

export default function ChangePasswordPage() {
  const { t } = useTranslation('profile');
  const { chef, refreshMe } = useAuth();
  const navigate = useNavigate();

  // authProvider មិនមានក្នុង /auth/login → ហៅ /auth/me ម្តង (Gap #8)
  const [loadingMe, setLoadingMe] = useState(!chef?.authProvider);
  const [needsCurrent, setNeedsCurrent] = useState(false); // Fallback: Backend តម្រូវ currentPassword
  const [form, setForm] = useState({ current: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (chef?.authProvider) return;
    refreshMe().catch(() => {}).finally(() => setLoadingMe(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSetMode = chef?.authProvider === 'google' && !needsCurrent;

  const onField = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    setErrors((p) => ({ ...p, [name]: undefined, ...(name === 'password' ? { confirm: undefined } : {}) }));
    setBanner('');
  };

  const validate = () => {
    const errs = {};
    if (!isSetMode && !form.current) errs.current = t('password.validation.currentRequired');
    if (!form.password) errs.password = t('password.validation.newRequired');
    else if (form.password.length < 8) errs.password = t('password.validation.newShort');
    if (!form.confirm) errs.confirm = t('password.validation.confirmRequired');
    else if (form.confirm !== form.password) errs.confirm = t('password.validation.mismatch');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (saving || !validate()) return;
    setSaving(true);
    setBanner('');
    try {
      await authService.changePassword({
        currentPassword: isSetMode ? undefined : form.current,
        newPassword: form.password,
      });
      navigate('/profile', { replace: true, state: { toast: 'passwordChanged' } });
    } catch (err) {
      if (err.code === 'AUTH_CURRENT_PASSWORD_INCORRECT') {
        setErrors({ current: getErrorMessage(err) });
      } else if (err.code === 'AUTH_CURRENT_PASSWORD_REQUIRED') {
        // Backend តម្រូវលេខចាស់ទោះជា Google → បង្ហាញ Field (Gap #14)
        setNeedsCurrent(true);
        setErrors({ current: getErrorMessage(err) });
      } else if (err.code === 'VALIDATION_FAILED' && err.errors?.length) {
        const next = {};
        err.errors.forEach((x) => {
          const msg = getErrorMessage({ code: x.code, params: x.params, message: x.message });
          if (x.field === 'currentPassword') next.current = msg;
          else if (x.field === 'newPassword') next.password = msg;
          else setBanner(msg);
        });
        setErrors(next);
      } else {
        setBanner(getErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadingMe) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-10">
      <PageHeader
        title={isSetMode ? t('password.setTitle') : t('password.changeTitle')}
        backTo="/profile"
        backLabel={t('back')}
      />

      <main className="mx-auto max-w-md px-5 pt-6">
        <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
          {isSetMode && <p className="text-[15px] text-slate-500">{t('password.setHint')}</p>}

          {banner && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
              <span>{banner}</span>
            </div>
          )}

          {!isSetMode && (
            <AuthInput
              label={t('password.current')}
              type="password"
              name="currentPassword"
              autoComplete="current-password"
              enterKeyHint="next"
              placeholder={t('password.currentPlaceholder')}
              value={form.current}
              onChange={onField('current')}
              error={errors.current}
            />
          )}

          <div>
            <AuthInput
              label={t('password.new')}
              type="password"
              name="newPassword"
              autoComplete="new-password"
              enterKeyHint="next"
              placeholder={t('password.newPlaceholder')}
              value={form.password}
              onChange={onField('password')}
              error={errors.password}
            />
            <PasswordStrength password={form.password} />
          </div>

          <AuthInput
            label={t('password.confirm')}
            type="password"
            name="confirm"
            autoComplete="new-password"
            enterKeyHint="go"
            placeholder={t('password.confirmPlaceholder')}
            value={form.confirm}
            onChange={onField('confirm')}
            error={errors.confirm}
          />

          <PrimaryButton type="submit" loading={saving}>
            {t('password.save')}
          </PrimaryButton>
        </form>
      </main>
    </div>
  );
}
