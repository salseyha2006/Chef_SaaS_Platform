/** Adapter: Backend shape → UI shape. បន្ថែមតាម Epic បន្ទាប់ */

/** Chef ពី /auth/login, /auth/google, /auth/me, /auth/profile → UI Chef */
export function toChef(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    email: raw.email,
    displayName: raw.displayName || raw.email?.split('@')[0] || '',
    avatarUrl: raw.avatarUrl || null,
    language: raw.language || 'km',
    // មានតែក្នុង /auth/me
    isEmailVerified: raw.isEmailVerified,
    authProvider: raw.authProvider,
    hasCompletedOnboarding: raw.hasCompletedOnboarding,
  };
}

/** បញ្ចូល patch ទៅ Chef ដោយមិនឱ្យ field `undefined` ជាន់តម្លៃចាស់ */
export function mergeChef(prev, patch) {
  const clean = Object.fromEntries(Object.entries(patch || {}).filter(([, v]) => v !== undefined));
  return { ...prev, ...clean };
}
