export interface SendOtpResult {
  success: boolean;
  message: string;
  devOtp?: string; // Only populated in development for display
}

export interface SmsAdapter {
  sendOtp(phone: string, otp: string): Promise<SendOtpResult>;
  sendOrderReadyNotification(phone: string, orderNumber: string, pickupCode: string): Promise<boolean>;
}
