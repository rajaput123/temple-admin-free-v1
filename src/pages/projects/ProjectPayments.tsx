import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, CheckCircle, Clock } from 'lucide-react';
import { Project, ProjectPayment, PaymentStatus } from '@/types/projects';
import { PaymentBillModal } from '@/components/projects/PaymentBillModal';
import { dummyProjects, dummyProjectPayments } from '@/data/projects-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function ProjectPayments() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [payments, setPayments] = useState<ProjectPayment[]>(dummyProjectPayments);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ProjectPayment | null>(null);

  if (!checkModuleAccess('projects')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const projectPayments = useMemo(() => {
    if (!selectedProject) return [];
    return payments.filter(p => p.projectId === selectedProject.id);
  }, [payments, selectedProject]);

  const paymentSummary = useMemo(() => {
    const total = projectPayments.reduce((sum, p) => sum + p.billAmount, 0);
    const paid = projectPayments.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + p.netPayableAmount, 0);
    const pending = projectPayments.filter(p => p.paymentStatus === 'pending' || p.paymentStatus === 'approved').reduce((sum, p) => sum + p.netPayableAmount, 0);
    return { total, paid, pending };
  }, [projectPayments]);

  const paymentColumns = [
    {
      accessorKey: 'billNumber',
      header: 'Bill Number',
    },
    {
      accessorKey: 'billDate',
      header: 'Bill Date',
      cell: ({ row }: any) => new Date(row.original.billDate).toLocaleDateString(),
    },
    {
      accessorKey: 'vendorName',
      header: 'Vendor',
    },
    {
      accessorKey: 'billAmount',
      header: 'Bill Amount',
      cell: ({ row }: any) => `₹${row.original.billAmount.toLocaleString()}`,
    },
    {
      accessorKey: 'netPayableAmount',
      header: 'Net Payable',
      cell: ({ row }: any) => `₹${row.original.netPayableAmount.toLocaleString()}`,
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.paymentStatus;
        const variants: Record<PaymentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
          pending: 'outline',
          approved: 'default',
          paid: 'default',
          rejected: 'destructive',
        };
        return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
      },
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Payments & Bills"
        description="Manage vendor bills, payments, and milestone-linked payment tracking"
        actions={
          selectedProject && checkWriteAccess('projects', 'project_payments') ? (
            <Button onClick={() => {
              setEditingPayment(null);
              setPaymentModalOpen(true);
            }}>
              Add Payment
            </Button>
          ) : null
        }
      />

      <div className="space-y-4">
        <div className="flex gap-4">
          <Select
            value={selectedProject?.id || ''}
            onValueChange={(value) => {
              const project = dummyProjects.find(p => p.id === value);
              setSelectedProject(project || null);
            }}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {dummyProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.projectCode} - {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProject ? (
          <>
            {/* Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{paymentSummary.total.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paid</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{paymentSummary.paid.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{paymentSummary.pending.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            {/* Payments Table */}
            <DataTable columns={paymentColumns} data={projectPayments} />
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Please select a project to view payments
          </div>
        )}
      </div>

      {paymentModalOpen && selectedProject && (
        <PaymentBillModal
          open={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setEditingPayment(null);
          }}
          project={selectedProject}
          payment={editingPayment || undefined}
          onSave={(paymentData) => {
            if (editingPayment) {
              setPayments(payments.map(p => p.id === editingPayment.id ? { ...p, ...paymentData } : p));
            } else {
              const newPayment: ProjectPayment = {
                ...paymentData,
                id: `payment-${Date.now()}`,
                projectId: selectedProject.id,
                paymentStatus: 'pending',
                billVerificationStatus: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as ProjectPayment;
              setPayments([...payments, newPayment]);
            }
            setPaymentModalOpen(false);
            setEditingPayment(null);
          }}
        />
      )}
    </MainLayout>
  );
}
