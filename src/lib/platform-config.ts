import { mockPlatformConfig } from '@/data/platform-config';
import { mockPlatformUsers } from '@/data/platform-users';
import { mockPlatformRoles } from '@/data/platform-roles';
import { PlatformConfig } from '@/data/platform-config';
import { User } from '@/types/erp';
import { PlatformRole } from '@/data/platform-roles';

export function getSubscriptionTier(): PlatformConfig['subscriptionTier'] {
  return mockPlatformConfig.subscriptionTier;
}

export function getFeatureFlags(): PlatformConfig['features'] {
  return mockPlatformConfig.features;
}

export function getModuleAccess(): PlatformConfig['modules'] {
  return mockPlatformConfig.modules;
}

export function getLimits(): PlatformConfig['limits'] {
  return mockPlatformConfig.limits;
}

export function getUsers(): User[] {
  return mockPlatformUsers;
}

export function getRoles(): PlatformRole[] {
  return mockPlatformRoles;
}

export function getPlatformConfig(): PlatformConfig {
  return mockPlatformConfig;
}
