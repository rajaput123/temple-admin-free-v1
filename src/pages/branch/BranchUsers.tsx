import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Users, Star, Building2 } from 'lucide-react';
import { getBranchUserMappings, getBranches, getRegions } from '@/lib/branch-store';
import { getEmployees } from '@/lib/hr-employee-store';
import type { BranchUserMapping, BranchRole } from '@/types/branch';

export default function BranchUsers() {
  const mappings = getBranchUserMappings();
  const branches = getBranches();
  const regions = getRegions();
  const employees = getEmployees();
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<BranchRole | 'all'>('all');

  const filteredMappings = useMemo(() => {
    return mappings.filter(m => {
      const matchesBranch = branchFilter === 'all' || m.branchId === branchFilter;
      const matchesRole = roleFilter === 'all' || m.branchRole === roleFilter;
      return matchesBranch && matchesRole;
    });
  }, [mappings, branchFilter, roleFilter]);

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.branchName || branchId;
  };

  const getEmployee = (employeeId: string) => {
    return employees.find(e => e.id === employeeId);
  };

  const getRoleColor = (role: BranchRole) => {
    switch (role) {
      case 'branch_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'branch_manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'branch_staff': return 'bg-green-100 text-green-800 border-green-200';
      case 'branch_viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'branch_finance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'branch_hr': return 'bg-pink-100 text-pink-800 border-pink-200';
    }
  };

  const getRoleLabel = (role: BranchRole) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'full_access': return 'bg-green-100 text-green-800 border-green-200';
      case 'read_write': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'read_only': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      sortable: true,
      render: (_: unknown, row: BranchUserMapping) => {
        const employee = getEmployee(row.employeeId);
        const initials = employee?.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'U';
        
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{employee?.name || row.employeeId}</div>
              <div className="text-xs text-muted-foreground">
                {employee?.designation || '—'} • {employee?.department || '—'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'branch',
      label: 'Branch',
      sortable: true,
      render: (_: unknown, row: BranchUserMapping) => {
        const branch = branches.find(b => b.id === row.branchId);
        return (
          <div className="flex items-center gap-2">
            {row.isPrimaryBranch && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
            <div>
              <div className="font-medium text-sm">{branch?.branchName || row.branchId}</div>
              <div className="text-xs text-muted-foreground">{branch?.branchCode || '—'}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (_: unknown, row: BranchUserMapping) => (
        <Badge className={`${getRoleColor(row.branchRole)} text-xs`} variant="outline">
          {getRoleLabel(row.branchRole)}
        </Badge>
      ),
    },
    {
      key: 'accessLevel',
      label: 'Access Level',
      sortable: true,
      render: (_: unknown, row: BranchUserMapping) => (
        <Badge className={`${getAccessLevelColor(row.accessLevel)} text-xs`} variant="outline">
          {row.accessLevel.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'additionalBranches',
      label: 'Multi-Branch',
      render: (_: unknown, row: BranchUserMapping) => {
        if (!row.additionalBranchIds || row.additionalBranchIds.length === 0) {
          return <span className="text-sm text-muted-foreground">—</span>;
        }
        return (
          <div className="flex items-center gap-1">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{row.additionalBranchIds.length}</span>
            <span className="text-xs text-muted-foreground">more</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_: unknown, row: BranchUserMapping) => (
        <Badge
          variant={row.status === 'active' ? 'default' : 'secondary'}
          className="text-xs"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: BranchUserMapping) => (
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Branch Users"
        description="Map employees to branches with role assignments"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Branch Management', href: '/branch' },
          { label: 'Branch Users', href: '/branch/users' },
        ]}
      />

      <div className="space-y-4">
        {/* Filters */}
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filter by Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.branchName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as BranchRole | 'all')}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="branch_admin">Branch Admin</SelectItem>
                  <SelectItem value="branch_manager">Branch Manager</SelectItem>
                  <SelectItem value="branch_staff">Branch Staff</SelectItem>
                  <SelectItem value="branch_viewer">Branch Viewer</SelectItem>
                  <SelectItem value="branch_finance">Branch Finance</SelectItem>
                  <SelectItem value="branch_hr">Branch HR</SelectItem>
                </SelectContent>
              </Select>
              <Button className="gap-2 ml-auto">
                <Plus className="h-4 w-4" />
                Assign User
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="rounded-xl border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Mappings</p>
                  <p className="text-2xl font-bold mt-1">{mappings.length}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Assignments</p>
                  <p className="text-2xl font-bold mt-1">
                    {mappings.filter(m => m.status === 'active').length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Primary Branches</p>
                  <p className="text-2xl font-bold mt-1">
                    {mappings.filter(m => m.isPrimaryBranch).length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Multi-Branch Access</p>
                  <p className="text-2xl font-bold mt-1">
                    {mappings.filter(m => m.additionalBranchIds && m.additionalBranchIds.length > 0).length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-0 pt-6">
            <DataTable
              data={filteredMappings}
              columns={columns}
              searchable={true}
              searchPlaceholder="Search by employee name, branch, or role..."
              emptyMessage="No user-branch mappings found"
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
