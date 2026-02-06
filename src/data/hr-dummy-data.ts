import type { 
  Department, 
  Designation, 
  GradePay, 
  Shift, 
  LeaveType, 
  Holiday, 
  LeaveApplication, 
  Expense,
  OrgNode,
  Attendance,
  AttendancePolicy,
  LeavePolicy,
  DisciplinaryAction,
  ExpensePolicy,
  ExpenseAuditLog
} from '@/types/hr';
import type { Employee } from '@/types/erp';
import type { CustomFieldDefinition } from '@/types/custom-fields';

const cf = (overrides: Partial<CustomFieldDefinition> & Pick<CustomFieldDefinition, 'id' | 'label' | 'type'>): CustomFieldDefinition => ({
  options: [],
  ...overrides,
});

export const departments: Department[] = [
  { id: '1', name: 'Administration', code: 'ADMIN', headEmployee: 'Lakshmi Devi', employeeCount: 5, status: 'active', createdAt: '2020-01-01', customFields: [cf({ id: 'dept-joinChannel', label: 'Join Channel', type: 'dropdown', options: ['Referral', 'Walk-in', 'Portal'] })] },
  { id: '2', name: 'Rituals', code: 'RTL', headEmployee: 'Ramesh Kumar', employeeCount: 12, status: 'active', createdAt: '2020-01-01', customFields: [cf({ id: 'dept-skill', label: 'Primary Skill', type: 'dropdown', options: ['Archana', 'Abhishekam', 'Homa'] })] },
  { id: '3', name: 'Finance', code: 'FIN', headEmployee: 'Priya Patel', employeeCount: 4, status: 'active', createdAt: '2020-01-01', customFields: [cf({ id: 'dept-tally', label: 'Tally Experience', type: 'dropdown', options: ['Yes', 'No'] })] },
  { id: '4', name: 'Kitchen', code: 'KIT', headEmployee: 'Meena Singh', employeeCount: 15, status: 'active', createdAt: '2020-01-01' },
  { id: '5', name: 'Security', code: 'SEC', headEmployee: 'Venkat Rao', employeeCount: 20, status: 'active', createdAt: '2020-01-01' },
  { id: '6', name: 'Maintenance', code: 'MNT', headEmployee: 'Gopal Reddy', employeeCount: 8, status: 'active', createdAt: '2020-01-01' },
  { id: '7', name: 'Operations', code: 'OPS', headEmployee: 'Anitha Kumari', employeeCount: 10, status: 'active', createdAt: '2020-01-01' },
  { id: '8', name: 'Guest Services', code: 'GS', employeeCount: 6, status: 'inactive', createdAt: '2020-01-01' },
];

export const designations: Designation[] = [
  { id: '1', name: 'Head Priest', department: 'Rituals', grade: 'Grade A', level: 1, status: 'active', customFields: [cf({ id: 'desg-veda', label: 'Veda Training', type: 'dropdown', options: ['Rig', 'Yajur', 'Sama', 'Atharva'] })] },
  { id: '2', name: 'Senior Priest', department: 'Rituals', grade: 'Grade B', level: 2, status: 'active' },
  { id: '3', name: 'Assistant Priest', department: 'Rituals', grade: 'Grade C', level: 3, status: 'active' },
  { id: '4', name: 'HR Manager', department: 'Administration', grade: 'Grade A', level: 1, status: 'active' },
  { id: '5', name: 'HR Executive', department: 'Administration', grade: 'Grade C', level: 3, status: 'active' },
  { id: '6', name: 'Accountant', department: 'Finance', grade: 'Grade B', level: 2, status: 'active' },
  { id: '7', name: 'Security Head', department: 'Security', grade: 'Grade B', level: 2, status: 'active' },
  { id: '8', name: 'Security Guard', department: 'Security', grade: 'Grade D', level: 4, status: 'active' },
  { id: '9', name: 'Kitchen Manager', department: 'Kitchen', grade: 'Grade B', level: 2, status: 'active' },
  { id: '10', name: 'Cook', department: 'Kitchen', grade: 'Grade D', level: 4, status: 'active' },
  { id: '11', name: 'Maintenance Lead', department: 'Maintenance', grade: 'Grade C', level: 3, status: 'active' },
  { id: '12', name: 'Seva Counter Staff', department: 'Operations', grade: 'Grade D', level: 4, status: 'active' },
];

