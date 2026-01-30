# Temple Admin Self-Registration System - Implementation Prompt

You are a senior product architect designing a **Temple Admin Self-Registration and Onboarding System** for the Keehoo platform.

Design this system with REAL temple operations in mind — identity verification, KYC compliance, consent management, and approval workflows.

## GOAL:
Build a secure, compliant, and user-friendly self-registration system that allows temple administrators to register new temples or join existing ones, with proper identity verification, KYC document upload, consent management, and admin approval workflow.

## MODULE STRUCTURE:

**TEMPLE ADMIN REGISTRATION (/register)**
- Multi-step registration wizard
- Mobile OTP verification
- Personal details collection
- Temple context selection (new vs. join existing)
- Consent management
- KYC document upload
- Review and submission
- Status tracking

**ADMIN APPROVAL (/platform/onboarding)**
- Registration review dashboard
- KYC document verification
- Approve/Reject workflow
- Status management

## CORE FUNCTIONAL REQUIREMENTS:

### 1. MOBILE VERIFICATION STEP
- Mobile number input (10 digits, Indian format)
- OTP generation and sending (mock implementation)
- OTP verification with resend capability
- Countdown timer for resend (60 seconds)
- Check if mobile already registered (redirect to login if exists)
- Create or retrieve devotee profile on successful verification

### 2. BASIC PROFILE STEP
- Full name collection (required)
- Email address (optional)
- Link to devotee profile
- Auto-populate if devotee exists

### 3. TEMPLE CONTEXT STEP
- Radio button selection:
  - **Register New Temple**: 
    - Temple name input
    - City and state selection
    - Creates temple in DRAFT status
  - **Join Existing Temple**:
    - Searchable temple selector
    - Creates join request
    - Requires existing temple admin approval
- Different validation rules based on selection

### 4. CONSENT MANAGEMENT STEP
- Display all required consents:
  - Sole responsibility
  - Data accuracy
  - Legal compliance
  - Terms of service
  - Privacy policy
- Checkbox for each consent
- Version tracking for each consent
- Timestamp and IP address recording
- All consents must be accepted to proceed

### 5. KYC DOCUMENT UPLOAD STEP
- **For New Temple Registration** (Required):
  - Aadhaar card
  - PAN card
  - Citizenship proof
  - Address proof (optional)
  - Selfie (optional)
- **For Join Existing** (Optional):
  - Documents can be uploaded later
- File upload with drag-and-drop
- Document type selection
- File size validation (max 5MB per file)
- Preview uploaded documents
- Remove document option
- Document status: uploaded → verified → rejected

### 6. REVIEW & SUBMIT STEP
- Display summary of all entered information:
  - Personal details
  - Temple context
  - Accepted consents
  - Uploaded KYC documents
- Validation check before submission
- Submit button
- On submission:
  - Create registration record
  - Set status to KYC_PENDING or PENDING_APPROVAL
  - Generate registration ID
  - Redirect to status page

### 7. REGISTRATION STATUS PAGE (/registration-status/:id)
- Display current registration status
- Show registration ID
- Status-specific messages:
  - KYC_PENDING: "Your KYC documents are being verified"
  - PENDING_APPROVAL: "Your registration is under review"
  - APPROVED: "Registration approved! You can now login"
  - REJECTED: Show rejection reason with option to reapply
- Link back to login
- Link to reapply if rejected

### 8. ADMIN APPROVAL WORKFLOW (/platform/onboarding)
- List all pending registrations
- Filter by status:
  - KYC_PENDING
  - PENDING_APPROVAL
  - UNDER_REVIEW
- Registration review modal showing:
  - Complete registration details
  - All uploaded KYC documents
  - Consent records with timestamps
  - Status history
- Actions:
  - Approve registration
  - Reject registration (with reason)
  - Request additional documents
  - Download registration data
- On approval:
  - Activate temple (if new)
  - Create user account
  - Send notification (future)
- On rejection:
  - Set status to REJECTED
  - Record rejection reason
  - Notify user (future)

## REGISTRATION STATUSES:

