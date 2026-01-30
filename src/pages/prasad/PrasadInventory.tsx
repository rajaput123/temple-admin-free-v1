import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';
import { PrasadInventory, PrasadBatch } from '@/types/prasad';
import { dummyPrasadInventory } from '@/data/prasad-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function PrasadInventoryPage() {
  const { checkModuleAccess } = usePermissions();
  const [inventory] = useState<PrasadInventory[]>(dummyPrasadInventory);
  const [prasadFilter, setPrasadFilter] = useState<string>('all');
  const [expiryFilter, setExpiryFilter] = useState<string>('all');

  if (!checkModuleAccess('prasad')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const allBatches: PrasadBatch[] = useMemo(() => {
    return inventory.flatMap(inv => inv.batches);
  }, [inventory]);

  const filteredBatches = useMemo(() => {
    return allBatches.filter(batch => {
      if (prasadFilter !== 'all' && batch.prasadId !== prasadFilter) return false;
      if (expiryFilter === 'expiring_soon') {
        const expiryDate = new Date(batch.expiryDate);
        const daysToExpiry = Math.floor((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysToExpiry > 3) return false;
      }
      return true;
    });
  }, [allBatches, prasadFilter, expiryFilter]);

  const columns = [
    { key: 'prasadName', label: 'Prasad', sortable: true },
    { key: 'batchNumber', label: 'Batch ID', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: true },
    { key: 'availableQuantity', label: 'Available', sortable: true },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      render: (_: unknown, batch: PrasadBatch) => {
        const expiryDate = new Date(batch.expiryDate);
        const daysToExpiry = Math.floor((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return (
          <div className="flex items-center gap-2">
            <span>{batch.expiryDate}</span>
            {daysToExpiry <= 3 && (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {daysToExpiry} days
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'qualityGrade',
      label: 'Quality Grade',
      render: (_: unknown, batch: PrasadBatch) => (
        <Badge variant="outline">{batch.qualityGrade}</Badge>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Prasad Inventory"
        description="View finished prasad inventory with batch traceability and expiry tracking"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prasad Inventory</CardTitle>
            <div className="flex gap-2">
              <Select value={prasadFilter} onValueChange={setPrasadFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Prasad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prasad</SelectItem>
                  {inventory.map(inv => (
                    <SelectItem key={inv.prasadId} value={inv.prasadId}>
                      {inv.prasadName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={expiryFilter} onValueChange={setExpiryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Expiry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredBatches}
            columns={columns}
            searchKey="prasadName"
            defaultPageSize={10}
          />
        </CardContent>
      </Card>
    </MainLayout>
  );
}
