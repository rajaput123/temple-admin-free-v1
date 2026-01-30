import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ProductionPlan } from '@/types/kitchen';
import { ProductionPlanModal } from '@/components/kitchen/ProductionPlanModal';
import { dummyProductionPlans, dummyRecipes } from '@/data/kitchen-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function ProductionPlanning() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [plans, setPlans] = useState<ProductionPlan[]>(dummyProductionPlans);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ProductionPlan | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  if (!checkModuleAccess('production')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      if (statusFilter !== 'all' && plan.approvalStatus !== statusFilter) return false;
      if (dateFilter && plan.date !== dateFilter) return false;
      return true;
    });
  }, [plans, statusFilter, dateFilter]);

  const handleSavePlan = (data: Partial<ProductionPlan>) => {
    if (editingPlan) {
      setPlans(plans.map(p => p.id === editingPlan.id ? { ...p, ...data } : p));
    } else {
      const newPlan: ProductionPlan = {
        ...data,
        id: `plan-${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: 'user-1',
        createdByName: 'Current User',
      } as ProductionPlan;
      setPlans([...plans, newPlan]);
    }
    setEditingPlan(null);
    setPlanModalOpen(false);
  };

  const getStatusBadge = (status: ProductionPlan['approvalStatus']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge variant="default" className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const planColumns = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'shift', label: 'Shift', sortable: true },
    { key: 'recipeName', label: 'Recipe', sortable: true },
    { key: 'plannedQuantity', label: 'Planned Qty', sortable: true },
    {
      key: 'demandForecast',
      label: 'Demand Forecast',
      render: (_: unknown, plan: ProductionPlan) => plan.demandForecast.forecastedQuantity,
    },
    {
      key: 'rawMaterialStatus',
      label: 'Raw Material Status',
      render: (_: unknown, plan: ProductionPlan) => {
        const status = plan.rawMaterialStatus;
        return status === 'validated' ? (
          <Badge variant="default" className="bg-green-500">Validated</Badge>
        ) : status === 'shortfall' ? (
          <Badge variant="destructive">Shortfall</Badge>
        ) : (
          <Badge variant="destructive">Unavailable</Badge>
        );
      },
    },
    {
      key: 'approvalStatus',
      label: 'Approval Status',
      render: (_: unknown, plan: ProductionPlan) => getStatusBadge(plan.approvalStatus),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Production Planning"
        description="Plan daily production with demand forecasting and raw material validation"
        actions={
          checkWriteAccess('production') ? (
            <Button onClick={() => {
              setEditingPlan(null);
              setPlanModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          ) : null
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Production Plans</CardTitle>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-40"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredPlans}
              columns={planColumns}
              searchKey="recipeName"
              defaultPageSize={10}
            />
          </CardContent>
        </Card>
      </div>

      {planModalOpen && (
        <ProductionPlanModal
          open={planModalOpen}
          onOpenChange={setPlanModalOpen}
          plan={editingPlan}
          recipes={dummyRecipes}
          onSave={handleSavePlan}
        />
      )}
    </MainLayout>
  );
}
