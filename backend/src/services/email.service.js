const nodemailer = require('nodemailer');
const { OTP_EXPIRY_MINUTES } = require('../utils/otp');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const DEFAULT_LANGUAGE = 'km';

const OTP_TEMPLATES = {
  km: {
    verification: { subject: 'ផ្ទៀងផ្ទាត់អ៊ីមែលរបស់អ្នក - Chef SaaS', heading: 'ផ្ទៀងផ្ទាត់អ៊ីមែលរបស់អ្នក' },
    reset: { subject: 'កំណត់លេខសម្ងាត់ថ្មី - Chef SaaS', heading: 'កំណត់លេខសម្ងាត់ថ្មី' },
    intro: 'លេខកូដ OTP របស់អ្នកគឺ៖',
    expiry: (minutes) => `លេខកូដនេះនឹងផុតកំណត់ក្នុងរយៈពេល ${minutes} នាទី។`,
    ignore: 'ប្រសិនបើអ្នកមិនបានស្នើសុំទេ សូមមិនអើពើអ៊ីមែលនេះ។ សូមកុំចែករំលែកលេខកូដនេះជាមួយអ្នកដទៃ។',
  },
  en: {
    verification: { subject: 'Verify Your Email - Chef SaaS', heading: 'Verify your email' },
    reset: { subject: 'Reset Your Password - Chef SaaS', heading: 'Reset your password' },
    intro: 'Your OTP code is:',
    expiry: (minutes) => `This code will expire in ${minutes} minutes.`,
    ignore: "If you didn't request this, you can safely ignore this email. Never share this code with anyone.",
  },
};

const RECEIPT_TEMPLATES = {
  km: {
    subject: 'បង្កាន់ដៃទូទាត់ប្រាក់ - Chef SaaS',
    heading: 'អរគុណសម្រាប់ការទូទាត់ប្រាក់!',
    intro: 'យើងខ្ញុំបានទទួលការទូទាត់ប្រាក់របស់អ្នករួចរាល់។ ព័ត៌មានលម្អិតមានភ្ជាប់ជា PDF ជាមួយអ៊ីមែលនេះ។',
    dateLabel: 'កាលបរិច្ឆេទ',
    planLabel: 'កញ្ចប់សេវា',
    amountLabel: 'ចំនួនទឹកប្រាក់',
    invoiceLabel: 'លេខវិក្កយបត្រ',
  },
  en: {
    subject: 'Payment Receipt - Chef SaaS',
    heading: 'Thank you for your payment!',
    intro: 'We have received your payment. Full details are attached as a PDF invoice.',
    dateLabel: 'Date',
    planLabel: 'Plan',
    amountLabel: 'Amount',
    invoiceLabel: 'Invoice number',
  },
};

const PAYMENT_FAILED_TEMPLATES = {
  km: {
    subject: 'ការទូទាត់ប្រាក់បរាជ័យ - Chef SaaS',
    heading: 'ការទូទាត់ប្រាក់មិនជោគជ័យ',
    planLabel: 'កញ្ចប់សេវា',
    reasonLabel: 'មូលហេតុ',
    retrying: (n, max) =>
      `ប្រព័ន្ធនឹងព្យាយាមកាត់ប្រាក់ម្តងទៀតដោយស្វ័យប្រវត្តិ (លើកទី ${n} ក្នុងចំណោម ${max})។ សូមធ្វើបច្ចុប្បន្នភាពមធ្យោបាយបង់ប្រាក់ ដើម្បីជៀសវាងការរអាក់រអួល។`,
    final:
      'ការទូទាត់បានបរាជ័យលើសចំនួនដងព្យាយាមកំណត់។ មុខងារកម្រិតខ្ពស់ត្រូវបានផ្អាកបណ្តោះអាសន្ន ប៉ុន្តែទិន្នន័យទាំងអស់របស់អ្នកនៅតែសុវត្ថិភាពពេញលេញ។ សូម Subscribe ម្តងទៀតនៅពេលណាដែលអ្នកចង់បន្ត។',
  },
  en: {
    subject: 'Payment Failed - Chef SaaS',
    heading: 'Your payment did not go through',
    planLabel: 'Plan',
    reasonLabel: 'Reason',
    retrying: (n, max) =>
      `We'll automatically try again (attempt ${n} of ${max}). Please update your payment method to avoid any interruption.`,
    final:
      'Payment failed after the maximum number of attempts. Advanced features have been paused, but none of your data was deleted. You can subscribe again anytime to pick up right where you left off.',
  },
};

const REFUND_TEMPLATES = {
  km: {
    approvedSubject: 'សំណើសុំប្រាក់មកវិញត្រូវបានអនុម័ត - Chef SaaS',
    approvedHeading: 'ប្រាក់របស់អ្នកត្រូវបានសងមកវិញ',
    rejectedSubject: 'សំណើសុំប្រាក់មកវិញត្រូវបានបដិសេធ - Chef SaaS',
    rejectedHeading: 'សំណើសុំប្រាក់មកវិញមិនត្រូវបានអនុម័ត',
    amountLabel: 'ចំនួនទឹកប្រាក់',
    invoiceLabel: 'លេខវិក្កយបត្រ',
    reasonLabel: 'មូលហេតុ',
  },
  en: {
    approvedSubject: 'Your Refund Has Been Approved - Chef SaaS',
    approvedHeading: 'Your refund has been processed',
    rejectedSubject: 'Your Refund Request Was Rejected - Chef SaaS',
    rejectedHeading: 'Your refund request was not approved',
    amountLabel: 'Amount',
    invoiceLabel: 'Invoice number',
    reasonLabel: 'Reason',
  },
};

