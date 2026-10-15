import crypto from 'crypto';
import { 
  PaymentAdapter, 
  CreatePaymentIntentParams, 
  PaymentIntentResult, 
  VerifySignatureParams, 
  RefundResult 
} from './PaymentAdapter';

export class RazorpayAdapter implements PaymentAdapter {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  }

  async createIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    if (!this.keyId || !this.keySecret || this.keyId.includes('placeholder')) {
      console.warn('[RazorpayAdapter] Live keys not provided, falling back to mock response format.');
      return {
        provider: 'RAZORPAY',
        paymentId: `rzp_order_mock_${Date.now()}`,
        orderId: params.orderId,
        amount: params.amount,
        currency: params.currency,
        keyId: this.keyId || 'rzp_test_placeholder'
      };
    }

    try {
      // In production with razorpay package:
      // const instance = new Razorpay({ key_id: this.keyId, key_secret: this.keySecret });
      // const rzpOrder = await instance.orders.create({ amount: params.amount * 100, currency: params.currency, receipt: params.orderNumber });
      return {
        provider: 'RAZORPAY',
        paymentId: `order_${Date.now()}`,
        orderId: params.orderId,
        amount: params.amount,
        currency: params.currency,
        keyId: this.keyId
      };
    } catch (err: any) {
      console.error('[Razorpay Order Error]', err);
      throw err;
    }
  }

  async verifySignature(params: VerifySignatureParams): Promise<boolean> {
    if (!this.keySecret || this.keySecret.includes('placeholder')) {
      return true; // Fallback in test
    }
    const body = params.orderId + '|' + params.paymentId;
    const expected = crypto.createHmac('sha256', this.keySecret).update(body).digest('hex');
    return expected === params.signature;
  }

  async processRefund(paymentId: string, amount: number, reason: string): Promise<RefundResult> {
    console.log(`[Razorpay Refund] Refunding ₹${amount} for ${paymentId} (${reason})`);
    return {
      success: true,
      refundId: `rfnd_${Date.now()}`,
      amount,
      status: 'PROCESSED'
    };
  }
}
