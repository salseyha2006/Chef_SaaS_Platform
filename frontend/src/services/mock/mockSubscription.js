import { ApiError } from '../api';
import { safeStorage } from '../../utils/storage';

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const DAY = 86400000;

/**
 * សាកល្បង State ផ្សេងៗ: DevTools Console →
 *   localStorage.setItem('mock.sub', 'expired'); location.reload()
 * តម្លៃ: trial | trial-soon | active | canceled | expired | none
 */
export const MOCK_SUB_KEY = 'mock.sub';
const SCENARIOS = ['trial', 'trial-soon', 'active', 'canceled', 'expired', 'none'];

const PLANS = [
  { id: 'plan-basic-m', name: 'Basic', price: '9.00', billingCycle: 'monthly', isRecommended: false,
    features: ['គ្រឿងផ្សំមិនកំណត់', 'មុខម្ហូប 50', 'Event 10 ក្នុងមួយខែ'] },
  { id: 'plan-pro-m', name: 'Pro', price: '19.00', billingCycle: 'monthly', isRecommended: true,
    features: ['គ្រឿងផ្សំមិនកំណត់', 'មុខម្ហូបមិនកំណត់', 'Event មិនកំណត់', 'Export PDF/Excel'] },
  { id: 'plan-basic-y', name: 'Basic', price: '86.40', billingCycle: 'yearly', isRecommended: false,
    features: ['គ្រឿងផ្សំមិនកំណត់', 'មុខម្ហូប 50', 'Event 10 ក្នុងមួយខែ'] },
  { id: 'plan-pro-y', name: 'Pro', price: '182.40', billingCycle: 'yearly', isRecommended: true,
    features: ['គ្រឿងផ្សំមិនកំណត់', 'មុខម្ហូបមិនកំណត់', 'Event មិនកំណត់', 'Export PDF/Excel'] },
];
const TRIAL_PLAN = { id: 'plan-trial', name: 'Free Trial', price: '0.00', billingCycle: 'trial', isRecommended: false };

const fail = (status, code, message) => {
  throw new ApiError({ status, code, message });
};

const scenario = () => {
  const v = safeStorage.get(MOCK_SUB_KEY);
  return SCENARIOS.includes(v) ? v : 'trial';
};

function build(name) {
  const at = (days) => new Date(Date.now() + days * DAY).toISOString();
  const base = { id: 'mock-sub-1', startDate: at(-18) };
  switch (name) {
    case 'trial':
      return { ...base, status: 'trial', plan: TRIAL_PLAN, endDate: at(12), daysRemaining: 12, autoRenew: false, canceledAt: null };
    case 'trial-soon':
      return { ...base, status: 'trial', plan: TRIAL_PLAN, endDate: at(2), daysRemaining: 2, autoRenew: false, canceledAt: null };
    case 'active':
      return { ...base, status: 'active', plan: PLANS[1], endDate: at(20), daysRemaining: 20, autoRenew: true, canceledAt: null };
    case 'canceled':
      return { ...base, status: 'active', plan: PLANS[1], endDate: at(20), daysRemaining: 20, autoRenew: false, canceledAt: at(-1) };
    case 'expired':
      return { ...base, status: 'expired', plan: PLANS[1], endDate: at(-1), daysRemaining: 0, autoRenew: false, canceledAt: null };
    default:
      return null;
  }
}

export const mockSubscription = {
  /** GET /subscription/plans (Public) */
  async plans() {
    await delay(400);
    return PLANS.map((p) => ({ ...p }));
  },

  /** GET /subscription/me */
  async me() {
    await delay(300);
    const sub = build(scenario());
    if (!sub) fail(404, 'SUBSCRIPTION_NOT_FOUND', 'Subscription not found');
    return sub;
  },

  /** POST /subscription/cancel → Subscription (គ្មាន plan) */
  async cancel() {
    await delay(600);
    const s = scenario();
    if (s === 'none') fail(404, 'SUBSCRIPTION_NOT_FOUND', 'Subscription not found');
    if (s === 'active') safeStorage.set(MOCK_SUB_KEY, 'canceled');
    return { ...build(scenario()), plan: undefined };
  },

  /** POST /subscription/resume */
  async resume() {
    await delay(600);
    const s = scenario();
    if (s === 'none') fail(404, 'SUBSCRIPTION_NOT_FOUND', 'Subscription not found');
    if (s === 'expired') fail(400, 'SUBSCRIPTION_EXPIRED_CANNOT_RESUME', 'Expired, cannot resume');
    if (s !== 'canceled') fail(400, 'SUBSCRIPTION_ALREADY_AUTO_RENEWING', 'Already auto renewing');
    safeStorage.set(MOCK_SUB_KEY, 'active');
    return { ...build('active'), plan: undefined };
  },
};