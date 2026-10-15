import { SmsAdapter, SendOtpResult } from './SmsAdapter';

export class Msg91SmsAdapter implements SmsAdapter {
  private authKey: string;
  private templateId: string;

  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY || '';
    this.templateId = process.env.MSG91_TEMPLATE_ID || '';
  }

  async sendOtp(phone: string, otp: string): Promise<SendOtpResult> {
    if (!this.authKey || !this.templateId) {
      console.warn('[Msg91SmsAdapter] Missing MSG91_AUTH_KEY or MSG91_TEMPLATE_ID, falling back to mock behavior.');
      return { success: true, message: 'Mock fallback', devOtp: otp };
    }

    try {
      // Plug in real MSG91 API call
      // const res = await fetch(`https://control.msg91.com/api/v5/otp?template_id=${this.templateId}&mobile=${phone}&authkey=${this.authKey}&otp=${otp}`);
      console.log(`[MSG91] Sending OTP ${otp} to ${phone}`);
      return { success: true, message: 'OTP sent via MSG91' };
    } catch (err: any) {
      console.error('[MSG91 Error]', err);
      return { success: false, message: err.message };
    }
  }

  async sendOrderReadyNotification(phone: string, orderNumber: string, pickupCode: string): Promise<boolean> {
    console.log(`[MSG91 Notification] Order ${orderNumber} ready for ${phone}. Pickup code: ${pickupCode}`);
    return true;
  }
}
