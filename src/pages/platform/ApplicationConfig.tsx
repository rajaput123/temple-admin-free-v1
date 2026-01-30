import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PlatformLayout } from '@/components/platform/PlatformLayout';
import { ConfigSection, ConfigSwitch, ConfigInput, ConfigSelect } from '@/components/platform/ConfigSection';
import { usePlatformConfig } from '@/contexts/PlatformConfigContext';
import { SubscriptionTier } from '@/types/erp';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function ApplicationConfig() {
  const { appId } = useParams();
  const { config } = usePlatformConfig();
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    // In real app, this would save to platform API
    console.log('Saving config for app:', appId, localConfig);
  };

  return (
    <PlatformLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Configure settings for application: {appId}
          </p>
        </div>

        <ConfigSection
          title="Subscription & Limits"
          description="Manage subscription tier and data limits"
          onSave={handleSave}
        >
          <ConfigSelect
            label="Subscription Tier"
            value={localConfig.subscriptionTier}
            onChange={(value) => setLocalConfig({ ...localConfig, subscriptionTier: value as SubscriptionTier })}
            options={[
              { value: 'free', label: 'Free' },
              { value: 'basic', label: 'Basic' },
              { value: 'premium', label: 'Premium' },
              { value: 'enterprise', label: 'Enterprise' },
            ]}
          />
          <ConfigInput
            label="Max Users"
            value={localConfig.limits.maxUsers}
            onChange={(value) => setLocalConfig({ ...localConfig, limits: { ...localConfig.limits, maxUsers: parseInt(value) || 0 } })}
            type="number"
          />
          <ConfigInput
            label="Max Employees"
            value={localConfig.limits.maxEmployees}
            onChange={(value) => setLocalConfig({ ...localConfig, limits: { ...localConfig.limits, maxEmployees: parseInt(value) || 0 } })}
            type="number"
          />
          <ConfigInput
            label="Max Temples"
            value={localConfig.limits.maxTemples}
            onChange={(value) => setLocalConfig({ ...localConfig, limits: { ...localConfig.limits, maxTemples: parseInt(value) || 0 } })}
            type="number"
          />
        </ConfigSection>

        <ConfigSection
          title="Feature Flags"
          description="Enable or disable features"
          onSave={handleSave}
        >
          <ConfigSwitch
            label="Bulk Operations"
            description="Allow bulk import/export operations"
            checked={localConfig.features.bulkOperations}
            onCheckedChange={(checked) => setLocalConfig({ ...localConfig, features: { ...localConfig.features, bulkOperations: checked } })}
          />
          <ConfigSwitch
            label="Advanced Reports"
            description="Enable advanced reporting features"
            checked={localConfig.features.advancedReports}
            onCheckedChange={(checked) => setLocalConfig({ ...localConfig, features: { ...localConfig.features, advancedReports: checked } })}
          />
          <ConfigSwitch
            label="Approval Workflows"
            description="Enable multi-level approval workflows"
            checked={localConfig.features.approvalWorkflows}
            onCheckedChange={(checked) => setLocalConfig({ ...localConfig, features: { ...localConfig.features, approvalWorkflows: checked } })}
          />
          <ConfigSwitch
            label="Document Uploads"
            description="Allow document uploads"
            checked={localConfig.features.documentUploads}
            onCheckedChange={(checked) => setLocalConfig({ ...localConfig, features: { ...localConfig.features, documentUploads: checked } })}
          />
          <ConfigSwitch
            label="Custom Fields"
            description="Allow custom fields on entities"
            checked={localConfig.features.customFields}
            onCheckedChange={(checked) => setLocalConfig({ ...localConfig, features: { ...localConfig.features, customFields: checked } })}
          />
          <ConfigSwitch
            label="Audit Trail"
            description="Track all changes with audit logs"
            checked={localConfig.features.auditTrail}
            onCheckedChange={(checked) => setLocalConfig({ ...localConfig, features: { ...localConfig.features, auditTrail: checked } })}
          />
          <ConfigSwitch
            label="Data Export"
            description="Allow CSV/Excel exports"
            checked={localConfig.features.dataExport}
            onCheckedChange={(checked) => setLocalConfig({ ...localConfig, features: { ...localConfig.features, dataExport: checked } })}
          />
          <ConfigSwitch
            label="Email Notifications"
            description="Send email notifications"
            checked={localConfig.features.emailNotifications}
            onCheckedChange={(checked) => setLocalConfig({ ...localConfig, features: { ...localConfig.features, emailNotifications: checked } })}
          />
        </ConfigSection>

        <ConfigSection
          title="Module Access"
          description="Control module visibility and access"
          onSave={handleSave}
        >
          {Object.entries(localConfig.modules).map(([moduleId, moduleConfig]) => (
            <div key={moduleId} className="flex items-center justify-between">
              <div>
                <Label className="capitalize">{moduleId}</Label>
                <p className="text-sm text-muted-foreground">
                  {moduleConfig.enabled ? 'Enabled' : 'Disabled'}
                  {moduleConfig.readOnly && ' (Read-only)'}
                </p>
              </div>
              <Switch
                checked={moduleConfig.enabled}
                onCheckedChange={(checked) => {
                  setLocalConfig({
                    ...localConfig,
                    modules: {
                      ...localConfig.modules,
                      [moduleId]: { ...moduleConfig, enabled: checked },
                    },
                  });
                }}
              />
            </div>
          ))}
        </ConfigSection>
      </div>
    </PlatformLayout>
  );
}
