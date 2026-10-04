import { Link } from 'react-router-dom';
import LanguageSwitch from './LanguageSwitch';
import { ArrowLeftIcon, ChefHatIcon } from './ui/Icons';

/**
 * Layout រួមសម្រាប់ទំព័រ Auth (Register, Verify, Forgot/Reset...)
 * props: title, subtitle (node), icon (node), backTo, backState, backLabel, footer (node)
 */
export default function AuthLayout({ title, subtitle, icon, backTo, backState, backLabel, footer, children }) {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-emerald-50 via-slate-50 to-slate-50">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 pb-8 pt-[max(1rem,env(safe-area-inset-top))] sm:justify-center">
        <header className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-1">
            {backTo && (
              <Link
                to={backTo}
                state={backState}
                replace
                aria-label={backLabel}
                className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-slate-600 hover:bg-white active:bg-slate-100"
              >
                <ArrowLeftIcon />
              </Link>
            )}
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-btn">
                <ChefHatIcon width={22} height={22} />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">Chef</span>
            </div>
          </div>
          <LanguageSwitch />
        </header>

        <main className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
          {icon && (
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              {icon}
            </div>
          )}
          <h1 className="text-[1.65rem] font-bold leading-normal text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-[15px] text-slate-500">{subtitle}</p>}
          {children}
        </main>

        {footer && <footer className="pt-5 text-center">{footer}</footer>}
      </div>
    </div>
  );
}
