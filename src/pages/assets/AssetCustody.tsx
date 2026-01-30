import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Edit, UserCheck, X } from 'lucide-react';
import { AssetCustody } from '@/types/assets';
import { CustodyAssignmentModal } from '@/components/assets/CustodyAssignmentModal';
import { dummyAssetCustody, dummyAssets } from '@/data/assets-data';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';

export default function AssetCustody() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const { user } = useAuth();
  const [custody, setCustody] = useState<AssetCustody[]>(dummyAssetCustody);
  const [custodyModalOpen, setCustodyModalOpen] = useState(false);
  const [editingCustody, setEditingCustody] = useState<AssetCustody | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [custodianTypeFilter, setCustodianTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!checkModuleAccess('assets')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const filteredCustody = useMemo(() => {
    return custody.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (custodianTypeFilter !== 'all' && c.custodianType !== custodianTypeFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          c.assetName.toLowerCase().includes(query) ||
          c.custodianName.toLowerCase().includes(query) ||
          c.custodianId.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [custody, statusFilter, custodianTypeFilter, searchQuery]);

  const handleSaveCustody = (data: Partial<AssetCustody>) => {
    if (editingCustody) {
      setCustody(custody.map(c => c.id === editingCustody.id ? { ...c, ...data } : c));
    } else {
      const newCustody: AssetCustody = {
        ...data,
        id: `cust-${Date.now()}`,
        acknowledged: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'user-1',
        createdByName: user?.name || 'User',
      } as AssetCustody;
      setCustody([...custody, newCustody]);
    }
    setEditingCustody(null);
    setCustodyModalOpen(false);
  };

  const handleReleaseCustody = (custodyId: string) => {
    if (confirm('Are you sure you want to release this custody assignment?')) {
      setCustody(custody.map(c => c.id === custodyId ? { ...c, status: 'released' as const } : c));
    }
  };

  const custodyColumns = [
    { key: 'assetName', label: 'Asset Name' },
    {
      key: 'custodianType',
      label: 'Custodian Type',
      render: (_: unknown, row: AssetCustody) => {
        const type = row.custodianType;
        return type.charAt(0).toUpperCase() + type.slice(1);
      },
    },
    { key: 'custodianName', label: 'Custodian' },
    {
      key: 'assignedDate',
      label: 'Assigned Date',
      render: (_: unknown, row: AssetCustody) => new Date(row.assignedDate).toLocaleDateString(),
    },
    {
      key: 'acknowledged',
      label: 'Acknowledged',
      render: (_: unknown, row: AssetCustody) => {
        const acknowledged = row.acknowledged;
        return acknowledged ? (
          <Badge variant="default" className="flex items-center gap-1 w-fit">
            <UserCheck className="h-3 w-3" />
            Yes
          </Badge>
        ) : (
          <Badge variant="secondary">Pending</Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: AssetCustody) => {
        const status = row.status;
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
          active: 'default',
          transferred: 'secondary',
          released: 'outline',
        };
        return <Badge variant={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
      },
    },
  ];

  const activeCustody = custody.filter(c => c.status === 'active').length;
  const pendingAcknowledgment = custody.filter(c => !c.acknowledged && c.status === 'active').length;

  return (
    <MainLayout>
      <PageHeader
        title="Custody Assignment"
        description="Manage asset custody assignments, custodian acknowledgment, and custody transfers"
        actions={
          checkWriteAccess('assets') ? (
            <Button onClick={() => {
              setEditingCustody(null);
              setCustodyModalOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Assign Custody
            </Button>
          ) : null
        }
      />

      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Active Custody Assignments</div>
            <div className="text-2xl font-bold">{activeCustody}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Pending Acknowledgment</div>
            <div className="text-2xl font-bold">{pendingAcknowledgment}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by asset name, custodian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Select value={custodianTypeFilter} onValueChange={setCustodianTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="department">Department</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="committee">Committee</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="transferred">Transferred</SelectItem>
              <SelectItem value="released">Released</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredCustody}
          columns={custodyColumns}
          actions={(row: AssetCustody) => (
            <div className="flex items-center gap-2">
              {checkWriteAccess('assets') && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setEditingCustody(row);
                    setCustodyModalOpen(true);
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {row.status === 'active' && (
                    <Button variant="ghost" size="sm" onClick={() => handleReleaseCustody(row.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        />
      </div>

      {custodyModalOpen && (
        <CustodyAssignmentModal
          open={custodyModalOpen}
          onClose={() => {
            setCustodyModalOpen(false);
            setEditingCustody(null);
          }}
          onSave={handleSaveCustody}
          custody={editingCustody || undefined}
          assets={dummyAssets}
        />
      )}
    </MainLayout>
  );
}
