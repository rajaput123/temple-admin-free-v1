import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { listCategories, listDocuments } from '@/lib/knowledge-store';
import type { KnowledgeCategory, KnowledgeDocument } from '@/types/knowledge';
import { DocumentDetailSheet } from '@/components/knowledge/DocumentDetailSheet';
import { UploadCard } from '@/components/knowledge/UploadCard';

function getStatusBadge(status: KnowledgeDocument['status']) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20' },
    uploaded: { label: 'Uploaded', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20' },
    processing: { label: 'Processing', className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20' },
    pending_approval: { label: 'Pending Approval', className: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20' },
    approved: { label: 'Approved', className: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20' },
    published: { label: 'Published', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' },
    rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20' },
  };

  const config = statusConfig[status] || statusConfig.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function KnowledgeDocuments() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const categories = listCategories();
  const documents = listDocuments();

  const [query, setQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const categoryId = params.get('categoryId') || 'all';
  const statusFilter = params.get('status') || 'all';

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      if (categoryId !== 'all' && d.categoryId !== categoryId) return false;
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !d.title.toLowerCase().includes(q) &&
          !d.fileName.toLowerCase().includes(q) &&
          !d.uploadedBy.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [documents, query, categoryId, statusFilter]);

  const columns = [
    { 
      key: 'title', 
      label: 'Title', 
      sortable: true,
      render: (_: unknown, row: KnowledgeDocument) => (
        <div className="font-medium text-foreground">{row.title}</div>
      ),
    },
    {
      key: 'categoryId',
      label: 'Category',
      sortable: true,
      render: (value: unknown) => (
        <span className="text-sm text-muted-foreground">
          {categories.find((c) => c.id === value)?.name || value}
        </span>
      ),
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (_: unknown, row: KnowledgeDocument) => getStatusBadge(row.status),
    },
    { 
      key: 'uploadDate', 
      label: 'Date', 
      sortable: true,
      render: (value: unknown) => (
        <span className="text-sm text-muted-foreground">{String(value)}</span>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Knowledge Management"
        description="Upload and manage documents, AI processing, and approvals"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Knowledge', href: '/knowledge' },
          { label: 'Knowledge Management' },
        ]}
      />
      <div className="p-6 space-y-6">
        {/* Upload Card */}
        <UploadCard />

        {/* Search */}
        <div className="flex items-center gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, file name, or user…"
            className="max-w-md"
          />
        </div>

        {/* Documents Table */}
        <DataTable 
          columns={columns as any} 
          data={filtered as any}
          onRowClick={(row: KnowledgeDocument) => {
            setSelectedDoc(row);
            setDetailOpen(true);
          }}
        />
      </div>

      <DocumentDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        document={selectedDoc}
        categories={categories as KnowledgeCategory[]}
      />
    </MainLayout>
  );
}

