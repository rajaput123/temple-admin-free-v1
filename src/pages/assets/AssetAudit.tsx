import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { dummyAssetAudits } from '@/data/assets-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function AssetAudit() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();

  if (!checkModuleAccess('assets')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const columns = [
    { key: 'auditNumber', label: 'Audit #' },
    { key: 'date', label: 'Date' },
    { key: 'auditType', label: 'Type' },
    { key: 'categoryFilter', label: 'Category' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Asset Audit & Verification"
        description="Periodic verification with CV-assisted comparison"
        actions={
          checkWriteAccess('asset_audit') && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Audit
            </Button>
          )
        }
      />
      <DataTable data={dummyAssetAudits} columns={columns} />
    </MainLayout>
  );
}
