import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/connection';
import { PricingService, CartItemInput } from './PricingService';
import { StoreSlotService } from './StoreSlotService';
import { SseService } from './SseService';
import { getPaymentAdapter } from '../adapters/payment';
import { getSmsAdapter } from '../adapters/sms';

export class OrderService {
  private static hashPickupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * 1. Create Order in PENDING_PAYMENT state (Atomic Transaction)
   */
  static async createOrder(params: {
    userId: string;
    storeId: string;
    fulfilmentMode: 'PICKUP' | 'DELIVERY' | 'DINEIN';
    slotId?: string;
    pickupType?: 'ASAP' | 'SCHEDULED';
    items: CartItemInput[];
    voucherCode?: string;
    deliveryAddressJson?: string;
    idempotencyKey?: string;
  }) {
    const { userId, storeId, fulfilmentMode, slotId, pickupType = 'ASAP', items, voucherCode, deliveryAddressJson, idempotencyKey } = params;

    // Check idempotency
    if (idempotencyKey) {
      const existing = db.prepare(`SELECT * FROM orders WHERE idempotency_key = ?`).get(idempotencyKey) as any;
      if (existing) {
        return { order: existing, isDuplicate: true };
      }
    }

    // 1. Calculate pricing strictly from server DB
    const preview = PricingService.calculatePreview({
      userId,
      storeId,
      fulfilmentMode,
      items,
      voucherCode,
      autoApplyBestVoucher: !voucherCode
    });

    const orderId = `ord_${uuidv4().substring(0, 10)}`;
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BB-${dateStamp}-${randomSuffix}`;

    // 2. Generate 4-digit pickup code + secure hash
    const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
    const pickupHash = this.hashPickupCode(pickupCode);

    // 10-minute expiry for payment
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const createTransaction = db.transaction(() => {
      // Slot capacity check & reservation if scheduled
      if (slotId) {
        const reserved = StoreSlotService.reserveSlot(slotId, orderId, preview.totalDrinksCount);
        if (!reserved) {
          throw new Error('Selected pickup slot is no longer available. Please choose another slot.');
        }
      }

      // Mark voucher as RESERVED
      if (preview.appliedVoucher) {
        db.prepare(`
          UPDATE user_vouchers SET status = 'RESERVED' 
          WHERE user_id = ? AND voucher_id = ? AND status = 'ACTIVE'
        `).run(userId, preview.appliedVoucher.id);
      }

      // Insert Order
      db.prepare(`
        INSERT INTO orders (
          id, order_number, user_id, store_id, fulfilment_mode, slot_id, pickup_type,
          status, subtotal, discount_amount, tax_amount, delivery_fee, total_amount,
          voucher_id, delivery_address_json, pickup_code, pickup_code_hash, idempotency_key, expires_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, 'PENDING_PAYMENT', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `).run(
        orderId, orderNumber, userId, storeId, fulfilmentMode, slotId || null, pickupType,
        preview.subtotal, preview.discountAmount, preview.totalTax, preview.deliveryFee, preview.finalTotal,
        preview.appliedVoucher?.id || null, deliveryAddressJson || null, pickupCode, pickupHash, idempotencyKey || null, expiresAt
      );

      // Insert Order Items and Options
      const insertItem = db.prepare(`
        INSERT INTO order_items (id, order_id, item_id, item_name, unit_base_price, quantity, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const insertOpt = db.prepare(`
        INSERT INTO order_item_options (id, order_item_id, option_id, group_name, option_name, price_modifier)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const line of preview.items) {
        const orderItemId = `oi_${uuidv4().substring(0, 10)}`;
        insertItem.run(orderItemId, orderId, line.itemId, line.name, line.unitBasePrice, line.quantity, line.lineTotal);

        for (const opt of line.optionsBreakdown) {
          const optRecId = `oio_${uuidv4().substring(0, 10)}`;
          insertOpt.run(optRecId, orderItemId, opt.optionId, opt.groupName, opt.optionName, opt.priceModifier);
        }
      }

      // Pre-create Invoice record
      const invoiceNumber = `INV-${orderNumber}`;
      db.prepare(`
        INSERT INTO invoices (id, order_id, invoice_number, cgst_amount, sgst_amount, total_tax)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(`inv_${orderId}`, orderId, invoiceNumber, preview.cgstAmount, preview.sgstAmount, preview.totalTax);
    });

    createTransaction();

    const createdOrder = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId) as any;

    // Create payment intent
    const user = db.prepare(`SELECT phone, name FROM users WHERE id = ?`).get(userId) as any;
    const paymentAdapter = getPaymentAdapter();
    const paymentIntent = await paymentAdapter.createIntent({
      orderId,
      orderNumber,
      amount: preview.finalTotal,
      currency: 'INR',
      userPhone: user?.phone || '+919876543210',
      userName: user?.name || 'Valued Guest',
      idempotencyKey
    });

    // Record initial payment row
    db.prepare(`
      INSERT INTO payments (id, order_id, provider, amount, currency, status)
      VALUES (?, ?, ?, ?, 'INR', 'PENDING')
    `).run(paymentIntent.paymentId, orderId, paymentIntent.provider, preview.finalTotal);

    return {
      order: createdOrder,
      preview,
      paymentIntent,
      isDuplicate: false
    };
  }

