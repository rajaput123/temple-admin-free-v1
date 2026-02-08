import { useState, useMemo, useCallback, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, CheckCircle, XCircle, Eye, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Asset } from '@/types/assets';
import { DisposalRequestModal } from '@/components/assets/DisposalRequestModal';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { getStoredAssets, updateAsset } from '@/lib/assets/asset-store';

export default function AssetDisposal() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>(getStoredAssets());
  const [disposalModalOpen, setDisposalModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load assets from localStorage on mount and when page becomes visible
  useEffect(() => {
    const loadAssets = () => {
      const storedAssets = getStoredAssets();
      setAssets(storedAssets);
    };
    
    loadAssets();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadAssets();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', loadAssets);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', loadAssets);
    };
  }, []);

  if (!checkModuleAccess('assets')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  // Get assets with disposal requests
  const disposalAssets = useMemo(() => {
    return assets.filter(a => a.disposalApproval && a.disposalApproval.requestedAt);
  }, [assets]);

  const filteredDisposals = useMemo(() => {
    return disposalAssets.filter(asset => {
      if (statusFilter !== 'all') {
        const disposal = asset.disposalApproval;
        if (!disposal) return false;
        if (statusFilter === 'pending' && !disposal.approvedAt && !disposal.disposalDate) return true;
        if (statusFilter === 'approved' && disposal.approvedAt && !disposal.disposalDate) return true;
        if (statusFilter === 'completed' && disposal.disposalDate) return true;
        if (statusFilter === 'rejected' && !disposal.approvedAt && disposal.disposalDate) return false;
        return false;
      }
      if (categoryFilter !== 'all' && asset.category !== categoryFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          asset.assetCode.toLowerCase().includes(query) ||
          asset.name.toLowerCase().includes(query) ||
          asset.nameEnglish?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [disposalAssets, statusFilter, categoryFilter, searchQuery]);

  const handleSaveDisposal = (assetId: string, disposalData: any) => {
    // Update local state
    const updatedAssets = assets.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          disposalApproval: {
            ...a.disposalApproval,
            ...disposalData,
          },
        };
      }
      return a;
    });
    setAssets(updatedAssets);
    
    // Update asset in Asset Master
    updateAsset(assetId, {
      disposalApproval: {
        ...assets.find(a => a.id === assetId)?.disposalApproval,
        ...disposalData,
      },
    });
    
    // If disposal is completed, update asset status to inactive
    if (disposalData.disposalDate) {
      updateAsset(assetId, {
        status: 'inactive',
        lifecycleStatus: 'disposed',
      });
      // Reload assets to reflect changes
      setAssets(getStoredAssets());
    }
    
    setDisposalModalOpen(false);
    setSelectedAsset(null);
  };

  const getDisposalStatus = useCallback((asset: Asset) => {
    const disposal = asset.disposalApproval;
    if (!disposal) return 'none';
    if (disposal.disposalDate) return 'completed';
    if (disposal.approvedAt) return 'approved';
    if (disposal.requestedAt) return 'pending';
    return 'none';
  }, []);

  const disposalColumns = [
    { key: 'assetCode', label: 'Asset Code' },
    {
      key: 'name',
      label: 'Asset Name',
      render: (_: unknown, row: Asset) => (
        <div>
          <div className="font-medium">{row.name}</div>
          {row.nameEnglish && (
            <div className="text-xs text-muted-foreground">{row.nameEnglish}</div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (_: unknown, row: Asset) => <Badge variant="outline">{row.category}</Badge>,
    },
    {
      key: 'requestedDate',
      label: 'Requested Date',
      render: (_: unknown, row: Asset) => {
        const requestedAt = row.disposalApproval?.requestedAt;
        return requestedAt ? new Date(requestedAt).toLocaleDateString() : '-';
      },
    },
    {
      key: 'disposalMethod',
      label: 'Disposal Method',
      render: (_: unknown, row: Asset) => row.disposalApproval?.disposalMethod || '-',
    },
    {
      key: 'disposalValue',
      label: 'Disposal Value',
      render: (_: unknown, row: Asset) => {
        const value = row.disposalApproval?.disposalValue;
        return value ? `₹${value.toLocaleString()}` : '-';
      },
    },
    {
      key: 'approvedAt',
      label: 'Approved Date',
      render: (_: unknown, row: Asset) => {
        const approvedAt = row.disposalApproval?.approvedAt;
        return approvedAt ? new Date(approvedAt).toLocaleDateString() : '-';
      },
    },
    {
      key: 'disposalDate',
      label: 'Disposal Date',
      render: (_: unknown, row: Asset) => {
        const disposalDate = row.disposalApproval?.disposalDate;
        return disposalDate ? (
          <div className="text-sm font-medium text-green-600">
            {new Date(disposalDate).toLocaleDateString()}
          </div>
        ) : '-';
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: Asset) => {
        const status = getDisposalStatus(row);
        const variant =
          status === 'completed' ? 'bg-green-500 text-white' :
          status === 'approved' ? 'bg-blue-500 text-white' :
          status === 'pending' ? 'bg-yellow-500 text-black' :
          'bg-gray-500 text-white';
        const labels: Record<string, string> = {
          pending: 'Pending',
          approved: 'Approved',
          completed: 'Completed',
          none: 'No Request',
        };
        return (
          <Badge className={cn('capitalize', variant)}>
            {labels[status]}
          </Badge>
        );
      },
    },
  ];

  const disposalStats = useMemo(() => {
    const pending = disposalAssets.filter(a => getDisposalStatus(a) === 'pending').length;
    const approved = disposalAssets.filter(a => getDisposalStatus(a) === 'approved').length;
    const completed = disposalAssets.filter(a => getDisposalStatus(a) === 'completed').length;
    const totalValue = disposalAssets
      .filter(a => getDisposalStatus(a) === 'completed' && a.disposalApproval?.disposalValue)
      .reduce((sum, a) => sum + (a.disposalApproval?.disposalValue || 0), 0);
    return { pending, approved, completed, totalValue };
  }, [disposalAssets, getDisposalStatus]);

  return (
    <MainLayout>
      <PageHeader
        title="Asset Disposal"
        description="Manage asset disposal requests, approvals, and tracking"
        actions={
          checkWriteAccess('assets') ? (
            <Button onClick={() => {
              setSelectedAsset(null);
              setDisposalModalOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Request Disposal
            </Button>
          ) : null
        }
      />

      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Pending Requests</div>
              <div className="text-2xl font-bold text-yellow-600">{disposalStats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Approved</div>
              <div className="text-2xl font-bold text-blue-600">{disposalStats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="text-2xl font-bold text-green-600">{disposalStats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Disposal Value</div>
              <div className="text-2xl font-bold">₹{disposalStats.totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by asset code, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="immovable">Immovable</SelectItem>
              <SelectItem value="sacred">Sacred</SelectItem>
              <SelectItem value="valuables">Valuables</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="vehicles">Vehicles</SelectItem>
              <SelectItem value="it">IT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Table */}
        {filteredDisposals.length > 0 ? (
          <DataTable
            data={filteredDisposals}
            columns={disposalColumns}
            actions={(row: Asset) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedAsset(row);
                    setDisposalModalOpen(true);
                  }}
                >
                  {getDisposalStatus(row) === 'none' ? (
                    <Edit className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          />
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No disposal requests found
          </div>
        )}
      </div>

      {disposalModalOpen && (
        <DisposalRequestModal
          open={disposalModalOpen}
          onClose={() => {
            setDisposalModalOpen(false);
            setSelectedAsset(null);
          }}
          onSave={handleSaveDisposal}
          asset={selectedAsset || undefined}
          assets={assets}
        />
      )}
    </MainLayout>
  );
}
