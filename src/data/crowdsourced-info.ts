export type InfoStatus = 'pending' | 'approved' | 'rejected' | 'needs_review';
export type InfoSource = 'devotee' | 'admin' | 'public';

export interface CrowdsourcedInfo {
  id: string;
  templeName: string;
  location: string;
  infoType: 'temple_details' | 'facilities' | 'contact' | 'historical' | 'photos' | 'events' | 'timings' | 'dress_code';
  data: Record<string, unknown>;
  source: InfoSource;
  contributorName?: string;
  contributorEmail?: string;
  contributorPhone?: string;
  status: InfoStatus;
  submittedAt: string;
  validatedAt?: string;
  validatedBy?: string;
  validationNotes?: string;
  rejectionReason?: string;
  existingTempleId?: string; // If linking to existing temple
}

export const mockCrowdsourcedInfo: CrowdsourcedInfo[] = [
  {
    id: 'info-1',
    templeName: 'Sri Venkateswara Temple',
    location: 'Bengaluru, Karnataka',
    infoType: 'temple_details',
    data: {
      name: 'Sri Venkateswara Temple',
      deity: 'Lord Venkateswara',
      address: '123 Temple Street, Bengaluru',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
    },
    source: 'devotee',
    contributorName: 'Ramesh Kumar',
    contributorEmail: 'ramesh@example.com',
    contributorPhone: '9876543210',
    status: 'pending',
    submittedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'info-2',
    templeName: 'Shri Krishna Temple',
    location: 'Mumbai, Maharashtra',
    infoType: 'facilities',
    data: {
      parking: true,
      prasadCounter: true,
      restrooms: true,
      wheelchairAccess: true,
      meditationHall: true,
    },
    source: 'public',
    contributorName: 'Anonymous',
    status: 'pending',
    submittedAt: '2024-01-16T14:30:00Z',
  },
  {
    id: 'info-3',
    templeName: 'Sri Sharadamba Temple',
    location: 'Sringeri, Karnataka',
    infoType: 'contact',
    data: {
      phone: '08165-123456',
      email: 'info@sharadamba.org',
      website: 'https://sharadamba.org',
    },
    source: 'devotee',
    contributorName: 'Priya Singh',
    contributorEmail: 'priya@example.com',
    status: 'approved',
    submittedAt: '2024-01-10T09:00:00Z',
    validatedAt: '2024-01-11T10:00:00Z',
    validatedBy: 'admin-1',
    validationNotes: 'Verified contact information',
  },
  {
    id: 'info-4',
    templeName: 'Kashi Vishwanath Temple',
    location: 'Varanasi, Uttar Pradesh',
    infoType: 'timings',
    data: {
      openingTime: '04:00',
      closingTime: '23:00',
      specialTimings: {
        'Maha Shivaratri': 'Open 24 hours',
      },
    },
    source: 'admin',
    status: 'approved',
    submittedAt: '2024-01-12T08:00:00Z',
    validatedAt: '2024-01-12T08:05:00Z',
    validatedBy: 'admin-1',
  },
  {
    id: 'info-5',
    templeName: 'New Temple',
    location: 'Delhi, Delhi',
    infoType: 'temple_details',
    data: {
      name: 'New Temple',
      deity: 'Unknown',
    },
    source: 'public',
    status: 'rejected',
    submittedAt: '2024-01-14T12:00:00Z',
    validatedAt: '2024-01-14T15:00:00Z',
    validatedBy: 'admin-1',
    rejectionReason: 'Insufficient information provided',
  },
];
