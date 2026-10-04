import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from './ui/Icons';

/** Header ទំព័រ។ props: title, backTo (Link) ឬ onBack (button), backLabel, right (Node ខាងស្តាំ) */
export default function PageHeader({ title, backTo, onBack, backLabel = 'Back', right }) {
  const cls =
    '-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 active:bg-slate-200';
  return (
    <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-md items-center gap-2 px-5">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label={backLabel} className={cls}>
            <ArrowLeftIcon />
          </button>
        ) : (
          <Link to={backTo} replace aria-label={backLabel} className={cls}>
            <ArrowLeftIcon />
          </Link>
        )}
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-slate-900">{title}</h1>
        {right}
      </div>
    </header>
  );
}