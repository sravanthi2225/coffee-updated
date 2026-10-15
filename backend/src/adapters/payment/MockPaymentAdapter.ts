import { v4 as uuidv4 } from 'uuid';
import { 
  PaymentAdapter, 
  CreatePaymentIntentParams, 
  PaymentIntentResult, 
  VerifySignatureParams, 
  RefundResult 
} from './PaymentAdapter';

export class MockPaymentAdapter implements PaymentAdapter {
  async createIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    const paymentId = `mock_pay_${uuidv4().substring(0, 12)}`;
    
    console.log(`[MOCK PAYMENT] Intent created for Order: ${params.orderNumber} (ID: ${params.orderId})`);
    console.log(`[MOCK PAYMENT] Total: ₹${params.amount} ${params.currency}. Payment ID: ${paymentId}`);

    return {
      provider: 'MOCK',
      paymentId,
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      clientSecret: `mock_secret_${uuidv4()}`,
      mockSuccessEndpoint: `/api/payments/mock-complete`,
      mockFailEndpoint: `/api/payments/mock-fail`
    };
  }

  async verifySignature(params: VerifySignatureParams): Promise<boolean> {
    // In mock mode, any signature starting with "mock" or present is valid
    return true;
  }

  async processRefund(paymentId: string, amount: number, reason: string): Promise<RefundResult> {
    const refundId = `mock_rfnd_${uuidv4().substring(0, 10)}`;
    console.log(`[MOCK REFUND] Processed ₹${amount} refund for Payment ${paymentId}. Reason: "${reason}". Refund ID: ${refundId}`);
    return {
      success: true,
      refundId,
      amount,
      status: 'PROCESSED'
    };
  }
}
