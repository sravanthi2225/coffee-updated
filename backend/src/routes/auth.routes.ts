import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/AuthService';
import { otpRateLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import db from '../db/connection';

export const authRouter = Router();

const sendOtpSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid phone number'),
  isDemo: z.boolean().optional()
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6, 'OTP must be 6 digits')
});

const registerSchema = z.object({
  phone: z.string().min(10),
  name: z.string().min(2, 'Name must have at least 2 characters'),
  email: z.string().email().optional().or(z.literal('')),
  referralCode: z.string().optional()
});

const loginSchema = z.object({
  identifier: z.string().min(3, 'Please enter your email or phone number'),
  password: z.string().min(1, 'Please enter your password')
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  referralCode: z.string().optional()
});

const forgotPasswordSchema = z.object({
  identifier: z.string().min(3, 'Please enter your email or phone number')
});

const resetPasswordSchema = z.object({
  identifier: z.string().min(3, 'Please enter your email or phone number'),
  resetCode: z.string().min(4, 'Please enter the reset code'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

const staffLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

// Helper to set session cookie
function setSessionCookie(res: Response, token: string) {
  res.cookie('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
}

// 0a. Password Login (Customer)
authRouter.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
  try {
    const result = await AuthService.loginWithPassword(req.body.identifier, req.body.password);
    if (result.error) {
      const statusCode = result.error.code === 'USER_NOT_FOUND' ? 404 : 401;
      res.status(statusCode).json({ success: false, error: result.error });
      return;
    }

    if (result.token) {
      setSessionCookie(res, result.token);
    }

    res.json({
      success: true,
      user: result.user,
      token: result.token,
      message: `Welcome back, ${result.user.name || 'Friend'}!`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'LOGIN_ERROR', message: error.message } });
  }
});

// 0b. Password Signup (Customer)
authRouter.post('/signup', validateBody(signupSchema), async (req: Request, res: Response) => {
  try {
    const result = await AuthService.signupWithPassword(req.body);
    setSessionCookie(res, result.token);

    res.status(201).json({
      success: true,
      user: result.user,
      token: result.token,
      newVoucherAssigned: result.newVoucherAssigned,
      message: 'Account created successfully! Welcome voucher credited to your wallet.'
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'SIGNUP_ERROR', message: error.message } });
  }
});

// 0c. Forgot Password
authRouter.post('/forgot-password', validateBody(forgotPasswordSchema), async (req: Request, res: Response) => {
  try {
    const result = await AuthService.forgotPassword(req.body.identifier);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'FORGOT_PASSWORD_ERROR', message: error.message } });
  }
});

// 0d. Reset Password
authRouter.post('/reset-password', validateBody(resetPasswordSchema), async (req: Request, res: Response) => {
  try {
    const result = await AuthService.resetPassword(req.body.identifier, req.body.resetCode, req.body.newPassword);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'RESET_PASSWORD_ERROR', message: error.message } });
  }
});

// 1. Send OTP
authRouter.post('/send-otp', otpRateLimiter, validateBody(sendOtpSchema), async (req: Request, res: Response) => {
  try {
    const result = await AuthService.sendOtp(req.body.phone);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'OTP_SEND_ERROR', message: error.message } });
  }
});

// 2. Verify OTP
authRouter.post('/verify-otp', validateBody(verifyOtpSchema), async (req: Request, res: Response) => {
  try {
    const result = await AuthService.verifyOtp(req.body.phone, req.body.otp);
    if (result.error) {
      res.status(400).json({ success: false, error: { code: 'INVALID_OTP', message: result.error } });
      return;
    }

    if (!result.isNewUser && result.token) {
      setSessionCookie(res, result.token);
    }

    res.json({
      success: true,
      isNewUser: result.isNewUser,
      token: result.token,
      user: result.user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'OTP_VERIFY_ERROR', message: error.message } });
  }
});

// 3. Register (New User)
authRouter.post('/register', validateBody(registerSchema), async (req: Request, res: Response) => {
  try {
    const result = await AuthService.registerUser(req.body);
    setSessionCookie(res, result.token);

    res.status(201).json({
      success: true,
      user: result.user,
      token: result.token,
      newVoucherAssigned: result.newVoucherAssigned,
      message: 'Registration successful! Welcome voucher added to your wallet.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'REGISTRATION_ERROR', message: error.message } });
  }
});

// 4. Get Current User & Wallet
authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = db.prepare(`
    SELECT id, phone, name, email, referral_code, membership_tier, loyalty_points, created_at
    FROM users WHERE id = ? AND deleted_at IS NULL
  `).get(req.user!.id) as any;

  if (!user) {
    res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User account not found' } });
    return;
  }

  // Active vouchers count
  const voucherCount = db.prepare(`
    SELECT COUNT(*) as count FROM user_vouchers WHERE user_id = ? AND status = 'ACTIVE'
  `).get(user.id) as { count: number };

  res.json({
    success: true,
    user: {
      ...user,
      activeVouchersCount: voucherCount.count
    }
  });
});

// 5. Logout
authRouter.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('session_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// 6. Delete Account (Soft Delete)
authRouter.delete('/me', requireAuth, (req: Request, res: Response) => {
  AuthService.softDeleteUser(req.user!.id);
  res.clearCookie('session_token');
  res.json({ success: true, message: 'Your account has been deleted.' });
});

// 7. Staff Login (Barista / Admin)
authRouter.post('/staff-login', validateBody(staffLoginSchema), (req: Request, res: Response) => {
  const result = AuthService.staffLogin(req.body.username, req.body.password);
  if (!result) {
    res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid staff username or password' } });
    return;
  }

  setSessionCookie(res, result.token);
  res.json({
    success: true,
    token: result.token,
    staff: {
      id: result.staff.id,
      username: result.staff.username,
      role: result.staff.role,
      storeId: result.staff.store_id
    }
  });
});
