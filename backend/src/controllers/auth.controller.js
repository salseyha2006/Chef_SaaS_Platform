const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { signAccessToken, verifyRefreshToken, signRefreshToken } = require('../utils/jwt');
const { generateOtp, getOtpExpiry } = require('../utils/otp');
const { hashOtp } = require('../utils/otpHash');
const { sendOtpEmail } = require('../services/email.service');
const { verifyGoogleIdToken } = require('../utils/googleAuth');
const { startTrialForChef } = require('../services/subscription.service');
const { uploadAvatarBuffer } = require('../services/upload.service');

const RESEND_WINDOW_MINUTES = 10;
const RESEND_MAX_ATTEMPTS = 3;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function issueTokensAndSetCookie(chef, res) {
  const accessToken = signAccessToken({ id: chef.id, email: chef.email });
  const refreshToken = signRefreshToken({ id: chef.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      chefId: chef.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
    },
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });

  return accessToken;
}

// US-02: Register with Email
const register = asyncHandler(async (req, res) => {
  const { email, password, displayName, language } = req.body;

  const existing = await prisma.chef.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('Email is already registered', { code: 'AUTH_EMAIL_EXISTS' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOtp();

  const chef = await prisma.chef.create({
    data: {
      email,
      password: hashedPassword,
      displayName,
      language: language || 'km',
      emailOtp: hashOtp(otp),
      emailOtpExpiresAt: getOtpExpiry(),
    },
  });

  await startTrialForChef(chef.id); // US-12

  // Fire-and-forget: don't block the response on a slow SMTP provider.
  // If delivery fails, the chef can request a new code via POST /auth/resend-otp (Step 2).
  sendOtpEmail(email, otp, 'verification', chef.language).catch((err) =>
    console.error('Failed to send verification OTP email:', err)
  );

  return new ApiResponse(
    201,
    { id: chef.id, email: chef.email, language: chef.language },
    'Registered successfully. Please check your email for the verification code.'
  ).send(res);
});

// US-03: Register / Login via Google
const googleLogin = asyncHandler(async (req, res) => {
  const { idToken, language } = req.body;

  const googlePayload = await verifyGoogleIdToken(idToken).catch(() => {
    throw ApiError.unauthorized('Invalid Google token', { code: 'AUTH_GOOGLE_TOKEN_INVALID' });
  });

  let chef = await prisma.chef.findFirst({
    where: {
      OR: [{ googleId: googlePayload.googleId }, { email: googlePayload.email }],
    },
  });

  let isNewChef = false;

  if (chef) {
    if (!chef.googleId) {
      chef = await prisma.chef.update({
        where: { id: chef.id },
        data: {
          googleId: googlePayload.googleId,
          isEmailVerified: true,
          avatarUrl: chef.avatarUrl || googlePayload.avatarUrl,
        },
      });
    }
  } else {
    chef = await prisma.chef.create({
      data: {
        email: googlePayload.email,
        displayName: googlePayload.name,
        avatarUrl: googlePayload.avatarUrl,
        googleId: googlePayload.googleId,
        authProvider: 'GOOGLE',
        isEmailVerified: true,
        language: language || 'km',
      },
    });
    isNewChef = true;
  }

  if (isNewChef) {
    await startTrialForChef(chef.id); // US-12
  }

  const accessToken = await issueTokensAndSetCookie(chef, res);

  return new ApiResponse(
    200,
    {
      accessToken,
      chef: {
        id: chef.id,
        email: chef.email,
        displayName: chef.displayName,
        avatarUrl: chef.avatarUrl,
        language: chef.language,
      },
    },
    'Google login successful'
  ).send(res);
});

// US-04: Verify Email OTP
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const chef = await prisma.chef.findUnique({ where: { email } });
  if (!chef) throw ApiError.notFound('Account not found', { code: 'AUTH_ACCOUNT_NOT_FOUND' });
  if (chef.isEmailVerified) {
    throw ApiError.badRequest('Email is already verified', [], { code: 'AUTH_EMAIL_ALREADY_VERIFIED' });
  }

  if (!chef.emailOtp || chef.emailOtp !== hashOtp(otp)) {
    throw ApiError.badRequest('Invalid OTP code', [], { code: 'AUTH_OTP_INVALID' });
  }
  if (chef.emailOtpExpiresAt < new Date()) {
    throw ApiError.badRequest('OTP code has expired', [], { code: 'AUTH_OTP_EXPIRED' });
  }

  await prisma.chef.update({
    where: { id: chef.id },
    data: { isEmailVerified: true, emailOtp: null, emailOtpExpiresAt: null },
  });

  return new ApiResponse(200, null, 'Email verified successfully').send(res);
});

