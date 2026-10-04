import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { GlobeIcon } from './ui/Icons';

const SHORT = { km: 'ខ្មែរ', en: 'EN' };

/** Segmented toggle: ប៉ះម្តងប្តូរភ្លាម (គ្មាន Dropdown)។ API ដូចមុន: className, onChange(code) */
export default function LanguageSwitch({ className = '', onChange }) {
  const { t } = useTranslation('common');
  const { lang, languages, setLang } = useLanguage();

  const select = async (code) => {
    if (code === lang) return;
    await setLang(code);
    onChange?.(code); // 2D: Sync ទៅ PATCH /auth/profile
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <GlobeIcon width={18} height={18} className="text-slate-400" />
      <div
        role="radiogroup"
        aria-label={t('language.label')}
        className="inline-flex rounded-full bg-slate-100 p-0.5"
      >
        {languages.map((code) => {
          const active = code === lang;
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => select(code)}
              className={`h-10 min-w-[44px] rounded-full px-3 text-sm font-semibold transition ${
                active ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {SHORT[code] ?? code}
            </button>
          );
        })}
      </div>
    </div>
  );
}