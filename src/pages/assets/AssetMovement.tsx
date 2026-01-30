import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { dummyAssetMovements } from '@/data/assets-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function AssetMovement() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();

  if (!checkModuleAccess('assets')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const columns = [
    { key: 'movementNumber', label: 'Movement #' },
    { key: 'date', label: 'Date' },
    { key: 'sourceLocationName', label: 'From' },
    { key: 'destinationLocationName', label: 'To' },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Asset Movement"
        description="Manage asset transfer requests and approval workflows"
        actions={
          checkWriteAccess('asset_movement') && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Movement
            </Button>
          )
        }
      />
      <DataTable data={dummyAssetMovements} columns={columns} />
    </MainLayout>
  );
}
