import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Lock, Unlock, CheckCircle } from 'lucide-react';
import { Project, ProjectTask, ProjectMilestone } from '@/types/projects';
import { WBSBuilder } from '@/components/projects/WBSBuilder';
import { dummyProjects, dummyProjectTasks, dummyProjectMilestones } from '@/data/projects-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function ProjectPlanning() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>(dummyProjectTasks);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(dummyProjectMilestones);
  const [wbsModalOpen, setWbsModalOpen] = useState(false);
  const [baselineLocked, setBaselineLocked] = useState(false);

  if (!checkModuleAccess('projects')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const projectTasks = useMemo(() => {
    if (!selectedProject) return [];
    return tasks.filter(t => t.projectId === selectedProject.id);
  }, [tasks, selectedProject]);

  const projectMilestones = useMemo(() => {
    if (!selectedProject) return [];
    return milestones.filter(m => m.projectId === selectedProject.id);
  }, [milestones, selectedProject]);

  const handleSaveTasks = (updatedTasks: ProjectTask[]) => {
    setTasks([...tasks.filter(t => t.projectId !== selectedProject?.id), ...updatedTasks]);
  };

  const handleLockBaseline = () => {
    if (confirm('Are you sure you want to lock the baseline? This cannot be undone.')) {
      setBaselineLocked(true);
      if (selectedProject) {
        // In real app, would update project baseline status
      }
    }
  };

  const handleUnlockBaseline = () => {
    if (confirm('Unlocking baseline will allow changes. Are you sure?')) {
      setBaselineLocked(false);
    }
  };

  const taskColumns = [
    {
      accessorKey: 'taskCode',
      header: 'Code',
    },
    {
      accessorKey: 'name',
      header: 'Task Name',
    },
    {
      accessorKey: 'phase',
      header: 'Phase',
    },
    {
      accessorKey: 'estimatedDuration',
      header: 'Duration (Days)',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
          not_started: 'secondary',
          in_progress: 'default',
          completed: 'default',
          blocked: 'destructive',
          on_hold: 'outline',
        };
        return <Badge variant={variants[status] || 'secondary'}>{status.replace('_', ' ').toUpperCase()}</Badge>;
      },
    },
    {
      accessorKey: 'completionPercentage',
      header: 'Progress',
      cell: ({ row }: any) => `${row.original.completionPercentage}%`,
    },
    {
      accessorKey: 'isCriticalPath',
      header: 'Critical',
      cell: ({ row }: any) => row.original.isCriticalPath ? <Badge variant="destructive">Yes</Badge> : <Badge variant="secondary">No</Badge>,
    },
  ];

  const milestoneColumns = [
    {
      accessorKey: 'milestoneCode',
      header: 'Code',
    },
    {
      accessorKey: 'name',
      header: 'Milestone Name',
    },
    {
      accessorKey: 'targetDate',
      header: 'Target Date',
      cell: ({ row }: any) => new Date(row.original.targetDate).toLocaleDateString(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
          pending: 'secondary',
          completed: 'default',
          delayed: 'destructive',
        };
        return <Badge variant={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
      },
    },
    {
      accessorKey: 'paymentLinked',
      header: 'Payment Linked',
      cell: ({ row }: any) => row.original.paymentLinked ? <CheckCircle className="h-4 w-4 text-green-500" /> : '-',
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Planning & Milestones"
        description="Manage Work Breakdown Structure (WBS), milestones, dependencies, and baseline plans"
        actions={
          selectedProject && checkWriteAccess('projects', 'project_planning') ? (
            <div className="flex gap-2">
              {baselineLocked ? (
                <Button variant="outline" onClick={handleUnlockBaseline}>
                  <Unlock className="h-4 w-4 mr-2" />
                  Unlock Baseline
                </Button>
              ) : (
                <Button variant="outline" onClick={handleLockBaseline}>
                  <Lock className="h-4 w-4 mr-2" />
                  Lock Baseline
                </Button>
              )}
              <Button onClick={() => setWbsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Manage WBS
              </Button>
            </div>
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
              if (project) {
                setBaselineLocked(project.baselineLocked);
              }
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
          {selectedProject && baselineLocked && (
            <Badge variant="outline" className="flex items-center gap-2">
              <Lock className="h-3 w-3" />
              Baseline Locked (v{selectedProject.baselineVersion})
            </Badge>
          )}
        </div>

        {selectedProject ? (
          <>
            {/* WBS Tasks */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Work Breakdown Structure</h3>
              <DataTable columns={taskColumns} data={projectTasks} />
            </div>

            {/* Milestones */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Milestones</h3>
              <DataTable columns={milestoneColumns} data={projectMilestones} />
            </div>

            {/* Critical Path Info */}
            <div className="bg-card rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-2">Critical Path</h3>
              <div className="text-sm text-muted-foreground">
                Critical path tasks are highlighted in red. These tasks have zero float and any delay will impact project completion.
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Please select a project to view planning details
          </div>
        )}
      </div>

      {wbsModalOpen && selectedProject && (
        <WBSBuilder
          open={wbsModalOpen}
          onClose={() => setWbsModalOpen(false)}
          project={selectedProject}
          tasks={projectTasks}
          milestones={projectMilestones}
          onSave={handleSaveTasks}
          baselineLocked={baselineLocked}
        />
      )}
    </MainLayout>
  );
}
