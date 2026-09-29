const nodemailer = require('nodemailer');
const { OTP_EXPIRY_MINUTES } = require('../utils/otp');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
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
    planLabel: 'កញ្ចប់សេវា',
    amountLabel: 'ចំនួនទឹកប្រាក់',
    invoiceLabel: 'លេខវិក្កយបត្រ',
  },
  en: {
    subject: 'Payment Receipt - Chef SaaS',
    heading: 'Thank you for your payment!',
    intro: 'We have received your payment. Full details are attached as a PDF invoice.',
    planLabel: 'Plan',
    amountLabel: 'Amount',
    invoiceLabel: 'Invoice number',
  },
};

function baseWrapper(lang, innerHtml) {
  return `
    <div lang="${lang}" style="font-family: 'Noto Sans Khmer', 'Khmer OS', 'Khmer UI', Arial, sans-serif; padding: 16px; max-width: 480px;">
      ${innerHtml}
    </div>
  `;
}

/**
 * @param {'km' | 'en'} language  chef's saved language; falls back to Khmer
 */
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

// US-14 Scenario 1: send a payment receipt with the invoice PDF attached
async function sendReceiptEmail({ toEmail, transaction, language = DEFAULT_LANGUAGE, pdfBuffer }) {
  const lang = RECEIPT_TEMPLATES[language] ? language : DEFAULT_LANGUAGE;
  const t = RECEIPT_TEMPLATES[lang];

  const html = baseWrapper(
    lang,
    `
      <h2>${t.heading}</h2>
      <p>${t.intro}</p>
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

module.exports = { sendOtpEmail, sendReceiptEmail };