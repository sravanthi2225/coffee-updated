import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/connection';
import { requireAuth, requireRole } from '../middleware/auth';

export const adminRouter = Router();

// Protect all admin routes
adminRouter.use(requireAuth, requireRole('ADMIN'));

// 1. GET /api/admin/reports - Executive Business Metrics
adminRouter.get('/reports', (req: Request, res: Response) => {
  // Total Revenue & Orders
  const totals = db.prepare(`
    SELECT COUNT(*) as total_orders, 
           COALESCE(SUM(total_amount), 0) as total_revenue,
           COALESCE(SUM(discount_amount), 0) as total_discounts_given
    FROM orders WHERE status IN ('PAID', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED')
  `).get() as any;

  // Daily revenue for last 7 days
  const daily = db.prepare(`
    SELECT DATE(created_at) as date, 
           COUNT(*) as order_count, 
           COALESCE(SUM(total_amount), 0) as daily_revenue
    FROM orders 
    WHERE status IN ('PAID', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED')
    GROUP BY DATE(created_at)
    ORDER BY date DESC LIMIT 7
  `).all();

  // Top items by sales volume
  const topItems = db.prepare(`
    SELECT oi.item_name, SUM(oi.quantity) as units_sold, SUM(oi.total_price) as gross_sales
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status IN ('PAID', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED')
    GROUP BY oi.item_name
    ORDER BY units_sold DESC LIMIT 5
  `).all();

  // Voucher usage stats
  const voucherStats = db.prepare(`
    SELECT v.code, v.title, COUNT(uv.id) as redeemed_count
    FROM vouchers v
    LEFT JOIN user_vouchers uv ON v.id = uv.voucher_id AND uv.status = 'USED'
    GROUP BY v.id
  `).all();

  res.json({
    success: true,
    totals,
    daily,
    topItems,
    voucherStats
  });
});

// 2. CRUD Vouchers
adminRouter.get('/vouchers', (req: Request, res: Response) => {
  const vouchers = db.prepare(`SELECT * FROM vouchers ORDER BY created_at DESC`).all();
  res.json({ success: true, vouchers });
});

adminRouter.post('/vouchers', (req: Request, res: Response) => {
  const { code, title, description, discountType, discountValue, minSpend, maxDiscount, isNewUserOnly, validUntil } = req.body;
  const id = `v_${uuidv4().substring(0, 8)}`;

  db.prepare(`
    INSERT INTO vouchers (id, code, title, description, discount_type, discount_value, min_spend, max_discount, is_new_user_only, valid_from, valid_until)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
  `).run(
    id, code.toUpperCase(), title, description || null, discountType, discountValue,
    minSpend || 0, maxDiscount || null, isNewUserOnly ? 1 : 0, validUntil || '2027-12-31'
  );

  res.status(201).json({ success: true, message: 'Voucher campaign created', voucherId: id });
});

// 3. CRUD Items
adminRouter.post('/items', (req: Request, res: Response) => {
  const { categoryId, name, slug, description, basePrice, imageUrl, isBestseller, isNew, calories } = req.body;
  const id = `item_${uuidv4().substring(0, 8)}`;

  db.prepare(`
    INSERT INTO items (id, category_id, name, slug, description, base_price, image_url, is_bestseller, is_new, calories)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, categoryId, name, slug, description || null, basePrice, imageUrl, isBestseller ? 1 : 0, isNew ? 1 : 0, calories || null);

  // Link to all stores by default
  const stores = db.prepare(`SELECT id FROM stores`).all() as any[];
  for (const s of stores) {
    db.prepare(`INSERT OR IGNORE INTO store_item_availability (store_id, item_id, is_available) VALUES (?, ?, 1)`).run(s.id, id);
  }

  res.status(201).json({ success: true, message: 'Item created', itemId: id });
});

adminRouter.put('/items/:id', (req: Request, res: Response) => {
  const { name, basePrice, description, isBestseller, isNew } = req.body;
  db.prepare(`
    UPDATE items SET name = ?, base_price = ?, description = ?, is_bestseller = ?, is_new = ? WHERE id = ?
  `).run(name, basePrice, description, isBestseller ? 1 : 0, isNew ? 1 : 0, req.params.id);

  res.json({ success: true, message: 'Item updated' });
});
