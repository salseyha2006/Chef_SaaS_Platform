/** Adapter: Backend shape → UI shape. បន្ថែមតាម Epic បន្ទាប់ */

/** Chef ពី /auth/login, /auth/google, /auth/me, /auth/profile → UI Chef */
export function toChef(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    email: raw.email,
    displayName: raw.displayName || raw.email?.split('@')[0] || '',
    avatarUrl: raw.avatarUrl || null,
    language: raw.language || 'km',
    // មានតែក្នុង /auth/me
    isEmailVerified: raw.isEmailVerified,
    authProvider: raw.authProvider,
    hasCompletedOnboarding: raw.hasCompletedOnboarding,
  };
}

/** បញ្ចូល patch ទៅ Chef ដោយមិនឱ្យ field `undefined` ជាន់តម្លៃចាស់ */
export function mergeChef(prev, patch) {
  const clean = Object.fromEntries(Object.entries(patch || {}).filter(([, v]) => v !== undefined));
  return { ...prev, ...clean };
}

/**
 * Plan ពី /subscription/plans (Prisma raw → Decimal ជា string)
 * ⚠️ Contract មិនបញ្ជាក់ field របស់ Plan (Backend Gap #21) — Adapter នេះអានតាមការសន្មត់
 */
export function toPlan(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    name: raw.name,
    price: Number(raw.price ?? 0),
    currency: raw.currency || 'USD',
    billingCycle: raw.billingCycle, // 'trial' | 'monthly' | 'yearly' (សន្មត់)
    isRecommended: Boolean(raw.isRecommended ?? raw.recommended),
    features: Array.isArray(raw.features) ? raw.features.map(String) : [],
  };
}

/** Subscription ពី /subscription/me (+ plan + daysRemaining) */
export function toSubscription(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    status: raw.status,
    plan: toPlan(raw.plan),
    startDate: raw.startDate ?? null,
    endDate: raw.endDate ?? null,
    autoRenew: Boolean(raw.autoRenew),
    canceledAt: raw.canceledAt ?? null,
    daysRemaining: typeof raw.daysRemaining === 'number' ? raw.daysRemaining : undefined,
  };
}

/** $19.00 */
export function formatPrice(amount, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount) || 0);
  } catch {
    return `$${(Number(amount) || 0).toFixed(2)}`;
  }
}

