import { Router, Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { getPaymentAdapter } from '../adapters/payment';

export const paymentRouter = Router();

// POST /api/payments/mock-complete - Complete test sandbox payment
paymentRouter.post('/mock-complete', async (req: Request, res: Response) => {
  try {
    const { orderId, paymentId, transactionId } = req.body;
    if (!orderId) {
      res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'orderId is required' } });
      return;
    }

    const updatedOrder = await OrderService.handlePaymentSuccess(orderId, paymentId || `pay_${Date.now()}`, transactionId);
    res.json({
      success: true,
      message: 'Payment completed successfully (Mock Sandbox)',
      order: updatedOrder
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'PAYMENT_ERROR', message: error.message } });
  }
});

// POST /api/payments/mock-fail - Simulate payment failure / user cancel
paymentRouter.post('/mock-fail', (req: Request, res: Response) => {
  const { orderId, reason } = req.body;
  if (!orderId) {
    res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'orderId is required' } });
    return;
  }

  OrderService.handlePaymentFailure(orderId, reason || 'User cancelled payment or insufficient funds');
  res.json({ success: true, message: 'Payment marked as failed. Reserved slot and voucher have been restored.' });
});

// POST /api/payments/webhook - Razorpay Webhook Handler
paymentRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string | undefined;
    const adapter = getPaymentAdapter();

    const isValid = await adapter.verifySignature({
      orderId: req.body?.payload?.payment?.entity?.order_id || '',
      paymentId: req.body?.payload?.payment?.entity?.id || '',
      signature
    });

    if (!isValid) {
      res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      return;
    }

    const event = req.body.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const orderId = req.body.payload.payment.entity.notes?.orderId;
      const paymentId = req.body.payload.payment.entity.id;
      if (orderId) {
        await OrderService.handlePaymentSuccess(orderId, paymentId);
      }
    }

    res.json({ status: 'ok' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
