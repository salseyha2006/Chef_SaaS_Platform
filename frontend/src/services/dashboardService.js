import { api } from './api';
import { mockDashboard } from './mock/mockDashboard';
import { toDashboard } from '../utils/format';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** GET /dashboard (Auth) → Dashboard (upcomingEvents ≤5, dishCount, menuSetCount, monthlySpending) */
async function get() {
  const data = USE_MOCK ? await mockDashboard.get() : await api.get('/dashboard');
  return toDashboard(data);
}

export const dashboardService = { get };