// US-04 Scenario 3/4: Resend Email Verification OTP (max 3 times per 10 minutes, per account)
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const chef = await prisma.chef.findUnique({ where: { email } });
  
  if (!chef) throw ApiError.notFound('Account not found', { code: 'AUTH_ACCOUNT_NOT_FOUND' });
  if (chef.isEmailVerified) {
    throw ApiError.badRequest('Email is already verified', [], { code: 'AUTH_EMAIL_ALREADY_VERIFIED' });
  }
  
  const now = new Date();
  const windowExpired =
    !chef.emailOtpResendWindowStart ||
    now - chef.emailOtpResendWindowStart > RESEND_WINDOW_MINUTES * 60 * 1000;
  const currentCount = windowExpired ? 0 : chef.emailOtpResendCount;
  
  if (currentCount >= RESEND_MAX_ATTEMPTS) {
    const minutesLeft = Math.max(
      1,
      Math.ceil(
        (RESEND_WINDOW_MINUTES * 60 * 1000 - (now - chef.emailOtpResendWindowStart)) / 60000
      )
    );
    throw ApiError.forbidden('Too many resend requests. Please wait before trying again', {
      code: 'AUTH_OTP_RESEND_LIMITED',
      params: { minutes: minutesLeft },
    });
  }
  
  const otp = generateOtp();
  await prisma.chef.update({
    where: { id: chef.id },
    data: {
      emailOtp: hashOtp(otp),
      emailOtpExpiresAt: getOtpExpiry(),
      emailOtpResendCount: currentCount + 1,
      emailOtpResendWindowStart: windowExpired ? now : chef.emailOtpResendWindowStart,
    },
  });
  
  sendOtpEmail(email, otp, 'verification', chef.language).catch((err) =>
    console.error('Failed to send verification OTP email:', err)
  );
  
  return new ApiResponse(200, null, 'A new verification code has been sent to your email').send(res);
});

// US-05: Login with Account Lockout & Rate Limiting
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const chef = await prisma.chef.findUnique({ where: { email } });
  if (!chef || !chef.password) {
    throw ApiError.unauthorized('Invalid email or password', { code: 'AUTH_INVALID_CREDENTIALS' });
  }

  const lockExpired = chef.lockedUntil && chef.lockedUntil <= new Date();

  if (chef.lockedUntil && !lockExpired) {
    const minutesLeft = Math.ceil((chef.lockedUntil - new Date()) / 60000);
    throw ApiError.forbidden(`Account is locked. Try again in ${minutesLeft} minute(s)`, {
      code: 'AUTH_ACCOUNT_LOCKED',
      params: { minutes: minutesLeft },
    });
  }

  // Bug fix: a lock that has already expired means failed attempts start counting from 0 again
  const baseFailedCount = lockExpired ? 0 : chef.failedLoginCount;

  const isPasswordValid = await bcrypt.compare(password, chef.password);

  if (!isPasswordValid) {
    const failedCount = baseFailedCount + 1;
    const shouldLock = failedCount >= MAX_FAILED_ATTEMPTS;

    await prisma.chef.update({
      where: { id: chef.id },
      data: {
        failedLoginCount: shouldLock ? 0 : failedCount,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
          : null,
      },
    });

    if (shouldLock) {
      throw ApiError.forbidden(
        `Too many failed attempts. Account locked for ${LOCK_DURATION_MINUTES} minutes`,
        { code: 'AUTH_TOO_MANY_ATTEMPTS', params: { minutes: LOCK_DURATION_MINUTES } }
      );
    }
    throw ApiError.unauthorized('Invalid email or password', { code: 'AUTH_INVALID_CREDENTIALS' });
  }

  await prisma.chef.update({
    where: { id: chef.id },
    data: { failedLoginCount: 0, lockedUntil: null },
  });

  // US-02 Technical Note: block login until the email is verified
  if (!chef.isEmailVerified) {
    throw ApiError.forbidden('Please verify your email before logging in', {
      code: 'AUTH_EMAIL_NOT_VERIFIED',
    });
  }

  const accessToken = await issueTokensAndSetCookie(chef, res);

  return new ApiResponse(
    200,
    {
      accessToken,
      chef: {
        id: chef.id,
        email: chef.email,
        displayName: chef.displayName,
        avatarUrl: chef.avatarUrl,
        language: chef.language,
      },
    },
    'Login successful'
  ).send(res);
});

// US-06: Forgot Password - Request OTP
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const chef = await prisma.chef.findUnique({ where: { email } });

  if (chef) {
    const otp = generateOtp();
    await prisma.chef.update({
      where: { id: chef.id },
      data: { resetOtp: hashOtp(otp), resetOtpExpiresAt: getOtpExpiry() },
    });
    // Fire-and-forget: keep response time identical whether or not the email exists
    sendOtpEmail(email, otp, 'reset', chef.language).catch((err) =>
      console.error('Failed to send reset OTP email:', err)
    );
  }

  return new ApiResponse(
    200,
    null,
    'If this email is registered, a reset code has been sent'
  ).send(res);
});

