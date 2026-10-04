import { ApiError } from '../api';
import { safeStorage } from '../../utils/storage';

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const SESSION_KEY = 'mock.session';
export const MOCK_ONBOARDED_KEY = 'mock.onboarded'; // លុប Key នេះក្នុង DevTools ដើម្បីសាកល្បង Wizard ម្តងទៀត

// Demo: demo@chef.com / Password123
const demoChef = {
  id: 'mock-chef-1',
  email: 'demo@chef.com',
  displayName: 'Demo Chef',
  avatarUrl: null,
  language: 'km',
};

// ស្ថានភាពគណនី (ចុច Google mock → provider = google, គ្មានលេខសម្ងាត់ → សាកល្បង "កំណត់លេខសម្ងាត់")
let provider = 'local';
let currentPw = 'Password123';

const MAX_FAILS = 5;
const LOCK_MINUTES = 15;
let fails = 0;
let lockedUntil = 0;

const OTP_OK = '123456';
const OTP_EXPIRED = '000000';
const TAKEN_EMAILS = ['demo@chef.com', 'unverified@chef.com'];
const RESEND_MAX = 3;
const RESEND_LOCK_MINUTES = 10;
let resendCount = 0;
let resendLockedUntil = 0;

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR_MAX = 5 * 1024 * 1024;

const fail = (status, code, message, params) => {
  throw new ApiError({ status, code, message, params });
};

export const mockAuth = {
  async login({ email, password }) {
    await delay();
    if (email === 'unverified@chef.com') {
      fail(403, 'AUTH_EMAIL_NOT_VERIFIED', 'Email not verified');
    }
    if (Date.now() < lockedUntil) {
      const minutes = Math.ceil((lockedUntil - Date.now()) / 60000);
      fail(403, 'AUTH_ACCOUNT_LOCKED', 'Account locked', { minutes });
    }
    if (email !== demoChef.email || !currentPw || password !== currentPw) {
      fails += 1;
      if (fails >= MAX_FAILS) {
        fails = 0;
        lockedUntil = Date.now() + LOCK_MINUTES * 60000;
        fail(403, 'AUTH_TOO_MANY_ATTEMPTS', 'Too many attempts', { minutes: LOCK_MINUTES });
      }
      fail(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid credentials');
    }
    fails = 0;
    provider = 'local';
    safeStorage.set(SESSION_KEY, '1');
    return { accessToken: 'mock-access-token', chef: { ...demoChef } };
  },

  async google({ idToken }) {
    await delay();
    if (!idToken) fail(401, 'AUTH_GOOGLE_TOKEN_INVALID', 'Invalid Google token');
    provider = 'google';
    currentPw = null; // Google-only: មិនទាន់មានលេខសម្ងាត់
    safeStorage.set(SESSION_KEY, '1');
    return { accessToken: 'mock-access-token', chef: { ...demoChef } };
  },

  async refresh() {
    await delay(200);
    if (!safeStorage.get(SESSION_KEY)) {
      fail(401, 'AUTH_REFRESH_TOKEN_MISSING', 'Missing refresh token');
    }
    return { accessToken: 'mock-access-token' };
  },

  async me() {
    await delay(200);
    return {
      ...demoChef,
      isEmailVerified: true,
      authProvider: provider,
      hasCompletedOnboarding: safeStorage.get(MOCK_ONBOARDED_KEY) === '1',
      createdAt: new Date().toISOString(),
    };
  },

  async logout() {
    await delay(200);
    safeStorage.remove(SESSION_KEY);
    return null;
  },

  async updateProfile(body) {
    await delay(400);
    if (body.displayName !== undefined && body.displayName.trim().length < 2) {
      fail(400, 'VALIDATION_FAILED', 'Validation failed', undefined);
    }
    Object.assign(demoChef, body);
    return { ...demoChef };
  },

  /** POST /auth/avatar (multipart) → { avatarUrl } */
  async uploadAvatar(formData) {
    await delay(800);
    const file = formData.get('avatar');
    if (!file) fail(400, 'AVATAR_FILE_REQUIRED', 'Avatar required');
    if (!AVATAR_TYPES.includes(file.type)) fail(400, 'AVATAR_INVALID_TYPE', 'Invalid type');
    if (file.size > AVATAR_MAX) fail(400, 'AVATAR_TOO_LARGE', 'Too large');
    demoChef.avatarUrl = URL.createObjectURL(file); // Mock ប៉ុណ្ណោះ (បាត់ពេល Refresh)
    return { avatarUrl: demoChef.avatarUrl };
  },

  /** PATCH /auth/change-password */
  async changePassword({ currentPassword, newPassword }) {
    await delay(700);
    if (currentPw) {
      if (!currentPassword) fail(400, 'AUTH_CURRENT_PASSWORD_REQUIRED', 'Current password required');
      if (currentPassword !== currentPw) {
        fail(401, 'AUTH_CURRENT_PASSWORD_INCORRECT', 'Current password incorrect');
      }
    }
    currentPw = newPassword; // Google-only (currentPw = null) → កំណត់លើកដំបូង
    return null;
  },

  async register({ email, language }) {
    await delay(700);
    if (TAKEN_EMAILS.includes(email.toLowerCase())) {
      fail(409, 'AUTH_EMAIL_EXISTS', 'Email already registered');
    }
    resendCount = 0;
    resendLockedUntil = 0;
    return { id: 'mock-new-chef', email, language: language || 'km' };
  },

  async verifyEmail({ otp }) {
    await delay(600);
    if (otp === OTP_EXPIRED) fail(400, 'AUTH_OTP_EXPIRED', 'OTP expired');
    if (otp !== OTP_OK) fail(400, 'AUTH_OTP_INVALID', 'Invalid OTP');
    return null;
  },

  async resendOtp() {
    await delay(500);
    if (Date.now() < resendLockedUntil) {
      fail(403, 'AUTH_OTP_RESEND_LIMITED', 'Resend limited', {
        minutes: Math.ceil((resendLockedUntil - Date.now()) / 60000),
      });
    }
    if (resendCount >= RESEND_MAX) {
      resendLockedUntil = Date.now() + RESEND_LOCK_MINUTES * 60000;
      fail(403, 'AUTH_OTP_RESEND_LIMITED', 'Resend limited', { minutes: RESEND_LOCK_MINUTES });
    }
    resendCount += 1;
    return null;
  },

  async forgotPassword() {
    await delay(600);
    return null; // ឆ្លើយដូចគ្នាទោះ Email មានឬអត់ (ដូច Backend)
  },

  async resetPassword({ otp }) {
    await delay(700);
    if (otp === OTP_EXPIRED) fail(400, 'AUTH_OTP_EXPIRED', 'OTP expired');
    if (otp !== OTP_OK) fail(400, 'AUTH_OTP_INVALID', 'Invalid OTP');
    return null;
  },
};
