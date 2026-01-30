// Prasad Management Types

import type { QualityGrade } from '@/types/kitchen';

export type DistributionChannel = 'counter' | 'vip' | 'annadanam' | 'external_event' | 'sponsor';
export type DistributionStatus = 'allocated' | 'dispatched' | 'collected' | 'returned' | 'expired';
export type ReturnReasonCode = 'quality_issue' | 'overstock' | 'expiry_near' | 'damaged' | 'other';
export type PrasadStatus = 'active' | 'inactive' | 'discontinued';
export type FundingType = 'donation_funded' | 'temple_funded' | 'mixed';

export interface PrasadPackSize {
  size: 'small' | 'medium' | 'large' | 'custom';
  name: string;
  weight?: number;
  weightUOM?: string;
  quantity?: number; // Pieces/units
  packagingType?: string;
  salePrice: number;
  donationPrice?: number;
  annadanamPrice: number; // Usually 0
  festivalPrice?: number;
}

export interface PrasadPricingRule {
  baseSalePrice: number;
  donationPrice?: number;
  annadanamPrice: number; // Usually 0
  festivalMultiplier?: number;
  bulkDiscount?: {
    minQuantity: number;
    discountPercent: number;
  };
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface PrasadStorageCondition {
  temperature?: {
    min: number;
    max: number;
    unit: 'celsius' | 'fahrenheit';
  };
  humidity?: {
    min: number;
    max: number;
    unit: 'percent';
  };
  containerType?: string;
  specialRequirements?: string;
}

export interface PrasadMaster {
  id: string;
  name: string;
  code: string;
  description?: string;
  prasadType: 'laddu' | 'pongal' | 'sweet' | 'savory' | 'other';
  packSizes: PrasadPackSize[];
  pricingRules: PrasadPricingRule[];
  shelfLife: number; // Days
  storageConditions: PrasadStorageCondition;
  qualityGrades: QualityGrade[];
  fundingType: FundingType;
  image?: string;
  status: PrasadStatus;
  customFields?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
}

export interface PrasadBatch {
  id: string;
  prasadId: string;
  prasadName: string;
  prasadCode: string;
  productionBatchId: string; // Links to ProductionBatch
  productionBatchNumber: string;
  packSize: 'small' | 'medium' | 'large' | 'custom';
  quantity: number;
  availableQuantity: number;
  allocatedQuantity: number;
  reservedQuantity: number;
  productionDate: string;
  expiryDate: string;
  qualityGrade: QualityGrade;
  location?: string; // Storage location
  createdAt: string;
}

export interface PrasadStockAllocation {
  counterId?: string;
  counterName?: string;
  hallId?: string;
  hallName?: string;
  allocatedQuantity: number;
  reservedQuantity: number;
  dispatchedQuantity: number;
  dailyLimit?: number;
  allocatedBy: string;
  allocatedByName: string;
  allocatedAt: string;
}

export interface PrasadInventory {
  id: string;
  prasadId: string;
  prasadName: string;
  prasadCode: string;
  totalQuantity: number;
  availableQuantity: number;
  allocatedQuantity: number;
  reservedQuantity: number;
  batches: PrasadBatch[];
  allocations: PrasadStockAllocation[];
  valuation: number; // Total inventory value
  lastUpdated: string;
}

export interface CounterDistribution {
  distributionId: string;
  counterId: string;
  counterName: string;
  prasadId: string;
  prasadName: string;
  prasadCode: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  packSize: 'small' | 'medium' | 'large' | 'custom';
  dailyLimit?: number;
  allocatedAt: string;
  dispatchedAt?: string;
  collectedAt?: string;
  status: DistributionStatus;
  returnedQuantity?: number;
  returnReason?: ReturnReasonCode;
  remarks?: string;
}

export interface VIPDistribution {
  distributionId: string;
  prasadId: string;
  prasadName: string;
  prasadCode: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  packSize: 'small' | 'medium' | 'large' | 'custom';
  beneficiaryName: string;
  beneficiaryPhone?: string;
  beneficiaryEmail?: string;
  beneficiaryType: 'vip' | 'special_darshan' | 'donor' | 'official';
  bookingId?: string; // Link to seva booking if applicable
  allocatedAt: string;
  dispatchedAt?: string;
  collectedAt?: string;
  status: DistributionStatus;
  remarks?: string;
}

export interface AnnadanamDistribution {
  distributionId: string;
  prasadId: string;
  prasadName: string;
  prasadCode: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  mealCount: number; // Number of meals served
  hallId: string;
  hallName: string;
  timeSlot: string; // Breakfast, Lunch, Dinner
  allocatedAt: string;
  servedAt?: string;
  status: DistributionStatus;
  remarks?: string;
}

export interface ExternalDistribution {
  distributionId: string;
  prasadId: string;
  prasadName: string;
  prasadCode: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  packSize: 'small' | 'medium' | 'large' | 'custom';
  eventName: string;
  eventDate: string;
  sponsorName?: string;
  sponsorContact?: string;
  destination: string;
  allocatedAt: string;
  dispatchedAt?: string;
  status: DistributionStatus;
  remarks?: string;
}

export interface PrasadReturn {
  id: string;
  distributionId: string;
  prasadId: string;
  prasadName: string;
  prasadCode: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  reasonCode: ReturnReasonCode;
  reason: string;
  returnedBy: string;
  returnedByName: string;
  returnedAt: string;
  qualityCheck?: {
    checkedBy: string;
    checkedByName: string;
    checkedAt: string;
    status: 'usable' | 'expired' | 'damaged' | 'unusable';
    remarks?: string;
  };
  disposition?: 'redistribute' | 'dispose' | 'return_to_inventory';
  remarks?: string;
}

export interface EndOfDayRedistribution {
  id: string;
  date: string;
  unsoldPrasad: Array<{
    prasadId: string;
    prasadName: string;
    batchId: string;
    batchNumber: string;
    quantity: number;
    expiryDate: string;
    daysToExpiry: number;
  }>;
  redistribution: Array<{
    prasadId: string;
    batchId: string;
    quantity: number;
    newChannel: DistributionChannel;
    newDestination: string;
    reason: string;
  }>;
  carryForward: Array<{
    prasadId: string;
    batchId: string;
    quantity: number;
    expiryDate: string;
    canCarryForward: boolean;
    reason?: string;
  }>;
  processedBy: string;
  processedByName: string;
  processedAt: string;
}

export interface PrasadDistribution {
  id: string;
  distributionNumber: string;
  date: string;
  channel: DistributionChannel;
  prasadId: string;
  prasadName: string;
  prasadCode: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  packSize: 'small' | 'medium' | 'large' | 'custom';
  status: DistributionStatus;
  // Channel-specific details
  counterDistribution?: CounterDistribution;
  vipDistribution?: VIPDistribution;
  annadanamDistribution?: AnnadanamDistribution;
  externalDistribution?: ExternalDistribution;
  // Common fields
  allocatedAt: string;
  allocatedBy: string;
  allocatedByName: string;
  dispatchedAt?: string;
  dispatchedBy?: string;
  dispatchedByName?: string;
  collectedAt?: string;
  returned?: PrasadReturn;
  remarks?: string;
  createdAt: string;
}
