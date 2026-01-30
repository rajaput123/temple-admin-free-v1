import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download } from 'lucide-react';
import { Project } from '@/types/projects';
import { dummyProjects, dummyProjectBudgets, dummyProjectPayments, dummyChangeRequests } from '@/data/projects-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function ProjectReports() {
  const { checkModuleAccess } = usePermissions();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (!checkModuleAccess('projects')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const projectBudget = useMemo(() => {
    if (!selectedProject) return null;
    return dummyProjectBudgets.find(b => b.projectId === selectedProject.id);
  }, [selectedProject]);

  const projectPayments = useMemo(() => {
    if (!selectedProject) return [];
    return dummyProjectPayments.filter(p => p.projectId === selectedProject.id);
  }, [selectedProject]);

  const projectChanges = useMemo(() => {
    if (!selectedProject) return [];
    return dummyChangeRequests.filter(cr => cr.projectId === selectedProject.id);
  }, [selectedProject]);

  const handleExportReport = (reportType: string) => {
    // Mock export functionality
    alert(`Exporting ${reportType} report for ${selectedProject?.name}`);
  };

  return (
    <MainLayout>
      <PageHeader
        title="Project Reports & Audit"
        description="Generate project status, budget, delay, and audit reports"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Project Status Summary
                  </span>
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('status')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Project Code:</span>
                    <span className="font-semibold">{selectedProject.projectCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-semibold">{selectedProject.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-semibold">{selectedProject.projectType}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Budget vs Actual
                  </span>
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('budget')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projectBudget ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Approved Budget:</span>
                      <span className="font-semibold">₹{projectBudget.approvedBudget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Spent:</span>
                      <span className="font-semibold">₹{projectBudget.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variance:</span>
                      <span className="font-semibold">
                        ₹{(projectBudget.totalSpent - projectBudget.approvedBudget).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No budget data available</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Payment Summary
                  </span>
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('payments')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Bills:</span>
                    <span className="font-semibold">{projectPayments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-semibold">
                      ₹{projectPayments.reduce((sum, p) => sum + p.billAmount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Change Requests
                  </span>
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('changes')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Changes:</span>
                    <span className="font-semibold">{projectChanges.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approved:</span>
                    <span className="font-semibold">
                      {projectChanges.filter(cr => cr.status === 'approved').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="font-semibold">
                      {projectChanges.filter(cr => cr.status === 'pending_approval').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Please select a project to view reports
          </div>
        )}
      </div>
    </MainLayout>
  );
}
