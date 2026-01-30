import React, { createContext, useContext, useMemo } from 'react';
import {
  getSubscriptionTier,
  getFeatureFlags,
  getModuleAccess,
  getLimits,
  getUsers,
  getRoles,
  getPlatformConfig,
} from '@/lib/platform-config';
import { PlatformConfig } from '@/data/platform-config';
import { User } from '@/types/erp';
import { PlatformRole } from '@/data/platform-roles';

interface PlatformConfigContextType {
  subscriptionTier: PlatformConfig['subscriptionTier'];
  features: PlatformConfig['features'];
  modules: PlatformConfig['modules'];
  limits: PlatformConfig['limits'];
  users: User[];
  roles: PlatformRole[];
  config: PlatformConfig;
}

const PlatformConfigContext = createContext<PlatformConfigContextType | null>(null);

export function PlatformConfigProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => ({
    subscriptionTier: getSubscriptionTier(),
    features: getFeatureFlags(),
    modules: getModuleAccess(),
    limits: getLimits(),
    users: getUsers(),
    roles: getRoles(),
    config: getPlatformConfig(),
  }), []);

  return (
    <PlatformConfigContext.Provider value={value}>
      {children}
    </PlatformConfigContext.Provider>
  );
}

export function usePlatformConfig() {
  const context = useContext(PlatformConfigContext);
  if (!context) {
    throw new Error('usePlatformConfig must be used within a PlatformConfigProvider');
  }
  return context;
}
