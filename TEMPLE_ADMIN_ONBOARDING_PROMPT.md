# Temple Admin Registration & Onboarding System

## Overview
A comprehensive multi-step self-registration system for temple administrators that supports both registering new temples and joining existing ones. The system includes mobile OTP verification, KYC document upload, consent management, and an admin approval workflow.

## Registration Flow

### Step 1: Mobile Verification
- User enters mobile number
- OTP is sent to mobile (mock implementation)
- User verifies OTP code
- System checks if mobile is already registered
- Creates or retrieves devotee profile

### Step 2: Basic Profile
- Collects full name
- Collects email (optional)
- Links to devotee profile

### Step 3: Temple Context
- User chooses between:
  - **New Temple Registration**: Enter temple name, city, state
  - **Join Existing Temple**: Search and select from existing temples
- Different validation rules apply based on choice

### Step 4: Consent Management
- User must accept all required consents:
  - Sole responsibility
  - Data accuracy
  - Legal compliance
  - Terms of service
  - Privacy policy
- Each consent is versioned and timestamped
- IP address is recorded for audit

### Step 5: KYC Document Upload
- **For New Temple**: Required documents:
  - Aadhaar card
  - PAN card
  - Citizenship proof
  - Address proof (optional)
  - Selfie (optional)
- **For Join Existing**: KYC is optional
- Documents are uploaded with metadata
- Status tracking: uploaded → verified → rejected

### Step 6: Review & Submit
- User reviews all entered information
- System validates completeness
- User submits registration
- Registration status changes to:
  - `KYC_PENDING` (if KYC documents need verification)
  - `PENDING_APPROVAL` (if ready for admin review)
  - `UNDER_REVIEW` (if admin is reviewing)

## Registration Statuses

1. **NEW** - Initial state
2. **OTP_VERIFIED** - Mobile OTP verified
3. **CONSENT_ACCEPTED** - All consents accepted
4. **SUBMITTED** - Registration submitted
5. **KYC_PENDING** - KYC documents uploaded, awaiting verification
6. **PENDING_APPROVAL** - Ready for admin review
7. **UNDER_REVIEW** - Admin is reviewing
8. **APPROVED** - Registration approved, temple activated
9. **REJECTED** - Registration rejected with reason
10. **SUSPENDED** - Registration suspended

## Admin Approval Workflow

### Temple Onboarding Page (`/platform/onboarding`)
- Lists all pending registrations
- Filters by status (KYC_PENDING, PENDING_APPROVAL, UNDER_REVIEW)
- Admin can:
  - View full registration details
  - Review KYC documents
  - Approve registration
  - Reject registration (with reason)
  - Download registration data

### Registration Review Modal
- Shows complete registration information
- Displays all uploaded KYC documents
- Shows consent records with timestamps
- Allows approve/reject actions
- Records review timestamp and reviewer name

## Data Models

### TempleAdminRegistration
```typescript
{
  id: string;
  devoteeId: string;
  mobile: string;
  otpVerified: boolean;
  fullName: string;
  email?: string;
  context: 'new_temple' | 'join_existing';
  templeId?: string; // For join_existing
  templeName?: string; // For new_temple
  templeLocation?: { city: string; state: string };
  consents: ConsentRecord[];
  consentAccepted: boolean;
  kycDocuments: KYCDocument[];
  status: RegistrationStatus;
  statusHistory: Array<{ status, timestamp, changedBy?, reason? }>;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}
```

### Devotee
```typescript
{
  id: string;
  mobile: string;
  name?: string;
  email?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}
```

### ConsentRecord
```typescript
{
  type: ConsentType;
  version: string;
  accepted: boolean;
  timestamp: string;
  ipAddress?: string;
}
```

### KYCDocument
```typescript
{
  id: string;
  type: 'aadhaar' | 'pan' | 'citizenship' | 'address_proof' | 'selfie';
  fileName: string;
  fileUrl?: string;
  status: 'uploaded' | 'verified' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}
```

## Key Features

1. **Multi-Step Wizard**: Progressive disclosure of information
2. **Mobile-First**: OTP-based authentication
3. **Dual Context Support**: New temple vs. join existing
4. **KYC Integration**: Document upload and verification workflow
5. **Consent Management**: Versioned, timestamped consent records
6. **Status Tracking**: Complete audit trail of status changes
7. **Admin Review**: Comprehensive review interface
8. **Join Request Workflow**: For joining existing temples

## Files Structure

### Pages
- `/register` - Main registration page (multi-step wizard)
- `/registration-status/:id` - Registration status display
- `/platform/onboarding` - Admin approval page

### Components
- `StepMobileVerification.tsx` - Mobile OTP verification
- `StepBasicProfile.tsx` - Name and email collection
- `StepTempleContext.tsx` - Temple selection/creation
- `StepConsent.tsx` - Consent acceptance
- `StepKYCUpload.tsx` - KYC document upload
- `StepSubmission.tsx` - Review and submit
- `RegistrationStatus.tsx` - Status display component
- `RegistrationReviewModal.tsx` - Admin review modal

### Context
- `RegistrationContext.tsx` - Manages registration state and workflow

### Libraries
- `mobile-verification.ts` - OTP send/verify logic
- `registration-workflow.ts` - Business logic for registration
- `registration-validation.ts` - Validation functions

## Implementation Notes

- **No Validation**: As per user requirements, minimal validation is implemented
- **Mock Data**: OTP and mobile verification are mocked
- **State Management**: Uses React Context for registration state
- **Progressive Enhancement**: Steps are conditionally enabled based on previous step completion
- **Audit Trail**: All actions are logged with timestamps and user information

## User Experience Flow

1. User clicks "Register here" on login page
2. Enters mobile number and receives OTP
3. Verifies OTP
4. Enters personal details
5. Chooses to register new temple or join existing
6. Accepts required consents
7. Uploads KYC documents (if new temple)
8. Reviews all information
9. Submits registration
10. Redirected to status page showing current status
11. Admin reviews and approves/rejects
12. User receives notification (future enhancement)

## Future Enhancements

- Email notifications for status changes
- SMS notifications for OTP and approvals
- Document verification API integration
- Multi-language support
- Resubmission workflow for rejected registrations
- Bulk approval for multiple registrations
