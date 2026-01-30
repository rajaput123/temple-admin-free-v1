export type UserRole = 
  | 'super_admin'
  | 'temple_administrator'
  | 'hr_manager'
  | 'department_head'
  | 'finance'
  | 'audit'
  | 'priest'
  | 'inventory_manager'
  | 'inventory_admin'
  | 'store_keeper'
  | 'purchase_manager'
  | 'kitchen_manager'
  | 'kitchen_admin'
  | 'kitchen_supervisor'
  | 'production_supervisor'
  | 'quality_incharge'
  | 'prasad_admin'
  | 'seva_counter_staff'
  | 'counter_admin'
  | 'counter_supervisor'
  | 'cashier'
  | 'pr_officer'
  | 'project_manager'
  | 'crm_officer'
  | 'temple_admin'
  | 'zone_admin'
  | 'booking_admin'
  | 'report_viewer'
  | 'ritual_admin'
  | 'priest_supervisor'
  | 'offering_admin'
  | 'festival_coordinator'
  | 'asset_admin'
  | 'asset_manager'
  | 'trustee'
  | 'project_admin'
  | 'site_engineer'
  | 'vendor'
  | 'pr_admin'
  | 'content_editor'
  | 'pr_manager'
  | 'spokesperson'
  | 'digital_team';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  templeName?: string;
  registrationStatus?: string; // RegistrationStatus from registration.ts
  templeId?: string;
  devoteeId?: string;
  subscriptionTier?: SubscriptionTier;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  roles: UserRole[];
  subModules?: SubModule[];
}

export interface SubModule {
  id: string;
  name: string;
  href: string;
  icon?: string;
}

export interface TableColumn<T = unknown> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface Employee {
  id: string;
  employeeCode?: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'on_leave';
  joinDate: string;
  shiftId?: string;
  gradePayId?: string;
  reportingToId?: string;
  avatar?: string;
}

export interface Ritual {
  id: string;
  name: string;
  type: string;
  scheduledTime: string;
  priest: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  offerings: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  location: string;
  lastUpdated: string;
}

export interface SevaBooking {
  id: string;
  bookingNumber: string;
  devotee: string;
  sevaType: string;
  date: string;
  time: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
}
