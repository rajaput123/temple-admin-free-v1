import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Plus, Download, Upload, Edit, Trash2, Eye, Building2, MapPin, GitBranch, TrendingUp } from 'lucide-react';
import { getBranches, getRegions, deleteBranch } from '@/lib/branch-store';
import type { Branch, BranchType, BranchStatus } from '@/types/branch';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { DeleteBranchDialog } from '@/components/branch/DeleteBranchDialog';
import { BranchFormModal } from '@/components/branch/BranchFormModal';
import { createBranch, updateBranch } from '@/lib/branch-store';

export default function BranchDirectory() {
  const [branches, setBranches] = useState(getBranches());
  const [typeFilter, setTypeFilter] = useState<BranchType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<BranchStatus | 'all'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | undefined>();
  const regions = getRegions();

  useEffect(() => {
    setBranches(getBranches());
  }, []);

  const filteredBranches = useMemo(() => {
    return branches.filter(branch => {
      const matchesType = typeFilter === 'all' || branch.branchType === typeFilter;
      const matchesStatus = statusFilter === 'all' || branch.status === statusFilter;
      const matchesRegion = regionFilter === 'all' || branch.regionId === regionFilter;
      return matchesType && matchesStatus && matchesRegion;
    });
  }, [branches, typeFilter, statusFilter, regionFilter]);

  const stats = useMemo(() => {
    return {
      total: branches.length,
      active: branches.filter(b => b.status === 'active').length,
      underSetup: branches.filter(b => b.status === 'under_setup').length,
      inactive: branches.filter(b => b.status === 'inactive').length,
    };
  }, [branches]);

  const handleDelete = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      setDeletingBranch(branch);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingBranch) {
      deleteBranch(deletingBranch.id);
      setBranches(getBranches());
      toast.success(`Branch "${deletingBranch.branchName}" deleted successfully`);
      setDeletingBranch(null);
    }
  };

  const handleView = (branch: Branch) => {
    setViewingBranch(branch);
    setIsSheetOpen(true);
  };

  const handleAdd = () => {
    setEditingBranch(undefined);
    setIsFormModalOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (data: Partial<Branch>) => {
    if (editingBranch) {
      // Update existing branch
      updateBranch(editingBranch.id, data);
      toast.success(`Branch "${data.branchName}" updated successfully`);
    } else {
      // Create new branch
      createBranch(data as Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>);
      toast.success(`Branch "${data.branchName}" created successfully`);
    }
    setBranches(getBranches());
    setIsFormModalOpen(false);
  };

  const handleImport = () => {
    toast.info('Import functionality coming soon');
  };

  const handleExport = () => {
    // Export filtered data as CSV
    toast.info('Export functionality coming soon');
  };

  const getBranchTypeLabel = (type: BranchType) => {
    switch (type) {
      case 'head_office': return 'Head Office';
      case 'regional_office': return 'Regional Office';
      case 'temple': return 'Temple';
      case 'subsidiary_temple': return 'Subsidiary Temple';
    }
  };

  const getBranchTypeIcon = (type: BranchType) => {
    switch (type) {
      case 'head_office': return <Building2 className="h-4 w-4" />;
      case 'regional_office': return <MapPin className="h-4 w-4" />;
      case 'temple': return <GitBranch className="h-4 w-4" />;
      case 'subsidiary_temple': return <GitBranch className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: BranchStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'under_setup': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const columns = [
    {
      key: 'branchName',
      label: 'Branch Name',
      sortable: true,
      render: (_: unknown, row: Branch) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            {getBranchTypeIcon(row.branchType)}
          </div>
          <div>
            <div className="font-medium">{row.branchName}</div>
            <div className="text-xs text-muted-foreground">{row.branchCode}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'branchType',
      label: 'Type',
      sortable: true,
      render: (_: unknown, row: Branch) => (
        <Badge variant="outline" className="text-xs">
          {getBranchTypeLabel(row.branchType)}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_: unknown, row: Branch) => (
        <Badge className={`${getStatusColor(row.status)} text-xs`} variant="outline">
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'region',
      label: 'Region',
      sortable: true,
      render: (_: unknown, row: Branch) => {
        const region = regions.find(r => r.id === row.regionId);
        return region ? (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-sm">{region.regionName}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      },
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      render: (_: unknown, row: Branch) => (
        <div className="text-sm">
          <div>{row.city || '—'}, {row.state || '—'}</div>
          {row.country && <div className="text-xs text-muted-foreground">{row.country}</div>}
        </div>
      ),
    },
    {
      key: 'hierarchyLevel',
      label: 'Level',
      sortable: true,
      render: (_: unknown, row: Branch) => (
        <Badge variant="secondary" className="text-xs">
          Level {row.hierarchyLevel}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: Branch) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleView(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Branch Directory"
        description="Central registry for all branch master data"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Branch Management', href: '/branch' },
          { label: 'Branch Directory', href: '/branch/directory' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={handleImport}>
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
              Add Branch
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card className="rounded-xl border-0 shadow-sm cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { setTypeFilter('all'); setStatusFilter('all'); setRegionFilter('all'); }}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</p>
                  <p className="text-3xl font-bold mt-0.5">{stats.total}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">All branches</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <GitBranch className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 shadow-sm cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter('active')}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active</p>
                  <p className="text-3xl font-bold mt-0.5 text-green-600">{stats.active}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Operational</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 shadow-sm cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter('under_setup')}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Setup</p>
                  <p className="text-3xl font-bold mt-0.5 text-yellow-600">{stats.underSetup}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">In progress</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 shadow-sm cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter('inactive')}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Inactive</p>
                  <p className="text-3xl font-bold mt-0.5 text-gray-600">{stats.inactive}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Not operational</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="rounded-xl border-0 shadow-sm">
          <CardContent className="pt-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as BranchType | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="head_office">Head Office</SelectItem>
                  <SelectItem value="regional_office">Regional Office</SelectItem>
                  <SelectItem value="temple">Temple</SelectItem>
                  <SelectItem value="subsidiary_temple">Subsidiary Temple</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BranchStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="under_setup">Under Setup</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.regionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="rounded-xl border-0 shadow-sm">
          <CardContent className="p-0 pt-4">
            <DataTable
              data={filteredBranches}
              columns={columns}
              searchable={true}
              searchPlaceholder="Search branches by name, code, or location..."
              onRowClick={(branch) => handleView(branch)}
              emptyMessage="No branches found matching your filters"
            />
          </CardContent>
        </Card>
      </div>

      {/* Branch Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{viewingBranch?.branchName}</SheetTitle>
            <SheetDescription>Complete branch information and details</SheetDescription>
          </SheetHeader>
          {viewingBranch && (
            <div className="space-y-6 mt-6">
              {/* Basic Information */}
              <div>
                <h3 className="font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Branch Code</Label>
                    <p className="text-sm font-medium">{viewingBranch.branchCode}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Branch Type</Label>
                    <p className="text-sm font-medium">{getBranchTypeLabel(viewingBranch.branchType)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge className={`${getStatusColor(viewingBranch.status)} text-xs mt-1`} variant="outline">
                      {viewingBranch.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Hierarchy Level</Label>
                    <p className="text-sm font-medium">Level {viewingBranch.hierarchyLevel}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Details */}
              {viewingBranch.contactPerson && (
                <div>
                  <h3 className="font-semibold mb-3">Contact Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Contact Person</Label>
                      <p className="text-sm font-medium">{viewingBranch.contactPerson}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Primary Phone</Label>
                      <p className="text-sm font-medium">{viewingBranch.contactPhonePrimary || '—'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Primary Email</Label>
                      <p className="text-sm font-medium">{viewingBranch.contactEmailPrimary || '—'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Website</Label>
                      <p className="text-sm font-medium">{viewingBranch.websiteUrl || '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Address Details */}
              <div>
                <h3 className="font-semibold mb-3">Address</h3>
                <div className="space-y-2">
                  <p className="text-sm">{viewingBranch.addressLine1 || '—'}</p>
                  {viewingBranch.addressLine2 && <p className="text-sm">{viewingBranch.addressLine2}</p>}
                  <p className="text-sm">
                    {viewingBranch.city}, {viewingBranch.state} {viewingBranch.pinCode}
                  </p>
                  <p className="text-sm">{viewingBranch.country}</p>
                </div>
              </div>

              <Separator />

              {/* Operational Details */}
              {viewingBranch.operationalStartDate && (
                <div>
                  <h3 className="font-semibold mb-3">Operational Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                      <p className="text-sm font-medium">{viewingBranch.operationalStartDate}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Capacity</Label>
                      <p className="text-sm font-medium">{viewingBranch.currentCapacity || '—'} devotees/day</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <DeleteBranchDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        branch={deletingBranch}
        onConfirm={confirmDelete}
      />

      {/* Add/Edit Branch Modal */}
      <BranchFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        branch={editingBranch}
        onSubmit={handleFormSubmit}
      />
    </MainLayout>
  );
}
