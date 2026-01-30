// Registration Types

export type RegistrationStatus = 
  | 'NEW'
  | 'OTP_VERIFIED'
  | 'CONSENT_ACCEPTED'
  | 'SUBMITTED'
  | 'KYC_PENDING'
  | 'PENDING_APPROVAL'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export type TempleRegistrationStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

export type RegistrationContext = 'new_temple' | 'join_existing';

export type KYCDocumentType = 'aadhaar' | 'pan' | 'citizenship' | 'address_proof' | 'selfie';

export type ConsentType = 
  | 'sole_responsibility'
  | 'data_accuracy'
  | 'legal_compliance'
  | 'terms_of_service'
  | 'privacy_policy';

export interface ConsentRecord {
  type: ConsentType;
  version: string;
  accepted: boolean;
  timestamp: string;
  ipAddress?: string;
}

export interface KYCDocument {
  id: string;
  type: KYCDocumentType;
  fileName: string;
  fileUrl?: string;
  fileSize?: number;
  status: 'uploaded' | 'verified' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
  maskedValue?: string; // For Aadhaar: masked number
}

export interface Devotee {
  id: string;
  mobile: string;
  name?: string;
  email?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface TempleAdminRegistration {
  id: string;
  devoteeId: string;
  mobile: string;
  otpVerified: boolean;
  otpVerifiedAt?: string;
  
  // Personal Details
  fullName: string;
  email?: string;
  
  // Temple Context
  context: RegistrationContext;
  templeId?: string; // For join_existing
  templeName?: string; // For new_temple
  templeLocation?: {
    city: string;
    state: string;
  };
  
  // Consent
  consents: ConsentRecord[];
  consentAccepted: boolean;
  consentAcceptedAt?: string;
  
  // KYC Documents
  kycDocuments: KYCDocument[];
  
  // Status
  status: RegistrationStatus;
  statusHistory: Array<{
    status: RegistrationStatus;
    timestamp: string;
    changedBy?: string;
    reason?: string;
  }>;
  
  // Review
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  
  // Timestamps
  createdAt: string;
  submittedAt?: string;
  updatedAt?: string;
}

export interface JoinRequest {
  id: string;
  registrationId: string;
  templeId: string;
  adminId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}