export const gradePays: GradePay[] = [
  { id: '1', name: 'Grade A - Executive', code: 'GA', minSalary: 60000, maxSalary: 100000, allowances: 20000, level: 1, status: 'active', customFields: [cf({ id: 'gp-band', label: 'Pay Band', type: 'dropdown', options: ['Band-1', 'Band-2', 'Band-3'] })] },
  { id: '2', name: 'Grade B - Senior', code: 'GB', minSalary: 40000, maxSalary: 60000, allowances: 15000, level: 2, status: 'active' },
  { id: '3', name: 'Grade C - Mid-Level', code: 'GC', minSalary: 25000, maxSalary: 40000, allowances: 10000, level: 3, status: 'active' },
  { id: '4', name: 'Grade D - Entry Level', code: 'GD', minSalary: 15000, maxSalary: 25000, allowances: 5000, level: 4, status: 'active' },
  { id: '5', name: 'Grade V - Volunteer', code: 'GV', minSalary: 0, maxSalary: 10000, allowances: 2000, level: 5, status: 'active' },
];

export const shifts: Shift[] = [
  { id: '1', name: 'Morning Shift', code: 'MS', startTime: '06:00', endTime: '14:00', breakDuration: 30, workingHours: 7.5, applicableDepartments: ['Rituals', 'Kitchen'], status: 'active' },
  { id: '2', name: 'General Shift', code: 'GS', startTime: '09:00', endTime: '18:00', breakDuration: 60, workingHours: 8, applicableDepartments: ['Administration', 'Finance'], status: 'active' },
  { id: '3', name: 'Evening Shift', code: 'ES', startTime: '14:00', endTime: '22:00', breakDuration: 30, workingHours: 7.5, applicableDepartments: ['Rituals', 'Kitchen', 'Operations'], status: 'active' },
  { id: '4', name: 'Night Shift', code: 'NS', startTime: '22:00', endTime: '06:00', breakDuration: 30, workingHours: 7.5, applicableDepartments: ['Security'], status: 'active' },
  { id: '5', name: 'Flexible', code: 'FL', startTime: '08:00', endTime: '20:00', breakDuration: 60, workingHours: 8, applicableDepartments: ['Maintenance'], status: 'active' },
];

export const leaveTypes: LeaveType[] = [
  { id: '1', name: 'Casual Leave', code: 'CL', annualQuota: 12, carryForward: false, maxCarryForward: 0, paid: true, status: 'active', published: true, publishedOn: '2024-01-01', publishedBy: 'Admin' },
  { id: '2', name: 'Sick Leave', code: 'SL', annualQuota: 10, carryForward: true, maxCarryForward: 5, paid: true, status: 'active', published: true, publishedOn: '2024-01-01', publishedBy: 'Admin' },
  { id: '3', name: 'Earned Leave', code: 'EL', annualQuota: 15, carryForward: true, maxCarryForward: 30, paid: true, status: 'active', published: true, publishedOn: '2024-01-01', publishedBy: 'Admin' },
  { id: '4', name: 'Maternity Leave', code: 'ML', annualQuota: 180, carryForward: false, maxCarryForward: 0, paid: true, status: 'active', published: true, publishedOn: '2024-01-01', publishedBy: 'Admin' },
  { id: '5', name: 'Paternity Leave', code: 'PL', annualQuota: 15, carryForward: false, maxCarryForward: 0, paid: true, status: 'active', published: true, publishedOn: '2024-01-01', publishedBy: 'Admin' },
  { id: '6', name: 'Leave Without Pay', code: 'LWP', annualQuota: 0, carryForward: false, maxCarryForward: 0, paid: false, status: 'active', published: false },
];

