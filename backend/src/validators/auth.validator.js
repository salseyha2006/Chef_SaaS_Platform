const { z } = require('zod');

const languageSchema = z.enum(['km', 'en']);

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2).optional(),
  language: languageSchema.optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

const googleLoginSchema = z.object({
  idToken: z.string().min(10, 'idToken is required'),
  language: languageSchema.optional(), // used only when a brand-new chef is created
});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const resendOtpSchema = z.object({
  email: z.string().email(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8),
});

const updateProfileSchema = z.object({
  displayName: z.string().min(2).optional(),
  language: languageSchema.optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  verifyEmailSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
};