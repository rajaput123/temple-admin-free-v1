import { UserRole } from '@/types/erp';
import { Employee } from '@/types/erp';

export type Permission =
  | 'employees:read'
  | 'employees:write'
  | 'employees:delete'
  | 'organization:read'
  | 'organization:write'
  | 'shifts:read'
  | 'shifts:write'
  | 'leave:read'
  | 'leave:write'
  | 'leave:approve'
  | 'attendance:read'
  | 'attendance:write'
  | 'expenses:read'
  | 'expenses:write'
  | 'expenses:approve'
  | 'expenses:finance'
  | 'payroll:read'
  | 'audit:read'
  | 'structure:read'
  | 'structure:write'
  | 'structure:delete'
  | 'temples:read'
  | 'temples:write'
  | 'zones:read'
  | 'zones:write'
  | 'counters:read'
  | 'counters:write'
  | 'bookings:read'
  | 'bookings:write'
  | 'bookings:cancel'
  | 'bookings:reprint'
  | 'seva:read'
  | 'seva:write'
  | 'seva:delete'
  | 'cash:read'
  | 'cash:write'
  | 'cash:reconcile'
  | 'settlement:read'
  | 'settlement:write'
  | 'settlement:approve'
  | 'reports:read'
  | 'rituals:read'
  | 'rituals:write'
  | 'rituals:delete'
  | 'offerings:read'
  | 'offerings:write'
  | 'schedule:read'
  | 'schedule:write'
  | 'festivals:read'
  | 'festivals:write'
  | 'priests:read'
  | 'priests:write'
  | 'inventory:read'
  | 'inventory:write'
  | 'inventory:delete'
  | 'items:read'
  | 'items:write'
  | 'stock_entries:read'
  | 'stock_entries:write'
  | 'purchase_orders:read'
  | 'purchase_orders:write'
  | 'purchase_orders:approve'
  | 'kitchen:read'
  | 'kitchen:write'
  | 'kitchen:delete'
  | 'recipes:read'
  | 'recipes:write'
  | 'recipes:approve'
  | 'production:read'
  | 'production:write'
  | 'production:plan'
  | 'production:execute'
  | 'kitchen_stores:read'
  | 'kitchen_stores:write'
  | 'prasad:read'
  | 'prasad:write'
  | 'prasad_master:read'
  | 'prasad_master:write'
  | 'prasad_distribution:read'
  | 'prasad_distribution:write'
  | 'quality:read'
  | 'quality:write'
  | 'quality:certify'
  | 'assets:read'
  | 'assets:write'
  | 'assets:delete'
  | 'asset_master:read'
  | 'asset_master:write'
  | 'asset_movement:read'
  | 'asset_movement:write'
  | 'asset_movement:approve'
  | 'asset_audit:read'
  | 'asset_audit:write'
  | 'asset_audit:certify'
  | 'maintenance:read'
  | 'maintenance:write'
  | 'cv_evidence:read'
  | 'cv_evidence:write'
  | 'disposal:read'
  | 'disposal:write'
  | 'disposal:approve'
  | 'projects:read'
  | 'projects:write'
  | 'projects:delete'
  | 'project_master:read'
  | 'project_master:write'
  | 'project_planning:read'
  | 'project_planning:write'
  | 'project_planning:approve'
  | 'project_budget:read'
  | 'project_budget:write'
  | 'project_budget:approve'
  | 'project_vendors:read'
  | 'project_vendors:write'
  | 'project_execution:read'
  | 'project_execution:write'
  | 'project_compliance:read'
  | 'project_compliance:write'
  | 'project_compliance:certify'
  | 'project_payments:read'
  | 'project_payments:write'
  | 'project_payments:approve'
  | 'change_requests:read'
  | 'change_requests:write'
  | 'change_requests:approve'
  | 'communications:read'
  | 'communications:write'
  | 'communications:delete'
  | 'announcements:read'
  | 'announcements:write'
  | 'announcements:publish'
  | 'devotee_messages:read'
  | 'devotee_messages:write'
  | 'devotee_messages:send'
  | 'media:read'
  | 'media:write'
  | 'media:approve'
  | 'crisis:read'
  | 'crisis:write'
  | 'crisis:override'
  | 'social:read'
  | 'social:write'
  | 'social:publish'
  | 'social:moderate'
  | 'approvals:read'
  | 'approvals:approve'
  | 'approvals:reject';