export const holidays: Holiday[] = [
  { id: '1', name: 'Republic Day', date: '2025-01-26', type: 'national', year: 2025, status: 'active', published: true, publishedOn: '2024-12-01', publishedBy: 'Admin' },
  { id: '2', name: 'Maha Shivaratri', date: '2025-02-26', type: 'religious', year: 2025, status: 'active', published: true, publishedOn: '2024-12-01', publishedBy: 'Admin' },
  { id: '3', name: 'Holi', date: '2025-03-14', type: 'religious', year: 2025, status: 'active', published: true, publishedOn: '2024-12-01', publishedBy: 'Admin' },
  { id: '4', name: 'Ram Navami', date: '2025-04-06', type: 'religious', year: 2025, status: 'active', published: true, publishedOn: '2024-12-01', publishedBy: 'Admin' },
  { id: '5', name: 'Independence Day', date: '2025-08-15', type: 'national', year: 2025, status: 'active', published: true, publishedOn: '2024-12-01', publishedBy: 'Admin' },
  { id: '6', name: 'Janmashtami', date: '2025-08-16', type: 'religious', year: 2025, status: 'active', published: true, publishedOn: '2024-12-01', publishedBy: 'Admin' },
  { id: '7', name: 'Gandhi Jayanti', date: '2025-10-02', type: 'national', year: 2025, status: 'active', published: true, publishedOn: '2024-12-01', publishedBy: 'Admin' },
  { id: '8', name: 'Dussehra', date: '2025-10-02', type: 'religious', year: 2025, status: 'active', published: true, publishedOn: '2024-12-01', publishedBy: 'Admin' },
  { id: '9', name: 'Diwali', date: '2025-10-21', type: 'religious', year: 2025, status: 'active', published: true, publishedOn: '2024-12-01', publishedBy: 'Admin' },
  { id: '10', name: 'Christmas', date: '2025-12-25', type: 'optional', year: 2025, status: 'active', published: false },
];

// Leave Policies
export const leavePolicies: LeavePolicy[] = [
  {
    id: '1',
    name: 'Standard Leave Policy',
    description: 'Standard leave policy for all employees',
    leaveTypes: ['1', '2', '3'],
    applicableTo: 'all',
    maxConsecutiveDays: 5,
    advanceNoticeDays: 2,
    requiresApproval: true,
    autoApprove: false,
    status: 'active',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Manager Auto-Approve Policy',
    description: 'Auto-approve leaves within policy limits for managers',
    leaveTypes: ['1'],
    applicableTo: 'designation',
    applicableIds: ['4'],
    maxConsecutiveDays: 3,
    advanceNoticeDays: 1,
    requiresApproval: true,
    autoApprove: true,
    status: 'active',
    createdAt: '2024-01-01',
  },
];

// Attendance Policies
export const attendancePolicies: AttendancePolicy[] = [
  {
    id: '1',
    name: 'Standard Attendance Policy',
    description: 'Standard 8-hour work day policy',
    applicableTo: 'all',
    workHoursPerDay: 8,
    workDaysPerWeek: 6,
    lateArrivalGraceMinutes: 15,
    earlyDepartureAllowed: false,
    halfDayAllowed: true,
    overtimeAllowed: true,
    overtimeRate: 1.5,
    biometricRequired: true,
    flexibleTimings: false,
    status: 'active',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Flexible Timing Policy',
    description: 'Flexible timing for administration staff',
    applicableTo: 'department',
    applicableIds: ['1'],
    workHoursPerDay: 8,
    workDaysPerWeek: 5,
    lateArrivalGraceMinutes: 30,
    earlyDepartureAllowed: true,
    halfDayAllowed: true,
    overtimeAllowed: false,
    biometricRequired: false,
    flexibleTimings: true,
    status: 'active',
    createdAt: '2024-01-01',
  },
];

// Attendance data
export const attendanceRecords: Attendance[] = [
  { id: '1', employeeId: '1', employeeName: 'Ramesh Kumar', date: '2025-01-20', status: 'present', checkIn: '06:00', checkOut: '14:00', markedBy: 'System', markedOn: '2025-01-20' },
  { id: '2', employeeId: '2', employeeName: 'Lakshmi Devi', date: '2025-01-20', status: 'present', checkIn: '09:00', checkOut: '18:00', markedBy: 'System', markedOn: '2025-01-20' },
  { id: '3', employeeId: '3', employeeName: 'Suresh Sharma', date: '2025-01-20', status: 'present', checkIn: '06:00', checkOut: '14:00', markedBy: 'System', markedOn: '2025-01-20' },
  { id: '4', employeeId: '4', employeeName: 'Priya Patel', date: '2025-01-20', status: 'on_leave', markedBy: 'System', markedOn: '2025-01-20' },
  { id: '5', employeeId: '5', employeeName: 'Venkat Rao', date: '2025-01-20', status: 'present', checkIn: '22:00', checkOut: '06:00', markedBy: 'System', markedOn: '2025-01-20' },
  { id: '6', employeeId: '6', employeeName: 'Meena Singh', date: '2025-01-20', status: 'present', checkIn: '06:00', checkOut: '14:00', markedBy: 'System', markedOn: '2025-01-20' },
  { id: '7', employeeId: '7', employeeName: 'Gopal Reddy', date: '2025-01-20', status: 'absent', markedBy: 'System', markedOn: '2025-01-20' },
  { id: '8', employeeId: '8', employeeName: 'Anitha Kumari', date: '2025-01-20', status: 'present', checkIn: '14:00', checkOut: '22:00', markedBy: 'System', markedOn: '2025-01-20' },
];

