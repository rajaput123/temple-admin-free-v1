import { SubscriptionTier } from '@/types/erp';

export interface PlatformConfig {
  subscriptionTier: SubscriptionTier;
  limits: {
    maxUsers: number;
    maxEmployees: number;
    maxTemples: number;
    maxItems: number;
    maxBookingsPerDay: number;
  };
  features: {
    bulkOperations: boolean;
    advancedReports: boolean;
    approvalWorkflows: boolean;
    documentUploads: boolean;
    customFields: boolean;
    auditTrail: boolean;
    dataExport: boolean;
    emailNotifications: boolean;
  };
  modules: {
    [key: string]: {
      enabled: boolean;
      readOnly?: boolean;
      limit?: number;
    };
  };
}

export const mockPlatformConfig: PlatformConfig = {
  subscriptionTier: 'free',
  limits: {
    maxUsers: 5,
    maxEmployees: 25,
    maxTemples: 3,
    maxItems: 50,
    maxBookingsPerDay: 50,
  },
  features: {
    bulkOperations: false,
    advancedReports: false,
    approvalWorkflows: false,
    documentUploads: false,
    customFields: false,
    auditTrail: false,
    dataExport: false,
    emailNotifications: false,
  },
  modules: {
    hr: { enabled: true, readOnly: false },
    structure: { enabled: true, readOnly: false },
    rituals: { enabled: true, readOnly: true },
    seva: { enabled: true, readOnly: false, limit: 1 },
    inventory: { enabled: true, readOnly: true, limit: 50 },
    kitchen: { enabled: false },
    prasad: { enabled: false },
    assets: { enabled: false },
    pr: { enabled: true },
    projects: { enabled: true },
    crm: { enabled: false },
  },
};
