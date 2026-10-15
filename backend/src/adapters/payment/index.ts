import { PaymentAdapter } from './PaymentAdapter';
import { MockPaymentAdapter } from './MockPaymentAdapter';
import { RazorpayAdapter } from './RazorpayAdapter';

export function getPaymentAdapter(): PaymentAdapter {
  const provider = (process.env.PAYMENT_PROVIDER || 'MOCK').toUpperCase();
  if (provider === 'RAZORPAY') {
    return new RazorpayAdapter();
  }
  return new MockPaymentAdapter();
}

export * from './PaymentAdapter';
