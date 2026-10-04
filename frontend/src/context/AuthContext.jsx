import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import i18n, { changeLanguage, hasStoredLanguage } from '../i18n';
import { setAccessToken, setAuthFailureHandler } from '../services/api';
import { authService } from '../services/authService';
import { safeStorage } from '../utils/storage';

const AuthContext = createContext(null);
const LOGOUT_BROADCAST_KEY = 'chef.logout'; // US-09: multi-tab logout

export function AuthProvider({ children }) {
  const [chef, setChef] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | authenticated | guest

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setChef(null);
    setStatus('guest');
  }, []);

  /** ភាសាមុន Login (localStorage) ឈ្នះ; បើមិនធ្លាប់ជ្រើស ប្រើភាសាក្នុង Profile */
  const reconcileLanguage = useCallback(async (serverChef) => {
    if (hasStoredLanguage()) {
      const local = i18n.resolvedLanguage || i18n.language;
      if (serverChef.language !== local) {
        authService.updateProfile({ language: local }).catch(() => {});
        return { ...serverChef, language: local };
      }
      return serverChef;
    }
    await changeLanguage(serverChef.language);
    return serverChef;
  }, []);

  const startSession = useCallback(
    async ({ accessToken, chef: c }) => {
      setAccessToken(accessToken);
      const merged = await reconcileLanguage(c);
      setChef(merged);
      setStatus('authenticated');
    },
    [reconcileLanguage],
  );

  // Bootstrap
  useEffect(() => {
    setAuthFailureHandler(clearSession);
    let cancelled = false;
    authService
      .restoreSession()
      .then(async (c) => {
        if (cancelled) return;
        setChef(await reconcileLanguage(c));
        setStatus('authenticated');
      })
      .catch(() => { if (!cancelled) clearSession(); });
    return () => { cancelled = true; };
  }, [clearSession, reconcileLanguage]);

  // Logout ពី Tab ផ្សេង
  useEffect(() => {
    const onStorage = (e) => { if (e.key === LOGOUT_BROADCAST_KEY) clearSession(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [clearSession]);

  const login = useCallback(async (creds) => startSession(await authService.login(creds)), [startSession]);

  const loginWithGoogle = useCallback(
    async (idToken) =>
      startSession(await authService.google({ idToken, language: i18n.resolvedLanguage || i18n.language })),
    [startSession],
  );

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* ចេញនៅ Client ដដែល */ }
    clearSession();
    safeStorage.set(LOGOUT_BROADCAST_KEY, String(Date.now()));
    safeStorage.remove(LOGOUT_BROADCAST_KEY);
  }, [clearSession]);

  const value = useMemo(
    () => ({ chef, status, isAuthenticated: status === 'authenticated', setChef, login, loginWithGoogle, logout }),
    [chef, status, login, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}