1. **NEW** - Initial state when registration starts
2. **OTP_VERIFIED** - Mobile OTP verified successfully
3. **CONSENT_ACCEPTED** - All required consents accepted
4. **SUBMITTED** - Registration form submitted
5. **KYC_PENDING** - KYC documents uploaded, awaiting verification
6. **PENDING_APPROVAL** - Ready for admin review
7. **UNDER_REVIEW** - Admin is currently reviewing
8. **APPROVED** - Registration approved, temple/user activated
9. **REJECTED** - Registration rejected with reason
10. **SUSPENDED** - Registration suspended (future use)

## DATA MODELS:

### TempleAdminRegistration
- id: Unique registration ID
- devoteeId: Link to devotee profile
- mobile: Verified mobile number
- otpVerified: Boolean flag
- fullName: Administrator full name
- email: Email address (optional)
- context: 'new_temple' | 'join_existing'
- templeId: For join_existing
- templeName: For new_temple
- templeLocation: { city, state }
- consents: Array of ConsentRecord
- consentAccepted: Boolean
- kycDocuments: Array of KYCDocument
- status: RegistrationStatus
- statusHistory: Array of status changes
- reviewedBy: Admin who reviewed
- reviewedAt: Review timestamp
- rejectionReason: If rejected

### Devotee
- id: Unique devotee ID
- mobile: Mobile number (primary key)
- name: Full name
- email: Email address
- status: 'active' | 'inactive'
- createdAt: Creation timestamp

### ConsentRecord
- type: ConsentType
- version: Consent version string
- accepted: Boolean
- timestamp: Acceptance timestamp
- ipAddress: IP address of acceptance

### KYCDocument
- id: Document ID
- type: Document type
- fileName: Original filename
- fileUrl: Storage URL
- fileSize: File size in bytes
- status: 'uploaded' | 'verified' | 'rejected'
- uploadedAt: Upload timestamp
- verifiedAt: Verification timestamp
- rejectionReason: If rejected

## PERMISSIONS & ROLES:

- **SUPER_ADMIN**: Full access to approval workflow
- **PLATFORM_ADMIN**: Can review and approve registrations
- **TEMPLE_ADMIN**: Can approve join requests for their temple
- **REGISTRANT**: Can register and view own status

## NON-NEGOTIABLE SYSTEM FEATURES:

- **Multi-step wizard**: Progressive disclosure, cannot skip steps
- **Mobile OTP verification**: Required before proceeding
- **Consent versioning**: Track consent versions for legal compliance
- **KYC document tracking**: Full audit trail of document status
- **Status history**: Immutable log of all status changes
- **Admin approval workflow**: Mandatory for activation
- **Join request workflow**: For joining existing temples
- **IP address logging**: For consent and security audit
- **No validation**: As per user requirements, minimal validation

## UX REQUIREMENTS:

- **Mobile-first design**: Responsive, works on mobile devices
- **Progress indicator**: Visual progress bar showing current step
- **Step validation**: Cannot proceed without completing current step
- **Error handling**: Clear error messages
- **Loading states**: Show loading during OTP send/verify
- **Success feedback**: Confirm actions (OTP sent, verified, etc.)
- **Accessibility**: Keyboard navigation, screen reader support

## REAL-WORLD CONSTRAINTS:

- Users may not have email addresses
- Mobile numbers may already be registered
- KYC documents may be in various formats
- Network issues during OTP verification
- Users may abandon registration mid-way
- Multiple registration attempts from same mobile
- Join requests need existing admin approval

## OUTPUT EXPECTATION:

- Clear data models for all entities
- Multi-step wizard component structure
- Registration context for state management
- Mobile verification library (mock)
- Registration workflow library
- Admin approval interface
- Status tracking and history
- Complete audit trail

## IMPLEMENTATION NOTES:

- **No validation**: Minimal validation as per user requirements
- **Mock implementations**: OTP and mobile verification are mocked
- **State management**: Use React Context for registration state
- **File upload**: Use base64 encoding for documents (mock storage)
- **Status persistence**: Store in local state (mock database)
- **Progressive enhancement**: Steps enabled based on previous completion

Design this system as if it will handle thousands of temple registrations with strict compliance and audit requirements.
