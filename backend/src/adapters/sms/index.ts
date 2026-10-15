import { SmsAdapter } from './SmsAdapter';
import { MockSmsAdapter } from './MockSmsAdapter';
import { Msg91SmsAdapter } from './Msg91SmsAdapter';

export function getSmsAdapter(): SmsAdapter {
  const provider = (process.env.SMS_PROVIDER || 'MOCK').toUpperCase();
  if (provider === 'MSG91') {
    return new Msg91SmsAdapter();
  }
  return new MockSmsAdapter();
}

export * from './SmsAdapter';
