// HR Module Types
import type { CustomFieldDefinition } from '@/types/custom-fields';

export interface Department {
  id: string;
  name: string;
  code: string;
  headEmployee?: string;
  parentDepartmentId?: string;
  employeeCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  path?: string; // Full path like "HR > Recruitment > Executive Hiring"
  customFields?: CustomFieldDefinition[];
}

export interface Designation {
  id: string;
  name: string;
  department?: string;
  grade?: string;
  level: number;
  status: 'active' | 'inactive';
  customFields?: CustomFieldDefinition[];
}

export interface GradePay {
  id: string;
  name: string;
  code: string;
  minSalary: number;
  maxSalary: number;
  allowances: number;
  level: number;
  status: 'active' | 'inactive';
  customFields?: CustomFieldDefinition[];
}

export interface Shift {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  breaks?: {
    startTime: string;
    endTime: string;
    duration: number;
  }[];
  workingHours: number;
  applicableDepartments: string[];
  templateId?: string;
  pattern?: '5_day' | '6_day' | 'rotating';
  status: 'active' | 'inactive';
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  annualQuota: number;
  carryForward: boolean;
  maxCarryForward: number;
  paid: boolean;
  status: 'active' | 'inactive';
  published?: boolean;
  publishedOn?: string;
  publishedBy?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'national' | 'religious' | 'optional';
  year: number;
  status: 'active' | 'inactive';
  published?: boolean;
  publishedOn?: string;
  publishedBy?: string;
}

export interface LeavePolicy {
  id: string;
  name: string;
  description?: string;
  leaveTypes: string[]; // Leave type IDs
  applicableTo: 'all' | 'department' | 'designation' | 'employee';
  applicableIds?: string[]; // Department/Designation/Employee IDs
  maxConsecutiveDays?: number;
  advanceNoticeDays?: number;
  requiresApproval: boolean;
  autoApprove?: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  // Enhanced fields
  carryForwardRules?: {
    maxDays: number;
    expiryDate?: string;
  };
  accrualRules?: {
    frequency: 'monthly' | 'quarterly';
    rate: number;
  };
  probationRestrictions?: {
    probationPeriod: number; // in months
    allowedLeaveTypes: string[];
  };
  minimumServicePeriod?: number; // in months
  versions?: LeavePolicyVersion[];
  effectiveDate?: string;
}

export interface AttendancePolicy {
  id: string;
  name: string;
  description?: string;
  applicableTo: 'all' | 'department' | 'designation' | 'employee';
  applicableIds?: string[];
  workHoursPerDay: number;
  workDaysPerWeek: number;
  lateArrivalGraceMinutes: number;
  earlyDepartureAllowed: boolean;
  halfDayAllowed: boolean;
  overtimeAllowed: boolean;
  overtimeRate?: number;
  biometricRequired: boolean;
  flexibleTimings: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'present' | 'absent' | 'half_day' | 'late' | 'on_leave' | 'holiday';
  checkIn?: string;
  checkOut?: string;
  lateMinutes?: number;
  overtimeHours?: number;
  remarks?: string;
  markedBy?: string;
  markedOn?: string;
}

export interface AttendanceReport {
  employeeId: string;
  employeeName: string;
  month: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateArrivals: number;
  overtimeHours: number;
}

export interface LeaveApplication {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedOn: string;
  approvedBy?: string;
  approvedOn?: string;
  remarks?: string;
  approvalWorkflow?: {
    level: number;
    approverId: string;
    approverName: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedOn?: string;
    remarks?: string;
  }[];
  currentApprovalLevel?: number;
}

export interface Expense {
  id: string;
  employeeId: string;
  employeeName: string;
  expenseType: string;
  amount: number;
  date: string;
  description: string;
  attachments: string[];
  receipts?: {
    id: string;
    url: string;
    amount: number;
    date: string;
    vendor: string;
    category?: string;
    ocrData?: Record<string, unknown>;
  }[];
  status: 'draft' | 'submitted' | 'manager_approved' | 'hr_approved' | 'finance_approved' | 'rejected' | 'paid';
  submittedOn?: string;
  approvedBy?: string;
  approvedOn?: string;
  remarks?: string;
  approvalWorkflow?: {
    level: number;
    approverId: string;
    approverName: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedOn?: string;
    remarks?: string;
  }[];
  currentApprovalLevel?: number;
  paymentMethod?: string;
  paymentDate?: string;
  paymentBatchId?: string;
}

export interface OrgNode {
  id: string;
  name: string;
  designation: string;
  department: string;
  avatar?: string;
  children?: OrgNode[];
}

export interface EmployeeOnboarding {
  // Overview Tab
  id?: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  reportingTo?: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'volunteer';
  
  // Joining Tab
  joiningDate: string;
  probationEndDate?: string;
  confirmationDate?: string;
  noticePeriod: number;
  
