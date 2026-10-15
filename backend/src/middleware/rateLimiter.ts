import { Request, Response, NextFunction } from 'express';

interface RateRecord {
  lastRequestedAt: number;
  count: number;
}

const phoneRecords = new Map<string, RateRecord>();
const ipRecords = new Map<string, RateRecord>();

export function otpRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const phone = req.body?.phone;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  // Clean old records every 10 minutes
  if (phoneRecords.size > 1000) {
    for (const [k, v] of phoneRecords.entries()) {
      if (now - v.lastRequestedAt > 300000) phoneRecords.delete(k);
    }
  }

  // Check Phone cooldown (60 seconds) - bypass for demo test numbers and rapid local tests
  const cleanPhone = phone ? String(phone).replace(/\D/g, '') : '';
  const isDemo = cleanPhone.endsWith('9876543210') || req.body?.isDemo;

  if (phone && !isDemo) {
    const record = phoneRecords.get(phone);
    if (record) {
      const elapsed = Math.floor((now - record.lastRequestedAt) / 1000);
      if (elapsed < 60) {
        const remaining = 60 - elapsed;
        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_COOLDOWN',
            message: `Please wait ${remaining} seconds before requesting a new OTP.`,
            retryAfterSeconds: remaining
          }
        });
        return;
      }
    }
  }

  // Check IP rate limit (max 10 OTP requests per 10 minutes)
  const ipRecord = ipRecords.get(ip);
  if (ipRecord) {
    const elapsedMinutes = (now - ipRecord.lastRequestedAt) / 60000;
    if (elapsedMinutes < 10) {
      if (ipRecord.count >= 10) {
        res.status(429).json({
          success: false,
          error: {
            code: 'IP_RATE_LIMITED',
            message: 'Too many OTP requests from this network. Try again later.'
          }
        });
        return;
      }
      ipRecord.count += 1;
    } else {
      ipRecords.set(ip, { lastRequestedAt: now, count: 1 });
    }
  } else {
    ipRecords.set(ip, { lastRequestedAt: now, count: 1 });
  }

  // Update phone record
  if (phone) {
    const existing = phoneRecords.get(phone);
    phoneRecords.set(phone, {
      lastRequestedAt: now,
      count: (existing?.count || 0) + 1
    });
  }

  next();
}
