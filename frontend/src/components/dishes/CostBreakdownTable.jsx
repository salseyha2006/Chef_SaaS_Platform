import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/format';

const fmtQty = (n) => String(Number(Number(n).toFixed(3)));

/**
 * តារាងបំបែកថ្លៃដើម (UX 9.4, US-38)
 * props: rows: [{ ingredientName, quantityUsed, unit, unitPrice, subtotal, percentageOfTotal }], total: number
 * Highlight ជួរ subtotal ខ្ពស់បំផុត (ពេលមាន ≥ 2 ជួរ)
 */
export default function CostBreakdownTable({ rows, total }) {
  const { t } = useTranslation('dishes');
  const topIndex = rows.length > 1
    ? rows.reduce((best, r, i) => (r.subtotal > rows[best].subtotal ? i : best), 0)
    : -1;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left">
          <caption className="sr-only">{t('detail.breakdown')}</caption>
          <thead>
            <tr className="border-b border-slate-100 text-xs font-medium text-slate-500">
              <th scope="col" className="px-4 py-3">{t('detail.col.ingredient')}</th>
              <th scope="col" className="px-2 py-3 text-right">{t('detail.col.quantity')}</th>
              <th scope="col" className="px-2 py-3 text-right">{t('detail.col.unitPrice')}</th>
              <th scope="col" className="px-4 py-3 text-right">{t('detail.col.subtotal')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => {
              const top = i === topIndex;
              return (
                <tr key={`${r.ingredientName}-${i}`} className={top ? 'bg-amber-50' : undefined}>
                  <td className="px-4 py-3 align-top">
                    <span className="block text-[15px] font-medium text-slate-900">{r.ingredientName}</span>
                    <span className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-200" aria-hidden>
                        <span
                          className={`block h-full rounded-full ${top ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, Math.max(0, r.percentageOfTotal))}%` }}
                        />
                      </span>
                      {r.percentageOfTotal}%
                      {top && <span className="font-semibold text-amber-700">· {t('detail.highest')}</span>}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-right align-top text-[15px] text-slate-700">
                    {fmtQty(r.quantityUsed)} {r.unit}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-right align-top text-[15px] text-slate-700">
                    {formatPrice(r.unitPrice)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right align-top text-[15px] font-semibold text-slate-900">
                    {formatPrice(r.subtotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-100 bg-slate-50">
              <th scope="row" colSpan={3} className="px-4 py-3 text-left text-[15px] font-semibold text-slate-800">
                {t('detail.total')}
              </th>
              <td className="whitespace-nowrap px-4 py-3 text-right text-base font-bold text-emerald-700">
                {formatPrice(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}