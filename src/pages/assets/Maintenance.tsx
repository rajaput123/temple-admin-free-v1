import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { dummyMaintenanceRecords, dummyAMCContracts } from '@/data/assets-data';
import { usePermissions } from '@/hooks/usePermissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Maintenance() {
  const { checkModuleAccess } = usePermissions();

  if (!checkModuleAccess('assets')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const maintenanceColumns = [
    { key: 'maintenanceNumber', label: 'Maintenance #' },
    { key: 'assetName', label: 'Asset' },
    { key: 'maintenanceType', label: 'Type' },
    { key: 'actualDate', label: 'Date' },
    { key: 'cost', label: 'Cost' },
    { key: 'status', label: 'Status' },
  ];

  const amcColumns = [
    { key: 'contractNumber', label: 'Contract #' },
    { key: 'assetName', label: 'Asset' },
    { key: 'vendorName', label: 'Vendor' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Maintenance & AMC"
        description="Track preventive maintenance, AMC contracts, and repair requests"
      />
      <Tabs defaultValue="maintenance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="maintenance">Maintenance Records</TabsTrigger>
          <TabsTrigger value="amc">AMC Contracts</TabsTrigger>
        </TabsList>
        <TabsContent value="maintenance">
          <DataTable data={dummyMaintenanceRecords} columns={maintenanceColumns} />
        </TabsContent>
        <TabsContent value="amc">
          <DataTable data={dummyAMCContracts} columns={amcColumns} />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
