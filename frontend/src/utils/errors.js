import i18n from '../i18n';

/** បកប្រែ ApiError → string; fallback ទៅ message (EN) ពី Backend */
export function getErrorMessage(err) {
  const code = err?.code;
  if (code && i18n.exists(`errors:${code}`)) {
    return i18n.t(`errors:${code}`, err.params || {});
  }
  return err?.message || i18n.t('errors:INTERNAL_ERROR');
}

/** VALIDATION_FAILED → { [field]: message } ឬ null បើមិនមែន (ប្រើក្នុង Form គ្រប់ទំព័រ) */
export function getFieldErrors(err) {
  if (err?.code !== 'VALIDATION_FAILED' || !Array.isArray(err.errors) || !err.errors.length) return null;
  return Object.fromEntries(
    err.errors.map((x) => [x.field, getErrorMessage({ code: x.code, params: x.params, message: x.message })]),
  );
}
