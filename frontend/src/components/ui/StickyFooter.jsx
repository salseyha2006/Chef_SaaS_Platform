/** Footer ជាប់ខាងក្រោម (Safe-area). ទំព័រត្រូវមាន pb-32 */
export default function StickyFooter({ children }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-100 bg-white/95 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      <div className="mx-auto max-w-md px-5">{children}</div>
    </div>
  );
}