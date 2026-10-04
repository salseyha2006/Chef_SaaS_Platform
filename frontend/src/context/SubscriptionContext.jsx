import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { subscriptionService } from '../services/subscriptionService';
import { getSubscriptionState } from '../utils/subscription';

const SubscriptionContext = createContext(null);
const VIEW_ONLY_KEY = 'chef.viewOnly'; // sessionStorage: មួយ Session ប៉ុណ្ណោះ

const readViewOnly = () => {
  try { return window.sessionStorage.getItem(VIEW_ONLY_KEY) === '1'; } catch { return false; }
};
const writeViewOnly = (on) => {
  try {
    if (on) window.sessionStorage.setItem(VIEW_ONLY_KEY, '1');
    else window.sessionStorage.removeItem(VIEW_ONLY_KEY);
  } catch { /* ignore */ }
};

/**
 * status: idle | loading | ready | error
 * ready + subscription=null → 404 SUBSCRIPTION_NOT_FOUND (ចាត់ជា Locked)
 * error (បណ្តាញ...) → មិន Lock User
 * viewOnly: User ជ្រើស "មើលទិន្នន័យ (អានតែប៉ុណ្ណោះ)" ពេល Expired (US-17 Scenario 2)
 * promptOpen: Modal Upgrade ពេល 403 SUBSCRIPTION_* លើ Action សរសេរ (US-17 Scenario 3)
 */
export function SubscriptionProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [status, setStatus] = useState('idle');
  const [viewOnly, setViewOnly] = useState(readViewOnly);
  const [promptOpen, setPromptOpen] = useState(false);
  const reqRef = useRef(0); // ការពារ Response ចាស់ជាន់ State ថ្មី

  const refresh = useCallback(async () => {
    const id = ++reqRef.current;
    setStatus((s) => (s === 'ready' ? s : 'loading'));
    try {
      const data = await subscriptionService.getMe();
      if (id !== reqRef.current) return;
      setSubscription(data);
      setStatus('ready');
    } catch (err) {
      if (id !== reqRef.current) return;
      if (err.code === 'SUBSCRIPTION_NOT_FOUND') {
        setSubscription(null);
        setStatus('ready');
      } else {
        setStatus((s) => (s === 'ready' ? s : 'error')); // រក្សាទិន្នន័យចាស់ពេលបរាជ័យបណ្តោះអាសន្ន
      }
    }
  }, []);

  // Login → ទាញ; Logout → Reset
  useEffect(() => {
    if (isAuthenticated) {
      refresh();
      return;
    }
    reqRef.current += 1;
    setSubscription(null);
    setStatus('idle');
    setPromptOpen(false);
    setViewOnly(false);
    writeViewOnly(false);
  }, [isAuthenticated, refresh]);

  // api.js ផ្ញើ Event នេះពេល 403 SUBSCRIPTION_EXPIRED|NOT_FOUND
  useEffect(() => {
    const onRequired = () => {
      setPromptOpen(true);
      refresh();
    };
    window.addEventListener('subscription:required', onRequired);
    return () => window.removeEventListener('subscription:required', onRequired);
  }, [refresh]);

  const state = useMemo(
    () => (status === 'ready' ? getSubscriptionState(subscription) : null),
    [status, subscription],
  );

  // បង់ប្រាក់ជោគជ័យ (លែង Locked) → ចាកចេញ View-only
  useEffect(() => {
    if (state && !state.isLocked && viewOnly) {
      setViewOnly(false);
      writeViewOnly(false);
    }
  }, [state, viewOnly]);

  const enterViewOnly = useCallback(() => {
    writeViewOnly(true);
    setViewOnly(true);
  }, []);

  /** US-16: Cancel/Resume រួច → ទាញ /subscription/me ថ្មី (Response គ្មាន plan) */
  const cancel = useCallback(async () => {
    await subscriptionService.cancel();
    await refresh();
  }, [refresh]);

  const resume = useCallback(async () => {
    await subscriptionService.resume();
    await refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      subscription,
      state,
      status,
      viewOnly,
      promptOpen,
      closePrompt: () => setPromptOpen(false),
      enterViewOnly,
      refresh,
      cancel,
      resume,
    }),
    [subscription, state, status, viewOnly, promptOpen, enterViewOnly, refresh, cancel, resume],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used inside <SubscriptionProvider>');
  return ctx;
}