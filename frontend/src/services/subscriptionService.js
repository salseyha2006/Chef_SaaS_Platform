import { api } from './api';
import { mockSubscription } from './mock/mockSubscription';
import { toPlan, toSubscription } from '../utils/format';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** GET /subscription/plans (Public) → Plan[] (active, មិនរួម trial) */
async function getPlans() {
  const data = USE_MOCK ? await mockSubscription.plans() : await api.get('/subscription/plans');
  return (data || []).map(toPlan);
}

/** GET /subscription/me → Subscription + plan + daysRemaining (404 SUBSCRIPTION_NOT_FOUND) */
async function getMe() {
  const data = USE_MOCK ? await mockSubscription.me() : await api.get('/subscription/me');
  return toSubscription(data);
}

/** POST /subscription/cancel → Subscription (autoRenew:false, គ្មាន plan → ហៅ getMe ម្តងទៀត) */
async function cancel() {
  const data = USE_MOCK ? await mockSubscription.cancel() : await api.post('/subscription/cancel');
  return toSubscription(data);
}

/** POST /subscription/resume → Subscription (autoRenew:true) */
async function resume() {
  const data = USE_MOCK ? await mockSubscription.resume() : await api.post('/subscription/resume');
  return toSubscription(data);
}

export const subscriptionService = { getPlans, getMe, cancel, resume };