// Asset Management Types

export type AssetCategory = 'immovable' | 'sacred' | 'valuables' | 'operational' | 'vehicles' | 'it';
export type AcquisitionType = 'purchased' | 'donated' | 'historical';
export type AssetSensitivity = 'normal' | 'high_value' | 'sacred';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'condemned';
export type LifecycleStatus = 'active' | 'in_use' | 'under_maintenance' | 'disposed' | 'condemned';
export type MovementStatus = 'draft' | 'pending_approval' | 'approved' | 'in_transit' | 'completed' | 'rejected';
export type AuditResult = 'match' | 'partial_match' | 'mismatch' | 'missing';
export type CVAlertLevel = 'INFO' | 'WARNING' | 'CRITICAL';
export type MaintenanceType = 'preventive' | 'repair' | 'amc';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type AuditStatus = 'pending' | 'in_progress' | 'completed' | 'locked';

export interface AssetCategoryDetail {
  id: string;
  name: string;
  category: AssetCategory;
  subCategory?: string;
  description?: string;
}

export interface AssetLocation {
  id: string;
  name: string;
  type: 'temple' | 'block' | 'building' | 'floor' | 'room' | 'locker';
  parentLocationId?: string;
  parentLocationName?: string;
  fullPath: string; // e.g., "Main Temple > Block A > Building 1 > Floor 2 > Room 101"
  capacity?: number;
  restrictions?: string[];
  qrCode?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface AssetCustody {
  id: string;
  assetId: string;
  assetName: string;
  custodianType: 'department' | 'individual' | 'committee';
  custodianId: string;
  custodianName: string;
  assignedDate: string;
  acceptedDate?: string;
  acknowledged: boolean;
  acknowledgmentDate?: string;
  terms?: string;
  status: 'active' | 'transferred' | 'released';
  previousCustodyId?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface AssetAllocation {
  id: string;
  assetId: string;
  assetName: string;
  allocationType: 'temporary' | 'permanent';
  allocatedTo: 'department' | 'seva' | 'custodian';
  allocatedToId: string;
  allocatedToName: string;
  purpose: string;
  issuedDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  issuedBy: string;
  issuedByName: string;
  receivedBy?: string;
  receivedByName?: string;
  status: 'active' | 'returned' | 'overdue';
  overdueAlerts?: number;
  createdAt: string;
}

export interface AssetMovementApproval {
  level: number;
  approverRole: string;
  approverId?: string;
  approverName?: string;
  status: ApprovalStatus;
  approvedOn?: string;
  remarks?: string;
}

export interface AssetMovement {
  id: string;
  movementNumber: string;
  date: string;
  sourceLocationId: string;
  sourceLocationName: string;
  destinationLocationId: string;
  destinationLocationName: string;
  reason: string;
  validityPeriod?: {
    from: string;
    to: string;
  };
  assets: Array<{
    assetId: string;
    assetName: string;
    assetCode: string;
  }>;
  cvVerificationAtSource?: {
    image: string; // base64
    timestamp: string;
    verifiedBy: string;
    verifiedByName: string;
  };
  cvVerificationAtDestination?: {
    image: string; // base64
    timestamp: string;
    verifiedBy: string;
    verifiedByName: string;
    matchResult?: AuditResult;
  };
  approvalWorkflow?: AssetMovementApproval[];
  currentApprovalLevel?: number;
  handoverAcknowledged: boolean;
  handoverAcknowledgedBy?: string;
  handoverAcknowledgedByName?: string;
  handoverAcknowledgedOn?: string;
  status: MovementStatus;
  createdBy: string;
  createdByName: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  maintenanceNumber: string;
  assetId: string;
  assetName: string;
  assetCode: string;
  maintenanceType: MaintenanceType;
  scheduledDate?: string;
  actualDate: string;
  vendorId?: string;
  vendorName?: string;
  serviceProvider?: string;
  description: string;
  cost: number;
  nextMaintenanceDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  conductedBy: string;
  conductedByName: string;
  remarks?: string;
  attachments?: string[];
  createdAt: string;
}

export interface AMCContract {
  id: string;
  contractNumber: string;
  assetId: string;
  assetName: string;
  assetCode: string;
  vendorId: string;
  vendorName: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  paymentTerms: string;
  coverage: string[];
  renewalDate?: string;
  autoRenewal: boolean;
  status: 'active' | 'expired' | 'cancelled' | 'renewed';
  createdAt: string;
  updatedAt: string;
}

export interface CVEvidence {
  id: string;
  assetId: string;
  assetName: string;
  assetCode: string;
  eventType: 'creation' | 'movement' | 'audit' | 'maintenance' | 'incident';
  eventId?: string; // Movement ID, Audit ID, etc.
  referenceImage: string; // base64 - original fingerprint
  currentImage: string; // base64 - current capture
  visualFingerprint: string; // hash or feature vector (mock)
  comparisonResult?: AuditResult;
  similarityScore?: number; // 0-100 (mock)
  alertLevel?: CVAlertLevel;
  exceptionExplanation?: string;
  capturedBy: string;
  capturedByName: string;
  capturedAt: string;
  locationId?: string;
  locationName?: string;
  immutable: boolean; // Once set, cannot be modified
  createdAt: string;
}

export interface AssetAudit {
  id: string;
  auditNumber: string;
  auditType: 'periodic' | 'spot' | 'annual';
  date: string;
  categoryFilter?: AssetCategory;
  locationFilter?: string;
  locationFilterName?: string;
  assets: Array<{
    assetId: string;
    assetName: string;
    assetCode: string;
    expectedLocationId: string;
    expectedLocationName: string;
    cvComparisonResult?: AuditResult;
    similarityScore?: number;
    photoEvidence?: string; // base64
    remarks?: string;
  }>;
  auditResults: {
    total: number;
    match: number;
    partialMatch: number;
    mismatch: number;
    missing: number;
  };
  conductedBy: string;
  conductedByName: string;
  supervisorSignOff?: {
    supervisorId: string;
    supervisorName: string;
    signedOn: string;
  };
  auditSignOff?: {
    auditorId: string;
    auditorName: string;
    signedOn: string;
  };
  status: AuditStatus;
  locked: boolean; // Once locked, cannot be modified
  incidentsCreated?: string[]; // Incident IDs for mismatches/missing
  remarks?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AuditIncident {
  id: string;
  incidentNumber: string;
  auditId: string;
  auditNumber: string;
  assetId: string;
  assetName: string;
  assetCode: string;
  incidentType: 'missing' | 'mismatch' | 'damage' | 'unauthorized_movement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reportedBy: string;
  reportedByName: string;
  reportedAt: string;
  investigationStatus: 'pending' | 'in_progress' | 'resolved' | 'escalated';
  resolution?: {
    resolvedBy: string;
    resolvedByName: string;
    resolvedAt: string;
    resolutionDetails: string;
  };
  trusteeApproval?: {
    approvedBy: string;
    approvedByName: string;
    approvedOn: string;
    remarks?: string;
  };
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string; // Immutable asset ID
  assetCode: string; // Human-readable code (e.g., AST-001)
  name: string; // Local name
  nameEnglish?: string; // English name
  category: AssetCategory;
  subCategory?: string;
  description?: string;
  acquisitionType: AcquisitionType;
  acquisitionDate?: string; // For purchased/donated
  acquisitionYear?: number; // For historical assets (approximate)
  sensitivity: AssetSensitivity;
  condition: AssetCondition;
  lifecycleStatus: LifecycleStatus;
  currentValuation: number;
  valuationDate: string;
  valuationCertificate?: string; // Document URL or base64
  donorId?: string; // Link to CRM donor if donated
  donorName?: string;
  donorReceiptNumber?: string;
  legalIdentifiers?: {
    surveyNumber?: string;
    serialNumber?: string;
    chassisNumber?: string;
    registrationNumber?: string;
    other?: Record<string, string>;
  };
  currentLocationId: string;
  currentLocationName: string;
  currentCustodianId?: string;
  currentCustodianName?: string;
  currentCustodianType?: 'department' | 'individual' | 'committee';
  primaryImage?: string; // base64
  additionalImages?: string[]; // base64 array
  cvFingerprint?: string; // Visual fingerprint hash (mock)
  documents?: Array<{
    type: string;
    name: string;
    url: string; // base64 or URL
    uploadedAt: string;
  }>;
  qrCode?: string;
  depreciationRate?: number; // Annual percentage
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  disposalApproval?: {
    requestedBy: string;
    requestedByName: string;
    requestedAt: string;
    approvedBy?: string;
    approvedByName?: string;
    approvedAt?: string;
    disposalDate?: string;
    disposalMethod?: string;
    disposalValue?: number;
  };
  customFields?: Record<string, string>;
  status: 'active' | 'inactive';
  createdAt: string;
  createdBy: string;
  createdByName: string;
  updatedAt: string;
  updatedBy?: string;
  updatedByName?: string;
}
