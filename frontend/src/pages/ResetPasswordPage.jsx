import { useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/ui/AuthInput';
import OTPInput from '../components/ui/OTPInput';
import PasswordStrength from '../components/ui/PasswordStrength';
import PrimaryButton from '../components/ui/PrimaryButton';
import { AlertIcon, KeyIcon } from '../components/ui/Icons';
import { authService } from '../services/authService';
import { formatMMSS, useCountdown } from '../hooks/useCountdown';
import { getErrorMessage } from '../utils/errors';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_MS = 60_000;

function ResetForm({ email }) {
  const { t } = useTranslation('reset');
  const navigate = useNavigate();
  const otpRef = useRef(null);

  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [otpError, setOtpError] = useState('');
  const [banner, setBanner] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendUntil, setResendUntil] = useState(() => Date.now() + RESEND_COOLDOWN_MS);
  const remaining = useCountdown(resendUntil);

  const clearMessages = () => {
    setBanner('');
    setInfo('');
  };

  const onOtpChange = (v) => {
    setOtp(v);
    setOtpError('');
    clearMessages();
  };

  const onField = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    setErrors((p) => ({ ...p, [name]: undefined, ...(name === 'password' ? { confirm: undefined } : {}) }));
    clearMessages();
  };

  const validate = () => {
    const errs = {};
    if (form.password.length < 8) {
      errs.password = form.password
        ? t('reset.validation.passwordShort')
        : t('reset.validation.passwordRequired');
    }
    if (!form.confirm) errs.confirm = t('reset.validation.confirmRequired');
    else if (form.confirm !== form.password) errs.confirm = t('reset.validation.passwordMismatch');
    setErrors(errs);

    const otpErr = otp.length !== OTP_LENGTH ? t('reset.validation.otpIncomplete') : '';
    setOtpError(otpErr);
    return !otpErr && Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading || !validate()) return;
    setLoading(true);
    clearMessages();
    try {
      await authService.resetPassword({ email, otp, newPassword: form.password });
      navigate('/login', { replace: true, state: { passwordReset: true, email } });
    } catch (err) {
      if (err.code === 'AUTH_OTP_INVALID' || err.code === 'AUTH_OTP_EXPIRED') {
        // មិនប្តូរលេខសម្ងាត់ (Backend បដិសេធ) → សម្អាត OTP តែរក្សាលេខសម្ងាត់ដែលបានវាយ
        setOtpError(getErrorMessage(err));
        setOtp('');
        otpRef.current?.focus();
      } else if (err.code === 'VALIDATION_FAILED' && err.errors?.length) {
        const next = {};
        err.errors.forEach((x) => {
          const msg = getErrorMessage({ code: x.code, params: x.params, message: x.message });
          if (x.field === 'otp') setOtpError(msg);
          else if (x.field === 'newPassword') next.password = msg;
          else setBanner(msg);
        });
        setErrors(next);
      } else {
        setBanner(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (remaining > 0 || resending) return;
    setResending(true);
    clearMessages();
    setOtpError('');
    try {
      // /auth/resend-otp សម្រាប់ Verify Email ប៉ុណ្ណោះ → Reset ហៅ forgot-password ម្តងទៀត
      await authService.forgotPassword({ email });
      setResendUntil(Date.now() + RESEND_COOLDOWN_MS);
      setOtp('');
      setInfo(t('reset.resent'));
      otpRef.current?.focus();
    } catch (err) {
      setResendUntil(Date.now() + RESEND_COOLDOWN_MS);
      setBanner(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title={t('reset.title')}
      subtitle={t('reset.generic', { email })}
      icon={<KeyIcon width={28} height={28} />}
      backTo="/forgot-password"
      backState={{ email }}
      backLabel={t('reset.back')}
    >
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
        {banner && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
            <span>{banner}</span>
          </div>
        )}

        <div>
          <OTPInput
            ref={otpRef}
            length={OTP_LENGTH}
            value={otp}
            onChange={onOtpChange}
            error={!!otpError}
            label={t('reset.otpLabel')}
          />
          {otpError && (
            <p role="alert" className="mt-3 text-center text-sm text-red-600">
              {otpError}
            </p>
          )}
          {info && (
            <p role="status" className="mt-3 text-center text-sm text-emerald-700">
              {info}
            </p>
          )}
          <p className="mt-2 text-center text-[15px] text-slate-500">
            {t('reset.noCode')}{' '}
            {remaining > 0 ? (
              <span className="font-medium text-slate-400">{t('reset.resendIn', { time: formatMMSS(remaining) })}</span>
            ) : (
              <button
                type="button"
                onClick={onResend}
                disabled={resending}
                className="inline-flex h-11 items-center font-semibold text-emerald-700 hover:text-emerald-800 disabled:text-slate-400"
              >
                {resending ? t('common:loading') : t('reset.resend')}
              </button>
            )}
          </p>
        </div>

        <div>
          <AuthInput
            label={t('reset.newPassword')}
            type="password"
            name="newPassword"
            autoComplete="new-password"
            enterKeyHint="next"
            placeholder={t('reset.newPasswordPlaceholder')}
            value={form.password}
            onChange={onField('password')}
            error={errors.password}
          />
          <PasswordStrength password={form.password} />
        </div>

        <AuthInput
          label={t('reset.confirmPassword')}
          type="password"
          name="confirm"
          autoComplete="new-password"
          enterKeyHint="go"
          placeholder={t('reset.confirmPlaceholder')}
          value={form.confirm}
          onChange={onField('confirm')}
          error={errors.confirm}
        />

        <PrimaryButton type="submit" loading={loading}>
          {t('reset.submit')}
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  const { state } = useLocation();
  if (!state?.email) return <Navigate to="/forgot-password" replace />;
  return <ResetForm email={state.email} />;
}
