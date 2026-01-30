import type { 
  Devotee, 
  TempleAdminRegistration, 
  RegistrationStatus, 
  RegistrationContext,
  ConsentRecord,
  ConsentType,
  KYCDocument,
} from '@/types/registration';
import type { Temple } from '@/types/temple-structure';
import { dummyDevotees } from '@/data/registration-data';
import { checkMobileExists } from './mobile-verification';

/**
 * Create devotee profile from mobile and name
 */
export function createDevoteeProfile(mobile: string, name?: string): Devotee {
  const devoteeId = `dev-${Date.now()}`;
  
  return {
    id: devoteeId,
    mobile,
    name: name || '',
    status: 'active',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create temple in DRAFT state
 */
export function createTempleDraft(
  name: string,
  location: { city: string; state: string },
  adminId: string
): Partial<Temple> {
  const templeId = `temple-${Date.now()}`;
  
  return {
    id: templeId,
    name,
    location: `${location.city}, ${location.state}`,
    description: `Temple registered by admin ${adminId}`,
    status: 'inactive',
    isPrimary: false,
    registrationStatus: 'DRAFT',
    primaryAdminId: adminId,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create join request for existing temple
 */
export function createJoinRequest(templeId: string, adminId: string, registrationId: string) {
  return {
    id: `join-${Date.now()}`,
    registrationId,
    templeId,
    adminId,
    status: 'pending' as const,
    requestedAt: new Date().toISOString(),
  };
}

/**
 * Determine initial status after submission
 */
export function determineInitialStatus(context: RegistrationContext): RegistrationStatus {
  if (context === 'new_temple') {
    return 'KYC_PENDING';
  } else {
    return 'PENDING_APPROVAL';
  }
}

/**
 * Record consent acceptance
 */
export function recordConsent(
  consentTypes: ConsentType[],
  ipAddress?: string
): ConsentRecord[] {
  const version = '1.0';
  const timestamp = new Date().toISOString();
  
  return consentTypes.map(type => ({
    type,
    version,
    accepted: true,
    timestamp,
    ipAddress,
  }));
}

/**
 * Submit registration
 */
export function submitRegistration(
  registration: Partial<TempleAdminRegistration>
): TempleAdminRegistration {
  const registrationId = `reg-${Date.now()}`;
  const now = new Date().toISOString();
  
  const initialStatus = determineInitialStatus(registration.context!);
  
  const fullRegistration: TempleAdminRegistration = {
    id: registrationId,
    devoteeId: registration.devoteeId!,
    mobile: registration.mobile!,
    otpVerified: registration.otpVerified || false,
    otpVerifiedAt: registration.otpVerifiedAt,
    fullName: registration.fullName!,
    email: registration.email,
    context: registration.context!,
    templeId: registration.templeId,
    templeName: registration.templeName,
    templeLocation: registration.templeLocation,
    consents: registration.consents || [],
    consentAccepted: registration.consentAccepted || false,
    consentAcceptedAt: registration.consentAcceptedAt,
    kycDocuments: registration.kycDocuments || [],
    status: initialStatus,
    statusHistory: [
      ...(registration.statusHistory || []),
      {
        status: 'SUBMITTED',
        timestamp: now,
      },
      {
        status: initialStatus,
        timestamp: now,
      },
    ],
    createdAt: registration.createdAt || now,
    submittedAt: now,
    updatedAt: now,
  };
  
  return fullRegistration;
}

/**
 * Check if mobile exists and handle accordingly
 */
export function handleMobileCheck(mobile: string): { exists: boolean; shouldRedirect: boolean } {
  const exists = checkMobileExists(mobile);
  
  // If mobile exists, user should login instead
  return {
    exists,
    shouldRedirect: exists,
  };
}

/**
 * Get client IP address (for consent recording)
 * In production, this would come from request headers
 */
export function getClientIP(): string {
  // For demo: return a placeholder
  return '127.0.0.1';
}
