import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/ui/AuthInput';
import PrimaryButton from '../components/ui/PrimaryButton';
import { AlertIcon, KeyIcon } from '../components/ui/Icons';
import { authService } from '../services/authService';
import { getErrorMessage } from '../utils/errors';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const { t } = useTranslation('reset');
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [error, setError] = useState('');
  const [banner, setBanner] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) return t('forgot.validation.emailRequired');
    if (!EMAIL_RE.test(email.trim())) return t('forgot.validation.emailInvalid');
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const err = validate();
    setError(err);
    if (err) return;

    setLoading(true);
    setBanner('');
    try {
      const clean = email.trim();
      await authService.forgotPassword({ email: clean });
      // ទៅ Step B ជានិច្ច ទោះ Email មានឬអត់ (ការពារ Email Enumeration)
      navigate('/reset-password', { state: { email: clean, fresh: true } });
    } catch (ex) {
      if (ex.code === 'VALIDATION_FAILED' && ex.errors?.length) {
        const first = ex.errors[0];
        setError(getErrorMessage({ code: first.code, params: first.params, message: first.message }));
      } else {
        setBanner(getErrorMessage(ex));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('forgot.title')}
      subtitle={t('forgot.subtitle')}
      icon={<KeyIcon width={28} height={28} />}
      backTo="/login"
      backLabel={t('forgot.back')}
      footer={
        <Link to="/login" className="inline-flex h-11 items-center text-[15px] font-medium text-emerald-700 hover:text-emerald-800">
          {t('forgot.backToLogin')}
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        {banner && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{banner}</span>
          </div>
        )}

        <AuthInput
          label={t('forgot.email')}
          type="email"
          name="email"
          enterKeyHint="go"
          placeholder={t('forgot.emailPlaceholder')}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
            setBanner('');
          }}
          error={error}
        />

        <PrimaryButton type="submit" loading={loading}>
          {t('forgot.submit')}
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
