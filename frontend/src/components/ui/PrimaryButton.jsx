export default function PrimaryButton({
  children,
  loading = false,
  disabled = false,
  variant = 'primary', // primary | secondary | danger
  className = '',
  type = 'button',
  ...rest
}) {
  const variants = {
    primary:
      'bg-emerald-600 text-white shadow-btn hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-300 disabled:shadow-none',
    secondary:
      'border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`flex h-[52px] w-full items-center justify-center gap-2.5 rounded-xl px-4 text-base font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
}
