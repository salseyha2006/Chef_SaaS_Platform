import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../components/AuthLayout';
import OTPInput from '../components/ui/OTPInput';
import PrimaryButton from '../components/ui/PrimaryButton';
import { AlertIcon, CheckCircleIcon, MailIcon } from '../components/ui/Icons';
import { authService } from '../services/authService';
import { formatMMSS, useCountdown } from '../hooks/useCountdown';
import { getErrorMessage } from '../utils/errors';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_MS = 60_000;

function VerifyEmailForm({ email, justRegistered }) {
  const { t } = useTranslation('verify');
  const navigate = useNavigate();
  const otpRef = useRef(null);
  const redirectTimer = useRef(null);

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [banner, setBanner] = useState('');
  const [info, setInfo] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [done, setDone] = useState(false);
  // Register ទើបរួច → Cooldown ភ្លាម; មកពី Login → Resend ចុចបានភ្លាម
  const [resendUntil, setResendUntil] = useState(() => (justRegistered ? Date.now() + RESEND_COOLDOWN_MS : 0));
  const remaining = useCountdown(resendUntil);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const goLogin = () => navigate('/login', { replace: true, state: { verified: true, email } });

  const onOtpChange = (v) => {
    setOtp(v);
    setOtpError('');
    setBanner('');
    setInfo('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH || verifying) return;
    setVerifying(true);
    setBanner('');
    setInfo('');
    try {
      await authService.verifyEmail({ email, otp });
      setDone(true);
      redirectTimer.current = setTimeout(goLogin, 1200);
    } catch (err) {
      if (err.code === 'AUTH_OTP_INVALID' || err.code === 'AUTH_OTP_EXPIRED') {
        setOtpError(getErrorMessage(err));
        setOtp('');
        otpRef.current?.focus();
      } else if (err.code === 'AUTH_EMAIL_ALREADY_VERIFIED') {
        goLogin();
      } else {
        setBanner(getErrorMessage(err));
      }
    } finally {
      setVerifying(false);
    }
  };

  const onResend = async () => {
    if (remaining > 0 || resending) return;
    setResending(true);
    setBanner('');
    setOtpError('');
    try {
      await authService.resendOtp({ email });
      setResendUntil(Date.now() + RESEND_COOLDOWN_MS);
      setOtp('');
      setInfo(t('resent'));
      otpRef.current?.focus();
    } catch (err) {
      if (err.code === 'AUTH_OTP_RESEND_LIMITED') {
        setResendUntil(Date.now() + (err.params?.minutes ?? 10) * 60_000);
        setBanner(getErrorMessage(err));
      } else if (err.code === 'AUTH_EMAIL_ALREADY_VERIFIED') {
        goLogin();
      } else {
        setBanner(getErrorMessage(err));
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title={t('title')}
      icon={done ? <CheckCircleIcon width={30} height={30} className="animate-pop" /> : <MailIcon width={28} height={28} />}
      subtitle={
        done ? (
          t('successHint')
        ) : (
          <>
            {t('sentTo')} <strong className="break-all font-semibold text-slate-800">{email}</strong>
          </>
        )
      }
      backTo={justRegistered ? '/register' : '/login'}
      backLabel={t('back')}
    >
      {done ? (
        <p role="status" className="mt-6 text-center text-lg font-semibold text-emerald-700">
          {t('success')}
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-6">
          {banner && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
              <span>{banner}</span>
            </div>
          )}

          <OTPInput
            ref={otpRef}
            length={OTP_LENGTH}
            value={otp}
            onChange={onOtpChange}
            error={!!otpError}
            label={t('otpLabel')}
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

          <PrimaryButton
            type="submit"
            className="mt-6"
            loading={verifying}
            disabled={otp.length !== OTP_LENGTH}
          >
            {t('submit')}
          </PrimaryButton>

          <p className="mt-4 text-center text-[15px] text-slate-500">
            {t('noCode')}{' '}
            {remaining > 0 ? (
              <span className="font-medium text-slate-400">{t('resendIn', { time: formatMMSS(remaining) })}</span>
            ) : (
              <button
                type="button"
                onClick={onResend}
                disabled={resending}
                className="inline-flex h-11 items-center font-semibold text-emerald-700 hover:text-emerald-800 disabled:text-slate-400"
              >
                {resending ? t('common:loading') : t('resend')}
              </button>
            )}
          </p>
        </form>
      )}
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  const { state } = useLocation();
  // Refresh ទំព័រ: history.state នៅតែមាន; បើគ្មាន Email ពិតជាមកដោយផ្ទាល់ → ទៅ Login
  if (!state?.email) return <Navigate to="/login" replace />;
  return <VerifyEmailForm email={state.email} justRegistered={!!state.justRegistered} />;
}