const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
    'employees:read', 'employees:write', 'employees:delete',
    'organization:read', 'organization:write',
    'shifts:read', 'shifts:write',
    'leave:read', 'leave:write', 'leave:approve',
    'attendance:read', 'attendance:write',
    'expenses:read', 'expenses:write', 'expenses:approve', 'expenses:finance',
    'payroll:read',
    'audit:read',
    'structure:read', 'structure:write', 'structure:delete',
    'temples:read', 'temples:write',
    'zones:read', 'zones:write',
    'counters:read', 'counters:write',
    'bookings:read', 'bookings:write',
    'reports:read',
    'rituals:read', 'rituals:write', 'rituals:delete',
    'offerings:read', 'offerings:write',
    'schedule:read', 'schedule:write',
    'festivals:read', 'festivals:write',
    'priests:read', 'priests:write',
    'inventory:read', 'inventory:write', 'inventory:delete',
    'items:read', 'items:write',
    'stock_entries:read', 'stock_entries:write',
    'purchase_orders:read', 'purchase_orders:write', 'purchase_orders:approve',
    'kitchen:read', 'kitchen:write', 'kitchen:delete',
    'recipes:read', 'recipes:write', 'recipes:approve',
    'production:read', 'production:write', 'production:plan', 'production:execute',
    'kitchen_stores:read', 'kitchen_stores:write',
    'prasad:read', 'prasad:write',
    'prasad_master:read', 'prasad_master:write',
    'prasad_distribution:read', 'prasad_distribution:write',
    'quality:read', 'quality:write', 'quality:certify',
    'assets:read', 'assets:write', 'assets:delete',
    'asset_master:read', 'asset_master:write',
    'asset_movement:read', 'asset_movement:write', 'asset_movement:approve',
    'asset_audit:read', 'asset_audit:write', 'asset_audit:certify',
    'maintenance:read', 'maintenance:write',
    'cv_evidence:read', 'cv_evidence:write',
    'disposal:read', 'disposal:write', 'disposal:approve',
    'projects:read', 'projects:write', 'projects:delete',
    'project_master:read', 'project_master:write',
    'project_planning:read', 'project_planning:write', 'project_planning:approve',
    'project_budget:read', 'project_budget:write', 'project_budget:approve',
    'project_vendors:read', 'project_vendors:write',
    'project_execution:read', 'project_execution:write',
    'project_compliance:read', 'project_compliance:write', 'project_compliance:certify',
    'project_payments:read', 'project_payments:write', 'project_payments:approve',
    'change_requests:read', 'change_requests:write', 'change_requests:approve',
    'communications:read', 'communications:write', 'communications:delete',
    'announcements:read', 'announcements:write', 'announcements:publish',
    'devotee_messages:read', 'devotee_messages:write', 'devotee_messages:send',
    'media:read', 'media:write', 'media:approve',
    'crisis:read', 'crisis:write', 'crisis:override',
    'social:read', 'social:write', 'social:publish', 'social:moderate',
    'approvals:read', 'approvals:approve', 'approvals:reject',
  ],
  temple_administrator: [
    'employees:read', 'employees:write', 'employees:delete',
    'organization:read', 'organization:write',
    'shifts:read', 'shifts:write',
    'leave:read', 'leave:write', 'leave:approve',
    'attendance:read', 'attendance:write',
    'expenses:read', 'expenses:write', 'expenses:approve', 'expenses:finance',
    'payroll:read',
    'audit:read',
    'structure:read', 'structure:write', 'structure:delete',
    'temples:read', 'temples:write',
    'zones:read', 'zones:write',
    'counters:read', 'counters:write',
    'bookings:read', 'bookings:write',
    'reports:read',
    'rituals:read', 'rituals:write', 'rituals:delete',
    'offerings:read', 'offerings:write',
    'schedule:read', 'schedule:write',
    'festivals:read', 'festivals:write',
    'priests:read', 'priests:write',
    'inventory:read', 'inventory:write', 'inventory:delete',
    'items:read', 'items:write',
    'stock_entries:read', 'stock_entries:write',
    'purchase_orders:read', 'purchase_orders:write', 'purchase_orders:approve',
    'kitchen:read', 'kitchen:write', 'kitchen:delete',
    'recipes:read', 'recipes:write', 'recipes:approve',
    'production:read', 'production:write', 'production:plan', 'production:execute',
    'kitchen_stores:read', 'kitchen_stores:write',
    'prasad:read', 'prasad:write',
    'prasad_master:read', 'prasad_master:write',
    'prasad_distribution:read', 'prasad_distribution:write',
    'quality:read', 'quality:write', 'quality:certify',
    'projects:read', 'projects:write', 'projects:delete',
    'project_master:read', 'project_master:write',
    'project_planning:read', 'project_planning:write', 'project_planning:approve',
    'project_budget:read', 'project_budget:write', 'project_budget:approve',
    'project_vendors:read', 'project_vendors:write',
    'project_execution:read', 'project_execution:write',
    'project_compliance:read', 'project_compliance:write', 'project_compliance:certify',
    'project_payments:read', 'project_payments:write', 'project_payments:approve',
    'change_requests:read', 'change_requests:write', 'change_requests:approve',
    'communications:read', 'communications:write', 'communications:delete',
    'announcements:read', 'announcements:write', 'announcements:publish',
    'devotee_messages:read', 'devotee_messages:write', 'devotee_messages:send',
    'media:read', 'media:write', 'media:approve',
    'crisis:read', 'crisis:write', 'crisis:override',
    'social:read', 'social:write', 'social:publish', 'social:moderate',
    'approvals:read', 'approvals:approve', 'approvals:reject',
  ],
  hr_manager: [
    'employees:read', 'employees:write', 'employees:delete',
    'organization:read', 'organization:write',
    'shifts:read', 'shifts:write',
    'leave:read', 'leave:write', 'leave:approve',
    'attendance:read', 'attendance:write',
    'expenses:read', 'expenses:write', 'expenses:approve',
    'audit:read',
  ],
  department_head: [
    'employees:read',
    'organization:read',
    'shifts:read',
    'leave:read', 'leave:approve',
    'attendance:read', 'attendance:write',
    'expenses:read', 'expenses:approve',
  ],
  finance: [
    'employees:read',
    'organization:read',
    'shifts:read',
    'leave:read',
    'attendance:read',
    'expenses:read', 'expenses:write', 'expenses:approve', 'expenses:finance',
    'payroll:read',
    'inventory:read',
    'items:read',
    'stock_entries:read',
    'purchase_orders:read', 'purchase_orders:write', 'purchase_orders:approve',
    'kitchen:read',
    'prasad:read',
    'bookings:read',
    'seva:read',
    'cash:read',
    'settlement:read', 'settlement:approve',
    'reports:read',
    'projects:read',
    'project_budget:read', 'project_budget:approve',
    'project_payments:read', 'project_payments:approve',
  ],
  audit: [
    'employees:read',
    'organization:read',
    'shifts:read',
    'leave:read',
    'attendance:read',
    'expenses:read',
    'audit:read',
    'structure:read',
    'rituals:read',
    'schedule:read',
    'inventory:read',
    'items:read',
    'stock_entries:read',
    'purchase_orders:read',
    'kitchen:read',
    'recipes:read',
    'production:read',
    'prasad:read',
    'bookings:read',
    'seva:read',
    'cash:read',
    'settlement:read',
    'reports:read',
    'projects:read',
    'reports:read',
  ],
  priest: [
    'leave:read',
    'attendance:read',
  ],
  inventory_manager: [
    'inventory:read', 'inventory:write',
    'items:read', 'items:write',
    'stock_entries:read', 'stock_entries:write',
    'purchase_orders:read', 'purchase_orders:write',
    'reports:read',
  ],
  inventory_admin: [
    'inventory:read', 'inventory:write', 'inventory:delete',
    'items:read', 'items:write',
    'stock_entries:read', 'stock_entries:write',
    'purchase_orders:read', 'purchase_orders:write', 'purchase_orders:approve',
    'reports:read',
    'audit:read',
  ],
  store_keeper: [
    'inventory:read',
    'items:read', 'items:write',
    'stock_entries:read', 'stock_entries:write',
    'purchase_orders:read',
    'reports:read',
  ],
  purchase_manager: [
    'inventory:read',
    'items:read',
    'stock_entries:read',
    'purchase_orders:read', 'purchase_orders:write',
    'reports:read',
  ],
  kitchen_manager: [
    'kitchen:read', 'kitchen:write',
    'recipes:read', 'recipes:write',
    'production:read', 'production:write',
    'kitchen_stores:read', 'kitchen_stores:write',
    'prasad:read', 'prasad:write',
    'reports:read',
  ],
  kitchen_admin: [
    'kitchen:read', 'kitchen:write', 'kitchen:delete',
    'recipes:read', 'recipes:write', 'recipes:approve',
    'production:read', 'production:write', 'production:plan', 'production:execute',
    'kitchen_stores:read', 'kitchen_stores:write',
    'prasad:read', 'prasad:write',
    'prasad_master:read', 'prasad_master:write',
    'prasad_distribution:read', 'prasad_distribution:write',
    'quality:read', 'quality:write', 'quality:certify',
    'reports:read',
    'audit:read',
  ],
  production_supervisor: [
    'kitchen:read',
    'recipes:read',
    'production:read', 'production:write', 'production:plan', 'production:execute',
    'kitchen_stores:read',
    'prasad:read',
    'reports:read',
  ],
  quality_incharge: [
    'kitchen:read',
    'production:read',
    'quality:read', 'quality:write', 'quality:certify',
    'prasad:read',
    'reports:read',
  ],
  prasad_admin: [
    'prasad:read', 'prasad:write',
    'prasad_master:read', 'prasad_master:write',
    'prasad_distribution:read', 'prasad_distribution:write',
    'reports:read',
  ],
  kitchen_supervisor: [
    'inventory:read',
    'items:read',
    'stock_entries:read', 'stock_entries:write',
    'kitchen_stores:read',
    'reports:read',
  ],
  seva_counter_staff: [
    'bookings:read', 'bookings:write',
    'seva:read', 'seva:write',
    'cash:read',
  ],
  counter_admin: [
    'bookings:read', 'bookings:write', 'bookings:cancel', 'bookings:reprint',
    'seva:read', 'seva:write', 'seva:delete',
    'cash:read', 'cash:write', 'cash:reconcile',
    'settlement:read', 'settlement:write', 'settlement:approve',
    'reports:read',
  ],
  counter_supervisor: [
    'counters:read', 'counters:write',
    'inventory:read',
    'items:read',
    'stock_entries:read', 'stock_entries:write',
    'prasad:read',
    'prasad_distribution:read',
    'bookings:read', 'bookings:write', 'bookings:cancel', 'bookings:reprint',
    'seva:read', 'seva:write',
    'cash:read', 'cash:write',
    'settlement:read', 'settlement:write',
    'reports:read',
  ],
  cashier: [
    'bookings:read', 'bookings:write',
    'seva:read', 'seva:write',
    'cash:read', 'cash:write',
  ],
  pr_officer: [],
  project_manager: [
    'projects:read', 'projects:write',
    'project_master:read', 'project_master:write',
    'project_planning:read', 'project_planning:write', 'project_planning:approve',
    'project_budget:read', 'project_budget:write',
    'project_vendors:read', 'project_vendors:write',
    'project_execution:read', 'project_execution:write',
    'project_compliance:read', 'project_compliance:write',
    'project_payments:read',
    'change_requests:read', 'change_requests:write',
    'reports:read',
  ],
  crm_officer: [],
  temple_admin: [
    'structure:read', 'structure:write', 'structure:delete',
    'temples:read', 'temples:write',
    'zones:read', 'zones:write',
    'counters:read', 'counters:write',
    'bookings:read', 'bookings:write',
    'reports:read',
    'audit:read',
  ],
  zone_admin: [
    'structure:read',
    'zones:read', 'zones:write',
    'reports:read',
  ],
  booking_admin: [
    'structure:read',
    'bookings:read', 'bookings:write',
    'reports:read',
  ],
  report_viewer: [
    'structure:read',
    'reports:read',
    'rituals:read',
    'schedule:read',
    'inventory:read',
    'items:read',
    'stock_entries:read',
    'purchase_orders:read',
  ],
  ritual_admin: [
    'rituals:read', 'rituals:write', 'rituals:delete',
    'offerings:read', 'offerings:write',
    'schedule:read', 'schedule:write',
    'festivals:read', 'festivals:write',
    'priests:read', 'priests:write',
    'reports:read',
    'audit:read',
  ],
  priest_supervisor: [
    'rituals:read',
    'schedule:read', 'schedule:write',
    'priests:read', 'priests:write',
    'reports:read',
  ],
  offering_admin: [
    'rituals:read',
    'offerings:read', 'offerings:write',
    'reports:read',
  ],
  festival_coordinator: [
    'rituals:read',
    'festivals:read', 'festivals:write',
    'schedule:read', 'schedule:write',
    'reports:read',
  ],
  asset_admin: [
    'assets:read', 'assets:write', 'assets:delete',
    'asset_master:read', 'asset_master:write',
    'asset_movement:read', 'asset_movement:write', 'asset_movement:approve',
    'asset_audit:read', 'asset_audit:write', 'asset_audit:certify',
    'maintenance:read', 'maintenance:write',
    'cv_evidence:read', 'cv_evidence:write',
    'disposal:read', 'disposal:write', 'disposal:approve',
    'reports:read',
  ],
  asset_manager: [
    'assets:read', 'assets:write',
    'asset_master:read', 'asset_master:write',
    'asset_movement:read', 'asset_movement:write', 'asset_movement:approve',
    'maintenance:read', 'maintenance:write',
    'cv_evidence:read', 'cv_evidence:write',
    'reports:read',
  ],
  trustee: [
    'assets:read',
    'asset_master:read',
    'asset_movement:read', 'asset_movement:approve',
    'asset_audit:read',
    'disposal:read', 'disposal:write', 'disposal:approve',
    'projects:read',
    'project_budget:read', 'project_budget:approve',
    'project_payments:read', 'project_payments:approve',
    'change_requests:read', 'change_requests:approve',
    'reports:read',
  ],
  project_admin: [
    'projects:read', 'projects:write', 'projects:delete',
    'project_master:read', 'project_master:write',
    'project_planning:read', 'project_planning:write', 'project_planning:approve',
    'project_budget:read', 'project_budget:write', 'project_budget:approve',
    'project_vendors:read', 'project_vendors:write',
    'project_execution:read', 'project_execution:write',
    'project_compliance:read', 'project_compliance:write', 'project_compliance:certify',
    'project_payments:read', 'project_payments:write', 'project_payments:approve',
    'change_requests:read', 'change_requests:write', 'change_requests:approve',
    'reports:read',
  ],
  site_engineer: [
    'projects:read',
    'project_execution:read', 'project_execution:write',
    'reports:read',
  ],
  vendor: [
    'projects:read',
    'project_payments:read',
  ],
  pr_admin: [
    'communications:read', 'communications:write', 'communications:delete',
    'announcements:read', 'announcements:write', 'announcements:publish',
    'devotee_messages:read', 'devotee_messages:write', 'devotee_messages:send',
    'media:read', 'media:write', 'media:approve',
    'crisis:read', 'crisis:write', 'crisis:override',
    'social:read', 'social:write', 'social:publish', 'social:moderate',
    'approvals:read', 'approvals:approve', 'approvals:reject',
  ],
  content_editor: [
    'communications:read', 'communications:write',
    'announcements:read', 'announcements:write',
    'devotee_messages:read', 'devotee_messages:write',
    'media:read', 'media:write',
    'crisis:read', 'crisis:write',
    'social:read', 'social:write',
  ],
  pr_manager: [
    'communications:read', 'communications:write',
    'announcements:read', 'announcements:write', 'announcements:publish',
    'devotee_messages:read', 'devotee_messages:write', 'devotee_messages:send',
    'media:read', 'media:write', 'media:approve',
    'crisis:read', 'crisis:write',
    'social:read', 'social:write', 'social:publish',
    'approvals:read', 'approvals:approve', 'approvals:reject',
  ],
  spokesperson: [
    'communications:read',
    'media:read', 'media:write',
  ],
  digital_team: [
    'communications:read',
    'social:read', 'social:write', 'social:moderate',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
}

