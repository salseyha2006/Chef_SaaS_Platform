import BottomSheet from './BottomSheet';
import PrimaryButton from './PrimaryButton';

/** Menu "⋮" ជា Sheet ខាងក្រោម. actions: [{ key, label, destructive?, onSelect }] */
export default function ActionSheet({ open, title, actions, cancelLabel, onClose }) {
  return (
    <BottomSheet open={open} title={title} onClose={onClose}>
      <ul className="mt-3 divide-y divide-slate-100">
        {actions.map((a) => (
          <li key={a.key}>
            <button
              type="button"
              onClick={() => { onClose(); a.onSelect(); }}
              className={`flex min-h-[56px] w-full items-center text-left text-base font-medium ${
                a.destructive ? 'text-red-600' : 'text-slate-800'
              }`}
            >
              {a.label}
            </button>
          </li>
        ))}
      </ul>
      <PrimaryButton variant="secondary" className="mt-3" onClick={onClose}>{cancelLabel}</PrimaryButton>
    </BottomSheet>
  );
}