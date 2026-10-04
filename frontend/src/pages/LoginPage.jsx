import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCountdown, formatMMSS } from '../hooks/useCountdown';
import { getErrorMessage } from '../utils/errors';
import LanguageSwitch from '../components/LanguageSwitch';
import AuthInput from '../components/ui/AuthInput';
import PrimaryButton from '../components/ui/PrimaryButton';
import GoogleButton from '../components/GoogleButton';
import { AlertIcon, CheckCircleIcon, ChefHatIcon, ClockIcon } from '../components/ui/Icons';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { t } = useTranslation('login');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';
  
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(0);

  const remaining = useCountdown(lockedUntil);
  const isLocked = remaining > 0;

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [key]: undefined }));
    setFormError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = t('validation.emailRequired');
    else if (!EMAIL_RE.test(form.email.trim())) errs.email = t('validation.emailInvalid');
    if (!form.password) errs.password = t('validation.passwordRequired');
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleApiError = (err) => {
    switch (err.code) {
      case 'AUTH_INVALID_CREDENTIALS':
        setFieldErrors({ password: getErrorMessage(err) });
        break;
      case 'AUTH_ACCOUNT_LOCKED':
      case 'AUTH_TOO_MANY_ATTEMPTS':
        setLockedUntil(Date.now() + (err.params?.minutes ?? 15) * 60_000);
        setFormError('');
        break;
      case 'AUTH_EMAIL_NOT_VERIFIED':
        navigate('/verify-email', { state: { email: form.email.trim() } });
        break;
      case 'VALIDATION_FAILED':
        setFieldErrors(
          Object.fromEntries(
            (err.errors || []).map((e) => [
              e.field,
              getErrorMessage({ code: e.code, params: e.params, message: e.message }),
            ]),
          ),
        );
        break;
      default:
        setFormError(getErrorMessage(err));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isLocked || loading || !validate()) return;
    setLoading(true);
    setFormError('');
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async (idToken) => {
    setLoading(true);
    setFormError('');
    try {
      await loginWithGoogle(idToken);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const lockText = useMemo(
    () => (isLocked ? t('lockedWait', { time: formatMMSS(remaining) }) : ''),
    [isLocked, remaining, t],
  );

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-emerald-50 via-slate-50 to-slate-50">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 pb-8 pt-[max(1rem,env(safe-area-inset-top))] sm:justify-center">
        {/* Header */}
        <header className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-btn">
              <ChefHatIcon width={22} height={22} />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">Chef</span>
          </div>
          <LanguageSwitch />
        </header>

        {/* Card */}
        <main className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
          <h1 className="text-[1.65rem] font-bold leading-normal text-slate-900">{t('title')}</h1>
          <p className="mt-1 text-[15px] text-slate-500">{t('subtitle')}</p>

          {(location.state?.verified || location.state?.passwordReset) && (
            <div
              role="status"
              className="mt-5 flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              <CheckCircleIcon className="mt-0.5 shrink-0" width={18} height={18} />
              <span>{location.state.passwordReset ? t('passwordReset') : t('verified')}</span>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
            {formError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
                <span>{formError}</span>
              </div>
            )}

            <AuthInput
              label={t('email')}
              type="email"
              name="email"
              enterKeyHint="next"
              placeholder={t('emailPlaceholder')}
              value={form.email}
              onChange={set('email')}
              error={fieldErrors.email}
            />

            <div>
              <AuthInput
                label={t('password')}
                type="password"
                name="password"
                enterKeyHint="go"
                placeholder={t('passwordPlaceholder')}
                value={form.password}
                onChange={set('password')}
                error={fieldErrors.password}
              />
              <div className="mt-1 flex justify-end">
                <Link
                  to="/forgot-password"
                  className="flex h-11 items-center text-[15px] font-medium text-emerald-700 hover:text-emerald-800"
                >
                  {t('forgot')}
                </Link>
              </div>
            </div>

            <PrimaryButton type="submit" loading={loading} disabled={isLocked}>
              {t('submit')}
            </PrimaryButton>

            {isLocked && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center justify-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
              >
                <ClockIcon width={18} height={18} />
                {lockText}
              </div>
            )}
          </form>

          <div className="my-6 flex items-center gap-3 text-sm text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            {t('or')}
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <GoogleButton
            label={t('google')}
            disabled={loading}
            onCredential={onGoogle}
            onError={(code) => setFormError(getErrorMessage({ code }))}
          />
        </main>

        {/* Footer */}
        <footer className="pt-5 text-center">
          <Link
            to="/register"
            className="inline-flex h-11 items-center text-[15px] font-medium text-emerald-700 hover:text-emerald-800"
          >
            {t('noAccount')}
          </Link>
        </footer>
      </div>
    </div>
  );
}