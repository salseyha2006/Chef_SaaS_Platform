import { ApiError } from '../api';
import { safeStorage } from '../../utils/storage';

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const SESSION_KEY = 'mock.session';

// Demo: demo@chef.com / Password123
const demoChef = {
  id: 'mock-chef-1',
  email: 'demo@chef.com',
  displayName: 'Demo Chef',
  avatarUrl: null,
  language: 'km',
};

const MAX_FAILS = 5;
const LOCK_MINUTES = 15;
let fails = 0;
let lockedUntil = 0;

const OTP_OK = '123456';       // ត្រឹមត្រូវ
const OTP_EXPIRED = '000000';  // ផុតកំណត់
const TAKEN_EMAILS = ['demo@chef.com', 'unverified@chef.com'];
const RESEND_MAX = 3;
const RESEND_LOCK_MINUTES = 10;
let resendCount = 0;
let resendLockedUntil = 0;

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
    if (email !== demoChef.email || password !== 'Password123') {
      fails += 1;
      if (fails >= MAX_FAILS) {
        fails = 0;
        lockedUntil = Date.now() + LOCK_MINUTES * 60000;
        fail(403, 'AUTH_TOO_MANY_ATTEMPTS', 'Too many attempts', { minutes: LOCK_MINUTES });
      }
      fail(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid credentials');
    }
    fails = 0;
    safeStorage.set(SESSION_KEY, '1');
    return { accessToken: 'mock-access-token', chef: demoChef };
  },

  async google({ idToken }) {
    await delay();
    if (!idToken) fail(401, 'AUTH_GOOGLE_TOKEN_INVALID', 'Invalid Google token');
    safeStorage.set(SESSION_KEY, '1');
    return { accessToken: 'mock-access-token', chef: demoChef };
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
      authProvider: 'local',
      hasCompletedOnboarding: true,
      createdAt: new Date().toISOString(),
    };
  },

  async logout() {
    await delay(200);
    safeStorage.remove(SESSION_KEY);
    return null;
  },

  async updateProfile(body) {
    await delay(200);
    return { ...demoChef, ...body };
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