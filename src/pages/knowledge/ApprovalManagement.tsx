import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { listCategories, listDocuments } from '@/lib/knowledge-store';
import type { KnowledgeDocument } from '@/types/knowledge';
import { useMemo, useState } from 'react';
import { ApprovalSheet } from '@/components/knowledge/ApprovalSheet';

export default function ApprovalManagement() {
  const categories = listCategories();
  const documents = listDocuments();
  const [selected, setSelected] = useState<KnowledgeDocument | null>(null);
  const [open, setOpen] = useState(false);

  const pending = useMemo(() => documents.filter(d => d.status === 'pending_approval'), [documents]);

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'fileName', label: 'File Name', sortable: true },
    {
      key: 'categoryId',
      label: 'Category',
      render: (value: unknown) => categories.find(c => c.id === value)?.name || value,
    },
    { key: 'uploadedBy', label: 'Uploaded By', sortable: true },
    { key: 'uploadDate', label: 'Upload Date', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: KnowledgeDocument) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelected(row);
            setOpen(true);
          }}
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Approval Management"
        description="Review, approve, reject, and publish knowledge documents"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Knowledge', href: '/knowledge' },
          { label: 'Approvals' },
        ]}
      />
      <div className="p-6">
        <Card className="p-4">
          <div className="text-sm font-semibold text-foreground mb-3">Pending Approval</div>
          <DataTable columns={columns as any} data={pending as any} />
        </Card>
      </div>

      <ApprovalSheet open={open} onOpenChange={setOpen} document={selected} categories={categories} />
    </MainLayout>
  );
}

