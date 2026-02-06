import { Card } from '@/components/ui/card';

export interface KnowledgeKpis {
  totalCategories: number;
  totalDocuments: number;
  processing: number;
  pendingApproval: number;
  approved: number;
  published: number;
  rejected: number;
}

export function KpiCards({ kpis }: { kpis: KnowledgeKpis }) {
  const items = [
    { label: 'Total Categories', value: kpis.totalCategories },
    { label: 'Total Documents', value: kpis.totalDocuments },
    { label: 'Processing', value: kpis.processing },
    { label: 'Pending Approval', value: kpis.pendingApproval },
    { label: 'Approved', value: kpis.approved },
    { label: 'Published', value: kpis.published },
    { label: 'Rejected', value: kpis.rejected },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
      {items.map((it) => (
        <Card key={it.label} className="p-4">
          <div className="text-xs text-muted-foreground">{it.label}</div>
          <div className="text-2xl font-semibold text-foreground mt-1">{it.value}</div>
        </Card>
      ))}
    </div>
  );
}

