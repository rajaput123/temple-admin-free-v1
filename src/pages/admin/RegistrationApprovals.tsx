import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye } from 'lucide-react';
import { dummyRegistrations } from '@/data/registration-data';
import type { TempleAdminRegistration, RegistrationStatus } from '@/types/registration';
import { RegistrationReviewModal } from '@/components/admin/RegistrationReviewModal';

export default function RegistrationApprovals() {
  const [registrations, setRegistrations] = useState(dummyRegistrations);
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>('all');
  const [selectedRegistration, setSelectedRegistration] = useState<TempleAdminRegistration | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const filteredRegistrations = useMemo(() => {
    if (statusFilter === 'all') {
      return registrations.filter(r => 
        ['KYC_PENDING', 'PENDING_APPROVAL', 'UNDER_REVIEW'].includes(r.status)
      );
    }
    return registrations.filter(r => r.status === statusFilter);
  }, [registrations, statusFilter]);

  const columns = [
    {
      key: 'id',
      label: 'Registration ID',
      render: (value: unknown) => (
        <span className="font-mono text-xs">{String(value).slice(0, 8)}...</span>
      ),
    },
    {
      key: 'fullName',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'mobile',
      label: 'Mobile',
      render: (value: unknown) => `+91 ${value}`,
    },
    {
      key: 'context',
      label: 'Type',
      render: (value: unknown) => (
        <StatusBadge variant={value === 'new_temple' ? 'primary' : 'neutral'}>
          {value === 'new_temple' ? 'New Temple' : 'Join Existing'}
        </StatusBadge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => {
        const status = value as RegistrationStatus;
        const variant = 
          status === 'APPROVED' ? 'success' :
          status === 'REJECTED' ? 'destructive' :
          status === 'UNDER_REVIEW' ? 'default' :
          'warning';
        return <StatusBadge variant={variant}>{status.replace('_', ' ')}</StatusBadge>;
      },
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      sortable: true,
      render: (value: unknown) => {
        if (!value) return '-';
        return new Date(value as string).toLocaleDateString('en-IN');
      },
    },
  ];

  const handleReview = (registration: TempleAdminRegistration) => {
    setSelectedRegistration(registration);
    setIsReviewModalOpen(true);
  };

  const handleApprovalChange = (registrationId: string, newStatus: RegistrationStatus) => {
    setRegistrations(prev => prev.map(r => 
      r.id === registrationId 
        ? { ...r, status: newStatus }
        : r
    ));
    setIsReviewModalOpen(false);
    setSelectedRegistration(null);
  };

  return (
    <MainLayout>
      <PageHeader
        title="Registration Approvals"
        description="Review and approve temple admin registrations"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'Admin', href: '/admin' },
          { label: 'Registration Approvals' },
        ]}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RegistrationStatus | 'all')}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pending</SelectItem>
              <SelectItem value="KYC_PENDING">KYC Pending</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          data={filteredRegistrations}
          columns={columns}
          searchPlaceholder="Search registrations..."
          actions={(row) => (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReview(row)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Review
            </Button>
          )}
        />
      </div>

      {selectedRegistration && (
        <RegistrationReviewModal
          open={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          registration={selectedRegistration}
          onApprovalChange={handleApprovalChange}
        />
      )}
    </MainLayout>
  );
}