function baseWrapper(lang, innerHtml) {
  return `
    <div lang="${lang}" style="font-family: 'Noto Sans Khmer', 'Khmer OS', 'Khmer UI', Arial, sans-serif; padding: 16px; max-width: 480px;">
      ${innerHtml}
    </div>
  `;
}

async function sendOtpEmail(toEmail, otp, purpose = 'verification', language = DEFAULT_LANGUAGE) {
  const lang = OTP_TEMPLATES[language] ? language : DEFAULT_LANGUAGE;
  const t = OTP_TEMPLATES[lang];
  const { subject, heading } = t[purpose] || t.verification;

  const html = baseWrapper(
    lang,
    `
      <h2>${heading}</h2>
      <p>${t.intro}</p>
      <h1 style="letter-spacing: 6px; font-family: monospace;">${otp}</h1>
      <p>${t.expiry(OTP_EXPIRY_MINUTES)}</p>
      <p style="color: #666; font-size: 13px;">${t.ignore}</p>
    `
  );

  await transporter.sendMail({ from: process.env.EMAIL_FROM, to: toEmail, subject, html });
}

async function sendReceiptEmail({ toEmail, transaction, language = DEFAULT_LANGUAGE, pdfBuffer }) {
  const lang = RECEIPT_TEMPLATES[language] ? language : DEFAULT_LANGUAGE;
  const t = RECEIPT_TEMPLATES[lang];

  const html = baseWrapper(
    lang,
    `
      <h2>${t.heading}</h2>
      <p>${t.intro}</p>
      <p><strong>${t.dateLabel}:</strong> ${new Date(transaction.createdAt).toISOString().slice(0, 10)}</p>
      <p><strong>${t.planLabel}:</strong> ${transaction.plan?.name || '-'}</p>
      <p><strong>${t.amountLabel}:</strong> $${transaction.amount.toFixed(2)} ${transaction.currency}</p>
      <p><strong>${t.invoiceLabel}:</strong> ${transaction.invoiceNumber}</p>
    `
  );

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: t.subject,
    html,
    attachments: [{ filename: `invoice-${transaction.invoiceNumber}.pdf`, content: pdfBuffer }],
  });
}

async function sendPaymentFailedEmail({
  toEmail,
  language = DEFAULT_LANGUAGE,
  planName,
  reason,
  retryCount,
  maxAttempts,
  isFinalAttempt,
}) {
  const lang = PAYMENT_FAILED_TEMPLATES[language] ? language : DEFAULT_LANGUAGE;
  const t = PAYMENT_FAILED_TEMPLATES[lang];

  const html = baseWrapper(
    lang,
    `
      <h2>${t.heading}</h2>
      <p><strong>${t.planLabel}:</strong> ${planName}</p>
      <p><strong>${t.reasonLabel}:</strong> ${reason}</p>
      <p>${isFinalAttempt ? t.final : t.retrying(retryCount, maxAttempts)}</p>
    `
  );

  await transporter.sendMail({ from: process.env.EMAIL_FROM, to: toEmail, subject: t.subject, html });
}

async function sendRefundApprovedEmail({ toEmail, language = DEFAULT_LANGUAGE, transaction }) {
  const lang = REFUND_TEMPLATES[language] ? language : DEFAULT_LANGUAGE;
  const t = REFUND_TEMPLATES[lang];

  const html = baseWrapper(
    lang,
    `
      <h2>${t.approvedHeading}</h2>
      <p><strong>${t.amountLabel}:</strong> $${transaction.amount.toFixed(2)} ${transaction.currency}</p>
      <p><strong>${t.invoiceLabel}:</strong> ${transaction.invoiceNumber}</p>
    `
  );

  await transporter.sendMail({ from: process.env.EMAIL_FROM, to: toEmail, subject: t.approvedSubject, html });
}

async function sendRefundRejectedEmail({ toEmail, language = DEFAULT_LANGUAGE, transaction, reason }) {
  const lang = REFUND_TEMPLATES[language] ? language : DEFAULT_LANGUAGE;
  const t = REFUND_TEMPLATES[lang];

  const html = baseWrapper(
    lang,
    `
      <h2>${t.rejectedHeading}</h2>
      <p><strong>${t.invoiceLabel}:</strong> ${transaction.invoiceNumber}</p>
      <p><strong>${t.reasonLabel}:</strong> ${reason}</p>
    `
  );

  await transporter.sendMail({ from: process.env.EMAIL_FROM, to: toEmail, subject: t.rejectedSubject, html });
}

module.exports = {
  sendOtpEmail,
  sendReceiptEmail,
  sendPaymentFailedEmail,
  sendRefundApprovedEmail,
  sendRefundRejectedEmail,
};
