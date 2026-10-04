import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { safeStorage } from '../utils/storage';

import kmCommon from './locales/km/common.json';
import kmLogin from './locales/km/login.json';
import kmRegister from './locales/km/register.json';
import kmVerify from './locales/km/verify.json';
import kmReset from './locales/km/reset.json';
import kmErrors from './locales/km/errors.json';
import enCommon from './locales/en/common.json';
import enLogin from './locales/en/login.json';
import enRegister from './locales/en/register.json';
import enVerify from './locales/en/verify.json';
import enReset from './locales/en/reset.json';
import enErrors from './locales/en/errors.json';

export const SUPPORTED_LANGS = ['km', 'en'];
export const DEFAULT_LANG = 'km';
const LANG_KEY = 'chef.lang';

const stored = safeStorage.get(LANG_KEY);
const initialLang = SUPPORTED_LANGS.includes(stored) ? stored : DEFAULT_LANG;

i18n.use(initReactI18next).init({
  lng: initialLang,
  fallbackLng: DEFAULT_LANG,
  supportedLngs: SUPPORTED_LANGS,
  ns: ['common', 'login', 'register', 'verify', 'reset', 'errors'],
  defaultNS: 'common',
  resources: {
    km: { common: kmCommon, login: kmLogin, register: kmRegister, verify: kmVerify, reset: kmReset, errors: kmErrors },
    en: { common: enCommon, login: enLogin, register: enRegister, verify: enVerify, reset: enReset, errors: enErrors },
  },
  interpolation: { escapeValue: false },
  returnNull: false,
});

document.documentElement.lang = initialLang;

/** ប្តូរភាសា + រក្សាទុក (Sync ទៅ Profile ធ្វើក្នុង 2D) */
export function changeLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return Promise.resolve();
  safeStorage.set(LANG_KEY, lang);
  document.documentElement.lang = lang;
  return i18n.changeLanguage(lang);
}

export const hasStoredLanguage = () => SUPPORTED_LANGS.includes(safeStorage.get(LANG_KEY));

export default i18n;