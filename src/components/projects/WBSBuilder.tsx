import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Project, ProjectTask, ProjectMilestone } from '@/types/projects';

interface WBSBuilderProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  onSave: (tasks: ProjectTask[]) => void;
  baselineLocked: boolean;
}

export function WBSBuilder({
  open,
  onClose,
  project,
  tasks,
  milestones,
  onSave,
  baselineLocked,
}: WBSBuilderProps) {
  const [localTasks, setLocalTasks] = useState<ProjectTask[]>(tasks);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [taskFormData, setTaskFormData] = useState({
    name: '',
    description: '',
    phase: '',
    estimatedDuration: 0,
    dependencies: [] as string[],
  });

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleAddTask = () => {
    const newTask: ProjectTask = {
      id: `task-${Date.now()}`,
      projectId: project.id,
      taskCode: `${localTasks.length + 1}.1`,
      name: taskFormData.name,
      description: taskFormData.description,
      level: 1,
      phase: taskFormData.phase,
      estimatedDuration: taskFormData.estimatedDuration,
      dependencies: taskFormData.dependencies,
      status: 'not_started',
      completionPercentage: 0,
      isMilestone: false,
      isCriticalPath: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLocalTasks([...localTasks, newTask]);
    setTaskFormData({
      name: '',
      description: '',
      phase: '',
      estimatedDuration: 0,
      dependencies: [],
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setLocalTasks(localTasks.filter(t => t.id !== taskId));
  };

  const handleSave = () => {
    onSave(localTasks);
    onClose();
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
      accessorKey: 'dependencies',
      header: 'Dependencies',
      cell: ({ row }: any) => {
        const deps = row.original.dependencies;
        if (!deps || deps.length === 0) return '-';
        return deps.map((depId: string) => {
          const depTask = localTasks.find(t => t.id === depId);
          return depTask?.taskCode || depId;
        }).join(', ');
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        if (baselineLocked) return '-';
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteTask(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Work Breakdown Structure - {project.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {baselineLocked && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              Baseline is locked. Changes require a change request.
            </div>
          )}

          {/* Add Task Form */}
          {!baselineLocked && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Add New Task</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Task Name *</Label>
                  <Input
                    value={taskFormData.name}
                    onChange={(e) => setTaskFormData({ ...taskFormData, name: e.target.value })}
                    placeholder="Enter task name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phase</Label>
                  <Input
                    value={taskFormData.phase}
                    onChange={(e) => setTaskFormData({ ...taskFormData, phase: e.target.value })}
                    placeholder="Enter phase"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estimated Duration (Days) *</Label>
                  <Input
                    type="number"
                    value={taskFormData.estimatedDuration}
                    onChange={(e) => setTaskFormData({ ...taskFormData, estimatedDuration: parseInt(e.target.value) || 0 })}
                    placeholder="Enter duration"
                  />
                </div>
              </div>
              <Button onClick={handleAddTask} disabled={!taskFormData.name || !taskFormData.estimatedDuration}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          )}

          {/* Tasks Table */}
          <div className="space-y-2">
            <h3 className="font-semibold">Tasks</h3>
            <DataTable columns={taskColumns} data={localTasks} />
          </div>

          {/* Critical Path Info */}
          <div className="bg-card rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Critical Path</h3>
            <div className="text-sm text-muted-foreground">
              Critical path will be calculated automatically based on task dependencies and durations.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={baselineLocked}>
            Save WBS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