export function canAccessModule(role: UserRole, module: 'employees' | 'organization' | 'shifts' | 'leave' | 'attendance' | 'expenses' | 'payroll' | 'structure' | 'temples' | 'zones' | 'counters' | 'bookings' | 'reports' | 'rituals' | 'offerings' | 'schedule' | 'festivals' | 'priests' | 'inventory' | 'items' | 'stock_entries' | 'purchase_orders' | 'kitchen' | 'recipes' | 'production' | 'kitchen_stores' | 'prasad' | 'prasad_master' | 'prasad_distribution' | 'quality' | 'seva' | 'cash' | 'settlement' | 'assets' | 'asset_master' | 'asset_movement' | 'asset_audit' | 'maintenance' | 'cv_evidence' | 'disposal' | 'projects' | 'project_master' | 'project_planning' | 'project_budget' | 'project_vendors' | 'project_execution' | 'project_compliance' | 'project_payments' | 'change_requests' | 'communications'): boolean {
  const readPermission = `${module}:read` as Permission;
  return hasPermission(role, readPermission);
}

export function canWrite(role: UserRole, module: 'employees' | 'organization' | 'shifts' | 'leave' | 'attendance' | 'expenses' | 'structure' | 'temples' | 'zones' | 'counters' | 'bookings' | 'rituals' | 'offerings' | 'schedule' | 'festivals' | 'priests' | 'inventory' | 'items' | 'stock_entries' | 'purchase_orders' | 'kitchen' | 'recipes' | 'production' | 'kitchen_stores' | 'prasad' | 'prasad_master' | 'prasad_distribution' | 'quality' | 'seva' | 'cash' | 'settlement' | 'assets' | 'asset_master' | 'asset_movement' | 'asset_audit' | 'maintenance' | 'cv_evidence' | 'disposal' | 'projects' | 'project_master' | 'project_planning' | 'project_budget' | 'project_vendors' | 'project_execution' | 'project_compliance' | 'project_payments' | 'change_requests' | 'communications'): boolean {
  const writePermission = `${module}:write` as Permission;
  return hasPermission(role, writePermission);
}

export function filterEmployeesByRole(employees: Employee[], userRole: UserRole, userDepartmentId?: string, userReportingToId?: string): Employee[] {
  if (userRole === 'super_admin' || userRole === 'temple_administrator' || userRole === 'hr_manager') {
    return employees;
  }

  if (userRole === 'department_head' && userDepartmentId) {
    return employees.filter(emp => emp.department === userDepartmentId);
  }

  if (userRole === 'finance' || userRole === 'audit') {
    return employees; // View only, but can see all
  }

  return employees;
}
