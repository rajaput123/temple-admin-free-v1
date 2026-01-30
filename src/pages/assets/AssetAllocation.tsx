import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { dummyAssetAllocations } from '@/data/assets-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function AssetAllocation() {
  const { checkModuleAccess } = usePermissions();

  if (!checkModuleAccess('assets')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const columns = [
    { key: 'assetName', label: 'Asset Name' },
    { key: 'allocationType', label: 'Type' },
    { key: 'allocatedToName', label: 'Allocated To' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'issuedDate', label: 'Issued Date' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Asset Allocation"
        description="Track asset assignment and usage"
      />
      <DataTable data={dummyAssetAllocations} columns={columns} />
    </MainLayout>
  );
}
