import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/connection';
import { getSmsAdapter } from '../adapters/sms';
import { signToken, AuthUser } from '../middleware/auth';

export class AuthService {
  private static hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  private static generateReferralCode(name?: string): string {
    const prefix = name ? name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() : 'BREW';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix || 'BREW'}${random}`;
  }

  /**
   * Request 6-digit OTP for phone
   */
  static async sendOtp(phone: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
    // Standardize phone format (default +91 if 10 digits provided)
    let formattedPhone = phone.trim().replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.length === 10 ? `+91${formattedPhone}` : `+${formattedPhone}`;
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = this.hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes TTL

    // Invalidate previous active OTPs for this phone
    db.prepare('DELETE FROM otp_requests WHERE phone = ?').run(formattedPhone);

    // Insert new request
    const id = `otp_${uuidv4()}`;
    db.prepare(`
      INSERT INTO otp_requests (id, phone, otp_hash, attempts, expires_at)
      VALUES (?, ?, ?, 0, ?)
    `).run(id, formattedPhone, otpHash, expiresAt);

    // Send via SMS Adapter
    const smsAdapter = getSmsAdapter();
    const sendResult = await smsAdapter.sendOtp(formattedPhone, otp);

    return {
      success: true,
      message: 'OTP sent successfully to your mobile number.',
      devOtp: sendResult.devOtp
    };
  }

  /**
   * Verify OTP and check if user already exists
   */
  static async verifyOtp(phone: string, inputOtp: string): Promise<{
    isNewUser: boolean;
    token?: string;
    user?: any;
    error?: string;
  }> {
    let formattedPhone = phone.trim().replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.length === 10 ? `+91${formattedPhone}` : `+${formattedPhone}`;
    }

    const otpRecord = db.prepare(`
      SELECT * FROM otp_requests WHERE phone = ? ORDER BY created_at DESC LIMIT 1
    `).get(formattedPhone) as any;

    if (!otpRecord) {
      return { isNewUser: false, error: 'No active OTP request found. Please request a new code.' };
    }

    // Check expiry
    const now = new Date();
    if (new Date(otpRecord.expires_at) < now) {
      db.prepare('DELETE FROM otp_requests WHERE id = ?').run(otpRecord.id);
      return { isNewUser: false, error: 'This OTP has expired. Please request a new code.' };
    }

    // Check attempts limit (max 5)
    if (otpRecord.attempts >= 5) {
      db.prepare('DELETE FROM otp_requests WHERE id = ?').run(otpRecord.id);
      return { isNewUser: false, error: 'Maximum verification attempts exceeded. Please request a new OTP.' };
    }

    const inputHash = this.hashOtp(inputOtp.trim());
    if (inputHash !== otpRecord.otp_hash) {
      db.prepare('UPDATE otp_requests SET attempts = attempts + 1 WHERE id = ?').run(otpRecord.id);
      const remainingAttempts = 4 - otpRecord.attempts;
      return {
        isNewUser: false,
        error: `Invalid OTP code. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : 'Attempts exhausted.'}`
      };
    }

    // OTP is valid! Delete used OTP
    db.prepare('DELETE FROM otp_requests WHERE id = ?').run(otpRecord.id);

    // Check if user exists (and not deleted)
    const existingUser = db.prepare(`
      SELECT * FROM users WHERE phone = ? AND deleted_at IS NULL
    `).get(formattedPhone) as any;

    if (!existingUser) {
      // User must complete registration
      return { isNewUser: true };
    }

    // Existing user: generate session token
    const authUser: AuthUser = {
      id: existingUser.id,
      phone: existingUser.phone,
      name: existingUser.name,
      role: 'CUSTOMER'
    };

    const token = signToken(authUser, '30d');
    const sessionId = `sess_${uuidv4()}`;
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT OR REPLACE INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)
    `).run(sessionId, existingUser.id, token, sessionExpires);

    return {
      isNewUser: false,
      token,
      user: existingUser
    };
  }

  /**
   * Complete registration for new user + auto-issue new user voucher + process referral
   */
  static async registerUser(data: {
    phone: string;
    name: string;
    email?: string;
    referralCode?: string;
  }): Promise<{ user: any; token: string; newVoucherAssigned: boolean }> {
    let formattedPhone = data.phone.trim().replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.length === 10 ? `+91${formattedPhone}` : `+${formattedPhone}`;
    }

    const userId = `usr_${uuidv4().substring(0, 10)}`;
    const userReferralCode = this.generateReferralCode(data.name);

    // Validate referring user code if given
    let referrerId: string | null = null;
    if (data.referralCode) {
      const refUser = db.prepare(`
        SELECT id FROM users WHERE UPPER(referral_code) = ? AND deleted_at IS NULL
      `).get(data.referralCode.trim().toUpperCase()) as any;
      if (refUser) {
        referrerId = refUser.id;
      }
    }

    const insertUser = db.transaction(() => {
      // 1. Create User
      db.prepare(`
        INSERT INTO users (id, phone, name, email, referral_code, referred_by_user_id, membership_tier, loyalty_points)
        VALUES (?, ?, ?, ?, ?, ?, 'BLUE', 0)
      `).run(userId, formattedPhone, data.name.trim(), data.email?.trim() || null, userReferralCode, referrerId);

      // 2. Auto-issue "New User First Cup" voucher into wallet
      const firstCupVoucher = db.prepare(`
        SELECT id FROM vouchers WHERE code = 'FIRSTCUP'
      `).get() as any;

      if (firstCupVoucher) {
        const uvId = `uv_${uuidv4().substring(0, 10)}`;
        db.prepare(`
          INSERT INTO user_vouchers (id, user_id, voucher_id, status)
          VALUES (?, ?, ?, 'ACTIVE')
        `).run(uvId, userId, firstCupVoucher.id);
      }

      // 3. Create referral record if referred
      if (referrerId) {
        const refId = `ref_${uuidv4().substring(0, 10)}`;
        db.prepare(`
          INSERT INTO referrals (id, referrer_user_id, referred_user_id, status)
          VALUES (?, ?, ?, 'PENDING')
        `).run(refId, referrerId, userId);
      }
    });

    insertUser();

    const createdUser = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId) as any;

    const authUser: AuthUser = {
      id: createdUser.id,
      phone: createdUser.phone,
      name: createdUser.name,
      role: 'CUSTOMER'
    };

    const token = signToken(authUser, '30d');
    const sessionId = `sess_${uuidv4()}`;
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT OR REPLACE INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)
    `).run(sessionId, createdUser.id, token, sessionExpires);

    return {
      user: createdUser,
      token,
      newVoucherAssigned: true
    };
  }

  /**
   * Secure Password Hashing using native crypto.scrypt
   */
  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verify Password against stored hash with timing-safe comparison
   */
  static verifyPassword(password: string, storedHash: string): boolean {
    if (!storedHash || !storedHash.includes(':')) return false;
    try {
      const [salt, key] = storedHash.split(':');
      const keyBuffer = Buffer.from(key, 'hex');
      const derivedKey = crypto.scryptSync(password, salt, 64);
      return crypto.timingSafeEqual(keyBuffer, derivedKey);
    } catch {
      return false;
    }
  }

  /**
   * Customer Login via Email or Mobile + Password
   */
  static async loginWithPassword(identifier: string, passwordPlain: string): Promise<{
    user?: any;
    token?: string;
    error?: { code: string; message: string };
  }> {
    const cleanId = identifier.trim().toLowerCase();
    let formattedPhone = identifier.trim().replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+') && /^\d+$/.test(formattedPhone)) {
      formattedPhone = formattedPhone.length === 10 ? `+91${formattedPhone}` : `+${formattedPhone}`;
    }

    const user = db.prepare(`
      SELECT * FROM users 
      WHERE (LOWER(email) = ? OR phone = ?) AND deleted_at IS NULL
    `).get(cleanId, formattedPhone) as any;

    if (!user) {
      return {
        error: {
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email or mobile number. Please check or sign up.'
        }
      };
    }

    if (!user.password_hash) {
      return {
        error: {
          code: 'PASSWORD_NOT_SET',
          message: 'This account was registered via Phone OTP. Please log in with OTP or reset your password.'
        }
      };
    }

    const isMatch = user.password_hash.includes(':')
      ? this.verifyPassword(passwordPlain, user.password_hash)
      : user.password_hash === passwordPlain;

    if (!isMatch) {
      return {
        error: {
          code: 'WRONG_PASSWORD',
          message: 'Incorrect password. Please verify your credentials or reset your password.'
        }
      };
    }

    const authUser: AuthUser = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: 'CUSTOMER'
    };

    const token = signToken(authUser, '30d');
    const sessionId = `sess_${uuidv4()}`;
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT OR REPLACE INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)
    `).run(sessionId, user.id, token, sessionExpires);

    return { user, token };
  }

  /**
   * Customer Signup via Name, Email, Password, and optional Phone
   */
  static async signupWithPassword(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    referralCode?: string;
  }): Promise<{ user: any; token: string; newVoucherAssigned: boolean }> {
    const cleanEmail = data.email.trim().toLowerCase();

    // Check existing email
    const existingEmail = db.prepare(`
      SELECT id FROM users WHERE LOWER(email) = ? AND deleted_at IS NULL
    `).get(cleanEmail);

    if (existingEmail) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    // Format phone
    let formattedPhone = (data.phone || '').trim().replace(/\s+/g, '');
    if (formattedPhone) {
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.length === 10 ? `+91${formattedPhone}` : `+${formattedPhone}`;
      }
      const existingPhone = db.prepare(`
        SELECT id FROM users WHERE phone = ? AND deleted_at IS NULL
      `).get(formattedPhone);

      if (existingPhone) {
        throw new Error('This phone number is already registered. Please sign in or use another number.');
      }
    } else {
      // Auto-assign placeholder phone if none provided
      formattedPhone = `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`;
    }

    const userId = `usr_${uuidv4().substring(0, 10)}`;
    const userReferralCode = this.generateReferralCode(data.name);
    const passwordHash = this.hashPassword(data.password);

    // Validate referral
    let referrerId: string | null = null;
    if (data.referralCode) {
      const refUser = db.prepare(`
        SELECT id FROM users WHERE UPPER(referral_code) = ? AND deleted_at IS NULL
      `).get(data.referralCode.trim().toUpperCase()) as any;
      if (refUser) {
        referrerId = refUser.id;
      }
    }

    const insertUser = db.transaction(() => {
      db.prepare(`
        INSERT INTO users (id, phone, name, email, password_hash, role, referral_code, referred_by_user_id, membership_tier, loyalty_points)
        VALUES (?, ?, ?, ?, ?, 'CUSTOMER', ?, ?, 'BLUE', 50)
      `).run(userId, formattedPhone, data.name.trim(), cleanEmail, passwordHash, userReferralCode, referrerId);

      // Auto-issue welcome vouchers
      db.prepare(`
        INSERT INTO user_vouchers (id, user_id, voucher_id, status)
        VALUES (?, ?, 'v_first_cup', 'ACTIVE')
      `).run(`uv_${uuidv4().substring(0, 8)}`, userId);

      db.prepare(`
        INSERT INTO user_vouchers (id, user_id, voucher_id, status)
        VALUES (?, ?, 'v_luckin_50', 'ACTIVE')
      `).run(`uv_${uuidv4().substring(0, 8)}`, userId);
    });

    insertUser();

    const createdUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

    const authUser: AuthUser = {
      id: createdUser.id,
      phone: createdUser.phone,
      name: createdUser.name,
      role: 'CUSTOMER'
    };

    const token = signToken(authUser, '30d');
    const sessionId = `sess_${uuidv4()}`;
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT OR REPLACE INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)
    `).run(sessionId, createdUser.id, token, sessionExpires);

    return {
      user: createdUser,
      token,
      newVoucherAssigned: true
    };
  }

  /**
   * Request Password Reset Code
   */
  static async forgotPassword(identifier: string): Promise<{ success: boolean; message: string; devResetCode?: string }> {
    const cleanId = identifier.trim().toLowerCase();
    let formattedPhone = identifier.trim().replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+') && /^\d+$/.test(formattedPhone)) {
      formattedPhone = formattedPhone.length === 10 ? `+91${formattedPhone}` : `+${formattedPhone}`;
    }

    const user = db.prepare(`
      SELECT * FROM users 
      WHERE (LOWER(email) = ? OR phone = ?) AND deleted_at IS NULL
    `).get(cleanId, formattedPhone) as any;

    if (!user) {
      return {
        success: true,
        message: 'If an account exists with this email or phone, a reset code has been generated.'
      };
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    db.prepare(`
      UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?
    `).run(resetCode, expiresAt, user.id);

    return {
      success: true,
      message: 'Password reset code sent. Valid for 15 minutes.',
      devResetCode: resetCode
    };
  }

  /**
   * Complete Password Reset
   */
  static async resetPassword(identifier: string, resetCode: string, newPasswordPlain: string): Promise<{ success: boolean; message: string }> {
    const cleanId = identifier.trim().toLowerCase();
    let formattedPhone = identifier.trim().replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+') && /^\d+$/.test(formattedPhone)) {
      formattedPhone = formattedPhone.length === 10 ? `+91${formattedPhone}` : `+${formattedPhone}`;
    }

    const user = db.prepare(`
      SELECT * FROM users 
      WHERE (LOWER(email) = ? OR phone = ?) AND deleted_at IS NULL
    `).get(cleanId, formattedPhone) as any;

    if (!user || !user.reset_token) {
      throw new Error('Invalid or expired password reset request. Please request a new code.');
    }

    if (new Date(user.reset_token_expires) < new Date()) {
      db.prepare(`UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?`).run(user.id);
      throw new Error('This password reset code has expired. Please request a new code.');
    }

    if (user.reset_token.trim() !== resetCode.trim()) {
      throw new Error('Invalid reset code. Please check the 6-digit code and try again.');
    }

    const newHash = this.hashPassword(newPasswordPlain);
    db.prepare(`
      UPDATE users 
      SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL 
      WHERE id = ?
    `).run(newHash, user.id);

    return {
      success: true,
      message: 'Your password has been successfully updated. You may now log in.'
    };
  }

  /**
   * Soft-delete user account
   */
  static softDeleteUser(userId: string): void {
    db.prepare(`
      UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(userId);

    db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(userId);
  }

  /**
   * Staff login (Barista / Admin)
   */
  static staffLogin(username: string, passwordPlain: string): { staff: any; token: string } | null {
    const staff = db.prepare(`
      SELECT * FROM staff_users WHERE username = ?
    `).get(username) as any;

    if (!staff) {
      return null;
    }

    const isMatch = staff.password_hash.includes(':')
      ? this.verifyPassword(passwordPlain, staff.password_hash)
      : staff.password_hash === passwordPlain;

    if (!isMatch) {
      return null;
    }

    const authUser: AuthUser = {
      id: staff.id,
      name: staff.username,
      role: staff.role,
      storeId: staff.store_id || undefined
    };

    const token = signToken(authUser, '7d');
    return { staff, token };
  }
}
