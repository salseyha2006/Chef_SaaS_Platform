import { useEffect, useState } from 'react';

const FIELD =
  'input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=file]):not([type=range]), textarea';

/**
 * true ពេល Focus លើប្រអប់អក្សរ ក្នុងឧបករណ៍ Touch (Keyboard ស្ទើរតែប្រាកដបើក) — Desktop តែងតែ false
 * ប្រើលាក់ Bottom Nav មិនឱ្យអណ្តែតលើ Keyboard
 */
export function useTextFieldFocus() {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!window.matchMedia?.('(pointer: coarse)').matches) return undefined;

    const onIn = (e) => {
      if (e.target instanceof Element && e.target.matches(FIELD)) setFocused(true);
    };
    const onOut = (e) => {
      // ផ្លាស់ពី Field មួយទៅមួយ → កុំឱ្យលោត
      if (e.relatedTarget instanceof Element && e.relatedTarget.matches(FIELD)) return;
      setFocused(false);
    };

    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);

  return focused;
}
