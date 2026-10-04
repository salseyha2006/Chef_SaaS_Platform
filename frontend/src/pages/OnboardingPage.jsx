import { useCallback, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { onboardingService } from '../services/onboardingService';
import { useSwipe } from '../hooks/useSwipe';
import { ONBOARDING_STEPS } from '../config/onboardingSteps';
import LanguageSwitch from '../components/LanguageSwitch';
import OnboardingSlide from '../components/OnboardingSlide';
import ProgressDots from '../components/ui/ProgressDots';
import PrimaryButton from '../components/ui/PrimaryButton';

const TOTAL = ONBOARDING_STEPS.length;

export default function OnboardingPage() {
  const { t } = useTranslation('onboarding');
  const { chef, updateChef, syncLanguage } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const replay = !!state?.replay; // មកពី Profile → មើលឡើងវិញ (មិនហៅ API)

  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const last = index === TOTAL - 1;

  const go = useCallback((i) => setIndex(Math.max(0, Math.min(i, TOTAL - 1))), []);
  const swipe = useSwipe({ onLeft: () => go(index + 1), onRight: () => go(index - 1) });

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(index + 1);
      if (e.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, go]);

  // Scenario 4: ធ្លាប់ឃើញរួច → មិនបង្ហាញ (លើកលែង Replay)
  if (chef?.hasCompletedOnboarding && !replay) return <Navigate to="/" replace />;

  /** Skip និង Finish កត់ត្រាដូចគ្នា (Scenario 2, 3) */
  const finish = async () => {
    if (saving) return;
    if (replay) return navigate('/profile', { replace: true });
    setSaving(true);
    setError('');
    try {
      await onboardingService.complete();
      updateChef({ hasCompletedOnboarding: true });
      navigate('/', { replace: true });
    } catch {
      setError(t('error')); // នៅទំព័រដដែល ដើម្បីចុចម្តងទៀត (បើមិនដូច្នេះ Gate នឹងនាំត្រឡប់មកវិញ)
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-emerald-50 via-white to-white pt-[env(safe-area-inset-top)]">
      <header className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-5">
        <LanguageSwitch onChange={syncLanguage} />
        {!last ? (
          <button
            type="button"
            onClick={finish}
            disabled={saving}
            className="flex h-11 min-w-11 items-center px-2 text-[15px] font-semibold text-slate-500 hover:text-slate-700"
          >
            {t('skip')}
          </button>
        ) : (
          <span className="h-11" />
        )}
      </header>

      <main
        {...swipe}
        style={{ touchAction: 'pan-y' }}
        className="mx-auto flex w-full max-w-md flex-1 select-none flex-col justify-center overflow-hidden"
      >
        <div
          className="flex transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {ONBOARDING_STEPS.map((s, i) => (
            <OnboardingSlide
              key={s.id}
              icon={s.icon}
              tone={s.tone}
              active={i === index}
              title={t(`steps.${s.id}.title`)}
              description={t(`steps.${s.id}.description`)}
            />
          ))}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-md px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <ProgressDots
          count={TOTAL}
          index={index}
          onSelect={go}
          getLabel={(i) => t('stepLabel', { n: i + 1 })}
        />
        {error && (
          <p role="alert" className="mt-2 text-center text-sm text-red-600">
            {error}
          </p>
        )}
        <PrimaryButton className="mt-3" loading={saving} onClick={last ? finish : () => go(index + 1)}>
          {last ? t('start') : t('next')}
        </PrimaryButton>
      </footer>
    </div>
  );
}
