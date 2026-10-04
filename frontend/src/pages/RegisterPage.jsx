import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { getErrorMessage } from '../utils/errors';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/ui/AuthInput';
import Checkbox from '../components/ui/Checkbox';
import PasswordStrength from '../components/ui/PasswordStrength';
import PrimaryButton from '../components/ui/PrimaryButton';
import GoogleButton from '../components/GoogleButton';
import { AlertIcon, UserIcon } from '../components/ui/Icons';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELDS = ['displayName', 'email', 'password', 'confirm'];

export default function RegisterPage() {
  const { t, i18n } = useTranslation('register');
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const bannerRef = useRef(null);

  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' });
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formError) bannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [formError]);

  const validateField = (name, f) => {
    const v = f[name];
    switch (name) {
      case 'displayName':
        if (!v.trim()) return t('validation.nameRequired');
        if (v.trim().length < 2) return t('validation.nameShort');
        return '';
      case 'email':
        if (!v.trim()) return t('validation.emailRequired');
        if (!EMAIL_RE.test(v.trim())) return t('validation.emailInvalid');
        return '';
      case 'password':
        if (!v) return t('validation.passwordRequired');
        if (v.length < 8) return t('validation.passwordShort');
        return '';
      case 'confirm':
        if (!v) return t('validation.confirmRequired');
        if (v !== f.password) return t('validation.passwordMismatch');
        return '';
      default:
        return '';
    }
  };

  // Real-time: validate ក្រោយ field ត្រូវបាន touch (blur) ហើយ
  const onChange = (name) => (e) => {
    const next = { ...form, [name]: e.target.value };
    setForm(next);
    setFormError('');
    setErrors((prev) => {
      const out = { ...prev, [name]: touched[name] ? validateField(name, next) : undefined };
      if (name === 'password' && touched.confirm) out.confirm = validateField('confirm', next);
      return out;
    });
  };

  const onBlur = (name) => () => {
    setTouched((p) => ({ ...p, [name]: true }));
    setErrors((p) => ({ ...p, [name]: validateField(name, form) }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading || !agreed) return;

    const errs = Object.fromEntries(FIELDS.map((n) => [n, validateField(n, form)]));
    setTouched(Object.fromEntries(FIELDS.map((n) => [n, true])));
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setLoading(true);
    setFormError('');
    try {
      const email = form.email.trim();
      await authService.register({
        email,
        password: form.password,
        displayName: form.displayName.trim(),
        language: i18n.resolvedLanguage,
      });
      navigate('/verify-email', { state: { email, justRegistered: true } });
    } catch (err) {
      if (err.code === 'VALIDATION_FAILED' && err.errors?.length) {
        setErrors(
          Object.fromEntries(
            err.errors.map((x) => [
              x.field,
              getErrorMessage({ code: x.code, params: x.params, message: x.message }),
            ]),
          ),
        );
      } else {
        setFormError(getErrorMessage(err)); // ឧ. AUTH_EMAIL_EXISTS → banner លើគេ
      }
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async (idToken) => {
    setLoading(true);
    setFormError('');
    try {
      await loginWithGoogle(idToken); // US-03: Google → រំលង Verify, ចូលភ្លាម
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('title')}
      subtitle={t('subtitle')}
      backTo="/login"
      backLabel={t('back')}
      footer={
        <Link to="/login" className="inline-flex h-11 items-center text-[15px] font-medium text-emerald-700 hover:text-emerald-800">
          {t('haveAccount')}
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        {formError && (
          <div
            ref={bannerRef}
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{formError}</span>
          </div>
        )}

        <AuthInput
          label={t('displayName')}
          type="text"
          name="displayName"
          icon={UserIcon}
          autoComplete="name"
          enterKeyHint="next"
          placeholder={t('displayNamePlaceholder')}
          value={form.displayName}
          onChange={onChange('displayName')}
          onBlur={onBlur('displayName')}
          error={errors.displayName}
        />

        <AuthInput
          label={t('email')}
          type="email"
          name="email"
          enterKeyHint="next"
          placeholder={t('emailPlaceholder')}
          value={form.email}
          onChange={onChange('email')}
          onBlur={onBlur('email')}
          error={errors.email}
        />

        <div>
          <AuthInput
            label={t('password')}
            type="password"
            name="password"
            autoComplete="new-password"
            enterKeyHint="next"
            placeholder={t('passwordPlaceholder')}
            value={form.password}
            onChange={onChange('password')}
            onBlur={onBlur('password')}
            error={errors.password}
          />
          <PasswordStrength password={form.password} />
        </div>

        <AuthInput
          label={t('confirmPassword')}
          type="password"
          name="confirm"
          autoComplete="new-password"
          enterKeyHint="go"
          placeholder={t('confirmPlaceholder')}
          value={form.confirm}
          onChange={onChange('confirm')}
          onBlur={onBlur('confirm')}
          error={errors.confirm}
        />

        <Checkbox checked={agreed} onChange={setAgreed}>
          {t('termsPrefix')}{' '}
          {/* TODO: ភ្ជាប់ទំព័រលក្ខខណ្ឌ (មិនទាន់មានក្នុង Spec/Contract) */}
          <span className="font-medium text-emerald-700 underline">{t('termsLink')}</span>
        </Checkbox>

        <PrimaryButton type="submit" loading={loading} disabled={!agreed}>
          {t('submit')}
        </PrimaryButton>
      </form>

      <div className="my-6 flex items-center gap-3 text-sm text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        {t('or')}
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleButton
        label={t('google')}
        text="signup_with"
        disabled={loading}
        onCredential={onGoogle}
        onError={(code) => setFormError(getErrorMessage({ code }))}
      />
    </AuthLayout>
  );
}