// Kitchen & Production Types

export type RecipeStatus = 'draft' | 'pending_approval' | 'approved' | 'archived';
export type ProductionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'quality_rejected';
export type BatchStatus = 'planned' | 'started' | 'in_progress' | 'quality_check' | 'completed' | 'rejected';
export type QualityGrade = 'vip' | 'standard' | 'annadanam';
export type WasteReasonCode = 'overcooking' | 'spillage' | 'quality_rejection' | 'equipment_failure' | 'other';

export interface RecipeIngredient {
  itemId: string;
  itemName: string;
  itemCode?: string;
  quantity: number;
  uomId: string;
  uomName: string;
  batchSizeMultiplier?: number; // For different batch sizes
}

export interface RecipeBatchSize {
  size: 'small' | 'medium' | 'large';
  name: string;
  scalingFactor: number; // Multiplier for base recipe
  preparationTime: number; // Minutes
  manpower: number; // Number of people required
  equipment?: string[];
}

export interface RecipeVersion {
  id: string;
  recipeId: string;
  version: string; // v1.0, v1.1, v2.0
  effectiveDate: string;
  status: RecipeStatus;
  ingredients: RecipeIngredient[];
  batchSizes: RecipeBatchSize[];
  preparationTime: number; // Base preparation time in minutes
  manpower: number; // Base manpower required
  equipment?: string[];
  cookingInstructions?: string;
  qualityStandards?: string;
  storageRequirements?: string;
  changesLog?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedOn?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface RecipeCosting {
  recipeVersionId: string;
  batchSize: 'small' | 'medium' | 'large';
  ingredientCost: number;
  laborCost?: number;
  overheadCost?: number;
  totalCost: number;
  costPerUnit: number;
  lastCalculated: string;
  ingredientBreakdown: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    uom: string;
    unitPrice: number;
    totalCost: number;
  }>;
}

