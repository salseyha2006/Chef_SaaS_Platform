import { formatQuantity, unitLabel } from '../../utils/shopping';

/**
 * ជួរ Check-off (UX 12.1): Checkbox ធំ (ជួរទាំងមូលជា Touch Target ≥ 64px) | ឈ្មោះ | បរិមាណ
 * ទិញរួច → ព្រាល + ឆូតកណ្តាល. ✓ លោតចូល (Bounce តាម cubic-bezier)
 * props: item (ShoppingItem + isPurchased), busy:boolean (កំពុងបញ្ជូន), onToggle(). ត្រឡប់ <li>
 */
export default function CheckoffRow({ item, busy, onToggle }) {
  const done = item.isPurchased;
  const unit = unitLabel(item.unit);
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-busy={busy}
        onClick={onToggle}
        className={`flex min-h-[64px] w-full items-center gap-4 px-4 py-2 text-left transition-colors active:bg-slate-100 ${
          done ? 'bg-slate-50' : 'bg-white'
        }`}
      >
        <span aria-hidden="true"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
            done ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'
          }`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            className={`h-5 w-5 text-white transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${
              done ? 'scale-100' : 'scale-0'
            }`}>
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span className={`min-w-0 flex-1 truncate text-base font-medium ${done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
          {item.ingredientName}
        </span>
        <span className={`shrink-0 text-base font-semibold tabular-nums ${done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
          {formatQuantity(item.totalQuantity)} {unit}
        </span>
      </button>
    </li>
  );
}
