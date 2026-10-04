/** Logic សុទ្ធ (គ្មាន React): បម្លែង Subscription → ស្ថានភាពសម្រាប់ UI */

export const EXPIRING_SOON_DAYS = 3;
const DAY_MS = 86400000;

export function daysUntil(dateLike, now = Date.now()) {
  if (!dateLike) return null;
  const t = new Date(dateLike).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.ceil((t - now) / DAY_MS));
}

/**
 * kind: trial | paid | canceled | expired | none
 * tone: info | success | warning | danger  (UX 4.1: ខៀវ/បៃតង → លឿង ≤3 ថ្ងៃ → ក្រហម)
 * isLocked: true → Graceful Lockout (US-17)
 */
export function getSubscriptionState(sub) {
  if (!sub) {
    return {
      kind: 'none', tone: 'danger', isTrial: false, isLocked: true,
      daysRemaining: 0, endDate: null, autoRenew: false,
    };
  }

  const isTrial = sub.plan?.billingCycle === 'trial';
  const endTime = sub.endDate ? new Date(sub.endDate).getTime() : NaN;
  const ended = sub.status === 'expired' || (!Number.isNaN(endTime) && endTime <= Date.now());
  const daysRemaining = ended ? 0 : (sub.daysRemaining ?? daysUntil(sub.endDate) ?? 0);

  let kind = 'paid';
  if (ended) kind = 'expired';
  else if (isTrial) kind = 'trial';
// មុន:  else if (!sub.autoRenew) kind = 'canceled';
  else if (!sub.autoRenew || sub.status === 'canceled') kind = 'canceled';

  let tone = 'success';
  if (kind === 'expired') tone = 'danger';
  else if (daysRemaining <= EXPIRING_SOON_DAYS) tone = 'warning';
  else if (kind === 'trial') tone = 'info';

  return {
    kind,
    tone,
    isTrial,
    isLocked: ended,
    daysRemaining,
    endDate: sub.endDate,
    autoRenew: sub.autoRenew,
  };
}