import { api } from './api';
import { safeStorage } from '../utils/storage';
import { MOCK_ONBOARDED_KEY } from './mock/mockAuth';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** PATCH /onboarding/complete → { hasCompletedOnboarding: true } (ប្រើទាំង Skip និង Finish) */
async function complete() {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    safeStorage.set(MOCK_ONBOARDED_KEY, '1');
    return { hasCompletedOnboarding: true };
  }
  return api.patch('/onboarding/complete');
}

export const onboardingService = { complete };
