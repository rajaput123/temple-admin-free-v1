import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { KpiCards } from '@/components/knowledge/KpiCards';
import { ActivityTimeline } from '@/components/knowledge/ActivityTimeline';
import { getKnowledgeState } from '@/lib/knowledge-store';
import { useMemo } from 'react';
import type { KnowledgeDocument } from '@/types/knowledge';

export default function KnowledgeDashboard() {
  const state = getKnowledgeState();

  const kpis = useMemo(() => {
    const totalCategories = state.categories.length;
    const totalDocuments = state.documents.length;
    const processing = state.documents.filter(d => d.status === 'processing' || d.status === 'uploaded').length;
    const pendingApproval = state.documents.filter(d => d.status === 'pending_approval').length;
    const approved = state.documents.filter(d => d.status === 'approved').length;
    const published = state.documents.filter(d => d.status === 'published').length;
    const rejected = state.documents.filter(d => d.status === 'rejected').length;
    return { totalCategories, totalDocuments, processing, pendingApproval, approved, published, rejected };
  }, [state.categories.length, state.documents]);

  const recentUploads = useMemo(() => {
    return [...state.documents]
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
      .slice(0, 5);
  }, [state.documents]);

  const recentApprovals = useMemo(() => {
    return [...state.documents]
      .filter(d => d.approval)
      .sort((a, b) => (b.approval?.reviewedAt || '').localeCompare(a.approval?.reviewedAt || ''))
      .slice(0, 5);
  }, [state.documents]);

  const docColumns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'uploadedBy', label: 'Uploaded By', sortable: true },
    { key: 'uploadDate', label: 'Upload Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  const approvalColumns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'approval', label: 'Reviewed', render: (_: unknown, row: KnowledgeDocument) => row.approval ? new Date(row.approval.reviewedAt).toLocaleString('en-IN') : '-' },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Knowledge Dashboard"
        description="Overview of categories, documents, approvals, and AI usage"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Knowledge', href: '/knowledge' },
          { label: 'Dashboard' },
        ]}
      />
      <div className="p-6 space-y-6">
        <KpiCards kpis={kpis} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-4">
              <div className="text-sm font-semibold text-foreground mb-3">Recent Uploads</div>
              <DataTable columns={docColumns as any} data={recentUploads as any} />
            </Card>

            <Card className="p-4">
              <div className="text-sm font-semibold text-foreground mb-3">Recent Approvals</div>
              <DataTable columns={approvalColumns as any} data={recentApprovals as any} />
            </Card>
          </div>

          <Card className="p-4">
            <div className="text-sm font-semibold text-foreground mb-3">Activity Timeline</div>
            <ActivityTimeline events={state.activity} />

            <div className="mt-6 border-t border-border pt-4">
              <div className="text-sm font-semibold text-foreground mb-2">AI Usage (mock)</div>
              <div className="text-xs text-muted-foreground">Total Beta Chats: {state.aiUsage.totalBetaChats}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Devotee Chats: {state.aiUsage.totalDevoteeChats}</div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