  /**
   * 2. Complete Payment & Transition to PAID
   */
  static async handlePaymentSuccess(orderId: string, paymentId: string, transactionId?: string) {
    const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId) as any;
    if (!order) throw new Error('Order not found');

    if (order.status !== 'PENDING_PAYMENT') {
      return order; // Already processed
    }

    const payTx = db.transaction(() => {
      // Mark payment SUCCESS
      db.prepare(`
        UPDATE payments SET status = 'SUCCESS', transaction_id = ? WHERE order_id = ?
      `).run(transactionId || paymentId, orderId);

      // Transition order to PAID
      db.prepare(`
        UPDATE orders SET status = 'PAID' WHERE id = ?
      `).run(orderId);

      // Consume voucher permanently
      if (order.voucher_id) {
        db.prepare(`
          UPDATE user_vouchers SET status = 'USED', used_at = CURRENT_TIMESTAMP
          WHERE user_id = ? AND voucher_id = ?
        `).run(order.user_id, order.voucher_id);
      }
    });

    payTx();

    const updatedOrder = this.getOrderDetails(orderId);

    // Notify Barista Dashboard via SSE
    SseService.notifyBaristaQueue(order.store_id, 'NEW_ORDER', updatedOrder);
    // Notify Customer
    SseService.notifyOrderStatus(orderId, { status: 'PAID', message: 'Payment confirmed! Barista queue received order.' });

