import { api, setAccessToken } from './api';
import { mockAuth } from './mock/mockAuth';
import { toChef } from '../utils/format';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** POST /auth/login → { accessToken, chef } */
async function login({ email, password }) {
  const data = USE_MOCK
    ? await mockAuth.login({ email, password })
    : await api.post('/auth/login', { email, password });
  return { accessToken: data.accessToken, chef: toChef(data.chef) };
}

/** POST /auth/google → { accessToken, chef } */
async function google({ idToken, language }) {
  const data = USE_MOCK
    ? await mockAuth.google({ idToken })
    : await api.post('/auth/google', { idToken, language });
  return { accessToken: data.accessToken, chef: toChef(data.chef) };
}

/** POST /auth/register → { id, email, language } (មិនមាន token; ត្រូវ Verify OTP មុន) */
async function register({ email, password, displayName, language }) {
  const body = { email, password, language, ...(displayName ? { displayName } : {}) };
  return USE_MOCK ? mockAuth.register(body) : api.post('/auth/register', body);
}

/** POST /auth/verify-email → null */
async function verifyEmail({ email, otp }) {
  return USE_MOCK ? mockAuth.verifyEmail({ email, otp }) : api.post('/auth/verify-email', { email, otp });
}

/** POST /auth/resend-otp → null */
async function resendOtp({ email }) {
  return USE_MOCK ? mockAuth.resendOtp({ email }) : api.post('/auth/resend-otp', { email });
}

/** Bootstrap session: cookie refreshToken → accessToken ថ្មី → /auth/me */
async function restoreSession() {
  const r = USE_MOCK ? await mockAuth.refresh() : await api.post('/auth/refresh-token');
  setAccessToken(r.accessToken);
  const me = USE_MOCK ? await mockAuth.me() : await api.get('/auth/me');
  return toChef(me);
}

/** POST /auth/logout */
async function logout() {
  return USE_MOCK ? mockAuth.logout() : api.post('/auth/logout');
}

/** PATCH /auth/profile */
async function updateProfile(body) {
  const data = USE_MOCK ? await mockAuth.updateProfile(body) : await api.patch('/auth/profile', body);
  return toChef(data);
}

/** POST /auth/forgot-password → null (ដូចគ្នាទោះ Email មានឬអត់) */
async function forgotPassword({ email }) {
  return USE_MOCK ? mockAuth.forgotPassword({ email }) : api.post('/auth/forgot-password', { email });
}

/** POST /auth/reset-password → null (Server លុប Refresh Token ទាំងអស់) */
async function resetPassword({ email, otp, newPassword }) {
  return USE_MOCK
    ? mockAuth.resetPassword({ email, otp, newPassword })
    : api.post('/auth/reset-password', { email, otp, newPassword });
}

export const authService = {
  login,
  google,
  register,
  verifyEmail,
  resendOtp,
  restoreSession,
  logout,
  updateProfile,
};