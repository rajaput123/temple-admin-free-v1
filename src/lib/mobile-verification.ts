import type { Devotee } from '@/types/registration';
import { dummyDevotees } from '@/data/registration-data';

/**
 * Send OTP to mobile number
 * In production, this would call an SMS service
 */
export async function sendOTP(mobile: string): Promise<{ success: boolean; message?: string }> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Validate mobile format
  if (!mobile || mobile.length !== 10 || !/^\d+$/.test(mobile)) {
    return { success: false, message: 'Invalid mobile number format' };
  }
  
  // For demo: Always succeed
  return { success: true };
}

/**
 * Verify OTP
 * In production, this would verify against stored OTP
 */
export async function verifyOTP(mobile: string, otp: string): Promise<{ success: boolean; message?: string }> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // For demo: Accept '123456' or any 6-digit OTP
  if (otp === '123456' || (otp.length === 6 && /^\d+$/.test(otp))) {
    return { success: true };
  }
  
  return { success: false, message: 'Invalid OTP' };
}

/**
 * Check if mobile number is already registered
 */
export function checkMobileRegistration(mobile: string): Devotee | null {
  const devotee = dummyDevotees.find(d => d.mobile === mobile);
  return devotee || null;
}

/**
 * Check if mobile exists in system (for redirect to login)
 */
export function checkMobileExists(mobile: string): boolean {
  return checkMobileRegistration(mobile) !== null;
}