export const leaveApplications: LeaveApplication[] = [
  { id: '1', employeeId: '1', employeeName: 'Ramesh Kumar', leaveType: 'Casual Leave', fromDate: '2025-02-01', toDate: '2025-02-02', days: 2, reason: 'Personal work', status: 'approved', appliedOn: '2025-01-25', approvedBy: 'Lakshmi Devi', approvedOn: '2025-01-26' },
  { id: '2', employeeId: '3', employeeName: 'Suresh Sharma', leaveType: 'Sick Leave', fromDate: '2025-01-28', toDate: '2025-01-29', days: 2, reason: 'Fever', status: 'approved', appliedOn: '2025-01-27', approvedBy: 'Ramesh Kumar', approvedOn: '2025-01-27' },
  { id: '3', employeeId: '4', employeeName: 'Priya Patel', leaveType: 'Earned Leave', fromDate: '2025-02-10', toDate: '2025-02-14', days: 5, reason: 'Family vacation', status: 'pending', appliedOn: '2025-01-20' },
  { id: '4', employeeId: '6', employeeName: 'Meena Singh', leaveType: 'Casual Leave', fromDate: '2025-02-05', toDate: '2025-02-05', days: 1, reason: 'Doctor appointment', status: 'pending', appliedOn: '2025-01-28' },
  { id: '5', employeeId: '8', employeeName: 'Anitha Kumari', leaveType: 'Sick Leave', fromDate: '2025-01-15', toDate: '2025-01-16', days: 2, reason: 'Migraine', status: 'rejected', appliedOn: '2025-01-14', remarks: 'Insufficient leave balance' },
];

export const expenses: Expense[] = [
  { id: '1', employeeId: '1', employeeName: 'Ramesh Kumar', expenseType: 'Travel', amount: 2500, date: '2025-01-20', description: 'Travel to sub-temple for special puja', attachments: ['receipt1.pdf'], status: 'admin_approved', submittedOn: '2025-01-21', approvedBy: 'Lakshmi Devi', approvedOn: '2025-01-22' },
  { id: '2', employeeId: '2', employeeName: 'Lakshmi Devi', expenseType: 'Office Supplies', amount: 1500, date: '2025-01-18', description: 'Stationery and printer cartridges', attachments: ['bill.pdf'], status: 'manager_approved', submittedOn: '2025-01-19' },
  { id: '3', employeeId: '6', employeeName: 'Meena Singh', expenseType: 'Kitchen Equipment', amount: 8000, date: '2025-01-25', description: 'New pressure cookers for prasad preparation', attachments: ['invoice.pdf'], status: 'submitted', submittedOn: '2025-01-26' },
  { id: '4', employeeId: '7', employeeName: 'Gopal Reddy', expenseType: 'Maintenance Supplies', amount: 3500, date: '2025-01-22', description: 'Electrical supplies and tools', attachments: [], status: 'draft' },
  { id: '5', employeeId: '5', employeeName: 'Venkat Rao', expenseType: 'Travel', amount: 1200, date: '2025-01-28', description: 'Site visit for security assessment', attachments: ['receipt.pdf'], status: 'rejected', submittedOn: '2025-01-28', remarks: 'Missing proper receipts' },
];

// Employees data with interconnections
import type { Employee } from '@/types/erp';

