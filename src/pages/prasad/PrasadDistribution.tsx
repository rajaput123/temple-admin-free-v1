import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { PrasadDistribution } from '@/types/prasad';
import { DistributionModal } from '@/components/prasad/DistributionModal';
import { dummyPrasadDistributions, dummyPrasadMaster, dummyPrasadInventory } from '@/data/prasad-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function PrasadDistributionPage() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [distributions, setDistributions] = useState<PrasadDistribution[]>(dummyPrasadDistributions);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDistribution, setEditingDistribution] = useState<PrasadDistribution | null>(null);
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!checkModuleAccess('prasad_distribution')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const filteredDistributions = useMemo(() => {
    return distributions.filter(dist => {
      if (channelFilter !== 'all' && dist.channel !== channelFilter) return false;
      if (statusFilter !== 'all' && dist.status !== statusFilter) return false;
      return true;
    });
  }, [distributions, channelFilter, statusFilter]);

  const handleSave = (data: Partial<PrasadDistribution>) => {
    if (editingDistribution) {
      setDistributions(distributions.map(d => d.id === editingDistribution.id ? { ...d, ...data } : d));
    } else {
      const newDist: PrasadDistribution = {
        ...data,
        id: `dist-${Date.now()}`,
        distributionNumber: `DIST-${Date.now()}`,
        createdAt: new Date().toISOString(),
        allocatedBy: 'user-1',
        allocatedByName: 'Current User',
      } as PrasadDistribution;
      setDistributions([...distributions, newDist]);
    }
    setEditingDistribution(null);
    setModalOpen(false);
  };

  const getStatusBadge = (status: PrasadDistribution['status']) => {
    switch (status) {
      case 'dispatched':
        return <Badge variant="default" className="bg-blue-500">Dispatched</Badge>;
      case 'collected':
        return <Badge variant="default" className="bg-green-500">Collected</Badge>;
      case 'returned':
        return <Badge variant="destructive">Returned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns = [
    { key: 'distributionNumber', label: 'Distribution ID', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    {
      key: 'channel',
      label: 'Channel',
      render: (_: unknown, dist: PrasadDistribution) => (
        <Badge variant="outline">{dist.channel}</Badge>
      ),
    },
    { key: 'prasadName', label: 'Prasad', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, dist: PrasadDistribution) => getStatusBadge(dist.status),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Prasad Distribution"
        description="Manage prasad distribution to counters, VIP, Annadanam, and external events"
        actions={
          checkWriteAccess('prasad_distribution') ? (
            <Button onClick={() => {
              setEditingDistribution(null);
              setModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Distribution
            </Button>
          ) : null
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Distributions</CardTitle>
            <div className="flex gap-2">
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="counter">Counter</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="annadanam">Annadanam</SelectItem>
                  <SelectItem value="external_event">External Event</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="allocated">Allocated</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="collected">Collected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredDistributions}
            columns={columns}
            searchKey="prasadName"
            defaultPageSize={10}
          />
        </CardContent>
      </Card>

      {modalOpen && (
        <DistributionModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          distribution={editingDistribution}
          prasadMaster={dummyPrasadMaster}
          prasadInventory={dummyPrasadInventory}
          onSave={handleSave}
        />
      )}
    </MainLayout>
  );
}
