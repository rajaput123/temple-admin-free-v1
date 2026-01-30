import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { dummyAssetLocations } from '@/data/assets-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function AssetLocations() {
  const { checkModuleAccess } = usePermissions();
  const [locations] = useState(dummyAssetLocations);

  if (!checkModuleAccess('assets')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Asset Locations"
        description="Manage hierarchical location structure (Temple → Block → Building → Floor → Room → Locker)"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        }
      />

      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              {locations.map(loc => (
                <div key={loc.id} className="p-3 border rounded">
                  <div className="font-medium">{loc.name}</div>
                  <div className="text-sm text-muted-foreground">{loc.fullPath}</div>
                  <div className="text-xs text-muted-foreground mt-1">Type: {loc.type}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
