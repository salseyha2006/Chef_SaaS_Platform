import { forwardRef, useImperativeHandle, useRef } from 'react';

/**
 * OTP 6 ប្រអប់ដាច់ដោយឡែក
 * - auto-advance, Backspace ត្រឡប់ក្រោយ, ព្រួញ ←/→
 * - Paste / SMS autofill (autocomplete="one-time-code") ចែកចូលប្រអប់ទាំងអស់
 * props: value (string), onChange(string), error (bool), label, disabled
 * ref.focus() → focus ប្រអប់ដំបូង
 */
const OTPInput = forwardRef(function OTPInput(
  { length = 6, value = '', onChange, error = false, disabled = false, autoFocus = true, label = 'OTP', className = '' },
  ref,
) {
  const inputs = useRef([]);

  const focusAt = (i) => inputs.current[Math.max(0, Math.min(i, length - 1))]?.focus();
  useImperativeHandle(ref, () => ({ focus: () => focusAt(0) }), [length]);

  const commit = (next) => onChange(next.replace(/\D/g, '').slice(0, length));

  const handleChange = (i, e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    // 1 ខ្ទង់: ជំនួសនៅទីតាំង i; ច្រើនខ្ទង់ (autofill/paste): បំពេញពី i
    const next = raw.length === 1 ? value.slice(0, i) + raw + value.slice(i + 1) : value.slice(0, i) + raw;
    commit(next);
    focusAt(Math.min(i + raw.length, length - 1));
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[i]) {
        commit(value.slice(0, i) + value.slice(i + 1));
      } else if (i > 0) {
        commit(value.slice(0, i - 1) + value.slice(i));
        focusAt(i - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusAt(i + 1);
    }
  };

  const handlePaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '');
    if (!text) return;
    e.preventDefault();
    commit(text);
    focusAt(Math.min(text.length, length - 1));
  };

  return (
    <div
      role="group"
      aria-label={label}
      className={`flex justify-between gap-2 ${error ? 'animate-shake' : ''} ${className}`}
    >
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={i === 0 ? length : 1}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          value={value[i] || ''}
          aria-label={`${label} ${i + 1}`}
          aria-invalid={error}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => {
            if (i > value.length) focusAt(value.length); // មិនឱ្យរំលងប្រអប់
            else e.target.select();
          }}
          className={`h-14 w-full min-w-0 rounded-xl border bg-white text-center text-xl font-semibold text-slate-900 outline-none transition focus:ring-4 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
              : value[i]
                ? 'border-emerald-300 focus:border-emerald-600 focus:ring-emerald-100'
                : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-100'
          }`}
        />
      ))}
    </div>
  );
});

export default OTPInput;
