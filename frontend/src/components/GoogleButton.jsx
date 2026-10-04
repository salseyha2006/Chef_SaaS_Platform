import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryButton from './ui/PrimaryButton';
import { GoogleIcon } from './ui/Icons';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const GSI_SRC = 'https://accounts.google.com/gsi/client';

function loadGsi() {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    const s = existing || Object.assign(document.createElement('script'), { src: GSI_SRC, async: true });
    s.addEventListener('load', resolve, { once: true });
    s.addEventListener('error', reject, { once: true });
    if (!existing) document.head.appendChild(s);
  });
}

/**
 * onCredential(idToken) · onError(code)  (code ∈ GOOGLE_UNAVAILABLE | GOOGLE_CANCELLED)
 * Mock mode ឬគ្មាន CLIENT_ID: ប៊ូតុង Secondary ធម្មតា ផ្ញើ token ក្លែង
 */
export default function GoogleButton({ label, disabled, onCredential, onError, text = 'signin_with' }) {
  const { i18n } = useTranslation();
  const holder = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (USE_MOCK || !CLIENT_ID) return undefined;
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || !holder.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (res) => (res.credential ? onCredential(res.credential) : onError('GOOGLE_CANCELLED')),
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(holder.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text,
          locale: i18n.resolvedLanguage === 'km' ? 'km' : 'en',
          width: Math.min(holder.current.offsetWidth || 320, 400),
        });
        setReady(true);
      })
      .catch(() => onError('GOOGLE_UNAVAILABLE'));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.resolvedLanguage]);

  if (USE_MOCK || !CLIENT_ID) {
    return (
      <PrimaryButton variant="secondary" disabled={disabled} onClick={() => onCredential('mock-google-id-token')}>
        <GoogleIcon />
        {label}
      </PrimaryButton>
    );
  }

  return (
    <div className={disabled ? 'pointer-events-none opacity-50' : ''}>
      <div ref={holder} className="flex min-h-[52px] w-full justify-center" />
      {!ready && <p className="text-center text-sm text-slate-400">…</p>}
    </div>
  );
}
