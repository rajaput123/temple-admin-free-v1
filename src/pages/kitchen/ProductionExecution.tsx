import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, CheckCircle, Clock, XCircle } from 'lucide-react';
import { ProductionBatch } from '@/types/kitchen';
import { ProductionBatchModal } from '@/components/kitchen/ProductionBatchModal';
import { dummyProductionBatches, dummyRecipes } from '@/data/kitchen-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function ProductionExecution() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [batches, setBatches] = useState<ProductionBatch[]>(dummyProductionBatches);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ProductionBatch | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!checkModuleAccess('production')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const filteredBatches = useMemo(() => {
    return batches.filter(batch => {
      if (statusFilter !== 'all' && batch.status !== statusFilter) return false;
      return true;
    });
  }, [batches, statusFilter]);

  const handleSaveBatch = (data: Partial<ProductionBatch>) => {
    if (editingBatch) {
      setBatches(batches.map(b => b.id === editingBatch.id ? { ...b, ...data } : b));
    }
    setEditingBatch(null);
    setBatchModalOpen(false);
  };

  const getStatusBadge = (status: ProductionBatch['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-500"><Play className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'quality_check':
        return <Badge variant="default" className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Quality Check</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const batchColumns = [
    { key: 'batchId', label: 'Batch ID', sortable: true },
    { key: 'recipeName', label: 'Recipe', sortable: true },
    { key: 'plannedQuantity', label: 'Planned Qty', sortable: true },
    { key: 'actualQuantity', label: 'Actual Qty', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, batch: ProductionBatch) => getStatusBadge(batch.status),
    },
    {
      key: 'qualityCheck',
      label: 'Quality Check',
      render: (_: unknown, batch: ProductionBatch) => {
        const qc = batch.qualityChecks[batch.qualityChecks.length - 1];
        return qc ? (
          qc.overallStatus === 'pass' ? (
            <Badge variant="default" className="bg-green-500">Pass</Badge>
          ) : (
            <Badge variant="destructive">Fail</Badge>
          )
        ) : (
          <Badge variant="outline">Pending</Badge>
        );
      },
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Production Execution"
        description="Execute production batches with quality checks and completion certification"
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Production Batches</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="started">Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="quality_check">Quality Check</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredBatches}
              columns={batchColumns}
              searchKey="batchId"
              defaultPageSize={10}
              onRowClick={(batch) => {
                setEditingBatch(batch);
                setBatchModalOpen(true);
              }}
            />
          </CardContent>
        </Card>
      </div>

      {batchModalOpen && (
        <ProductionBatchModal
          open={batchModalOpen}
          onOpenChange={setBatchModalOpen}
          batch={editingBatch}
          recipes={dummyRecipes}
          onSave={handleSaveBatch}
        />
      )}
    </MainLayout>
  );
}