/** ថ្ងៃទី តាមភាសា (km → km-KH) */
export function formatDate(value, lang = 'km') {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(lang === 'km' ? 'km-KH' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

/** Saved payment method ពី GET /billing/payment-methods (មិនមាន token/លេខកាតពេញ) */
export function toSavedPaymentMethod(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    provider: raw.provider, // 'ABA_PAYWAY' | 'VISA_MASTERCARD' | 'WING'
    last4: raw.last4,
    brand: raw.brand || null,
    isDefault: Boolean(raw.isDefault),
  };
}

/**
 * Transaction ពី /subscription/upgrade, /retry, /billing/transactions[/:id]
 * ⚠️ Contract មិនបញ្ជាក់ field (Gap #27/#36) — សន្មត់ ហើយ Normalize status/refundStatus ជាអក្សរតូច
 */
export function toTransaction(raw) {
  if (!raw) return null;
  const refund = raw.refundStatus ? String(raw.refundStatus).toLowerCase() : null;
  return {
    id: raw.id,
    amount: raw.amount != null ? Number(raw.amount) : undefined,
    currency: raw.currency || 'USD',
    status: raw.status ? String(raw.status).toLowerCase() : undefined, // success | failed | refunded | pending
    createdAt: raw.createdAt,
    invoiceNumber: raw.invoiceNumber || null,
    provider: raw.paymentMethod ?? raw.provider ?? null,
    planName: raw.plan?.name ?? null,
    refundStatus: refund && refund !== 'none' ? refund : null, // requested | approved | rejected
    refundReason: raw.refundReason ?? null,
  };
}

/** ថ្ងៃទី + ម៉ោង តាមភាសា */
export function formatDateTime(value, lang = 'km') {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(lang === 'km' ? 'km-KH' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

/** ខែ + ឆ្នាំ (ក្បាលក្រុមក្នុង Billing History) */
export function formatMonthYear(value, lang = 'km') {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(lang === 'km' ? 'km-KH' : 'en-GB', { month: 'long', year: 'numeric' }).format(d);
  } catch {
    return `${d.getMonth() + 1}/${d.getFullYear()}`;
  }
}

/** ChefUnit ពី GET /units, POST /units, import, archive */
export function toUnit(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    name: raw.name,
    abbreviation: raw.abbreviation || '',
    unitType: raw.unitType || null, // weight | volume | count
    conversionRate: Number(raw.conversionRate ?? 0),
    isActive: raw.isActive !== false,
  };
}

/** Preset Unit ពី GET /units/presets */
export function toPresetUnit(raw) {
  if (!raw) return null;
  return { ...toUnit(raw), isImported: Boolean(raw.isImported) };
}

/** ChefCategory ពី GET /categories, POST, import, archive */
export function toCategory(raw) {
  if (!raw) return null;
  return { id: raw.id, name: raw.name, isActive: raw.isActive !== false };
}

/** Preset Category ពី GET /categories/presets */
export function toPresetCategory(raw) {
  if (!raw) return null;
  return { id: raw.id, name: raw.name, isImported: Boolean(raw.isImported) };
}

/** Preset Ingredient: {id, name, defaultUnit:{id,name}|null, isImported} */
export function toPresetIngredient(raw) {
  return {
    id: raw.id,
    name: raw.name,
    defaultUnit: raw.defaultUnit ? { id: raw.defaultUnit.id, name: raw.defaultUnit.name } : null,
    isImported: Boolean(raw.isImported),
  };
}

/**
 * GET /ingredients/presets → Tree 3 កម្រិត [{ key, name, subs:[{ key, name|null, items[] }] }]
 * ⚠️ Contract បច្ចុប្បន្ន: [{category, items[]}] (2 កម្រិត) → ដាក់ក្នុង Sub តែមួយ (name:null)
 *    ពេល Backend ផ្តល់ Sub-category → កែតែ Function នេះ (Gap #48)
 */
export function toPresetTree(raw) {
  return (raw || []).map((g, gi) => {
    const key = g.id ?? g.category ?? gi;
    return {
      key: `g:${key}`,
      name: g.category,
      subs: [{ key: `s:${key}:0`, name: null, items: (g.items || []).map(toPresetIngredient) }],
    };
  });
}

/** Item ក្នុង GET /ingredients/my-stock: category ជា String (Gap #57) */
export function toStockItem(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category || '',
    purchasePrice: Number(raw.purchasePrice ?? 0),
    unit: raw.unit ? { id: raw.unit.id, name: raw.unit.name, abbreviation: raw.unit.abbreviation || '' } : null,
    source: raw.source ?? null,
  };
}

// ============================================================
// Epic 9–12 Adapters (Backend shape → UI shape)
// ============================================================

/**
 * Dish ពី GET /dishes (raw Prisma — Contract មិនបញ្ជាក់ field: Gap #60)
 * calculationType: Backend មិនទាន់មាន (US-44.1, Gap #65) → ដាក់ per_table ជាមុន
 */
export function toDish(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? '',
    imageUrl: raw.imageUrl || null,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    totalCost: raw.totalCost != null ? Number(raw.totalCost) : null,
    isArchived: Boolean(raw.isArchived),
    calculationType: String(raw.calculationType || '').toLowerCase() === 'fixed' ? 'fixed' : 'per_table',
  };
}

/**
 * Dish ពី GET /dishes/:id (DTO មាន costBreakdown)
 * ⚠️ Contract មិនបញ្ជាក់ `unit` (string ឬ object) និងគ្មាន chefIngredientId (Gap #66/#68)
 */
export function toDishDetail(raw) {
  if (!raw) return null;
  const unitLabel = (u) => (typeof u === 'string' ? u : u?.abbreviation || u?.name || '');
  return {
    ...toDish(raw),
    costBreakdown: (raw.costBreakdown || []).map((r) => ({
      chefIngredientId: r.chefIngredientId ?? null,
      ingredientName: r.ingredientName,
      quantityUsed: Number(r.quantityUsed ?? 0),
      unit: unitLabel(r.unit),
      unitPrice: Number(r.unitPrice ?? 0),
      subtotal: Number(r.subtotal ?? 0),
      percentageOfTotal: Number(r.percentageOfTotal ?? 0),
    })),
  };
}