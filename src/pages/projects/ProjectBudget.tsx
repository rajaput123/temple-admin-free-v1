import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { Project, ProjectBudget, BudgetItem } from '@/types/projects';
import { BudgetAllocationModal } from '@/components/projects/BudgetAllocationModal';
import { dummyProjects, dummyProjectBudgets } from '@/data/projects-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function ProjectBudget() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [budgets, setBudgets] = useState<ProjectBudget[]>(dummyProjectBudgets);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  if (!checkModuleAccess('projects')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const projectBudget = useMemo(() => {
    if (!selectedProject) return null;
    return budgets.find(b => b.projectId === selectedProject.id);
  }, [budgets, selectedProject]);

  const budgetColumns = [
    {
      accessorKey: 'itemName',
      header: 'Item Name',
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'estimatedAmount',
      header: 'Estimated (₹)',
      cell: ({ row }: any) => `₹${row.original.estimatedAmount.toLocaleString()}`,
    },
    {
      accessorKey: 'actualAmount',
      header: 'Actual (₹)',
      cell: ({ row }: any) => row.original.actualAmount ? `₹${row.original.actualAmount.toLocaleString()}` : '-',
    },
    {
      accessorKey: 'fundingSource',
      header: 'Funding Source',
      cell: ({ row }: any) => {
        const source = row.original.fundingSource;
        const labels: Record<string, string> = {
          temple_funds: 'Temple Funds',
          donor_funded: 'Donor-Funded',
          government_grant: 'Government Grant',
        };
        return labels[source] || source;
      },
    },
    {
      accessorKey: 'overrunAlert',
      header: 'Overrun',
      cell: ({ row }: any) => row.original.overrunAlert ? (
        <Badge variant="destructive">Alert</Badge>
      ) : '-',
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Budget & Funding"
        description="Manage project budgets, funding sources, and track budget vs actual"
        actions={
          selectedProject && checkWriteAccess('projects', 'project_budget') ? (
            <Button onClick={() => setBudgetModalOpen(true)}>
              Manage Budget
            </Button>
          ) : null
        }
      />

      <div className="space-y-4">
        {/* Project Selection */}
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

        {selectedProject && projectBudget ? (
          <>
            {/* Budget Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved Budget</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{projectBudget.approvedBudget.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{projectBudget.totalSpent.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Committed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{projectBudget.totalCommitted.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{projectBudget.availableBudget.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            {/* Overrun Alert */}
            {projectBudget.overrunAlert && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div className="text-sm text-red-800">
                  Budget overrun detected! Approval required for budget revision.
                </div>
              </div>
            )}

            {/* Funding Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Funding Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Temple Funds:</span>
                    <span className="font-semibold">₹{projectBudget.fundingBreakdown.templeFunds.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Donor Funds:</span>
                    <span className="font-semibold">₹{projectBudget.fundingBreakdown.donorFunds.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Government Grants:</span>
                    <span className="font-semibold">₹{projectBudget.fundingBreakdown.governmentGrants.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Items Table */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Budget Items</h3>
              <DataTable columns={budgetColumns} data={projectBudget.budgetItems} />
            </div>
          </>
        ) : selectedProject ? (
          <div className="text-center text-muted-foreground py-8">
            No budget data found for this project
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Please select a project to view budget details
          </div>
        )}
      </div>

      {budgetModalOpen && selectedProject && projectBudget && (
        <BudgetAllocationModal
          open={budgetModalOpen}
          onClose={() => setBudgetModalOpen(false)}
          project={selectedProject}
          budget={projectBudget}
          onSave={(updatedBudget) => {
            setBudgets(budgets.map(b => b.id === projectBudget.id ? updatedBudget : b));
            setBudgetModalOpen(false);
          }}
        />
      )}
    </MainLayout>
  );
}
