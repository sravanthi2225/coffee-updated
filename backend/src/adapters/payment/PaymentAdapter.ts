export interface CreatePaymentIntentParams {
  orderId: string;
  orderNumber: string;
  amount: number; // in INR
  currency: string;
  userPhone: string;
  userName?: string;
  idempotencyKey?: string;
}

export interface PaymentIntentResult {
  provider: 'MOCK' | 'RAZORPAY';
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  clientSecret?: string;
  keyId?: string; // For Razorpay client SDK
  mockSuccessEndpoint?: string;
  mockFailEndpoint?: string;
}

export interface VerifySignatureParams {
  orderId: string;
  paymentId: string;
  signature?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: string;
}

export interface PaymentAdapter {
  createIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;
  verifySignature(params: VerifySignatureParams): Promise<boolean>;
  processRefund(paymentId: string, amount: number, reason: string): Promise<RefundResult>;
}
