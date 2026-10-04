import { useEffect, useState } from 'react';

const SIZES = { sm: 'h-10 w-10 text-base', md: 'h-14 w-14 text-xl', lg: 'h-24 w-24 text-4xl' };

/** រូបតំណាង; បើគ្មាន/ផ្ទុកមិនកើត → បង្ហាញអក្សរដំបូងនៃឈ្មោះ */
export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);

  const initial = (Array.from(name.trim())[0] || '?').toUpperCase();
  const box = `${SIZES[size]} shrink-0 rounded-full ${className}`;

  if (src && !failed) {
    return <img src={src} alt="" onError={() => setFailed(true)} className={`${box} object-cover`} />;
  }
  return (
    <span
      aria-hidden
      className={`${box} flex items-center justify-center bg-emerald-100 font-semibold text-emerald-700`}
    >
      {initial}
    </span>
  );
}
