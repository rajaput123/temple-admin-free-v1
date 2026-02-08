import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Eye, Lock } from 'lucide-react';
import { dummyAssetAudits } from '@/data/assets-data';
import { usePermissions } from '@/hooks/usePermissions';
import { getStoredAssets, updateAsset } from '@/lib/assets/asset-store';
import type { AssetAudit } from '@/types/assets';
import { AssetAuditModal } from '@/components/assets/AssetAuditModal';
import { AuditVerificationModal } from '@/components/assets/AuditVerificationModal';
import { cn } from '@/lib/utils';

const AUDIT_STORAGE_KEY = 'asset_audits';

function getStoredAudits(): AssetAudit[] {
  try {
    const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!stored) return dummyAssetAudits;
    return JSON.parse(stored);
  } catch {
    return dummyAssetAudits;
  }
}

function saveAudits(audits: AssetAudit[]): void {
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(audits));
  } catch (error) {
    console.error('Error saving audits:', error);
  }
}

export default function AssetAudit() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [audits, setAudits] = useState<AssetAudit[]>(getStoredAudits());
  const [assets, setAssets] = useState(getStoredAssets());
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState<AssetAudit | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [viewingAudit, setViewingAudit] = useState<AssetAudit | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Load assets from localStorage on mount and when page becomes visible
  useEffect(() => {
    const loadData = () => {
      const storedAssets = getStoredAssets();
      setAssets(storedAssets);
      // Reload audits
      setAudits(getStoredAudits());
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

  // Filtered audits
  const filteredAudits = useMemo(() => {
    return audits.filter(audit => {
      if (statusFilter !== 'all' && audit.status !== statusFilter) return false;
      if (typeFilter !== 'all' && audit.auditType !== typeFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          audit.auditNumber.toLowerCase().includes(query) ||
          audit.conductedByName.toLowerCase().includes(query) ||
          audit.assets.some(a => 
            a.assetName.toLowerCase().includes(query) ||
            a.assetCode.toLowerCase().includes(query)
          )
        );
      }
      return true;
    });
  }, [audits, statusFilter, typeFilter, searchQuery]);

  // Summary statistics
  const auditStats = useMemo(() => {
    const pending = audits.filter(a => a.status === 'pending').length;
    const inProgress = audits.filter(a => a.status === 'in_progress').length;
    const completed = audits.filter(a => a.status === 'completed').length;
    const totalIssues = audits.reduce((sum, a) => 
      sum + (a.auditResults.mismatch + a.auditResults.missing), 0
    );
    return { pending, inProgress, completed, totalIssues };
  }, [audits]);

  const handleSaveAudit = (data: Partial<AssetAudit>) => {
    if (editingAudit) {
      const updated = audits.map(a =>
        a.id === editingAudit.id ? { ...a, ...data } : a
      );
      setAudits(updated);
      saveAudits(updated);
    } else {
      const newAudit: AssetAudit = {
        ...data,
        id: data.id || `audit-${Date.now()}`,
        createdAt: data.createdAt || new Date().toISOString(),
      } as AssetAudit;
      const updated = [...audits, newAudit];
      setAudits(updated);
      saveAudits(updated);
    }

    setEditingAudit(null);
    setAuditModalOpen(false);
  };

  const handleCompleteAudit = (audit: AssetAudit) => {
    const updated = audits.map(a =>
      a.id === audit.id
        ? { ...a, status: 'completed' as const, completedAt: new Date().toISOString(), locked: true }
        : a
    );
    setAudits(updated);
    saveAudits(updated);

    // Update asset audit status
    if (audit.assets) {
      audit.assets.forEach(assetResult => {
        if (assetResult.assetId) {
          updateAsset(assetResult.assetId, {
            auditStatus: 'completed',
            lastAuditDate: audit.date,
          });
        }
      });
      setAssets(getStoredAssets());
    }

    setVerificationModalOpen(false);
    setViewingAudit(null);
  };

  if (!checkModuleAccess('assets')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const columns = [
    { key: 'auditNumber', label: 'Audit #' },
    {
      key: 'date',
      label: 'Date',
      render: (_: unknown, row: AssetAudit) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: 'auditType',
      label: 'Type',
      render: (_: unknown, row: AssetAudit) => (
        <Badge variant="outline" className="capitalize">
          {row.auditType}
        </Badge>
      ),
    },
    {
      key: 'assets',
      label: 'Assets',
      render: (_: unknown, row: AssetAudit) => (
        <div className="text-sm">
          <div className="font-medium">{row.assets.length} asset(s)</div>
          {row.categoryFilter && (
            <div className="text-xs text-muted-foreground capitalize">
              Category: {row.categoryFilter}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'auditResults',
      label: 'Results',
      render: (_: unknown, row: AssetAudit) => {
        const { match, mismatch, missing, partialMatch } = row.auditResults;
        return (
          <div className="text-sm space-y-1">
            <div className="flex gap-2">
              <Badge variant="default" className="bg-green-500 text-white">
                Match: {match}
              </Badge>
              {partialMatch > 0 && (
                <Badge variant="default" className="bg-yellow-500 text-black">
                  Partial: {partialMatch}
                </Badge>
              )}
              {mismatch > 0 && (
                <Badge variant="destructive">Mismatch: {mismatch}</Badge>
              )}
              {missing > 0 && (
                <Badge variant="destructive">Missing: {missing}</Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'conductedByName',
      label: 'Conducted By',
      render: (_: unknown, row: AssetAudit) => (
        <div className="text-sm">{row.conductedByName}</div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: AssetAudit) => {
        const variant =
          row.status === 'completed' ? 'bg-green-500 text-white' :
          row.status === 'in_progress' ? 'bg-blue-500 text-white' :
          row.status === 'locked' ? 'bg-gray-500 text-white' :
          'bg-yellow-500 text-black';
        return (
          <div className="flex items-center gap-2">
            <Badge className={cn('capitalize', variant)}>
              {row.status.replace('_', ' ')}
            </Badge>
            {row.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
          </div>
        );
      },
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Asset Audit & Verification"
        description="Periodic verification with CV-assisted comparison"
        actions={
          checkWriteAccess('asset_audit') && (
            <Button onClick={() => {
              setEditingAudit(null);
              setAuditModalOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Audit
            </Button>
          )
        }
      />

      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Pending Audits</div>
              <div className="text-2xl font-bold">{auditStats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">In Progress</div>
              <div className="text-2xl font-bold text-blue-600">{auditStats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="text-2xl font-bold text-green-600">{auditStats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Issues</div>
              <div className="text-2xl font-bold text-red-600">{auditStats.totalIssues}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by audit #, asset, auditor..."
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
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="periodic">Periodic</SelectItem>
              <SelectItem value="spot">Spot Check</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredAudits}
          columns={columns}
          actions={(row: AssetAudit) => (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setViewingAudit(row);
                  setVerificationModalOpen(true);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {checkWriteAccess('asset_audit') && !row.locked && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingAudit(row);
                    setAuditModalOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        />
      </div>

      {/* Modals */}
      {auditModalOpen && (
        <AssetAuditModal
          open={auditModalOpen}
          onOpenChange={setAuditModalOpen}
          audit={editingAudit || undefined}
          assets={assets}
          onSave={handleSaveAudit}
        />
      )}

      {verificationModalOpen && viewingAudit && (
        <AuditVerificationModal
          open={verificationModalOpen}
          onOpenChange={(open) => {
            setVerificationModalOpen(open);
            if (!open) setViewingAudit(null);
          }}
          audit={viewingAudit}
          assets={assets}
          onSave={(updatedAudit) => {
            const updated = audits.map(a =>
              a.id === updatedAudit.id ? updatedAudit : a
            );
            setAudits(updated);
            saveAudits(updated);
            
            // If completed, update assets
            if (updatedAudit.status === 'completed') {
              handleCompleteAudit(updatedAudit);
            }
          }}
        />
      )}
    </MainLayout>
  );
}
