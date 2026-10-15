import { Router, Request, Response } from 'express';
import db from '../db/connection';
import { requireAuth, requireRole } from '../middleware/auth';
import { OrderService } from '../services/OrderService';
import { SseService } from '../services/SseService';

export const baristaRouter = Router();

// GET /api/barista/stream - Realtime SSE queue stream
baristaRouter.get('/stream', (req: Request, res: Response) => {
  const storeId = req.query.storeId as string | undefined;
  SseService.subscribeBarista(res, storeId);
});

// GET /api/barista/queue - Active order queue for staff store
baristaRouter.get('/queue', requireAuth, requireRole('BARISTA', 'STORE_MANAGER', 'ADMIN'), (req: Request, res: Response) => {
  const storeId = req.query.storeId as string || req.user?.storeId;

  let query = `
    SELECT o.*, s.name as store_name, u.name as customer_name, u.phone as customer_phone
    FROM orders o
    JOIN stores s ON o.store_id = s.id
    JOIN users u ON o.user_id = u.id
    WHERE o.status IN ('PAID', 'ACCEPTED', 'PREPARING', 'READY')
  `;
  const params: any[] = [];

  if (storeId) {
    query += ` AND o.store_id = ?`;
    params.push(storeId);
  }

  query += ` ORDER BY o.created_at ASC`;

  const orders = db.prepare(query).all(...params) as any[];

  for (const o of orders) {
    const items = db.prepare(`SELECT * FROM order_items WHERE order_id = ?`).all(o.id) as any[];
    for (const item of items) {
      item.options = db.prepare(`SELECT * FROM order_item_options WHERE order_item_id = ?`).all(item.id);
    }
    o.items = items;
  }

  res.json({ success: true, queue: orders });
});

// PATCH /api/barista/orders/:id/status - Advance order status
baristaRouter.patch('/orders/:id/status', requireAuth, requireRole('BARISTA', 'STORE_MANAGER', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['ACCEPTED', 'PREPARING', 'READY'].includes(status)) {
      res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Status must be ACCEPTED, PREPARING, or READY' } });
      return;
    }

    const updated = await OrderService.updateOrderStatus(req.params.id, status);
    res.json({ success: true, order: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'STATUS_UPDATE_FAILED', message: error.message } });
  }
});

// POST /api/barista/orders/collect - Scan QR / Enter 4-digit code to complete order
baristaRouter.post('/orders/collect', requireAuth, requireRole('BARISTA', 'STORE_MANAGER', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const { storeId, pickupCode } = req.body;
    const targetStoreId = storeId || req.user?.storeId;

    if (!targetStoreId || !pickupCode) {
      res.status(400).json({ success: false, error: { code: 'MISSING_DATA', message: 'storeId and pickupCode are required' } });
      return;
    }

    const result = await OrderService.verifyPickupAndCollect(targetStoreId, pickupCode);
    if (!result.success) {
      res.status(400).json({ success: false, error: { code: 'COLLECTION_FAILED', message: result.error } });
      return;
    }

    res.json({ success: true, order: result.order, message: 'Order marked as COLLECTED!' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// PATCH /api/barista/store/status - Toggle store status & prep time
baristaRouter.patch('/store/status', requireAuth, requireRole('BARISTA', 'STORE_MANAGER', 'ADMIN'), (req: Request, res: Response) => {
  const { storeId, status, avgPrepTimeMinutes } = req.body;
  const targetStoreId = storeId || req.user?.storeId;

  if (!targetStoreId) {
    res.status(400).json({ success: false, error: { code: 'MISSING_STORE', message: 'storeId required' } });
    return;
  }

  if (status) {
    db.prepare(`UPDATE stores SET status = ? WHERE id = ?`).run(status, targetStoreId);
  }
  if (avgPrepTimeMinutes !== undefined) {
    db.prepare(`UPDATE stores SET avg_prep_time_minutes = ? WHERE id = ?`).run(avgPrepTimeMinutes, targetStoreId);
  }

  const updatedStore = db.prepare(`SELECT * FROM stores WHERE id = ?`).get(targetStoreId) as any;
  if (updatedStore) {
    SseService.notifyGlobalFeed({
      type: 'STORE_STATUS_UPDATED',
      storeId: targetStoreId,
      status: updatedStore.status,
      avg_prep_time_minutes: updatedStore.avg_prep_time_minutes,
      message: `${updatedStore.name} is now ${updatedStore.status} (~${updatedStore.avg_prep_time_minutes}m prep)`
    });
  }
  res.json({ success: true, store: updatedStore });
});

// PATCH /api/barista/items/:id/availability - Toggle item stock at store
baristaRouter.patch('/items/:id/availability', requireAuth, requireRole('BARISTA', 'STORE_MANAGER', 'ADMIN'), (req: Request, res: Response) => {
  const { storeId, isAvailable } = req.body;
  const targetStoreId = storeId || req.user?.storeId;

  db.prepare(`
    INSERT INTO store_item_availability (store_id, item_id, is_available)
    VALUES (?, ?, ?)
    ON CONFLICT(store_id, item_id) DO UPDATE SET is_available = excluded.is_available
  `).run(targetStoreId, req.params.id, isAvailable ? 1 : 0);

  res.json({ success: true, message: `Item availability updated.` });
});
