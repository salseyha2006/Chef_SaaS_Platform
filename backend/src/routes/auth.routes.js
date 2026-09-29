const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const requireAuth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { registerLimiter, loginLimiter, resendOtpLimiter } = require('../middlewares/rateLimiters');
const { handleAvatarUpload } = require('../middlewares/upload');
const {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  verifyEmailSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} = require('../validators/auth.validator');


router.post('/register', registerLimiter, validate(registerSchema), authController.register); // Added registerLimiter[cite: 1]
router.post('/google', validate(googleLoginSchema), authController.googleLogin);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/login', loginLimiter, validate(loginSchema), authController.login); // Added loginLimiter[cite: 1]
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh-token', authController.refreshAccessToken);
router.post('/logout', authController.logout);
router.post('/resend-otp', resendOtpLimiter, validate(resendOtpSchema), authController.resendOtp);
router.post('/avatar', requireAuth, handleAvatarUpload, authController.uploadAvatar);

router.get('/me', requireAuth, authController.getMe);
router.patch('/profile', requireAuth, validate(updateProfileSchema), authController.updateProfile);
router.patch(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema),
  authController.changePassword
);

module.exports = router;