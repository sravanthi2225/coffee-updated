import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { OrderService } from '../services/OrderService';
import { PricingService } from '../services/PricingService';
import { SseService } from '../services/SseService';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import db from '../db/connection';

export const orderRouter = Router();

const previewSchema = z.object({
  storeId: z.string().min(1, 'Store is required'),
  fulfilmentMode: z.enum(['PICKUP', 'DELIVERY', 'DINEIN']).default('PICKUP'),
  slotId: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().int().min(1),
    selectedOptionIds: z.array(z.string()).default([])
  })).min(1, 'At least one item is required in the cart'),
  voucherCode: z.string().optional()
});

const createOrderSchema = previewSchema.extend({
  pickupType: z.enum(['ASAP', 'SCHEDULED']).default('ASAP'),
  deliveryAddress: z.any().optional(),
  idempotencyKey: z.string().optional()
});

// 1. POST /api/orders/preview - Point of Truth Calculation
orderRouter.post('/preview', optionalAuth, validateBody(previewSchema), (req: Request, res: Response) => {
  try {
    const preview = PricingService.calculatePreview({
      userId: req.user?.id,
      storeId: req.body.storeId,
      fulfilmentMode: req.body.fulfilmentMode,
      items: req.body.items,
      voucherCode: req.body.voucherCode,
      autoApplyBestVoucher: !req.body.voucherCode
    });

    res.json({ success: true, preview });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'PREVIEW_ERROR', message: error.message } });
  }
});

// 2. POST /api/orders - Create Order & Payment Intent
orderRouter.post('/', requireAuth, validateBody(createOrderSchema), async (req: Request, res: Response) => {
  try {
    const result = await OrderService.createOrder({
      userId: req.user!.id,
      storeId: req.body.storeId,
      fulfilmentMode: req.body.fulfilmentMode,
      slotId: req.body.slotId,
      pickupType: req.body.pickupType,
      items: req.body.items,
      voucherCode: req.body.voucherCode,
      deliveryAddressJson: req.body.deliveryAddress ? JSON.stringify(req.body.deliveryAddress) : undefined,
      idempotencyKey: req.body.idempotencyKey
    });

    res.status(201).json({
      success: true,
      order: result.order,
      preview: result.preview,
      paymentIntent: result.paymentIntent,
      isDuplicate: result.isDuplicate
    });
  } catch (error: any) {
    console.error('[ORDER CREATION ERROR]', error);
    res.status(400).json({ success: false, error: { code: 'ORDER_CREATION_FAILED', message: error.message } });
  }
});

// 3. GET /api/orders/:id - Fetch Order Details
orderRouter.get('/:id', optionalAuth, (req: Request, res: Response) => {
  const order = OrderService.getOrderDetails(req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    return;
  }
  res.json({ success: true, order });
});

// 4. GET /api/orders/:id/stream - Realtime Order Status SSE
orderRouter.get('/:id/stream', (req: Request, res: Response) => {
  const orderId = req.params.id;
  const order = db.prepare('SELECT id, status FROM orders WHERE id = ?').get(orderId);
  if (!order) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    return;
  }
  SseService.subscribeOrder(orderId, res);
});

// 5. POST /api/orders/:id/cancel - Cancel Order before PREPARING
orderRouter.post('/:id/cancel', requireAuth, async (req: Request, res: Response) => {
  try {
    const reason = req.body?.reason || 'Cancelled by customer';
    const role = (req.user!.role as any) || 'CUSTOMER';
    const updated = await OrderService.cancelOrder(req.params.id, reason, role);
    res.json({ success: true, order: updated, message: 'Order cancelled successfully.' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CANCEL_FAILED', message: error.message } });
  }
});

// 6. GET /api/orders/:id/invoice - Itemized Tax Invoice Data
orderRouter.get('/:id/invoice', optionalAuth, (req: Request, res: Response) => {
  const order = OrderService.getOrderDetails(req.params.id);
  if (!order || !order.invoice) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    return;
  }

  res.json({
    success: true,
    invoice: {
      ...order.invoice,
      orderNumber: order.order_number,
      createdAt: order.created_at,
      storeName: order.store_name,
      storeAddress: order.store_address,
      items: order.items,
      subtotal: order.subtotal,
      discountAmount: order.discount_amount,
      taxAmount: order.tax_amount,
      deliveryFee: order.delivery_fee,
      totalAmount: order.total_amount,
      fulfilmentMode: order.fulfilment_mode,
      payment: order.payment
    }
  });
});
