import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  phone?: string;
  name?: string;
  role: 'CUSTOMER' | 'BARISTA' | 'STORE_MANAGER' | 'ADMIN';
  storeId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const getJwtSecret = () => process.env.JWT_SECRET || 'super_secret_brew_and_bloom_jwt_key_2026';

import db from '../db/connection';

export function signToken(user: AuthUser, expiresIn: string = '30d'): string {
  return jwt.sign({ ...user, jti: uuidv4() }, getJwtSecret(), { expiresIn });
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthUser;

    // 1. Staff check
    if (decoded.role && ['BARISTA', 'STORE_MANAGER', 'ADMIN'].includes(decoded.role)) {
      const staffInDb = db.prepare('SELECT id, username, role, store_id FROM staff_users WHERE id = ?').get(decoded.id) as any;
      if (staffInDb) {
        req.user = { id: staffInDb.id, role: staffInDb.role, storeId: staffInDb.store_id, name: staffInDb.username };
        return next();
      }
    }

    // 2. Customer check
    let userInDb = db.prepare('SELECT id, phone, name, role FROM users WHERE id = ? AND deleted_at IS NULL').get(decoded.id) as any;
    if (!userInDb && decoded.phone) {
      const refCode = `REF${Math.floor(1000 + Math.random() * 9000)}`;
      db.prepare(`
        INSERT OR IGNORE INTO users (id, phone, name, role, referral_code)
        VALUES (?, ?, ?, 'CUSTOMER', ?)
      `).run(decoded.id, decoded.phone, decoded.name || 'Valued Guest', refCode);
      userInDb = db.prepare('SELECT id, phone, name, role FROM users WHERE id = ? AND deleted_at IS NULL').get(decoded.id) as any;
    }
    if (userInDb) {
      req.user = { ...decoded, phone: userInDb.phone, name: userInDb.name, role: userInDb.role || 'CUSTOMER' };
    }
  } catch {
    // Ignore invalid token in optional auth
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthUser;

    // 1. Staff check
    if (decoded.role && ['BARISTA', 'STORE_MANAGER', 'ADMIN'].includes(decoded.role)) {
      const staffInDb = db.prepare('SELECT id, username, role, store_id FROM staff_users WHERE id = ?').get(decoded.id) as any;
      if (staffInDb) {
        req.user = { id: staffInDb.id, role: staffInDb.role, storeId: staffInDb.store_id, name: staffInDb.username };
        return next();
      }
    }

    // 2. Customer check
    let userInDb = db.prepare('SELECT id, phone, name, role FROM users WHERE id = ? AND deleted_at IS NULL').get(decoded.id) as any;
    if (!userInDb && decoded.phone) {
      const refCode = `REF${Math.floor(1000 + Math.random() * 9000)}`;
      db.prepare(`
        INSERT OR IGNORE INTO users (id, phone, name, role, referral_code)
        VALUES (?, ?, ?, 'CUSTOMER', ?)
      `).run(decoded.id, decoded.phone, decoded.name || 'Valued Guest', refCode);
      userInDb = db.prepare('SELECT id, phone, name, role FROM users WHERE id = ? AND deleted_at IS NULL').get(decoded.id) as any;
    }

    if (!userInDb) {
      res.clearCookie('session_token');
      res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User record not found. Please log in again.' } });
      return;
    }

    req.user = { ...decoded, phone: userInDb.phone, name: userInDb.name, role: userInDb.role || 'CUSTOMER' };
    next();
  } catch (err) {
    res.clearCookie('session_token');
    res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Session expired or invalid' } });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient access privileges' } });
      return;
    }

    next();
  };
}
