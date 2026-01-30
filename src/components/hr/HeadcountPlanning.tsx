import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, TrendingUp, TrendingDown, Users, Calendar, Download } from 'lucide-react';
import { HeadcountPlan } from '@/types/hr';
import { Department } from '@/types/hr';
import { Employee } from '@/types/erp';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface HeadcountPlanningProps {
  departments: Department[];
  employees: Employee[];
  plans: HeadcountPlan[];
  onSavePlan: (plan: Partial<HeadcountPlan>) => void;
  currentUserId: string;
}

export function HeadcountPlanning({
  departments,
  employees,
  plans,
  onSavePlan,
  currentUserId,
}: HeadcountPlanningProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q1');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<HeadcountPlan | null>(null);
  const [planFormData, setPlanFormData] = useState({
    departmentId: '',
    quarter: 'Q1',
    year: new Date().getFullYear(),
    plannedHeadcount: 0,
    budget: 0,
  });

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i - 2);

  const filteredPlans = useMemo(() => {
    return plans.filter(
      plan => plan.year === selectedYear && plan.quarter === selectedQuarter
    );
  }, [plans, selectedYear, selectedQuarter]);

  const departmentStats = useMemo(() => {
    return departments.map(dept => {
      const actualCount = employees.filter(emp => emp.department === dept.name).length;
      const plan = filteredPlans.find(p => p.departmentId === dept.id);
      const plannedCount = plan?.plannedHeadcount || actualCount;
      const variance = actualCount - plannedCount;
      const budget = plan?.budget || 0;

      return {
        department: dept,
        actual: actualCount,
        planned: plannedCount,
        variance,
        budget,
        plan,
      };
    });
  }, [departments, employees, filteredPlans]);

  const totalStats = useMemo(() => {
    return departmentStats.reduce(
      (acc, stat) => ({
        actual: acc.actual + stat.actual,
        planned: acc.planned + stat.planned,
        variance: acc.variance + stat.variance,
        budget: acc.budget + stat.budget,
      }),
      { actual: 0, planned: 0, variance: 0, budget: 0 }
    );
  }, [departmentStats]);

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setPlanFormData({
      departmentId: '',
      quarter: selectedQuarter,
      year: selectedYear,
      plannedHeadcount: 0,
      budget: 0,
    });
    setIsPlanModalOpen(true);
  };

  const handleEditPlan = (plan: HeadcountPlan) => {
    setEditingPlan(plan);
    setPlanFormData({
      departmentId: plan.departmentId,
      quarter: plan.quarter,
      year: plan.year,
      plannedHeadcount: plan.plannedHeadcount,
      budget: plan.budget,
    });
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = () => {
    onSavePlan({
      ...planFormData,
      id: editingPlan?.id,
      status: editingPlan?.status || 'draft',
      createdAt: editingPlan?.createdAt || new Date().toISOString(),
      createdBy: currentUserId,
    });
    setIsPlanModalOpen(false);
  };

  const columns = [
    {
      key: 'department',
      label: 'Department',
      render: (_: unknown, row: typeof departmentStats[0]) => row.department.name,
    },
    {
      key: 'actual',
      label: 'Actual',
      render: (_: unknown, row: typeof departmentStats[0]) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.actual}</span>
        </div>
      ),
    },
    {
      key: 'planned',
      label: 'Planned',
      render: (_: unknown, row: typeof departmentStats[0]) => row.planned,
    },
    {
      key: 'variance',
      label: 'Variance',
      render: (_: unknown, row: typeof departmentStats[0]) => {
        const variant = row.variance > 0 ? 'warning' : row.variance < 0 ? 'success' : 'neutral';
        return (
          <div className="flex items-center gap-1">
            {row.variance > 0 ? (
              <TrendingUp className="h-4 w-4 text-warning" />
            ) : row.variance < 0 ? (
              <TrendingDown className="h-4 w-4 text-success" />
            ) : null}
            <StatusBadge variant={variant}>
              {row.variance > 0 ? '+' : ''}{row.variance}
            </StatusBadge>
          </div>
        );
      },
    },
    {
      key: 'budget',
      label: 'Budget',
      render: (_: unknown, row: typeof departmentStats[0]) =>
        `₹${row.budget.toLocaleString('en-IN')}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: typeof departmentStats[0]) =>
        row.plan ? (
          <StatusBadge variant={row.plan.status === 'approved' ? 'success' : 'neutral'}>
            {row.plan.status}
          </StatusBadge>
        ) : (
          <span className="text-xs text-muted-foreground">Not Planned</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Headcount Planning</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Plan and track headcount by department, quarter, and year
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {quarters.map(q => (
                <SelectItem key={q} value={q}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleCreatePlan}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold text-foreground">{totalStats.actual}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Planned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold text-foreground">{totalStats.planned}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Variance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {totalStats.variance > 0 ? (
                <TrendingUp className="h-5 w-5 text-warning" />
              ) : totalStats.variance < 0 ? (
                <TrendingDown className="h-5 w-5 text-success" />
              ) : (
                <div className="h-5 w-5" />
              )}
              <span className="text-2xl font-bold text-foreground">
                {totalStats.variance > 0 ? '+' : ''}{totalStats.variance}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-foreground">
              ₹{totalStats.budget.toLocaleString('en-IN')}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Department Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Department Headcount Plans - {selectedQuarter} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={departmentStats}
            columns={columns}
            searchable={false}
            viewToggle={false}
            onRowClick={(row) => {
              if (row.plan) {
                handleEditPlan(row.plan);
              }
            }}
            actions={(row) => (
              row.plan ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditPlan(row.plan!)}
                >
                  Edit Plan
                </Button>
              ) : null
            )}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Plan Modal */}
      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Headcount Plan' : 'Create Headcount Plan'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Department</Label>
              <Select
                value={planFormData.departmentId}
                onValueChange={(value) => setPlanFormData({ ...planFormData, departmentId: value })}
                disabled={!!editingPlan}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quarter</Label>
                <Select
                  value={planFormData.quarter}
                  onValueChange={(value) => setPlanFormData({ ...planFormData, quarter: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {quarters.map(q => (
                      <SelectItem key={q} value={q}>
                        {q}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Select
                  value={String(planFormData.year)}
                  onValueChange={(value) => setPlanFormData({ ...planFormData, year: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Planned Headcount</Label>
              <Input
                type="number"
                value={planFormData.plannedHeadcount}
                onChange={(e) => setPlanFormData({ ...planFormData, plannedHeadcount: Number(e.target.value) })}
                min="0"
              />
            </div>
            <div>
              <Label>Budget (₹)</Label>
              <Input
                type="number"
                value={planFormData.budget}
                onChange={(e) => setPlanFormData({ ...planFormData, budget: Number(e.target.value) })}
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlanModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePlan} disabled={!planFormData.departmentId}>
              {editingPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
