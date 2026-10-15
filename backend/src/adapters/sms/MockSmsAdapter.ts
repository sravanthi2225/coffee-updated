import { SmsAdapter, SendOtpResult } from './SmsAdapter';

export class MockSmsAdapter implements SmsAdapter {
  async sendOtp(phone: string, otp: string): Promise<SendOtpResult> {
    const isDev = process.env.NODE_ENV === 'development';
    console.log(`\n======================================================`);
    console.log(`[MOCK SMS GATEWAY] Dispatching OTP to: ${phone}`);
    console.log(`[MOCK SMS GATEWAY] Your Brew & Bloom OTP is: >>> ${otp} <<<`);
    console.log(`[MOCK SMS GATEWAY] Valid for 5 minutes.`);
    console.log(`======================================================\n`);

    return {
      success: true,
      message: 'OTP dispatched successfully via Mock SMS Gateway.',
      devOtp: isDev ? otp : undefined
    };
  }

  async sendOrderReadyNotification(phone: string, orderNumber: string, pickupCode: string): Promise<boolean> {
    console.log(`\n[MOCK SMS] To ${phone}: Your artisan order ${orderNumber} is READY for pickup! Show 4-digit code: ${pickupCode}`);
    return true;
  }
}
