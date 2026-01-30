import { UserRole } from '@/types/erp';

export interface PlatformRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isCustom: boolean;
}

export const mockPlatformRoles: PlatformRole[] = [
  {
    id: 'role-1',
    name: 'Super Admin',
    description: 'Full access to all modules and features',
    permissions: ['*'],
    isCustom: false,
  },
  {
    id: 'role-2',
    name: 'HR Manager',
    description: 'Full access to HR module',
    permissions: ['hr:*', 'reports:hr'],
    isCustom: false,
  },
  {
    id: 'role-3',
    name: 'Temple Administrator',
    description: 'Full access to temple management',
    permissions: ['structure:*', 'rituals:*', 'seva:*'],
    isCustom: false,
  },
  {
    id: 'role-4',
    name: 'Finance Officer',
    description: 'Access to finance and expense modules',
    permissions: ['hr:expenses', 'inventory:orders', 'reports:finance'],
    isCustom: false,
  },
  {
    id: 'role-5',
    name: 'Audit',
    description: 'Read-only access to all modules for auditing',
    permissions: ['*:read'],
    isCustom: false,
  },
];
