import type { TempleAdminRegistration } from '@/types/registration';

/**
 * Validate mobile number format
 */
export function validateMobileFormat(mobile: string): { valid: boolean; error?: string } {
  if (!mobile) {
    return { valid: false, error: 'Mobile number is required' };
  }
  
  if (mobile.length !== 10) {
    return { valid: false, error: 'Mobile number must be 10 digits' };
  }
  
  if (!/^\d+$/.test(mobile)) {
    return { valid: false, error: 'Mobile number must contain only digits' };
  }
  
  return { valid: true };
}

/**
 * Validate Aadhaar format (12 digits, masked display)
 */
export function validateAadhaarFormat(aadhaar: string): { valid: boolean; error?: string; masked?: string } {
  if (!aadhaar) {
    return { valid: false, error: 'Aadhaar number is required' };
  }
  
  // Remove spaces and hyphens
  const cleaned = aadhaar.replace(/[\s-]/g, '');
  
  if (cleaned.length !== 12) {
    return { valid: false, error: 'Aadhaar number must be 12 digits' };
  }
  
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: 'Aadhaar number must contain only digits' };
  }
  
  // Mask: XXXX XXXX 1234
  const masked = `XXXX XXXX ${cleaned.slice(-4)}`;
  
  return { valid: true, masked };
}

/**
 * Validate PAN format (10 characters: 5 letters, 4 digits, 1 letter)
 */
export function validatePANFormat(pan: string): { valid: boolean; error?: string } {
  if (!pan) {
    return { valid: false, error: 'PAN number is required' };
  }
  
  // Remove spaces
  const cleaned = pan.replace(/\s/g, '').toUpperCase();
  
  if (cleaned.length !== 10) {
    return { valid: false, error: 'PAN number must be 10 characters' };
  }
  
  // Format: ABCDE1234F (5 letters, 4 digits, 1 letter)
  const panRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/;
  
  if (!panRegex.test(cleaned)) {
    return { valid: false, error: 'Invalid PAN format. Expected: ABCDE1234F' };
  }
  
  return { valid: true };
}

/**
 * Validate registration completeness
 */
export function validateRegistration(registration: Partial<TempleAdminRegistration>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Mobile and OTP
  if (!registration.mobile) {
    errors.push('Mobile number is required');
  } else {
    const mobileValidation = validateMobileFormat(registration.mobile);
    if (!mobileValidation.valid) {
      errors.push(mobileValidation.error || 'Invalid mobile number');
    }
  }
  
  if (!registration.otpVerified) {
    errors.push('OTP verification is required');
  }
  
  // Personal details
  if (!registration.fullName || registration.fullName.trim().length === 0) {
    errors.push('Full name is required');
  }
  
  // Temple context
  if (!registration.context) {
    errors.push('Temple context is required');
  } else {
    if (registration.context === 'new_temple') {
      if (!registration.templeName || registration.templeName.trim().length === 0) {
        errors.push('Temple name is required for new temple registration');
      }
      if (!registration.templeLocation?.city || registration.templeLocation.city.trim().length === 0) {
        errors.push('City is required for new temple registration');
      }
      if (!registration.templeLocation?.state || registration.templeLocation.state.trim().length === 0) {
        errors.push('State is required for new temple registration');
      }
    } else if (registration.context === 'join_existing') {
      if (!registration.templeId) {
        errors.push('Temple selection is required for joining existing temple');
      }
    }
  }
  
  // Consent
  if (!registration.consentAccepted) {
    errors.push('All consents must be accepted');
  }
  
  if (!registration.consents || registration.consents.length < 5) {
    errors.push('All required consents must be accepted');
  }
  
  // KYC Documents (for new temple)
  if (registration.context === 'new_temple') {
    const requiredDocs = ['aadhaar', 'pan', 'citizenship'] as const;
    const uploadedDocs = registration.kycDocuments?.map(d => d.type) || [];
    
    for (const docType of requiredDocs) {
      if (!uploadedDocs.includes(docType)) {
        errors.push(`${docType.toUpperCase()} document is required`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check temple name uniqueness
 */
export function checkTempleNameUniqueness(templeName: string, existingTemples: Array<{ name: string }>): boolean {
  const normalized = templeName.trim().toLowerCase();
  return !existingTemples.some(t => t.name.trim().toLowerCase() === normalized);
}