  // Address & Contact Tab
  currentAddress: string;
  permanentAddress: string;
  city: string;
  state: string;
  pincode: string;
  emergencyContact: string;
  emergencyPhone: string;
  emergencyRelation: string;
  
  // Shift & Attendance Tab
  shift: string;
  workLocation: string;
  
  // Leave Tab
  leavePolicy: string;
  casualLeave: number;
  sickLeave: number;
  earnedLeave: number;
  
  // Salary Tab
  gradePay: string;
  basicSalary: number;
  hra: number;
  conveyance: number;
  medical: number;
  specialAllowance: number;
  pf: number;
  esi: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  
  // Personal Tab
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  nationality: string;
  religion: string;
  aadharNumber: string;
  panNumber: string;
  
  // Documents Tab
  documents: {
    type: string;
    name: string;
    url: string;
    uploadedOn: string;
  }[];
  
  // Exit Tab (role-based)
  exitDate?: string;
  exitReason?: string;
  exitInterview?: boolean;
  clearanceStatus?: 'pending' | 'in_progress' | 'completed';
  
  status: 'draft' | 'active' | 'inactive' | 'terminated';
}

// New interfaces for enhanced HR features
export interface EmployeeDocument {
  id: string;
  employeeId: string;
  category: 'id_proof' | 'bank_details' | 'certifications' | 'contracts' | 'performance_reviews' | 'disciplinary_records';
  name: string;
  url: string;
  uploadedOn: string;
  uploadedBy: string;
  expiryDate?: string;
  version?: number;
  metadata?: Record<string, unknown>;
}

export interface HeadcountPlan {
  id: string;
  departmentId: string;
  quarter: string;
  year: number;
  plannedHeadcount: number;
  actualHeadcount: number;
  budget: number;
  requisitions: string[];
  status: 'draft' | 'approved' | 'active';
  createdAt: string;
  createdBy: string;
}

export interface PermissionTemplate {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  applicableRoles: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breaks: {
    startTime: string;
    endTime: string;
    duration: number;
  }[];
  pattern: '5_day' | '6_day' | 'rotating';
  workingHours: number;
  status: 'active' | 'inactive';
}

export interface ShiftSchedule {
  id: string;
  employeeId: string;
  shiftId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface OvertimeRule {
  id: string;
  name: string;
  dailyThreshold: number;
  weeklyThreshold: number;
  rateMultiplier: number;
  holidayRateMultiplier: number;
  applicableTo: 'all' | 'department' | 'designation';
  applicableIds?: string[];
  status: 'active' | 'inactive';
}

export interface LeavePolicyVersion {
  id: string;
  policyId: string;
  version: number;
  effectiveDate: string;
  leaveTypes: string[];
  carryForwardRules: {
    maxDays: number;
    expiryDate?: string;
  };
  accrualRules: {
    frequency: 'monthly' | 'quarterly';
    rate: number;
  };
  probationRestrictions?: {
    probationPeriod: number;
    allowedLeaveTypes: string[];
  };
  minimumServicePeriod?: number;
  status: 'active' | 'inactive';
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  type: 'leave' | 'expense';
  levels: {
    level: number;
    approverRole: string;
    conditions?: {
      duration?: number;
      amount?: number;
      leaveType?: string;
      expenseCategory?: string;
    };
  }[];
  parallelApproval?: boolean;
  escalationRules?: {
    hours: number;
    action: 'auto_approve' | 'escalate';
  };
  status: 'active' | 'inactive';
}

export interface AttendanceViolation {
  id: string;
  employeeId: string;
  date: string;
  violationType: 'late' | 'early_departure' | 'absent' | 'proxy';
  details: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'investigated' | 'resolved';
  createdAt: string;
}

export interface DisciplinaryAction {
  id: string;
  employeeId: string;
  actionType: 'warning' | 'suspension' | 'termination';
  actionSubType?: 'verbal_warning' | 'written_warning';
  reason: string;
  description: string;
  status: 'initiated' | 'investigation' | 'decision' | 'executed';
  initiatedBy: string;
  initiatedOn: string;
  documents?: string[];
  resolvedOn?: string;
}

export interface ExpensePolicy {
  id: string;
  name: string;
  category: 'travel' | 'office_supplies' | 'meals' | 'accommodation' | 'other';
  applicableTo: 'all' | 'department' | 'designation';
  applicableIds?: string[];
  dailyLimit?: number;
  monthlyLimit?: number;
  perDiem?: number;
  mileageRate?: number;
  cityLimits?: Array<{ city: string; limit: number }>;
  effectiveDate: string;
  version: number;
  status: 'active' | 'inactive';
}

export interface ExpenseAuditLog {
  id: string;
  expenseId: string;
  action: 'created' | 'modified' | 'approved' | 'rejected' | 'paid';
  userId: string;
  userName: string;
  timestamp: string;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  remarks?: string;
}
