// Temple Structure Types

export type StructureStatus = 'active' | 'inactive';

export interface Temple {
  id: string;
  name: string;
  location: string;
  description: string;
  status: 'active' | 'inactive';
  isPrimary: boolean;
  image?: string;
  createdAt: string;
  // Enhanced fields
  deity?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  gpsCoordinates?: { latitude: number; longitude: number };
  geoFencingRadius?: number;
  operationalStatus?: 'open' | 'closed' | 'maintenance';
  darshanTimings?: { open: string; close: string; days: string[] };
  specialDays?: Array<{ date: string; reason: string; status: 'open' | 'closed' }>;
  administrationContacts?: Array<{ name: string; role: string; phone: string; email: string }>;
  statusHistory?: Array<{ date: string; status: string; changedBy: string; reason?: string }>;
  facilities?: string[];
  dressCode?: string;
  templeHistory?: string;
  customFields?: Record<string, string>;
  // Registration fields
  registrationStatus?: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  primaryAdminId?: string;
}

export interface ChildTemple {
  id: string;
  name: string;
  parentTempleId: string; // Keep for backward compat, but also support parentTempleIds
  parentTempleIds?: string[];
  description: string;
  status: 'active' | 'inactive';
  image?: string;
  createdAt: string;
  // Enhanced fields
  operationalSettings?: { independent: boolean; followParent: boolean };
  distanceFromMain?: number;
  sharedFacilities?: Array<{ facilityType: string; accessLevel: string }>;
  promotedFrom?: string | null;
  customFields?: Record<string, string>;
}

export type SacredType = 'deity' | 'samadhi';

export interface Sacred {
  id: string;
  name: string;
  sacredType: SacredType;
  associatedTempleId: string; // Can be Temple or ChildTemple ID
  associatedTempleType: 'temple' | 'child_temple';
  description: string;
  status: 'active' | 'inactive';
  image?: string;
  // Samadhi-specific fields
  jagadguruName?: string;
  peetha?: string;
  samadhiYear?: number;
  createdAt: string;
  // Enhanced fields
  installationDate?: string;
  festivals?: Array<{ name: string; date: string; description: string }>;
  abhishekamSchedule?: Array<{ day: string; time: string; type: string }>;
  sacredObjects?: Array<{ name: string; type: string; description: string }>;
  eligiblePujas?: string[];
  eligibleSevas?: string[];
  darshanPriority?: 'vip' | 'general' | 'special';
  temporaryClosure?: { isClosed: boolean; fromDate?: string; toDate?: string; reason?: string };
  customFields?: Record<string, string>;
}

export type ZoneType = 'pradakshina' | 'mantapa' | 'queue' | 'staff_only' | 'public' | 'restricted';

export interface Zone {
  id: string;
  name: string;
  zoneType: ZoneType;
  associatedTempleId: string;
  associatedTempleType: 'temple' | 'child_temple';
  description: string;
  status: 'active' | 'inactive';
  image?: string;
  createdAt: string;
  // Enhanced fields
  capacity?: number;
  queueLengthLimit?: number;
  pradakshinaSequence?: number;
  accessRestrictions?: Array<'vip' | 'general' | 'disabled' | 'staff'>;
  peakHourCapacity?: Array<{ timeRange: string; capacity: number }>;
  maintenanceSchedule?: Array<{ day: string; time: string; type: string; duration: number }>;
  customFields?: Record<string, string>;
}

export type HallRoomType = 'hall' | 'room';

export interface HallRoom {
  id: string;
  name: string;
  type: HallRoomType;
  zoneId: string;
  capacity: number;
  description: string;
  status: 'active' | 'inactive';
  image?: string;
  createdAt: string;
  // Enhanced fields
  roomType?: 'marriage_hall' | 'kalyana_mantapam' | 'meeting_room' | 'prayer_room' | 'other';
  isBookable?: boolean;
  bookingRates?: { hourly: number; daily: number; special: number };
  hasAC?: boolean;
  maintenanceSchedule?: Array<{ date: string; type: string; status: 'scheduled' | 'in_progress' | 'completed' }>;
  maintenanceStatus?: 'available' | 'under_maintenance' | 'reserved';
  capacityOverride?: Array<{ eventType: string; capacity: number; date?: string }>;
  customFields?: Record<string, string>;
}

export type CounterType = 'seva' | 'donation' | 'info' | 'prasad' | 'ticket';

export interface Counter {
  id: string;
  name: string;
  counterType: CounterType;
  hallRoomId: string;
  description: string;
  status: 'active' | 'inactive';
  image?: string;
  createdAt: string;
  // Enhanced fields
  shiftTimings?: Array<{ day: string; openTime: string; closeTime: string }>;
  staffAllocation?: Array<{ staffId: string; shift: string; date?: string }>;
  servicePricing?: { baseRate: number; specialRate?: number; currency: string };
  queueLengthLimit?: number;
  paymentMethods?: Array<'cash' | 'card' | 'digital' | 'upi'>;
  analyticsEnabled?: boolean;
  performanceMetrics?: { transactions: number; revenue: number; avgWaitTime: number };
  customFields?: Record<string, string>;
}

// Display helpers
export const sacredTypeLabels: Record<SacredType, string> = {
  deity: 'Deity',
  samadhi: 'Samadhi',
};

export const zoneTypeLabels: Record<ZoneType, string> = {
  pradakshina: 'Pradakshina Path',
  mantapa: 'Mantapa',
  queue: 'Queue Area',
  staff_only: 'Staff Only',
  public: 'Public Area',
  restricted: 'Restricted',
};

export const hallRoomTypeLabels: Record<HallRoomType, string> = {
  hall: 'Hall',
  room: 'Room',
};

export const counterTypeLabels: Record<CounterType, string> = {
  seva: 'Seva Counter',
  donation: 'Donation Counter',
  info: 'Information Counter',
  prasad: 'Prasad Counter',
  ticket: 'Ticket Counter',
};