// US-06: Reset Password with OTP
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const chef = await prisma.chef.findUnique({ where: { email } });
  if (!chef || !chef.resetOtp || chef.resetOtp !== hashOtp(otp)) {
    throw ApiError.badRequest('Invalid or expired OTP code', [], { code: 'AUTH_OTP_INVALID' });
  }
  if (chef.resetOtpExpiresAt < new Date()) {
    throw ApiError.badRequest('OTP code has expired', [], { code: 'AUTH_OTP_EXPIRED' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.chef.update({
    where: { id: chef.id },
    data: {
      password: hashedPassword,
      resetOtp: null,
      resetOtpExpiresAt: null,
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });

  // US-06 Technical Note: invalidate every existing session/token after a password reset
  await prisma.refreshToken.deleteMany({ where: { chefId: chef.id } });

  return new ApiResponse(200, null, 'Password has been reset successfully').send(res);
});

// US-08: Change Password (while logged in)
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const chefId = req.chef.id;

  const chef = await prisma.chef.findUnique({ where: { id: chefId } });
  if (!chef) throw ApiError.notFound('Account not found', { code: 'AUTH_ACCOUNT_NOT_FOUND' });

  if (chef.password) {
    if (!currentPassword) {
      throw ApiError.badRequest('Current password is required', [], {
        code: 'AUTH_CURRENT_PASSWORD_REQUIRED',
      });
    }
    const isValid = await bcrypt.compare(currentPassword, chef.password);
    if (!isValid) {
      throw ApiError.unauthorized('Current password is incorrect', {
        code: 'AUTH_CURRENT_PASSWORD_INCORRECT',
      });
    }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.chef.update({ where: { id: chefId }, data: { password: hashedPassword } });

  return new ApiResponse(200, null, 'Password updated successfully').send(res);
});

// US-07: Update Own Profile (name / language only — avatar has its own endpoint)
const updateProfile = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { displayName, language } = req.body;

  const chef = await prisma.chef.update({
    where: { id: chefId },
    data: { displayName, language },
  });

  return new ApiResponse(
    200,
    {
      id: chef.id,
      email: chef.email,
      displayName: chef.displayName,
      avatarUrl: chef.avatarUrl,
      language: chef.language,
    },
    'Profile updated successfully'
  ).send(res);
});

// US-07 Scenario 1/2: Upload / replace avatar (multer already validated size + type)
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No image file was provided', [], { code: 'AVATAR_FILE_REQUIRED' });
  }

  const result = await uploadAvatarBuffer(req.file.buffer, req.chef.id);

  const chef = await prisma.chef.update({
    where: { id: req.chef.id },
    data: { avatarUrl: result.secure_url },
  });

  return new ApiResponse(200, { avatarUrl: chef.avatarUrl }, 'Avatar updated successfully').send(res);
});

// Refresh Access Token using Refresh Token cookie
const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw ApiError.unauthorized('Refresh token is missing', { code: 'AUTH_REFRESH_TOKEN_MISSING' });

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token', { code: 'AUTH_REFRESH_TOKEN_INVALID' });
  }

  const storedToken = await prisma.refreshToken.findUnique({ where: { token } });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw ApiError.unauthorized('Refresh token is invalid or expired', { code: 'AUTH_REFRESH_TOKEN_INVALID' });
  }

  const chef = await prisma.chef.findUnique({ where: { id: decoded.id } });
  if (!chef) throw ApiError.notFound('Account not found', { code: 'AUTH_ACCOUNT_NOT_FOUND' });

  const accessToken = signAccessToken({ id: chef.id, email: chef.email });

  return new ApiResponse(200, { accessToken }, 'Token refreshed').send(res);
});

// US-09: Logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  res.clearCookie('refreshToken');
  return new ApiResponse(200, null, 'Logged out successfully').send(res);
});

// GET current logged-in profile
const getMe = asyncHandler(async (req, res) => {
  const chef = await prisma.chef.findUnique({
    where: { id: req.chef.id },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      language: true,
      isEmailVerified: true,
      authProvider: true,
      hasCompletedOnboarding: true,
      createdAt: true,
    },
  });

  if (!chef) throw ApiError.notFound('Account not found', { code: 'AUTH_ACCOUNT_NOT_FOUND' });

  return new ApiResponse(200, chef, 'Profile fetched successfully').send(res);
});

module.exports = {
  register,
  googleLogin,
  verifyEmail,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  uploadAvatar,
  refreshAccessToken,
  logout,
  getMe,
};