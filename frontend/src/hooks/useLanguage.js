import { useTranslation } from 'react-i18next';
import { changeLanguage, SUPPORTED_LANGS } from '../i18n';

export function useLanguage() {
  const { i18n } = useTranslation();
  return {
    lang: i18n.resolvedLanguage || i18n.language,
    languages: SUPPORTED_LANGS,
    setLang: changeLanguage,
  };
}
