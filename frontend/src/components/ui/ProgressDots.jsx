/** Dots (Tap លោតជំហាន) — Touch target 44px */
export default function ProgressDots({ count, index, onSelect, getLabel }) {
  return (
    <div role="tablist" className="flex items-center justify-center">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === index}
          aria-label={getLabel(i)}
          onClick={() => onSelect(i)}
          className="flex h-11 w-8 items-center justify-center"
        >
          <span
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
