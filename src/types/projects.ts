// Projects Management Types

export type ProjectType = 'construction' | 'renovation' | 'restoration' | 'infrastructure' | 'it';
export type ProjectStatus = 'draft' | 'approved' | 'in_progress' | 'on_hold' | 'completed' | 'closed';
export type RegulatorySensitivity = 'normal' | 'heritage' | 'government_approval_required';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'on_hold';
export type ChangeRequestType = 'scope' | 'cost' | 'timeline';
export type ChangeRequestStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';
export type PaymentStatus = 'pending' | 'approved' | 'paid' | 'rejected';
export type QualityStatus = 'pass' | 'fail' | 'conditional_pass';
export type FundingSource = 'temple_funds' | 'donor_funded' | 'government_grant';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type BaselineStatus = 'draft' | 'pending_approval' | 'approved' | 'locked';

export interface Project {
  id: string; // Immutable project ID
  projectCode: string; // Human-readable code (e.g., PRJ-001)
  name: string;
  description?: string;
  projectType: ProjectType;
  locationId?: string; // Link to Asset/Temple structure
  locationName?: string;
  departmentId?: string;
  departmentName?: string;
  projectManagerId?: string;
  projectManagerName?: string;
  startDate?: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  regulatorySensitivity: RegulatorySensitivity;
  status: ProjectStatus;
  baselineLocked: boolean;
  baselineVersion: number;
  donorId?: string; // Link to CRM donor if donor-funded
  donorName?: string;
  governmentApprovalRequired?: boolean;
  governmentApprovalStatus?: 'pending' | 'approved' | 'rejected';
  governmentApprovalDate?: string;
  heritageApprovalRequired?: boolean;
  heritageApprovalStatus?: 'pending' | 'approved' | 'rejected';
  heritageApprovalDate?: string;
  customFields?: Record<string, string>;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  updatedAt: string;
  updatedBy?: string;
  updatedByName?: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  taskCode: string; // e.g., "1.1", "1.2.1" for hierarchical numbering
  name: string;
  description?: string;
  parentTaskId?: string; // For hierarchical WBS
  level: number; // WBS level (1, 2, 3, etc.)
  phase?: string; // Phase grouping
  estimatedDuration: number; // Days
  actualDuration?: number; // Days
  startDate?: string;
  targetEndDate?: string;
  actualEndDate?: string;
  dependencies: string[]; // Array of task IDs this task depends on
  assignedTo?: string;
  assignedToName?: string;
  status: TaskStatus;
  completionPercentage: number; // 0-100
  isMilestone: boolean;
  isCriticalPath: boolean;
  float?: number; // Float days (for critical path)
  festivalBlackoutPeriods?: Array<{
    from: string;
    to: string;
    reason: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  milestoneCode: string;
  name: string;
  description?: string;
  targetDate: string;
  actualDate?: string;
  completionCriteria: string[];
  status: 'pending' | 'completed' | 'delayed';
  linkedTasks: string[]; // Task IDs that must complete for milestone
  paymentLinked: boolean; // Whether payment is linked to this milestone
  qualitySignOff?: {
    signedBy: string;
    signedByName: string;
    signedOn: string;
  };
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  projectId: string;
  phaseId?: string;
  taskId?: string;
  itemName: string;
  category: string; // Material, Labor, Equipment, etc.
  estimatedAmount: number;
  actualAmount?: number;
  fundingSource: FundingSource;
  donorId?: string;
  donorName?: string;
  governmentGrantId?: string;
  overrunThreshold?: number; // Percentage
  overrunAlert?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectBudget {
  id: string;
  projectId: string;
  budgetVersion: number;
  approvedBudget: number;
  totalAllocated: number;
  totalSpent: number;
  totalCommitted: number;
  availableBudget: number;
  budgetItems: BudgetItem[];
  fundingBreakdown: {
    templeFunds: number;
    donorFunds: number;
    governmentGrants: number;
  };
  overrunThreshold: number; // Percentage
  overrunAlert: boolean;
  approvedBy?: string;
  approvedByName?: string;
  approvedOn?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'revised';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectVendor {
  id: string;
  projectId: string;
  vendorId: string;
  vendorName: string;
  vendorType: 'contractor' | 'supplier' | 'consultant' | 'other';
  contractNumber?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  contractValue: number;
  scopeOfWork: string;
  rateCard?: string; // Document URL or base64
  boq?: string; // Bill of Quantities document
  insuranceDocuments?: Array<{
    type: string;
    document: string; // base64 or URL
    expiryDate?: string;
  }>;
  complianceDocuments?: Array<{
    type: string;
    document: string; // base64 or URL
    expiryDate?: string;
  }>;
  performanceRating?: number; // 1-5
  performanceHistory?: Array<{
    date: string;
    rating: number;
    remarks?: string;
  }>;
  blacklisted: boolean;
  warningFlags?: string[];
  status: 'active' | 'completed' | 'terminated';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectProgress {
  id: string;
  projectId: string;
  taskId?: string;
  progressDate: string;
  progressType: 'daily' | 'weekly' | 'milestone';
  completionPercentage: number;
  workDescription: string;
  photos?: string[]; // base64 array
  documents?: Array<{
    type: string;
    name: string;
    url: string; // base64 or URL
  }>;
  delayReason?: string;
  delayDays?: number;
  siteInspectionNotes?: string;
  updatedBy: string;
  updatedByName: string;
  createdAt: string;
}

export interface QualityCheck {
  id: string;
  projectId: string;
  taskId?: string;
  milestoneId?: string;
  checkType: 'quality' | 'safety' | 'heritage' | 'government_inspection';
  checkDate: string;
  checklist: Array<{
    item: string;
    status: QualityStatus;
    remarks?: string;
  }>;
  safetyCompliance: {
    compliant: boolean;
    violations?: string[];
    rectificationRequired?: boolean;
  };
  heritageCompliance?: {
    compliant: boolean;
    notes?: string;
    restrictions?: string[];
  };
  governmentInspection?: {
    inspectorName: string;
    inspectorDesignation: string;
    inspectionDate: string;
    findings?: string[];
    approvalStatus?: 'pending' | 'approved' | 'rejected';
  };
  nonComplianceIssues?: Array<{
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    rectificationRequired: boolean;
    rectificationDate?: string;
    rectificationStatus?: 'pending' | 'in_progress' | 'completed';
  }>;
  conductedBy: string;
  conductedByName: string;
  qualitySignOff?: {
    signedBy: string;
    signedByName: string;
    signedOn: string;
  };
  createdAt: string;
}

export interface ProjectPayment {
  id: string;
  projectId: string;
  vendorId: string;
  vendorName: string;
  billNumber: string;
  billDate: string;
  billAmount: number;
  workDescription: string;
  linkedTasks: string[]; // Task IDs for work completed
  linkedMilestoneId?: string;
  milestoneCompletionVerified: boolean;
  milestoneVerifiedBy?: string;
  milestoneVerifiedByName?: string;
  milestoneVerifiedOn?: string;
  retentionAmount?: number;
  penaltyAmount?: number;
  adjustmentAmount?: number;
  netPayableAmount: number;
  advanceAmount?: number;
  advanceAdjusted?: boolean;
  billVerificationStatus: 'pending' | 'verified' | 'rejected';
  billVerifiedBy?: string;
  billVerifiedByName?: string;
  billVerifiedOn?: string;
  billVerificationRemarks?: string;
  paymentStatus: PaymentStatus;
  paymentApprovedBy?: string;
  paymentApprovedByName?: string;
  paymentApprovedOn?: string;
  paymentDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  attachments?: Array<{
    type: string;
    name: string;
    url: string; // base64 or URL
  }>;
  approvalWorkflow?: Array<{
    level: number;
    approverRole: string;
    approverId?: string;
    approverName?: string;
    status: ApprovalStatus;
    approvedOn?: string;
    remarks?: string;
  }>;
  currentApprovalLevel?: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeRequest {
  id: string;
  projectId: string;
  changeRequestNumber: string;
  changeType: ChangeRequestType;
  description: string;
  reason: string;
  costImpact?: number;
  timeImpact?: number; // Days
  scopeImpact?: string;
  impactAnalysis?: string;
  approvalRequired: boolean;
  approvalWorkflow?: Array<{
    level: number;
    approverRole: string;
    approverId?: string;
    approverName?: string;
    status: ApprovalStatus;
    approvedOn?: string;
    remarks?: string;
  }>;
  currentApprovalLevel?: number;
  status: ChangeRequestStatus;
  approvedBy?: string;
  approvedByName?: string;
  approvedOn?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectedOn?: string;
  rejectionReason?: string;
  baselineVersionCreated?: number; // New baseline version if approved
  implemented: boolean;
  implementedBy?: string;
  implementedByName?: string;
  implementedOn?: string;
  attachments?: Array<{
    type: string;
    name: string;
    url: string; // base64 or URL
  }>;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  updatedAt: string;
}

export interface ProjectInspection {
  id: string;
  projectId: string;
  inspectionType: 'government' | 'heritage' | 'safety' | 'quality';
  inspectionDate: string;
  inspectorName: string;
  inspectorDesignation: string;
  inspectorOrganization: string;
  findings: string[];
  complianceStatus: 'compliant' | 'non_compliant' | 'conditional';
  nonComplianceIssues?: Array<{
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    rectificationRequired: boolean;
    rectificationDeadline?: string;
  }>;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvalDate?: string;
  documents?: Array<{
    type: string;
    name: string;
    url: string; // base64 or URL
  }>;
  remarks?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface ProjectBaseline {
  id: string;
  projectId: string;
  baselineVersion: number;
  baselineDate: string;
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  budget: ProjectBudget;
  approvedBy: string;
  approvedByName: string;
  approvedOn: string;
  locked: boolean;
  lockedOn?: string;
  changeRequestId?: string; // If created from change request
  createdAt: string;
}
