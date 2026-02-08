import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { dummyMaintenanceRecords, dummyAMCContracts } from '@/data/assets-data';
import { usePermissions } from '@/hooks/usePermissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStoredAssets, updateAsset } from '@/lib/assets/asset-store';
import type { MaintenanceRecord, AMCContract } from '@/types/assets';
import { MaintenanceRecordModal } from '@/components/assets/MaintenanceRecordModal';
import { AMCContractModal } from '@/components/assets/AMCContractModal';
import { Plus, Edit, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAINTENANCE_STORAGE_KEY = 'asset_maintenance_records';
const AMC_STORAGE_KEY = 'asset_amc_contracts';

function getStoredMaintenanceRecords(): MaintenanceRecord[] {
  try {
    const stored = localStorage.getItem(MAINTENANCE_STORAGE_KEY);
    if (!stored) return dummyMaintenanceRecords;
    return JSON.parse(stored);
  } catch {
    return dummyMaintenanceRecords;
  }
}

function saveMaintenanceRecords(records: MaintenanceRecord[]): void {
  try {
    localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Error saving maintenance records:', error);
  }
}

function getStoredAMCContracts(): AMCContract[] {
  try {
    const stored = localStorage.getItem(AMC_STORAGE_KEY);
    if (!stored) return dummyAMCContracts;
    return JSON.parse(stored);
  } catch {
    return dummyAMCContracts;
  }
}

function saveAMCContracts(contracts: AMCContract[]): void {
  try {
    localStorage.setItem(AMC_STORAGE_KEY, JSON.stringify(contracts));
  } catch (error) {
    console.error('Error saving AMC contracts:', error);
  }
}

export default function Maintenance() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(getStoredMaintenanceRecords());
  const [amcContracts, setAmcContracts] = useState<AMCContract[]>(getStoredAMCContracts());
  const [assets, setAssets] = useState(getStoredAssets());
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceRecord | null>(null);
  const [amcModalOpen, setAmcModalOpen] = useState(false);
  const [editingAMC, setEditingAMC] = useState<AMCContract | null>(null);
  const [activeTab, setActiveTab] = useState('maintenance');
  
  // Filters
  const [maintenanceSearch, setMaintenanceSearch] = useState('');
  const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState('all');
  const [maintenanceTypeFilter, setMaintenanceTypeFilter] = useState('all');
  const [amcSearch, setAmcSearch] = useState('');
  const [amcStatusFilter, setAmcStatusFilter] = useState('all');

  // Load assets from localStorage on mount and when page becomes visible
  useEffect(() => {
    const loadData = () => {
      const storedAssets = getStoredAssets();
      setAssets(storedAssets);
      // Reload maintenance records and AMC contracts
      setMaintenanceRecords(getStoredMaintenanceRecords());
      setAmcContracts(getStoredAMCContracts());
    };
    
    loadData();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', loadData);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', loadData);
    };
  }, []);

  // Filtered maintenance records
  const filteredMaintenance = useMemo(() => {
    return maintenanceRecords.filter(record => {
      if (maintenanceStatusFilter !== 'all' && record.status !== maintenanceStatusFilter) return false;
      if (maintenanceTypeFilter !== 'all' && record.maintenanceType !== maintenanceTypeFilter) return false;
      if (maintenanceSearch) {
        const query = maintenanceSearch.toLowerCase();
        return (
          record.maintenanceNumber.toLowerCase().includes(query) ||
          record.assetName.toLowerCase().includes(query) ||
          record.assetCode.toLowerCase().includes(query) ||
          record.vendorName?.toLowerCase().includes(query) ||
          record.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [maintenanceRecords, maintenanceStatusFilter, maintenanceTypeFilter, maintenanceSearch]);

  // Filtered AMC contracts
  const filteredAMC = useMemo(() => {
    return amcContracts.filter(contract => {
      if (amcStatusFilter !== 'all' && contract.status !== amcStatusFilter) return false;
      if (amcSearch) {
        const query = amcSearch.toLowerCase();
        return (
          contract.contractNumber.toLowerCase().includes(query) ||
          contract.assetName.toLowerCase().includes(query) ||
          contract.assetCode.toLowerCase().includes(query) ||
          contract.vendorName.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [amcContracts, amcStatusFilter, amcSearch]);

  // Summary statistics
  const maintenanceStats = useMemo(() => {
    const pending = maintenanceRecords.filter(r => r.status === 'scheduled' || r.status === 'in_progress').length;
    const completed = maintenanceRecords.filter(r => r.status === 'completed').length;
    const overdue = maintenanceRecords.filter(r => {
      if (r.status === 'scheduled' && r.scheduledDate) {
        return new Date(r.scheduledDate) < new Date();
      }
      return false;
    }).length;
    const totalCost = maintenanceRecords
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.cost, 0);
    return { pending, completed, overdue, totalCost };
  }, [maintenanceRecords]);

  const amcStats = useMemo(() => {
    const active = amcContracts.filter(c => c.status === 'active').length;
    const expiringSoon = amcContracts.filter(c => {
      if (c.status === 'active' && c.endDate) {
        const daysUntilExpiry = Math.ceil(
          (new Date(c.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      }
      return false;
    }).length;
    const expired = amcContracts.filter(c => c.status === 'expired').length;
    return { active, expiringSoon, expired };
  }, [amcContracts]);

  const handleSaveMaintenance = (data: Partial<MaintenanceRecord>) => {
    if (editingMaintenance) {
      const updated = maintenanceRecords.map(r =>
        r.id === editingMaintenance.id ? { ...r, ...data } : r
      );
      setMaintenanceRecords(updated);
      saveMaintenanceRecords(updated);
    } else {
      const newRecord: MaintenanceRecord = {
        ...data,
        id: data.id || `maint-${Date.now()}`,
        createdAt: data.createdAt || new Date().toISOString(),
      } as MaintenanceRecord;
      const updated = [...maintenanceRecords, newRecord];
      setMaintenanceRecords(updated);
      saveMaintenanceRecords(updated);
    }

    // Update asset maintenance dates if completed
    if (data.status === 'completed' && data.assetId) {
      updateAsset(data.assetId, {
        lastMaintenanceDate: data.actualDate,
        nextMaintenanceDate: data.nextMaintenanceDate,
      });
      setAssets(getStoredAssets());
    }

    setEditingMaintenance(null);
    setMaintenanceModalOpen(false);
  };

  const handleSaveAMC = (data: Partial<AMCContract>) => {
    if (editingAMC) {
      const updated = amcContracts.map(c =>
        c.id === editingAMC.id ? { ...c, ...data } : c
      );
      setAmcContracts(updated);
      saveAMCContracts(updated);
    } else {
      const newContract: AMCContract = {
        ...data,
        id: data.id || `amc-${Date.now()}`,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as AMCContract;
      const updated = [...amcContracts, newContract];
      setAmcContracts(updated);
      saveAMCContracts(updated);
    }

    setEditingAMC(null);
    setAmcModalOpen(false);
  };

  if (!checkModuleAccess('assets')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const maintenanceColumns = [
    { key: 'maintenanceNumber', label: 'Maintenance #' },
    {
      key: 'assetName',
      label: 'Asset',
      render: (_: unknown, row: MaintenanceRecord) => (
        <div>
          <div className="font-medium">{row.assetCode}</div>
          <div className="text-xs text-muted-foreground">{row.assetName}</div>
        </div>
      ),
    },
    {
      key: 'maintenanceType',
      label: 'Type',
      render: (_: unknown, row: MaintenanceRecord) => (
        <Badge variant="outline" className="capitalize">
          {row.maintenanceType}
        </Badge>
      ),
    },
    {
      key: 'actualDate',
      label: 'Date',
      render: (_: unknown, row: MaintenanceRecord) => (
        <div>
          <div>{new Date(row.actualDate).toLocaleDateString()}</div>
          {row.scheduledDate && (
            <div className="text-xs text-muted-foreground">
              Scheduled: {new Date(row.scheduledDate).toLocaleDateString()}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'vendorName',
      label: 'Vendor',
      render: (_: unknown, row: MaintenanceRecord) => (
        <div className="text-sm">{row.vendorName || '-'}</div>
      ),
    },
    {
      key: 'cost',
      label: 'Cost',
      render: (_: unknown, row: MaintenanceRecord) => (
        <div className="font-medium">₹{row.cost.toLocaleString()}</div>
      ),
    },
    {
      key: 'nextMaintenanceDate',
      label: 'Next Date',
      render: (_: unknown, row: MaintenanceRecord) => (
        <div className="text-sm">
          {row.nextMaintenanceDate ? new Date(row.nextMaintenanceDate).toLocaleDateString() : '-'}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: MaintenanceRecord) => {
        const variant =
          row.status === 'completed' ? 'bg-green-500 text-white' :
          row.status === 'in_progress' ? 'bg-blue-500 text-white' :
          row.status === 'scheduled' ? 'bg-yellow-500 text-black' :
          'bg-gray-500 text-white';
        return (
          <Badge className={cn('capitalize', variant)}>
            {row.status.replace('_', ' ')}
          </Badge>
        );
      },
    },
  ];

  const amcColumns = [
    { key: 'contractNumber', label: 'Contract #' },
    {
      key: 'assetName',
      label: 'Asset',
      render: (_: unknown, row: AMCContract) => (
        <div>
          <div className="font-medium">{row.assetCode}</div>
          <div className="text-xs text-muted-foreground">{row.assetName}</div>
        </div>
      ),
    },
    { key: 'vendorName', label: 'Vendor' },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (_: unknown, row: AMCContract) => new Date(row.startDate).toLocaleDateString(),
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (_: unknown, row: AMCContract) => {
        const isExpiringSoon = new Date(row.endDate).getTime() - new Date().getTime() <= 30 * 24 * 60 * 60 * 1000;
        return (
          <div className={cn(isExpiringSoon && row.status === 'active' ? 'text-orange-600 font-medium' : '')}>
            {new Date(row.endDate).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      key: 'contractValue',
      label: 'Value',
      render: (_: unknown, row: AMCContract) => (
        <div className="font-medium">₹{row.contractValue.toLocaleString()}</div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: AMCContract) => {
        const variant =
          row.status === 'active' ? 'bg-green-500 text-white' :
          row.status === 'expired' ? 'bg-red-500 text-white' :
          'bg-gray-500 text-white';
        return (
          <Badge className={cn('capitalize', variant)}>
            {row.status}
          </Badge>
        );
      },
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Maintenance & AMC"
        description="Track preventive maintenance, AMC contracts, and repair requests"
        actions={
          checkWriteAccess('assets') && (
            <Button
              onClick={() => {
                if (activeTab === 'maintenance') {
                  setEditingMaintenance(null);
                  setMaintenanceModalOpen(true);
                } else {
                  setEditingAMC(null);
                  setAmcModalOpen(true);
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === 'maintenance' ? 'New Maintenance' : 'New AMC Contract'}
            </Button>
          )
        }
      />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="maintenance">Maintenance Records</TabsTrigger>
          <TabsTrigger value="amc">AMC Contracts</TabsTrigger>
        </TabsList>
        <TabsContent value="maintenance" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Pending Maintenance</div>
                <div className="text-2xl font-bold">{maintenanceStats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold text-green-600">{maintenanceStats.completed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Overdue</div>
                <div className="text-2xl font-bold text-red-600">{maintenanceStats.overdue}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Cost</div>
                <div className="text-2xl font-bold">₹{maintenanceStats.totalCost.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by maintenance #, asset, vendor..."
              value={maintenanceSearch}
              onChange={(e) => setMaintenanceSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={maintenanceStatusFilter} onValueChange={setMaintenanceStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={maintenanceTypeFilter} onValueChange={setMaintenanceTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="preventive">Preventive</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="amc">AMC Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <DataTable
            data={filteredMaintenance}
            columns={maintenanceColumns}
            actions={(row: MaintenanceRecord) => (
              <div className="flex items-center gap-2">
                {checkWriteAccess('assets') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingMaintenance(row);
                      setMaintenanceModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {row.status !== 'completed' && checkWriteAccess('assets') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updated = maintenanceRecords.map(r =>
                        r.id === row.id ? { ...r, status: 'completed' as const } : r
                      );
                      setMaintenanceRecords(updated);
                      saveMaintenanceRecords(updated);
                      if (row.assetId) {
                        updateAsset(row.assetId, {
                          lastMaintenanceDate: row.actualDate,
                          nextMaintenanceDate: row.nextMaintenanceDate,
                        });
                        setAssets(getStoredAssets());
                      }
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </Button>
                )}
              </div>
            )}
          />
        </TabsContent>
        <TabsContent value="amc" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Active Contracts</div>
                <div className="text-2xl font-bold text-green-600">{amcStats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Expiring Soon (30 days)</div>
                <div className="text-2xl font-bold text-orange-600">{amcStats.expiringSoon}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Expired</div>
                <div className="text-2xl font-bold text-red-600">{amcStats.expired}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by contract #, asset, vendor..."
              value={amcSearch}
              onChange={(e) => setAmcSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={amcStatusFilter} onValueChange={setAmcStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <DataTable
            data={filteredAMC}
            columns={amcColumns}
            actions={(row: AMCContract) => (
              <div className="flex items-center gap-2">
                {checkWriteAccess('assets') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingAMC(row);
                      setAmcModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {maintenanceModalOpen && (
        <MaintenanceRecordModal
          open={maintenanceModalOpen}
          onOpenChange={setMaintenanceModalOpen}
          record={editingMaintenance || undefined}
          assets={assets}
          onSave={handleSaveMaintenance}
        />
      )}

      {amcModalOpen && (
        <AMCContractModal
          open={amcModalOpen}
          onOpenChange={setAmcModalOpen}
          contract={editingAMC || undefined}
          assets={assets}
          onSave={handleSaveAMC}
        />
      )}
    </MainLayout>
  );
}
