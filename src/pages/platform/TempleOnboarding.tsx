import { useState, useMemo } from 'react';
import { PlatformLayout } from '@/components/platform/PlatformLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Check, X, Download } from 'lucide-react';
import { dummyRegistrations } from '@/data/registration-data';
import type { TempleAdminRegistration, RegistrationStatus } from '@/types/registration';
import { RegistrationReviewModal } from '@/components/admin/RegistrationReviewModal';
import { useAuth } from '@/contexts/AuthContext';

export default function TempleOnboarding() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<TempleAdminRegistration[]>(dummyRegistrations);
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>('all');
  const [selectedRegistration, setSelectedRegistration] = useState<TempleAdminRegistration | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const filteredRegistrations = useMemo(() => {
    if (statusFilter === 'all') {
      return registrations.filter(r =>
        (r.status === 'KYC_PENDING' || r.status === 'PENDING_APPROVAL' || r.status === 'UNDER_REVIEW')
      );
    }
    return registrations.filter(r => r.status === statusFilter);
  }, [registrations, statusFilter]);

  const handleApprove = (registrationId: string) => {
    setRegistrations(prev =>
      prev.map(reg =>
        reg.id === registrationId
          ? {
              ...reg,
              status: 'APPROVED' as RegistrationStatus,
              reviewedAt: new Date().toISOString(),
              statusHistory: [...reg.statusHistory, { status: 'APPROVED' as RegistrationStatus, timestamp: new Date().toISOString(), changedBy: user?.name }],
            }
          : reg
      )
    );
    setIsReviewModalOpen(false);
  };

  const handleReject = (registrationId: string, reason: string) => {
    setRegistrations(prev =>
      prev.map(reg =>
        reg.id === registrationId
          ? {
              ...reg,
              status: 'REJECTED' as RegistrationStatus,
              reviewedAt: new Date().toISOString(),
              rejectionReason: reason,
              reviewedBy: user?.name,
              statusHistory: [...reg.statusHistory, { status: 'REJECTED' as RegistrationStatus, timestamp: new Date().toISOString(), changedBy: user?.name, reason }],
            }
          : reg
      )
    );
    setIsReviewModalOpen(false);
  };

  const columns = [
    {
      key: 'fullName',
      label: 'Applicant Name',
      render: (value: unknown, row: TempleAdminRegistration) => (
        <div className="font-medium">{row.fullName || 'N/A'}</div>
      ),
    },
    {
      key: 'mobile',
      label: 'Mobile',
    },
    {
      key: 'context',
      label: 'Context',
      render: (value: unknown) => (
        <span className="capitalize">{(value as string).replace('_', ' ')}</span>
      ),
    },
    {
      key: 'templeInfo',
      label: 'Temple',
      render: (_: unknown, row: TempleAdminRegistration) => (
        <div>
          {row.context === 'new_temple' ? (
            <>
              <div className="font-medium">{row.templeName || 'N/A'}</div>
              <div className="text-xs text-muted-foreground">{row.templeLocation?.city}, {row.templeLocation?.state}</div>
            </>
          ) : (
            <>
              <div className="font-medium">{row.templeName || 'N/A'}</div>
              <div className="text-xs text-muted-foreground">ID: {row.templeId || 'N/A'}</div>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => {
        const status = value as RegistrationStatus;
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
        if (status === 'APPROVED') variant = 'default';
        if (status === 'REJECTED') variant = 'destructive';
        if (status === 'KYC_PENDING' || status === 'PENDING_APPROVAL' || status === 'UNDER_REVIEW') variant = 'outline';
        return <Badge variant={variant}>{status.replace(/_/g, ' ')}</Badge>;
      },
    },
    {
      key: 'submittedAt',
      label: 'Submitted On',
      render: (value: unknown) => value ? new Date(value as string).toLocaleDateString() : 'N/A',
    },
  ];

  return (
    <PlatformLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Temple Onboarding</h1>
            <p className="text-muted-foreground mt-2">
              Manage temple registration and onboarding workflow
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RegistrationStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pending</SelectItem>
                <SelectItem value="KYC_PENDING">KYC Pending</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <DataTable
          data={filteredRegistrations}
          columns={columns}
          searchPlaceholder="Search registrations..."
          actions={(row) => (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedRegistration(row);
                  setIsReviewModalOpen(true);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Review
              </Button>
            </>
          )}
        />
      </div>

      {selectedRegistration && (
        <RegistrationReviewModal
          open={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          registration={selectedRegistration}
          onApprove={handleApprove}
          onReject={handleReject}
          canApprove={true}
        />
      )}
    </PlatformLayout>
  );
}
