// Rituals & Darshan Types

export type OfferingType = 'seva' | 'darshan';
export type OfferingStatus = 'active' | 'paused';
export type PriestRole = 'main' | 'assistant';
export type DarshanType = 'mukh_darshan' | 'padha_darshan' | 'vip_darshan' | 'general';
export type SevaType = 'archana' | 'abhishekam' | 'special_darshan' | 'kumkumarchana' | 'other';
export type DayType = 'weekday' | 'weekend' | 'festival' | 'special';
export type DevoteeCategory = 'general' | 'vip' | 'senior_citizen' | 'child' | 'student';

export interface Offering {
  id: string;
  name: string;
  type: OfferingType;
  sevaType?: SevaType; // For seva type offerings
  darshanType?: DarshanType; // For darshan type offerings
  sacredId: string;
  applicableDays: string[]; // ['all'] or ['monday', 'tuesday', ...]
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  amount: number; // 0 for free
  capacity?: number;
  status: OfferingStatus;
  image?: string;
  createdAt: string;
  // Enhanced fields
  pricingByTimeSlot?: Array<{ timeRange: string; amount: number }>;
  pricingByDayType?: Record<DayType, number>;
  festivalPricing?: number;
  capacityPerBatch?: number;
  capacityPerTimeSlot?: number;
  eligibilityRules?: {
    minAge?: number;
    maxAge?: number;
    genderRestriction?: 'male' | 'female' | 'all';
    devoteeCategories?: DevoteeCategory[];
  };
  realTimeAvailability?: {
    availableSlots: number;
    bookedSlots: number;
    nextAvailableSlot?: string;
  };
  customFields?: Record<string, string>;
}

export interface FestivalEvent {
  id: string;
  name: string;
  sacredId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  notes?: string;
  image?: string;
  createdAt: string;
  // Enhanced fields
  duration?: number; // in days
  specialRituals?: string[];
  scheduleOverrideRules?: {
    overrideRegularSchedule: boolean;
    overrideStartDate?: string;
    overrideEndDate?: string;
  };
  specialOfferings?: string[]; // Offering IDs activated during festival
  additionalPriestRequirements?: Array<{ priestId: string; role: PriestRole; days: string[] }>;
  additionalStaffRequirements?: Array<{ staffId: string; role: string; days: string[] }>;
  pricingAdjustments?: Record<string, number>; // Offering ID -> adjusted price
  capacityAdjustments?: Record<string, number>; // Offering ID -> adjusted capacity
  postFestivalNormalization?: {
    normalizeDate: string;
    restoreRegularSchedule: boolean;
  };
  customFields?: Record<string, string>;
}

export interface Priest {
  id: string;
  name: string;
  specialization?: string[];
  experience?: number; // years
  availability?: {
    days: string[];
    timeSlots: Array<{ start: string; end: string }>;
  };
  image?: string;
  createdAt: string;
}

export interface PriestAssignment {
  id: string;
  priestId: string;
  priestName: string;
  sacredId: string;
  offeringId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  role: PriestRole;
  image?: string;
  createdAt: string;
  // Enhanced fields
  shift?: string;
  restPeriods?: Array<{ start: string; end: string }>;
  isSubstitute?: boolean;
  originalPriestId?: string;
  performanceMetrics?: {
    offeringsCompleted: number;
    averageRating?: number;
    byOfferingType?: Record<string, number>;
  };
  customFields?: Record<string, string>;
}

export interface DailySchedule {
  id: string;
  date: string; // YYYY-MM-DD
  sacredId: string;
  rituals: Array<{
    id: string;
    name: string;
    type: 'suprabhata_seva' | 'abhishekam' | 'naivedya' | 'other';
    startTime: string;
    endTime: string;
    bufferTime?: number; // minutes
    priestRequirements?: Array<{ priestId: string; role: PriestRole }>;
    assistantRequirements?: number;
    offeringId?: string;
    zoneId?: string;
    notes?: string;
  }>;
  isOverride?: boolean;
  overrideReason?: string;
  published?: boolean;
  publishedAt?: string;
  createdAt: string;
  customFields?: Record<string, string>;
}

// Display helpers
export const offeringTypeLabels: Record<OfferingType, string> = {
  seva: 'Seva',
  darshan: 'Darshan',
};

export const offeringStatusLabels: Record<OfferingStatus, string> = {
  active: 'Active',
  paused: 'Paused',
};

export const priestRoleLabels: Record<PriestRole, string> = {
  main: 'Main',
  assistant: 'Assistant',
};

export const dayLabels: Record<string, string> = {
  all: 'All Days',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};