    return updatedOrder;
  }

  /**
   * 3. Handle Payment Failure / Cancel from Payment sheet
   */
  static handlePaymentFailure(orderId: string, reason: string) {
    const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId) as any;
    if (!order || order.status !== 'PENDING_PAYMENT') return;

    db.transaction(() => {
      // Mark payment FAILED
      db.prepare(`UPDATE payments SET status = 'FAILED' WHERE order_id = ?`).run(orderId);

      // Release reserved slot
      StoreSlotService.releaseSlot(orderId);

      // Restore voucher to ACTIVE
      if (order.voucher_id) {
        db.prepare(`
          UPDATE user_vouchers SET status = 'ACTIVE' 
          WHERE user_id = ? AND voucher_id = ? AND status = 'RESERVED'
        `).run(order.user_id, order.voucher_id);
      }
    })();
  }

  /**
   * 4. Barista Status Transitions: ACCEPTED -> PREPARING -> READY
   */
  static async updateOrderStatus(orderId: string, newStatus: 'ACCEPTED' | 'PREPARING' | 'READY') {
    const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId) as any;
    if (!order) throw new Error('Order not found');

    db.prepare(`UPDATE orders SET status = ? WHERE id = ?`).run(newStatus, orderId);

    // On READY: trigger SMS notification
    if (newStatus === 'READY') {
      const user = db.prepare(`SELECT phone FROM users WHERE id = ?`).get(order.user_id) as any;
      if (user) {
        const sms = getSmsAdapter();
        await sms.sendOrderReadyNotification(user.phone, order.order_number, order.pickup_code);
      }
    }

    const updated = this.getOrderDetails(orderId);

    // Live update broadcast
    SseService.notifyOrderStatus(orderId, {
      status: newStatus,
      pickupCode: newStatus === 'READY' ? order.pickup_code : undefined
    });
    SseService.notifyBaristaQueue(order.store_id, 'STATUS_CHANGED', updated);

    return updated;
  }

  /**
   * 5. Verify Pickup Code / QR Scan -> COLLECTED (Credits Points & Referral)
   */
  static async verifyPickupAndCollect(storeId: string, pickupCodeInput: string): Promise<{ success: boolean; order?: any; error?: string }> {
    const code = pickupCodeInput.trim();
    const inputHash = this.hashPickupCode(code);

    const order = db.prepare(`
      SELECT * FROM orders 
      WHERE pickup_code_hash = ? AND store_id = ? AND status = 'READY'
    `).get(inputHash, storeId) as any;

    if (!order) {
      return {
        success: false,
        error: 'Invalid or already collected pickup code for this store location.'
      };
    }

    const collectTx = db.transaction(() => {
      // 1. Mark COLLECTED
      db.prepare(`UPDATE orders SET status = 'COLLECTED' WHERE id = ?`).run(order.id);

      // 2. Credit Loyalty Points (10 points per ₹100 spend)
      const earnedPoints = Math.max(10, Math.floor((order.total_amount / 100) * 10));
      db.prepare(`
        UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?
      `).run(earnedPoints, order.user_id);

      db.prepare(`
        INSERT INTO loyalty_ledger (id, user_id, order_id, points, event_type)
        VALUES (?, ?, ?, ?, 'ORDER_EARN')
      `).run(`ll_${uuidv4().substring(0, 8)}`, order.user_id, order.id, earnedPoints);

      // Check Tier Upgrade
      const user = db.prepare(`SELECT loyalty_points, membership_tier FROM users WHERE id = ?`).get(order.user_id) as any;
      if (user.loyalty_points >= 1000 && user.membership_tier !== 'GOLD') {
        db.prepare(`UPDATE users SET membership_tier = 'GOLD' WHERE id = ?`).run(order.user_id);
      } else if (user.loyalty_points >= 300 && user.membership_tier === 'BLUE') {
        db.prepare(`UPDATE users SET membership_tier = 'SILVER' WHERE id = ?`).run(order.user_id);
      }

      // 3. Process Referral Rewards if this is user's first collected order
      const referral = db.prepare(`
        SELECT * FROM referrals WHERE referred_user_id = ? AND status = 'PENDING'
      `).get(order.user_id) as any;

      if (referral) {
        // Issue reward voucher to referrer & referee
        const rewardVoucher = db.prepare(`SELECT id FROM vouchers WHERE code = 'LUCKIN50'`).get() as any;
        if (rewardVoucher) {
          // Referrer gets reward
          db.prepare(`
            INSERT INTO user_vouchers (id, user_id, voucher_id, status)
            VALUES (?, ?, ?, 'ACTIVE')
          `).run(`uv_ref_${uuidv4().substring(0, 8)}`, referral.referrer_user_id, rewardVoucher.id);

          // Mark referral QUALIFIED
          db.prepare(`
            UPDATE referrals SET status = 'QUALIFIED', reward_voucher_id = ? WHERE id = ?
          `).run(rewardVoucher.id, referral.id);
        }
      }
    });

    collectTx();

    const updated = this.getOrderDetails(order.id);

    SseService.notifyOrderStatus(order.id, { status: 'COLLECTED', message: 'Order collected! Thank you for brewing with us.' });
    SseService.notifyBaristaQueue(storeId, 'ORDER_COLLECTED', updated);

    return { success: true, order: updated };
  }

  /**
   * 6. User or Store Cancellation & Automatic Refund
   */
  static async cancelOrder(orderId: string, reason: string, cancelledByRole: 'CUSTOMER' | 'BARISTA' | 'ADMIN') {
    const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId) as any;
    if (!order) throw new Error('Order not found');

    // Rule: Customer cannot cancel after PREPARING begins
    if (cancelledByRole === 'CUSTOMER' && ['PREPARING', 'READY', 'COLLECTED', 'CANCELLED'].includes(order.status)) {
      throw new Error('Order cannot be cancelled as preparation has already commenced.');
    }

    const cancelTx = db.transaction(() => {
      db.prepare(`UPDATE orders SET status = 'CANCELLED' WHERE id = ?`).run(orderId);

      // Release slot
      StoreSlotService.releaseSlot(orderId);

      // Restore voucher
      if (order.voucher_id) {
        db.prepare(`
          UPDATE user_vouchers SET status = 'ACTIVE' 
          WHERE user_id = ? AND voucher_id = ?
        `).run(order.user_id, order.voucher_id);
      }

      // If already paid, issue refund
      if (['PAID', 'ACCEPTED'].includes(order.status)) {
        const payment = db.prepare(`
          SELECT * FROM payments WHERE order_id = ? AND status = 'SUCCESS'
        `).get(orderId) as any;

        if (payment) {
          db.prepare(`
            INSERT INTO refunds (id, order_id, payment_id, amount, reason, status)
            VALUES (?, ?, ?, ?, ?, 'COMPLETED')
          `).run(`rfnd_${uuidv4().substring(0, 8)}`, orderId, payment.id, order.total_amount, reason);

          db.prepare(`UPDATE orders SET status = 'REFUNDED' WHERE id = ?`).run(orderId);
        }
      }
    });

    cancelTx();

    const updated = this.getOrderDetails(orderId);
    SseService.notifyOrderStatus(orderId, { status: updated.status, message: `Order cancelled: ${reason}` });
    SseService.notifyBaristaQueue(order.store_id, 'ORDER_CANCELLED', updated);

    return updated;
  }

  /**
   * Get complete order with items, options, invoice and store
   */
  static getOrderDetails(orderId: string) {
    const order = db.prepare(`
      SELECT o.*, s.name as store_name, s.address as store_address, s.latitude as store_lat, s.longitude as store_lng,
             v.code as voucher_code, v.title as voucher_title
      FROM orders o
      JOIN stores s ON o.store_id = s.id
      LEFT JOIN vouchers v ON o.voucher_id = v.id
      WHERE o.id = ?
    `).get(orderId) as any;

    if (!order) return null;

    const items = db.prepare(`SELECT * FROM order_items WHERE order_id = ?`).all(orderId) as any[];
    for (const item of items) {
      item.options = db.prepare(`SELECT * FROM order_item_options WHERE order_item_id = ?`).all(item.id);
    }

    const invoice = db.prepare(`SELECT * FROM invoices WHERE order_id = ?`).get(orderId);
    const payment = db.prepare(`SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1`).get(orderId);
    const refund = db.prepare(`SELECT * FROM refunds WHERE order_id = ?`).get(orderId);

    return {
      ...order,
      items,
      invoice,
      payment,
      refund
    };
  }
}
