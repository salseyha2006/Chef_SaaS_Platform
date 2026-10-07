import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { safeStorage } from '../utils/storage';

import kmCommon from './locales/km/common.json';
import kmLogin from './locales/km/login.json';
import kmRegister from './locales/km/register.json';
import kmVerify from './locales/km/verify.json';
import kmReset from './locales/km/reset.json';
import kmProfile from './locales/km/profile.json';
import kmOnboarding from './locales/km/onboarding.json';
import kmSubscription from './locales/km/subscription.json';
import kmErrors from './locales/km/errors.json';
import enCommon from './locales/en/common.json';
import enLogin from './locales/en/login.json';
import enRegister from './locales/en/register.json';
import enVerify from './locales/en/verify.json';
import enReset from './locales/en/reset.json';
import enProfile from './locales/en/profile.json';
import enOnboarding from './locales/en/onboarding.json';
import enSubscription from './locales/en/subscription.json';
import enErrors from './locales/en/errors.json';
import kmPayment from './locales/km/payment.json';
import enPayment from './locales/en/payment.json';
import kmBilling from './locales/km/billing.json';
import enBilling from './locales/en/billing.json';
import kmCatalog from './locales/km/catalog.json';
import enCatalog from './locales/en/catalog.json';
import kmIngredients from './locales/km/ingredients.json';
import enIngredients from './locales/en/ingredients.json';
import kmDishes from './locales/km/dishes.json';
import enDishes from './locales/en/dishes.json';
import kmMenuSets from './locales/km/menuSets.json';
import enMenuSets from './locales/en/menuSets.json';
import kmEvents from './locales/km/events.json';
import enEvents from './locales/en/events.json';
import kmDashboard from './locales/km/dashboard.json';
import enDashboard from './locales/en/dashboard.json';

export const SUPPORTED_LANGS = ['km', 'en'];
export const DEFAULT_LANG = 'km';
const LANG_KEY = 'chef.lang';

const stored = safeStorage.get(LANG_KEY);
const initialLang = SUPPORTED_LANGS.includes(stored) ? stored : DEFAULT_LANG;

i18n.use(initReactI18next).init({
  lng: initialLang,
  fallbackLng: DEFAULT_LANG,
  supportedLngs: SUPPORTED_LANGS,
  ns: [
    'common', 'login', 'register', 'verify', 'reset', 'profile', 'onboarding',
    'subscription', 'errors', 'payment', 'billing', 'catalog', 'ingredients',
    'dishes', 'menuSets', 'events', 'dashboard',
  ],
  defaultNS: 'common',
  resources: {
    km: {
      common: kmCommon, login: kmLogin, register: kmRegister, verify: kmVerify,
      reset: kmReset, profile: kmProfile, onboarding: kmOnboarding,
      subscription: kmSubscription, errors: kmErrors, payment: kmPayment, billing: kmBilling,
      catalog: kmCatalog, ingredients: kmIngredients,
      dishes: kmDishes, menuSets: kmMenuSets, events: kmEvents, dashboard: kmDashboard,
    },
    en: {
      common: enCommon, login: enLogin, register: enRegister, verify: enVerify,
      reset: enReset, profile: enProfile, onboarding: enOnboarding,
      subscription: enSubscription, errors: enErrors, payment: enPayment, billing: enBilling,
      catalog: enCatalog, ingredients: enIngredients,
      dishes: enDishes, menuSets: enMenuSets, events: enEvents, dashboard: enDashboard,
    },
  },
  interpolation: { escapeValue: false },
  returnNull: false,
});

document.documentElement.lang = initialLang;

/** ប្តូរភាសា + រក្សាទុក localStorage (Sync ទៅ Server ធ្វើក្នុង AuthContext.syncLanguage) */
export function changeLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return Promise.resolve();
  safeStorage.set(LANG_KEY, lang);
  document.documentElement.lang = lang;
  return i18n.changeLanguage(lang);
}

export const hasStoredLanguage = () => SUPPORTED_LANGS.includes(safeStorage.get(LANG_KEY));

export default i18n;