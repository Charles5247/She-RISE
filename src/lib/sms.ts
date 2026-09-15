/**
 * SMS gateway interface — per spec Section 3: "pick one and wire it behind
 * an interface so it's swappable." No provider has been selected yet
 * (flagged as an open item in Section 14), so this ships as a console-log
 * mock implementing the same interface a real Termii/Africa's Talking
 * client would implement. Swap MockSmsProvider for a real client without
 * touching any call site.
 */

export interface SmsProvider {
  sendOtp(destination: string, code: string): Promise<{ ok: boolean; error?: string }>;
  sendBroadcast(destinations: string[], title: string, body: string): Promise<{ ok: boolean; reach: number }>;
}

class MockSmsProvider implements SmsProvider {
  async sendOtp(destination: string, code: string) {
    console.log(`[mock:sms] OTP ${code} -> ${destination}`);
    return { ok: true };
  }
  async sendBroadcast(destinations: string[], title: string, body: string) {
    console.log(`[mock:sms] broadcast "${title}" -> ${destinations.length} recipients: ${body}`);
    return { ok: true, reach: destinations.length };
  }
}

export const smsProvider: SmsProvider = new MockSmsProvider();

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
