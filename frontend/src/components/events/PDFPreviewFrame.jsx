import { useTranslation } from 'react-i18next';
import { formatQuantity } from '../../utils/shopping';

/**
 * Preview ទម្រង់ក្រដាស A4 (ប៉ាន់ស្មាន) — បង្ហាញតែ ឈ្មោះ + បរិមាណ (មិនមានតម្លៃ)
 * props: title, lines [{ id, name, unit, quantity:string }]
 */
export default function PDFPreviewFrame({ title, lines }) {
  const { t } = useTranslation('events');
  return (
    <div className="rounded-2xl bg-slate-200 p-3">
      <article
        aria-label={t('report.previewAria')}
        style={{ aspectRatio: '210 / 297' }}
        className="mx-auto w-full max-w-[420px] bg-white p-6 shadow-lg"
      >
        <h2 className="border-b-2 border-slate-800 pb-3 text-center text-lg font-bold text-slate-900">
          {title || '—'}
        </h2>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-xs text-slate-500">
              <th scope="col" className="py-1.5 font-medium">{t('report.col.name')}</th>
              <th scope="col" className="py-1.5 text-right font-medium">{t('report.col.quantity')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lines.map((l) => {
              const q = Number(String(l.quantity).replace(',', '.'));
              return (
                <tr key={l.id}>
                  <td className="py-2 pr-3 text-slate-900">{l.name}</td>
                  <td className="whitespace-nowrap py-2 text-right tabular-nums text-slate-900">
                    {String(l.quantity).trim() !== '' && Number.isFinite(q) ? `${formatQuantity(q)} ${l.unit}` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-4 text-right text-xs text-slate-500">{t('report.count', { count: lines.length })}</p>
      </article>
    </div>
  );
}
