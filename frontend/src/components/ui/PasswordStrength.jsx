import { useTranslation } from 'react-i18next';

export function scorePassword(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (pw.length >= 12) s += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  return s;
}

function levelOf(pw) {
  const s = scorePassword(pw);
  if (pw.length < 8 || s <= 2) return { key: 'weak', bars: 1, bar: 'bg-red-500', text: 'text-red-600' };
  if (s === 3) return { key: 'medium', bars: 2, bar: 'bg-amber-500', text: 'text-amber-600' };
  return { key: 'strong', bars: 3, bar: 'bg-emerald-500', text: 'text-emerald-600' };
}

/** Indicator ណែនាំប៉ុណ្ណោះ (Backend តម្រូវតែ ≥ 8 តួ) */
export default function PasswordStrength({ password }) {
  const { t } = useTranslation('register');
  if (!password) return null;
  const lv = levelOf(password);

  return (
    <div className="mt-2 flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1.5" aria-hidden>
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-1.5 flex-1 rounded-full transition-colors ${n <= lv.bars ? lv.bar : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <span className={`text-sm font-medium ${lv.text}`}>{t(`strength.${lv.key}`)}</span>
    </div>
  );
}