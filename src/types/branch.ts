// Branch Management Types

export type BranchType = 'temple' | 'regional_office' | 'head_office' | 'subsidiary_temple';
export type BranchStatus = 'active' | 'inactive' | 'under_setup' | 'suspended';
export type BranchRole = 'branch_admin' | 'branch_manager' | 'branch_staff' | 'branch_viewer' | 'branch_finance' | 'branch_hr';
export type AccessLevel = 'full_access' | 'read_write' | 'read_only';
export type RegionType = 'geographic' | 'administrative' | 'operational';
export type BranchScope = 'own_only' | 'region' | 'all_branches';

export interface OperatingHours {
  open: string; // HH:mm format
  close: string; // HH:mm format
  days: string[]; // ['Mon', 'Tue', 'Wed', ...]
}

export interface SpecialFeatures {
  parking?: boolean;
  accommodation?: boolean;
  prasad?: boolean;
  prasadDistribution?: boolean;
  library?: boolean;
  meditationHall?: boolean;
  auditorium?: boolean;
  [key: string]: boolean | undefined;
}

export interface SocialMediaHandles {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
  [key: string]: string | undefined;
}

export interface Branch {
  id: string;
  branchCode: string;
  branchName: string;
  branchType: BranchType;
  legalEntityName?: string;
  registrationNumber?: string;
  panNumber?: string;
  tanNumber?: string;
  establishmentDate?: string; // YYYY-MM-DD
  status: BranchStatus;
  
  // Contact Details
  contactPerson?: string;
  contactPhonePrimary?: string;
  contactPhoneSecondary?: string;
  contactEmailPrimary?: string;
  contactEmailSecondary?: string;
  websiteUrl?: string;
  socialMediaHandles?: SocialMediaHandles;
  
  // Address Details
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  regionalLanguagePreference?: string;
  
  // Hierarchy Details
  parentBranchId?: string;
  regionId?: string;
  hierarchyLevel: number; // 1=Head Office, 2=Regional, 3=Branch, 4=Sub-branch
  reportingBranchId?: string;
  
  // Operational Status
  operationalStartDate?: string; // YYYY-MM-DD
  currentCapacity?: number;
  operatingHours?: OperatingHours;
  peakSeasonMonths?: string[]; // ['Jan', 'Feb', ...]
  specialFeatures?: SpecialFeatures;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string | null;
}

export interface Region {
  id: string;
  regionCode: string;
  regionName: string;
  regionType: RegionType;
  parentRegionId?: string;
  regionHeadEmployeeId?: string;
  coverageArea?: string[]; // States/Districts
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchUserMapping {
  id: string;
  employeeId: string; // Foreign key to HR Employees
  branchId: string; // Foreign key to Branch
  isPrimaryBranch: boolean;
  branchRole: BranchRole;
  accessLevel: AccessLevel;
  assignmentStartDate: string; // YYYY-MM-DD
  assignmentEndDate?: string; // YYYY-MM-DD
  status: 'active' | 'inactive' | 'transferred';
  additionalBranchIds?: string[]; // For multi-branch access
  modulePermissions?: Record<string, string[]>; // { module: ['read', 'write'] }
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchAccessRule {
  id: string;
  moduleName: string; // 'assets', 'donations', 'tasks', etc.
  branchScope: BranchScope;
  regionRollupEnabled: boolean;
  parentVisibilityEnabled: boolean;
  crossBranchComparisonEnabled: boolean;
  configuration?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchAuditLog {
  id: string;
  userId?: string;
  branchId?: string;
  actionType: string;
  actionDescription?: string;
  branchDataBefore?: Record<string, unknown>;
  branchDataAfter?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
}
