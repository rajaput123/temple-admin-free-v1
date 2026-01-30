import { User, SubscriptionTier } from '@/types/erp';

export const mockPlatformUsers: User[] = [
  {
    id: 'user-1',
    name: 'Super Admin',
    email: 'admin@temple.org',
    role: 'super_admin',
    subscriptionTier: 'premium',
  },
  {
    id: 'user-2',
    name: 'HR Manager',
    email: 'hr@temple.org',
    role: 'hr_manager',
    subscriptionTier: 'basic',
  },
  {
    id: 'user-3',
    name: 'Priest',
    email: 'priest@temple.org',
    role: 'priest',
    subscriptionTier: 'free',
  },
  {
    id: 'user-4',
    name: 'Finance Officer',
    email: 'finance@temple.org',
    role: 'finance',
    subscriptionTier: 'basic',
  },
  {
    id: 'user-5',
    name: 'Temple Administrator',
    email: 'temple.admin@temple.org',
    role: 'temple_administrator',
    subscriptionTier: 'premium',
  },
];
