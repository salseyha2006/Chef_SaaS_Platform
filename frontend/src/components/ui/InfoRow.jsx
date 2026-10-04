/** ជួរ Label/Value ក្នុង <dl> (ប្រើក្នុង Transaction Detail; SubscriptionPage អាចប្តូរមកប្រើក្រោយ) */
export default function InfoRow({ label, value, breakAll = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="shrink-0 text-[15px] text-slate-500">{label}</dt>
      <dd className={`text-right text-[15px] font-semibold text-slate-900 ${breakAll ? 'break-all' : 'break-words'}`}>
        {value}
      </dd>
    </div>
  );
}