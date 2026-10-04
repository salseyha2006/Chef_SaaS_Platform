import i18n from '../i18n';

/** បកប្រែ ApiError → string; fallback ទៅ message (EN) ពី Backend */
export function getErrorMessage(err) {
  const code = err?.code;
  if (code && i18n.exists(`errors:${code}`)) {
    return i18n.t(`errors:${code}`, err.params || {});
  }
  return err?.message || i18n.t('errors:INTERNAL_ERROR');
}