export interface RecipeApproval {
  recipeVersionId: string;
  workflow: {
    level: number;
    approverRole: string;
    approverId?: string;
    approverName?: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedOn?: string;
    remarks?: string;
  }[];
  currentLevel: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Recipe {
  id: string;
  name: string;
  code: string;
  description?: string;
  recipeType: 'prasad' | 'naivedya' | 'annadanam' | 'special';
  currentVersion: string;
  currentVersionId: string;
  status: RecipeStatus;
  versions: RecipeVersion[];
  costing?: RecipeCosting[];
  approval?: RecipeApproval;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
}

export interface DemandForecast {
  date: string;
  recipeId: string;
  recipeName: string;
  baseDemand: number; // Regular day demand
  festivalMultiplier?: number; // 10x-50x for festivals
  specialDayAdjustment?: number;
  forecastedQuantity: number;
  existingInventory?: number;
  netRequirement: number;
  confidence: 'high' | 'medium' | 'low';
  basedOn: {
    footfallHistory?: number;
    festivalId?: string;
    festivalName?: string;
    dayOfWeek?: string;
  };
}

export interface RawMaterialRequirement {
  itemId: string;
  itemName: string;
  itemCode?: string;
  requiredQuantity: number;
  uomId: string;
  uomName: string;
  availableQuantity: number;
  shortfall: number;
  status: 'available' | 'shortfall' | 'unavailable';
  batches?: Array<{
    batchNumber?: string;
    expiryDate?: string;
    quantity: number;
  }>;
}

export interface ProductionSchedule {
  shift: 'morning' | 'afternoon' | 'evening' | 'night';
  startTime: string;
  endTime: string;
  manpower: number;
  staffIds: string[];
  staffNames: string[];
  equipment?: string[];
}

export interface ProductionPlan {
  id: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'evening' | 'night';
  recipeId: string;
  recipeName: string;
  recipeVersion: string;
  recipeVersionId: string;
  plannedQuantity: number;
  batchSize: 'small' | 'medium' | 'large';
  demandForecast: DemandForecast;
  rawMaterialRequirements: RawMaterialRequirement[];
  rawMaterialStatus: 'validated' | 'shortfall' | 'unavailable';
  bufferQuantity?: number; // VIP/emergency buffer
  existingPrasadInventory?: number;
  adjustedQuantity: number; // After considering existing inventory
  schedule: ProductionSchedule;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedByName?: string;
  approvedOn?: string;
  remarks?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface BatchIngredientUsage {
  itemId: string;
  itemName: string;
  itemCode?: string;
  plannedQuantity: number;
  actualQuantity: number;
  uomId: string;
  uomName: string;
  batchNumber?: string; // From inventory
  lotNumber?: string;
  expiryDate?: string;
  deductedFromKitchenStore: boolean;
  deductionDate?: string;
}

export interface ProductionWaste {
  reasonCode: WasteReasonCode;
  reason: string;
  quantity: number;
  uom: string;
  remarks?: string;
  recordedBy: string;
  recordedByName: string;
  recordedAt: string;
}

export interface QualityCheck {
  id: string;
  batchId: string;
  stage: 'raw_materials' | 'during_production' | 'finished_goods';
  checkedBy: string;
  checkedByName: string;
  checkedAt: string;
  parameters: Array<{
    name: string;
    value: string;
    standard: string;
    status: 'pass' | 'fail';
  }>;
  overallStatus: 'pass' | 'fail';
  qualityGrade?: QualityGrade;
  remarks?: string;
  certified: boolean;
  certifiedBy?: string;
  certifiedByName?: string;
  certifiedAt?: string;
}

export interface ProductionCompletion {
  batchId: string;
  completedBy: string;
  completedByName: string;
  completedAt: string;
  certifications: Array<{
    type: 'quality' | 'quantity' | 'safety';
    certifiedBy: string;
    certifiedByName: string;
    certifiedAt: string;
    remarks?: string;
  }>;
  allApprovalsComplete: boolean;
}

export interface ProductionBatch {
  id: string;
  batchId: string; // Unique: BATCH-{recipeCode}-{YYYYMMDD}-{sequence}
  recipeId: string;
  recipeName: string;
  recipeVersion: string;
  recipeVersionId: string;
  plannedQuantity: number;
  actualQuantity: number;
  batchSize: 'small' | 'medium' | 'large';
  status: BatchStatus;
  productionPlanId?: string;
  startedAt?: string;
  startedBy?: string;
  startedByName?: string;
  completedAt?: string;
  completedBy?: string;
  completedByName?: string;
  ingredientUsage: BatchIngredientUsage[];
  waste: ProductionWaste[];
  qualityChecks: QualityCheck[];
  completion?: ProductionCompletion;
  qualityGrade?: QualityGrade;
  remarks?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface KitchenStockEntry {
  id: string;
  entryNumber: string;
  date: string;
  type: 'transfer' | 'receipt' | 'adjustment' | 'reconciliation';
  fromGodownId?: string;
  fromGodownName?: string;
  toGodownId: string; // Always kitchen_store
  toGodownName: string;
  items: Array<{
    itemId: string;
    itemName: string;
    itemCode?: string;
    quantity: number;
    uomId: string;
    uomName: string;
    batchNumber?: string;
    lotNumber?: string;
    expiryDate?: string;
    manufacturingDate?: string;
  }>;
  reference?: string; // Stock entry ID from inventory
  remarks?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface KitchenStockReconciliation {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  itemCode?: string;
  systemQuantity: number;
  physicalQuantity: number;
  variance: number;
  variancePercentage: number;
  reason?: string;
  adjusted: boolean;
  adjustedBy?: string;
  adjustedByName?: string;
  adjustedAt?: string;
  remarks?: string;
  reconciledBy: string;
  reconciledByName: string;
  reconciledAt: string;
}

export interface KitchenLowStockAlert {
  id: string;
  itemId: string;
  itemName: string;
  itemCode?: string;
  currentStock: number;
  minStockLevel: number;
  reorderPoint: number;
  shortfall: number;
  uom: string;
  alertDate: string;
  requisitionGenerated: boolean;
  requisitionId?: string;
  status: 'active' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
}
