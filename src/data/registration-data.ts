import type { Devotee, TempleAdminRegistration, JoinRequest } from '@/types/registration';

// Dummy Devotee Profiles
export const dummyDevotees: Devotee[] = [
  {
    id: 'dev-1',
    mobile: '9876543210',
    name: 'Ramesh Sharma',
    email: 'ramesh@example.com',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dev-2',
    mobile: '9876543211',
    name: 'Lakshmi Devi',
    email: 'lakshmi@example.com',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
  },
];

// Dummy Registrations in Various States
export const dummyRegistrations: TempleAdminRegistration[] = [
  {
    id: 'reg-1',
    devoteeId: 'dev-3',
    mobile: '9876543212',
    otpVerified: true,
    otpVerifiedAt: '2024-01-15T10:00:00Z',
    fullName: 'Suresh Kumar',
    email: 'suresh@example.com',
    context: 'new_temple',
    templeName: 'New Temple Example',
    templeLocation: {
      city: 'Bangalore',
      state: 'Karnataka',
    },
    consents: [
      {
        type: 'sole_responsibility',
        version: '1.0',
        accepted: true,
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        type: 'data_accuracy',
        version: '1.0',
        accepted: true,
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        type: 'legal_compliance',
        version: '1.0',
        accepted: true,
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        type: 'terms_of_service',
        version: '1.0',
        accepted: true,
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        type: 'privacy_policy',
        version: '1.0',
        accepted: true,
        timestamp: '2024-01-15T10:30:00Z',
      },
    ],
    consentAccepted: true,
    consentAcceptedAt: '2024-01-15T10:30:00Z',
    kycDocuments: [
      {
        id: 'doc-1',
        type: 'aadhaar',
        fileName: 'aadhaar.pdf',
        status: 'uploaded',
        uploadedAt: '2024-01-15T11:00:00Z',
        maskedValue: 'XXXX XXXX 1234',
      },
      {
        id: 'doc-2',
        type: 'pan',
        fileName: 'pan.pdf',
        status: 'uploaded',
        uploadedAt: '2024-01-15T11:05:00Z',
      },
      {
        id: 'doc-3',
        type: 'citizenship',
        fileName: 'citizenship.pdf',
        status: 'uploaded',
        uploadedAt: '2024-01-15T11:10:00Z',
      },
    ],
    status: 'KYC_PENDING',
    statusHistory: [
      {
        status: 'NEW',
        timestamp: '2024-01-15T09:00:00Z',
      },
      {
        status: 'OTP_VERIFIED',
        timestamp: '2024-01-15T10:00:00Z',
      },
      {
        status: 'CONSENT_ACCEPTED',
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        status: 'SUBMITTED',
        timestamp: '2024-01-15T11:15:00Z',
      },
      {
        status: 'KYC_PENDING',
        timestamp: '2024-01-15T11:15:00Z',
      },
    ],
    createdAt: '2024-01-15T09:00:00Z',
    submittedAt: '2024-01-15T11:15:00Z',
  },
  {
    id: 'reg-2',
    devoteeId: 'dev-4',
    mobile: '9876543213',
    otpVerified: true,
    otpVerifiedAt: '2024-01-16T10:00:00Z',
    fullName: 'Priya Menon',
    email: 'priya@example.com',
    context: 'join_existing',
    templeId: 'temple-1',
    consents: [
      {
        type: 'sole_responsibility',
        version: '1.0',
        accepted: true,
        timestamp: '2024-01-16T10:30:00Z',
      },
      {
        type: 'data_accuracy',
        version: '1.0',
        accepted: true,
        timestamp: '2024-01-16T10:30:00Z',
      },
      {
        type: 'legal_compliance',
        version: '1.0',
        accepted: true,
        timestamp: '2024-01-16T10:30:00Z',
      },
      {
        type: 'terms_of_service',
        version: '1.0',
        accepted: true,
        timestamp: '2024-01-16T10:30:00Z',
      },
      {
        type: 'privacy_policy',
        version: '1.0',
        accepted: true,
        timestamp: '2024-01-16T10:30:00Z',
      },
    ],
    consentAccepted: true,
    consentAcceptedAt: '2024-01-16T10:30:00Z',
    kycDocuments: [],
    status: 'PENDING_APPROVAL',
    statusHistory: [
      {
        status: 'NEW',
        timestamp: '2024-01-16T09:00:00Z',
      },
      {
        status: 'OTP_VERIFIED',
        timestamp: '2024-01-16T10:00:00Z',
      },
      {
        status: 'CONSENT_ACCEPTED',
        timestamp: '2024-01-16T10:30:00Z',
      },
      {
        status: 'SUBMITTED',
        timestamp: '2024-01-16T11:00:00Z',
      },
      {
        status: 'PENDING_APPROVAL',
        timestamp: '2024-01-16T11:00:00Z',
      },
    ],
    createdAt: '2024-01-16T09:00:00Z',
    submittedAt: '2024-01-16T11:00:00Z',
  },
  {
    id: 'reg-3',
    devoteeId: 'dev-5',
    mobile: '9876543214',
    otpVerified: true,
    otpVerifiedAt: '2024-01-17T10:00:00Z',
    fullName: 'Rajesh Nair',
    email: 'rajesh@example.com',
    context: 'new_temple',
    templeName: 'Another New Temple',
    templeLocation: {
      city: 'Mysore',
      state: 'Karnataka',
    },
    consents: [
      {
        type: 'sole_responsibility',
        version: '1.0',
        accepted: true,
        timestamp: '2024-01-17T10:30:00Z',
      },
      {
        type: 'data_accuracy',
        version: '1.0',
        accepted: true,
        timestamp: '2024-01-17T10:30:00Z',
      },
      {
        type: 'legal_compliance',
        version: '1.0',
        accepted: true,
        timestamp: '2024-01-17T10:30:00Z',
      },
      {
        type: 'terms_of_service',
        version: '1.0',
        accepted: true,
        timestamp: '2024-01-17T10:30:00Z',
      },
      {
        type: 'privacy_policy',
        version: '1.0',
        accepted: true,
        timestamp: '2024-01-17T10:30:00Z',
      },
    ],
    consentAccepted: true,
    consentAcceptedAt: '2024-01-17T10:30:00Z',
    kycDocuments: [
      {
        id: 'doc-4',
        type: 'aadhaar',
        fileName: 'aadhaar.pdf',
        status: 'verified',
        uploadedAt: '2024-01-17T11:00:00Z',
        verifiedAt: '2024-01-17T12:00:00Z',
        maskedValue: 'XXXX XXXX 5678',
      },
      {
        id: 'doc-5',
        type: 'pan',
        fileName: 'pan.pdf',
        status: 'verified',
        uploadedAt: '2024-01-17T11:05:00Z',
        verifiedAt: '2024-01-17T12:00:00Z',
      },
      {
        id: 'doc-6',
        type: 'citizenship',
        fileName: 'citizenship.pdf',
        status: 'verified',
        uploadedAt: '2024-01-17T11:10:00Z',
        verifiedAt: '2024-01-17T12:00:00Z',
      },
    ],
    status: 'UNDER_REVIEW',
    statusHistory: [
      {
        status: 'NEW',
        timestamp: '2024-01-17T09:00:00Z',
      },
      {
        status: 'OTP_VERIFIED',
        timestamp: '2024-01-17T10:00:00Z',
      },
      {
        status: 'CONSENT_ACCEPTED',
        timestamp: '2024-01-17T10:30:00Z',
      },
      {
        status: 'SUBMITTED',
        timestamp: '2024-01-17T11:15:00Z',
      },
      {
        status: 'KYC_PENDING',
        timestamp: '2024-01-17T11:15:00Z',
      },
      {
        status: 'UNDER_REVIEW',
        timestamp: '2024-01-17T12:00:00Z',
        changedBy: 'admin@temple.org',
      },
    ],
    createdAt: '2024-01-17T09:00:00Z',
    submittedAt: '2024-01-17T11:15:00Z',
  },
];

// Dummy Join Requests
export const dummyJoinRequests: JoinRequest[] = [
  {
    id: 'join-1',
    registrationId: 'reg-2',
    templeId: 'temple-1',
    adminId: 'dev-4',
    status: 'pending',
    requestedAt: '2024-01-16T11:00:00Z',
  },
];
