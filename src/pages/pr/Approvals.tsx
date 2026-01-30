import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { dummyCommunicationApprovals, dummyUnauthorizedAttempts } from '@/data/communications-data';
import type { CommunicationApproval } from '@/types/communications';
import { usePermissions } from '@/hooks/usePermissions';

export default function Approvals() {
  const { checkWriteAccess } = usePermissions();
  const [approvals] = useState<CommunicationApproval[]>(dummyCommunicationApprovals);
  const [unauthorizedAttempts] = useState(dummyUnauthorizedAttempts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const canApprove = checkWriteAccess('approvals');

  const filteredApprovals = approvals.filter((appr) => {
    const matchesSearch = appr.communicationId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const approvalColumns = [
    {
      key: 'communicationType',
      label: 'Communication Type',
      sortable: true,
      render: (value: unknown, row: CommunicationApproval) => (
        <Badge variant="outline" className="capitalize">
          {row.communicationType.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'communicationId',
      label: 'Communication ID',
      render: (value: unknown, row: CommunicationApproval) => (
        <div className="font-mono text-sm">{row.communicationId}</div>
      ),
    },
    {
      key: 'currentLevel',
      label: 'Current Level',
      sortable: true,
      render: (value: unknown, row: CommunicationApproval) => (
        <Badge variant="outline" className="capitalize">
          {row.currentLevel.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: unknown, row: CommunicationApproval) => {
        const statusColors: Record<string, string> = {
          pending: 'bg-yellow-100 text-yellow-700',
          approved: 'bg-green-100 text-green-700',
          rejected: 'bg-red-100 text-red-700',
          escalated: 'bg-orange-100 text-orange-700',
        };
        return (
          <Badge className={statusColors[row.status] || 'bg-gray-100 text-gray-700'}>
            {row.status}
          </Badge>
        );
      },
    },
    {
      key: 'requestedBy',
      label: 'Requested By',
      sortable: true,
      render: (value: unknown, row: CommunicationApproval) => (
        <div className="text-sm">
          <div>{row.requestedBy}</div>
          <div className="text-xs text-gray-500">
            {new Date(row.requestedAt).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Reviewed/Approved By',
      render: (value: unknown, row: CommunicationApproval) => (
        <div className="text-sm">
          {row.approvedBy ? (
            <>
              <div>{row.approvedBy}</div>
              <div className="text-xs text-gray-500">
                {row.approvedAt
                  ? new Date(row.approvedAt).toLocaleDateString()
                  : row.reviewedAt
                  ? new Date(row.reviewedAt).toLocaleDateString()
                  : '-'}
              </div>
            </>
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'isEmergencyOverride',
      label: 'Emergency Override',
      render: (value: unknown, row: CommunicationApproval) => (
        <div>
          {row.isEmergencyOverride ? (
            <Badge variant="destructive" className="text-xs">Yes</Badge>
          ) : (
            <span className="text-sm text-gray-500">No</span>
          )}
        </div>
      ),
    },
  ];

  const unauthorizedColumns = [
    {
      key: 'userId',
      label: 'User',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div className="font-medium">{row.userId}</div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (value: unknown, row: any) => (
        <div className="max-w-md text-sm">{row.action}</div>
      ),
    },
    {
      key: 'communicationType',
      label: 'Communication Type',
      sortable: true,
      render: (value: unknown, row: any) => (
        <Badge variant="outline">{row.communicationType}</Badge>
      ),
    },
    {
      key: 'blocked',
      label: 'Blocked',
      sortable: true,
      render: (value: unknown, row: any) => (
        <Badge variant={row.blocked ? 'destructive' : 'outline'}>
          {row.blocked ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (value: unknown, row: any) => (
        <div className="text-sm text-gray-600">{row.reason}</div>
      ),
    },
    {
      key: 'attemptedAt',
      label: 'Attempted At',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div className="text-sm">
          {new Date(row.attemptedAt).toLocaleString()}
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Approval & Governance"
        description="Manage communication approvals, workflows, and unauthorized access attempts"
      />

      <div className="space-y-6">
        {/* Approvals Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pending Approvals</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search approvals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Total Approvals</div>
              <div className="text-2xl font-bold mt-1">{approvals.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-yellow-200">
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold mt-1 text-yellow-600">
                {approvals.filter(a => a.status === 'pending').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="text-sm text-gray-600">Approved</div>
              <div className="text-2xl font-bold mt-1 text-green-600">
                {approvals.filter(a => a.status === 'approved').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Emergency Overrides</div>
              <div className="text-2xl font-bold mt-1 text-orange-600">
                {approvals.filter(a => a.isEmergencyOverride).length}
              </div>
            </div>
          </div>

          <DataTable 
            data={filteredApprovals} 
            columns={approvalColumns}
            actions={(row) => (
              <div className="flex items-center gap-2">
                {canApprove && row.status === 'pending' && (
                  <>
                    <Button variant="ghost" size="sm" className="text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          />
        </div>

        {/* Unauthorized Attempts Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Unauthorized Access Attempts
            </h2>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-800">
              <strong>{unauthorizedAttempts.length}</strong> unauthorized attempt(s) detected and blocked.
            </div>
          </div>

          <DataTable data={unauthorizedAttempts} columns={unauthorizedColumns} />
        </div>
      </div>
    </MainLayout>
  );
}
