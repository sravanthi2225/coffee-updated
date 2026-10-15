import db from '../db/connection';
import { StoreSlotService } from '../services/StoreSlotService';
import { SseService } from '../services/SseService';

export function startOrderReaper(): NodeJS.Timeout {
  console.log('[Cron] Order reaper initialized (checks every 60s for expired pending orders)...');

  return setInterval(() => {
    try {
      const now = new Date().toISOString();

      // Find orders in PENDING_PAYMENT where expires_at has passed
      const expiredOrders = db.prepare(`
        SELECT id, user_id, voucher_id, store_id FROM orders 
        WHERE status = 'PENDING_PAYMENT' AND expires_at < ?
      `).all(now) as any[];

      if (expiredOrders.length > 0) {
        console.log(`[Cron] Found ${expiredOrders.length} expired pending orders. Reaping...`);

        const reapTx = db.transaction(() => {
          for (const order of expiredOrders) {
            // 1. Mark EXPIRED
            db.prepare(`UPDATE orders SET status = 'EXPIRED' WHERE id = ?`).run(order.id);

            // 2. Release slot reservation
            StoreSlotService.releaseSlot(order.id);

            // 3. Restore voucher
            if (order.voucher_id) {
              db.prepare(`
                UPDATE user_vouchers SET status = 'ACTIVE' 
                WHERE user_id = ? AND voucher_id = ? AND status = 'RESERVED'
              `).run(order.user_id, order.voucher_id);
            }

            // Notify SSE
            SseService.notifyOrderStatus(order.id, {
              status: 'EXPIRED',
              message: 'Order expired due to payment timeout. Slot and voucher released.'
            });
          }
        });

        reapTx();
        console.log(`[Cron] Successfully reaped ${expiredOrders.length} orders.`);
      }
    } catch (err) {
      console.error('[Cron Error in OrderReaper]', err);
    }
  }, 60 * 1000);
}
