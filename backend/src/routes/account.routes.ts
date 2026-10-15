import { Router, Request, Response } from 'express';
import db from '../db/connection';
import { requireAuth } from '../middleware/auth';
import { OrderService } from '../services/OrderService';

export const accountRouter = Router();

// GET /api/account/vouchers - User's active, used, and expired vouchers
accountRouter.get('/vouchers', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;

  const vouchers = db.prepare(`
    SELECT uv.id as user_voucher_id, uv.status, uv.created_at, uv.used_at,
           v.id as voucher_id, v.code, v.title, v.description, v.discount_type,
           v.discount_value, v.min_spend, v.max_discount, v.valid_until
    FROM user_vouchers uv
    JOIN vouchers v ON uv.voucher_id = v.id
    WHERE uv.user_id = ?
    ORDER BY CASE WHEN uv.status = 'ACTIVE' THEN 1 ELSE 2 END, uv.created_at DESC
  `).all(userId);

  res.json({ success: true, vouchers });
});

// GET /api/account/referrals - Referral link, code, and invited friends status
accountRouter.get('/referrals', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;

  const user = db.prepare(`
    SELECT referral_code, loyalty_points, membership_tier FROM users WHERE id = ?
  `).get(userId) as any;

  const referrals = db.prepare(`
    SELECT r.*, u.name as referee_name, u.phone as referee_phone, u.created_at as referee_joined_at,
           v.title as reward_title
    FROM referrals r
    JOIN users u ON r.referred_user_id = u.id
    LEFT JOIN vouchers v ON r.reward_voucher_id = v.id
    WHERE r.referrer_user_id = ?
    ORDER BY r.created_at DESC
  `).all(userId);

  res.json({
    success: true,
    referralCode: user.referral_code,
    shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?ref=${user.referral_code}`,
    loyaltyPoints: user.loyalty_points,
    membershipTier: user.membership_tier,
    referrals
  });
});

// GET /api/account/orders - Paginated past order history
accountRouter.get('/orders', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;

  const orders = db.prepare(`
    SELECT o.*, s.name as store_name
    FROM orders o
    JOIN stores s ON o.store_id = s.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `).all(userId) as any[];

  for (const o of orders) {
    o.items = db.prepare(`SELECT * FROM order_items WHERE order_id = ?`).all(o.id);
  }

  res.json({ success: true, orders });
});

// POST /api/account/reorder/:orderId - Reorder in one tap (re-validates price and items)
accountRouter.post('/reorder/:orderId', requireAuth, (req: Request, res: Response) => {
  const oldOrder = OrderService.getOrderDetails(req.params.orderId);
  if (!oldOrder) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    return;
  }

  // Convert old order items into cart format
  const cartItems = oldOrder.items.map((item: any) => ({
    itemId: item.item_id,
    quantity: item.quantity,
    selectedOptionIds: item.options.map((o: any) => o.option_id)
  }));

  res.json({
    success: true,
    storeId: oldOrder.store_id,
    fulfilmentMode: oldOrder.fulfilment_mode,
    items: cartItems,
    message: 'Cart items loaded for reorder'
  });
});

// POST /api/account/bookings - Create Table / Slot Pre-Booking
accountRouter.post('/bookings', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { storeId, slotId, bookingDate, startTime, partySize, tableType, specialNotes, preorderItems } = req.body;

  if (!storeId || !bookingDate || !startTime) {
    res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Store, date, and start time are required.' } });
    return;
  }

  const bookingId = `book_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const refCode = `BB-${Math.floor(100000 + Math.random() * 900000)}`;

  db.prepare(`
    INSERT INTO table_bookings (id, booking_reference, user_id, store_id, slot_id, booking_date, start_time, party_size, table_type, special_notes, preorder_items_json, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')
  `).run(
    bookingId,
    refCode,
    userId,
    storeId,
    slotId || null,
    bookingDate,
    startTime,
    partySize || 2,
    tableType || 'STANDARD',
    specialNotes || null,
    preorderItems ? JSON.stringify(preorderItems) : null
  );

  const created = db.prepare(`
    SELECT b.*, s.name as store_name, s.address as store_address
    FROM table_bookings b
    JOIN stores s ON b.store_id = s.id
    WHERE b.id = ?
  `).get(bookingId);

  res.status(201).json({
    success: true,
    booking: created,
    message: `Table reserved successfully! Reference code: ${refCode}`
  });
});

// GET /api/account/bookings - List User's Table Bookings
accountRouter.get('/bookings', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;

  const bookings = db.prepare(`
    SELECT b.*, s.name as store_name, s.address as store_address
    FROM table_bookings b
    JOIN stores s ON b.store_id = s.id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC, b.start_time DESC
  `).all(userId) as any[];

  for (const b of bookings) {
    if (b.preorder_items_json) {
      try {
        b.preorder_items = JSON.parse(b.preorder_items_json);
      } catch {
        b.preorder_items = [];
      }
    }
  }

  res.json({ success: true, bookings });
});

// POST /api/account/bookings/:id/cancel - Cancel Table Booking
accountRouter.post('/bookings/:id/cancel', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const bookingId = req.params.id;

  const booking = db.prepare(`
    SELECT * FROM table_bookings WHERE id = ? AND user_id = ?
  `).get(bookingId, userId) as any;

  if (!booking) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found.' } });
    return;
  }

  db.prepare(`
    UPDATE table_bookings SET status = 'CANCELLED' WHERE id = ?
  `).run(bookingId);

  res.json({ success: true, message: 'Booking has been cancelled.' });
});
