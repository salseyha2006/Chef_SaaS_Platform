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

const TEMPLATES = {
  km: {
    verification: {
      subject: 'ផ្ទៀងផ្ទាត់អ៊ីមែលរបស់អ្នក - Chef SaaS',
      heading: 'ផ្ទៀងផ្ទាត់អ៊ីមែលរបស់អ្នក',
    },
    reset: {
      subject: 'កំណត់លេខសម្ងាត់ថ្មី - Chef SaaS',
      heading: 'កំណត់លេខសម្ងាត់ថ្មី',
    },
    intro: 'លេខកូដ OTP របស់អ្នកគឺ៖',
    expiry: (minutes) => `លេខកូដនេះនឹងផុតកំណត់ក្នុងរយៈពេល ${minutes} នាទី។`,
    ignore: 'ប្រសិនបើអ្នកមិនបានស្នើសុំទេ សូមមិនអើពើអ៊ីមែលនេះ។ សូមកុំចែករំលែកលេខកូដនេះជាមួយអ្នកដទៃ។',
  },
  en: {
    verification: {
      subject: 'Verify Your Email - Chef SaaS',
      heading: 'Verify your email',
    },
    reset: {
      subject: 'Reset Your Password - Chef SaaS',
      heading: 'Reset your password',
    },
    intro: 'Your OTP code is:',
    expiry: (minutes) => `This code will expire in ${minutes} minutes.`,
    ignore: "If you didn't request this, you can safely ignore this email. Never share this code with anyone.",
  },
};

/**
 * @param {string} toEmail
 * @param {string} otp
 * @param {'verification' | 'reset'} purpose
 * @param {'km' | 'en'} language  chef's saved language; falls back to Khmer
 */
async function sendOtpEmail(toEmail, otp, purpose = 'verification', language = DEFAULT_LANGUAGE) {
  const lang = TEMPLATES[language] ? language : DEFAULT_LANGUAGE;
  const t = TEMPLATES[lang];
  const { subject, heading } = t[purpose] || t.verification;

  const html = `
    <div lang="${lang}" style="font-family: 'Noto Sans Khmer', 'Khmer OS', 'Khmer UI', Arial, sans-serif; padding: 16px; max-width: 480px;">
      <h2>${heading}</h2>
      <p>${t.intro}</p>
      <h1 style="letter-spacing: 6px; font-family: monospace;">${otp}</h1>
      <p>${t.expiry(OTP_EXPIRY_MINUTES)}</p>
      <p style="color: #666; font-size: 13px;">${t.ignore}</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject,
    html,
  });
}

module.exports = { sendOtpEmail };