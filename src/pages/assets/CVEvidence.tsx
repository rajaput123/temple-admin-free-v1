import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { dummyCVEvidence } from '@/data/assets-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function CVEvidence() {
  const { checkModuleAccess } = usePermissions();

  if (!checkModuleAccess('assets')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const columns = [
    { key: 'assetName', label: 'Asset' },
    { key: 'eventType', label: 'Event Type' },
    { key: 'comparisonResult', label: 'Result' },
    { key: 'similarityScore', label: 'Similarity %' },
    { key: 'alertLevel', label: 'Alert Level' },
    { key: 'capturedAt', label: 'Captured At' },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="CV Evidence"
        description="Visual fingerprint gallery and comparison results"
      />
      <DataTable data={dummyCVEvidence} columns={columns} />
    </MainLayout>
  );
}
