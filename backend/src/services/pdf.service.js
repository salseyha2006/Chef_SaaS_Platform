const PDFDocument = require('pdfkit');

// Kantumruy Pro (SIL OFL 1.1) — tested and confirmed working with pdfkit + fontkit.
// IMPORTANT: Noto Sans Khmer (and Noto Serif Khmer) crash fontkit/pdfkit — do not use them here.
const FONT_REGULAR = require.resolve(
  '@fontsource/kantumruy-pro/files/kantumruy-pro-khmer-400-normal.woff'
);
const FONT_BOLD = require.resolve(
  '@fontsource/kantumruy-pro/files/kantumruy-pro-khmer-700-normal.woff'
);

const LABELS = {
  km: {
    purchasingList: 'បញ្ជីទិញទំនិញ',
    ingredient: 'គ្រឿងផ្សំ',
    quantity: 'បរិមាណ',
    eventDate: 'កាលបរិច្ឆេទ',
    tables: 'ចំនួនតុ',
    invoice: 'វិក្កយបត្រ',
    date: 'កាលបរិច្ឆេទ',
    billedTo: 'ចេញជូន',
    addressLabel: 'អាសយដ្ឋានហាង',
    plan: 'កញ្ចប់សេវា',
    amount: 'ចំនួនទឹកប្រាក់',
    paymentMethod: 'វិធីបង់ប្រាក់',
    status: 'ស្ថានភាព',
    statuses: { SUCCESS: 'ជោគជ័យ', FAILED: 'បរាជ័យ', PENDING: 'កំពុងរង់ចាំ', REFUNDED: 'បានសងប្រាក់វិញ' },
  },
  en: {
    purchasingList: 'Purchasing List',
    ingredient: 'Ingredient',
    quantity: 'Quantity',
    eventDate: 'Event date',
    tables: 'Tables',
    invoice: 'Invoice',
    date: 'Date',
    billedTo: 'Billed to',
    addressLabel: 'Shop address',
    plan: 'Plan',
    amount: 'Amount',
    paymentMethod: 'Payment method',
    status: 'Status',
    statuses: { SUCCESS: 'Success', FAILED: 'Failed', PENDING: 'Pending', REFUNDED: 'Refunded' },
  },
};

function getLabels(language) {
  return LABELS[language] || LABELS.km;
}

function createPdfDocument() {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.registerFont('Regular', FONT_REGULAR);
  doc.registerFont('Bold', FONT_BOLD);
  doc.font('Regular');
  return doc;
}

function formatQuantity(value) {
  return Number(Number(value).toFixed(3)).toString();
}

function formatDate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

// US-58: name + quantity ONLY. Price must never appear here (business secret).
function writePurchasingListPdf(doc, { title, event, items, language }) {
  const L = getLabels(language);
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const qtyWidth = 140;
  const nameWidth = right - left - qtyWidth - 10;
  const pageBottom = () => doc.page.height - doc.page.margins.bottom;

  doc.font('Bold').fontSize(18).text(title || `${L.purchasingList} - ${event.name}`, {
    align: 'center',
  });
  doc.moveDown(0.5);
  doc
    .font('Regular')
    .fontSize(10)
    .text(`${L.eventDate}: ${formatDate(event.eventDate)}   |   ${L.tables}: ${event.tableCount}`);
  doc.moveDown();

  const drawHeader = () => {
    const y = doc.y;
    doc.font('Bold').fontSize(12);
    doc.text(L.ingredient, left, y, { width: nameWidth });
    doc.text(L.quantity, right - qtyWidth, y, { width: qtyWidth, align: 'right' });
    doc.y = y + 20;
    doc.moveTo(left, doc.y).lineTo(right, doc.y).stroke();
    doc.y += 8;
    doc.font('Regular').fontSize(11);
  };

  drawHeader();

  for (const item of items) {
    const qtyText = `${formatQuantity(item.totalQuantity)} ${item.unit.abbreviation}`;
    const rowHeight = Math.max(
      doc.heightOfString(item.ingredientName, { width: nameWidth }),
      doc.heightOfString(qtyText, { width: qtyWidth, align: 'right' })
    );

    if (doc.y + rowHeight > pageBottom()) {
      doc.addPage();
      drawHeader();
    }

    const y = doc.y;
    doc.text(item.ingredientName, left, y, { width: nameWidth });
    doc.text(qtyText, right - qtyWidth, y, { width: qtyWidth, align: 'right' });
    doc.y = y + rowHeight + 6;
  }
}

function writeInvoicePdf(doc, { transaction, language }) {
  const L = getLabels(language);

  // US-24 Scenario 2: use the snapshot taken at charge time, never the chef's current BillingInfo
  const billingName = transaction.billingNameSnapshot || transaction.chef.displayName || transaction.chef.email;
  const shopAddress = transaction.shopAddressSnapshot;

  doc.font('Bold').fontSize(20).text('Chef SaaS Platform', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`${L.invoice}: ${transaction.invoiceNumber}`);
  doc.font('Regular').fontSize(12);
  doc.text(`${L.date}: ${formatDate(transaction.createdAt)}`);
  doc.text(`${L.billedTo}: ${billingName}`);
  if (shopAddress) doc.text(`${L.addressLabel}: ${shopAddress}`);
  doc.moveDown();
  doc.text(`${L.plan}: ${transaction.plan?.name || '-'}`);
  doc.text(`${L.amount}: $${transaction.amount.toFixed(2)} ${transaction.currency}`);
  doc.text(`${L.paymentMethod}: ${transaction.paymentMethod}`);
  doc.text(`${L.status}: ${L.statuses[transaction.status] || transaction.status}`);
}

// Generic buffer-mode wrapper — used when a PDF is needed in-memory (e.g. as an email attachment)
function generatePdfBuffer(writeFn, options) {
  return new Promise((resolve, reject) => {
    const doc = createPdfDocument();
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    writeFn(doc, options);
    doc.end();
  });
}

function generateInvoicePdfBuffer({ transaction, language }) {
  return generatePdfBuffer(writeInvoicePdf, { transaction, language });
}

module.exports = {
  createPdfDocument,
  writePurchasingListPdf,
  writeInvoicePdf,
  generatePdfBuffer,
  generateInvoicePdfBuffer,
};
