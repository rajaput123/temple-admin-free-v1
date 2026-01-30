import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp } from 'lucide-react';
import { Project, ProjectProgress } from '@/types/projects';
import { ProgressUpdateModal } from '@/components/projects/ProgressUpdateModal';
import { dummyProjects, dummyProjectProgress } from '@/data/projects-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function ProjectExecution() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [progress, setProgress] = useState<ProjectProgress[]>(dummyProjectProgress);
  const [progressModalOpen, setProgressModalOpen] = useState(false);

  if (!checkModuleAccess('projects')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const projectProgress = useMemo(() => {
    if (!selectedProject) return [];
    return progress.filter(p => p.projectId === selectedProject.id);
  }, [progress, selectedProject]);

  const overallProgress = useMemo(() => {
    if (!selectedProject || projectProgress.length === 0) return 0;
    // Calculate average progress
    const total = projectProgress.reduce((sum, p) => sum + p.completionPercentage, 0);
    return Math.round(total / projectProgress.length);
  }, [projectProgress, selectedProject]);

  const progressColumns = [
    {
      accessorKey: 'progressDate',
      header: 'Date',
      cell: ({ row }: any) => new Date(row.original.progressDate).toLocaleDateString(),
    },
    {
      accessorKey: 'progressType',
      header: 'Type',
      cell: ({ row }: any) => row.original.progressType.charAt(0).toUpperCase() + row.original.progressType.slice(1),
    },
    {
      accessorKey: 'completionPercentage',
      header: 'Progress',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${row.original.completionPercentage}%` }}
            />
          </div>
          <span>{row.original.completionPercentage}%</span>
        </div>
      ),
    },
    {
      accessorKey: 'workDescription',
      header: 'Description',
      cell: ({ row }: any) => (
        <div className="max-w-md truncate">{row.original.workDescription}</div>
      ),
    },
    {
      accessorKey: 'updatedByName',
      header: 'Updated By',
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Execution & Progress Tracking"
        description="Track daily/weekly progress updates with photo evidence and site inspection records"
        actions={
          selectedProject && checkWriteAccess('projects', 'project_execution') ? (
            <Button onClick={() => setProgressModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Progress Update
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
            {/* Progress Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overallProgress}%</div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Progress Updates */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Progress Updates</h3>
              <DataTable columns={progressColumns} data={projectProgress} />
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Please select a project to view progress
          </div>
        )}
      </div>

      {progressModalOpen && selectedProject && (
        <ProgressUpdateModal
          open={progressModalOpen}
          onClose={() => setProgressModalOpen(false)}
          project={selectedProject}
          onSave={(progressData) => {
            const newProgress: ProjectProgress = {
              ...progressData,
              id: `progress-${Date.now()}`,
              projectId: selectedProject.id,
              createdAt: new Date().toISOString(),
            } as ProjectProgress;
            setProgress([...progress, newProgress]);
            setProgressModalOpen(false);
          }}
        />
      )}
    </MainLayout>
  );
}