export const employees: Employee[] = [
  { id: '1', employeeCode: 'EMP-0001', name: 'Ramesh Kumar', designation: 'Head Priest', department: 'Rituals', email: 'ramesh@temple.org', phone: '+91 98765 43210', status: 'active', joinDate: '2020-01-15', shiftId: '1', gradePayId: '1', reportingToId: '2' },
  { id: '2', employeeCode: 'EMP-0002', name: 'Lakshmi Devi', designation: 'HR Manager', department: 'Administration', email: 'lakshmi@temple.org', phone: '+91 98765 43211', status: 'active', joinDate: '2019-06-01', shiftId: '2', gradePayId: '1' },
  { id: '3', employeeCode: 'EMP-0003', name: 'Suresh Sharma', designation: 'Assistant Priest', department: 'Rituals', email: 'suresh@temple.org', phone: '+91 98765 43212', status: 'active', joinDate: '2021-03-10', shiftId: '1', gradePayId: '3', reportingToId: '1' },
  { id: '4', employeeCode: 'EMP-0004', name: 'Priya Patel', designation: 'Accountant', department: 'Finance', email: 'priya@temple.org', phone: '+91 98765 43213', status: 'on_leave', joinDate: '2020-08-20', shiftId: '2', gradePayId: '2', reportingToId: '2' },
  { id: '5', employeeCode: 'EMP-0005', name: 'Venkat Rao', designation: 'Security Head', department: 'Security', email: 'venkat@temple.org', phone: '+91 98765 43214', status: 'active', joinDate: '2018-12-01', shiftId: '4', gradePayId: '2', reportingToId: '2' },
  { id: '6', employeeCode: 'EMP-0006', name: 'Meena Singh', designation: 'Kitchen Manager', department: 'Kitchen', email: 'meena@temple.org', phone: '+91 98765 43215', status: 'active', joinDate: '2019-04-15', shiftId: '1', gradePayId: '2', reportingToId: '2' },
  { id: '7', employeeCode: 'EMP-0007', name: 'Gopal Reddy', designation: 'Maintenance Lead', department: 'Maintenance', email: 'gopal@temple.org', phone: '+91 98765 43216', status: 'inactive', joinDate: '2017-09-01', shiftId: '5', gradePayId: '3', reportingToId: '2' },
  { id: '8', employeeCode: 'EMP-0008', name: 'Anitha Kumari', designation: 'Seva Counter Staff', department: 'Operations', email: 'anitha@temple.org', phone: '+91 98765 43217', status: 'active', joinDate: '2022-01-10', shiftId: '3', gradePayId: '4', reportingToId: '2' },
];

export const orgTree: OrgNode = {
  id: '0',
  name: 'Temple Trust',
  designation: 'Trust Board',
  department: 'Governance',
  children: [
    {
      id: '1',
      name: 'Lakshmi Devi',
      designation: 'Temple Administrator',
      department: 'Administration',
      children: [
        {
          id: '2',
          name: 'Ramesh Kumar',
          designation: 'Head Priest',
          department: 'Rituals',
          children: [
            { id: '3', name: 'Suresh Sharma', designation: 'Senior Priest', department: 'Rituals' },
            { id: '4', name: 'Karthik Iyer', designation: 'Assistant Priest', department: 'Rituals' },
            { id: '5', name: 'Arun Pandit', designation: 'Assistant Priest', department: 'Rituals' },
          ]
        },
        {
          id: '6',
          name: 'Priya Patel',
          designation: 'Finance Head',
          department: 'Finance',
          children: [
            { id: '7', name: 'Ravi Sharma', designation: 'Accountant', department: 'Finance' },
            { id: '8', name: 'Neha Gupta', designation: 'Accountant', department: 'Finance' },
          ]
        },
        {
          id: '9',
          name: 'Meena Singh',
          designation: 'Kitchen Manager',
          department: 'Kitchen',
          children: [
            { id: '10', name: 'Sita Devi', designation: 'Head Cook', department: 'Kitchen' },
            { id: '11', name: 'Ganga Prasad', designation: 'Cook', department: 'Kitchen' },
          ]
        },
        {
          id: '12',
          name: 'Venkat Rao',
          designation: 'Security Head',
          department: 'Security',
          children: [
            { id: '13', name: 'Rahul Yadav', designation: 'Security Supervisor', department: 'Security' },
            { id: '14', name: 'Amit Kumar', designation: 'Security Guard', department: 'Security' },
          ]
        },
        {
          id: '15',
          name: 'Gopal Reddy',
          designation: 'Maintenance Lead',
          department: 'Maintenance',
          children: [
            { id: '16', name: 'Mohan Das', designation: 'Electrician', department: 'Maintenance' },
            { id: '17', name: 'Sunil Kumar', designation: 'Plumber', department: 'Maintenance' },
          ]
        },
        {
          id: '18',
          name: 'Anitha Kumari',
          designation: 'Operations Manager',
          department: 'Operations',
          children: [
            { id: '19', name: 'Kavitha Reddy', designation: 'Seva Counter Staff', department: 'Operations' },
            { id: '20', name: 'Deepa Nair', designation: 'Seva Counter Staff', department: 'Operations' },
          ]
        },
      ]
    }
  ]
};

// Disciplinary Actions
export const disciplinaryActions: DisciplinaryAction[] = [
  {
    id: '1',
    employeeId: '7',
    actionType: 'warning',
    actionSubType: 'written_warning',
    reason: 'Repeated late arrival',
    description: 'Employee has been arriving late consistently for the past week. Written warning issued.',
    status: 'executed',
    initiatedBy: '2',
    initiatedOn: '2025-01-15',
    resolvedOn: '2025-01-15',
  },
  {
    id: '2',
    employeeId: '8',
    actionType: 'warning',
    actionSubType: 'verbal_warning',
    reason: 'Inappropriate behavior',
    description: 'Verbal warning for inappropriate behavior during work hours.',
    status: 'executed',
    initiatedBy: '2',
    initiatedOn: '2025-01-10',
    resolvedOn: '2025-01-10',
  },
];

// Expense Policies
export const expensePolicies: ExpensePolicy[] = [
  {
    id: '1',
    name: 'Travel Policy - Executive',
    category: 'travel',
    applicableTo: 'designation',
    applicableIds: ['1', '4'],
    dailyLimit: 5000,
    monthlyLimit: 50000,
    perDiem: 2000,
    mileageRate: 8,
    effectiveDate: '2024-01-01',
    version: 1,
    status: 'active',
  },
  {
    id: '2',
    name: 'Travel Policy - Standard',
    category: 'travel',
    applicableTo: 'all',
    dailyLimit: 3000,
    monthlyLimit: 30000,
    perDiem: 1500,
    mileageRate: 6,
    effectiveDate: '2024-01-01',
    version: 1,
    status: 'active',
  },
  {
    id: '3',
    name: 'Meals Policy',
    category: 'meals',
    applicableTo: 'all',
    dailyLimit: 500,
    monthlyLimit: 10000,
    effectiveDate: '2024-01-01',
    version: 1,
    status: 'active',
  },
];

// Expense Audit Logs
export const expenseAuditLogs: ExpenseAuditLog[] = [
  {
    id: '1',
    expenseId: '1',
    action: 'created',
    userId: '1',
    userName: 'Ramesh Kumar',
    timestamp: '2025-01-21T10:00:00Z',
    remarks: 'Expense created',
  },
  {
    id: '2',
    expenseId: '1',
    action: 'approved',
    userId: '2',
    userName: 'Lakshmi Devi',
    timestamp: '2025-01-22T14:30:00Z',
    remarks: 'Approved by manager',
    changes: [
      { field: 'status', oldValue: 'submitted', newValue: 'admin_approved' },
    ],
  },
  {
    id: '3',
    expenseId: '2',
    action: 'created',
    userId: '2',
    userName: 'Lakshmi Devi',
    timestamp: '2025-01-19T09:15:00Z',
    remarks: 'Expense created',
  },
  {
    id: '4',
    expenseId: '2',
    action: 'modified',
    userId: '2',
    userName: 'Lakshmi Devi',
    timestamp: '2025-01-19T10:00:00Z',
    remarks: 'Updated amount',
    changes: [
      { field: 'amount', oldValue: 1200, newValue: 1500 },
    ],
  },
  {
    id: '5',
    expenseId: '5',
    action: 'rejected',
    userId: '2',
    userName: 'Lakshmi Devi',
    timestamp: '2025-01-28T16:00:00Z',
    remarks: 'Missing proper receipts',
    changes: [
      { field: 'status', oldValue: 'submitted', newValue: 'rejected' },
    ],
  },
];
