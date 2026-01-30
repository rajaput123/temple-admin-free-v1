import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Project, ChangeRequest, ChangeRequestStatus } from '@/types/projects';
import { ChangeRequestModal } from '@/components/projects/ChangeRequestModal';
import { dummyProjects, dummyChangeRequests } from '@/data/projects-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function ProjectChanges() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(dummyChangeRequests);
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [editingChange, setEditingChange] = useState<ChangeRequest | null>(null);

  if (!checkModuleAccess('projects')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const projectChanges = useMemo(() => {
    if (!selectedProject) return [];
    return changeRequests.filter(cr => cr.projectId === selectedProject.id);
  }, [changeRequests, selectedProject]);

  const changeColumns = [
    {
      accessorKey: 'changeRequestNumber',
      header: 'CR Number',
    },
    {
      accessorKey: 'changeType',
      header: 'Type',
      cell: ({ row }: any) => {
        const type = row.original.changeType;
        return type.charAt(0).toUpperCase() + type.slice(1);
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <div className="max-w-md truncate">{row.original.description}</div>
      ),
    },
    {
      accessorKey: 'costImpact',
      header: 'Cost Impact',
      cell: ({ row }: any) => row.original.costImpact ? `₹${row.original.costImpact.toLocaleString()}` : '-',
    },
    {
      accessorKey: 'timeImpact',
      header: 'Time Impact',
      cell: ({ row }: any) => row.original.timeImpact ? `${row.original.timeImpact} days` : '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variants: Record<ChangeRequestStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
          draft: 'secondary',
          pending_approval: 'outline',
          approved: 'default',
          rejected: 'destructive',
        };
        return <Badge variant={variants[status]}>{status.replace('_', ' ').toUpperCase()}</Badge>;
      },
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Change Requests & Delays"
        description="Manage scope, cost, and timeline change requests with approval workflows"
        actions={
          selectedProject && checkWriteAccess('projects', 'change_requests') ? (
            <Button onClick={() => {
              setEditingChange(null);
              setChangeModalOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Change Request
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
          <DataTable columns={changeColumns} data={projectChanges} />
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Please select a project to view change requests
          </div>
        )}
      </div>

      {changeModalOpen && selectedProject && (
        <ChangeRequestModal
          open={changeModalOpen}
          onClose={() => {
            setChangeModalOpen(false);
            setEditingChange(null);
          }}
          project={selectedProject}
          changeRequest={editingChange || undefined}
          onSave={(changeData) => {
            if (editingChange) {
              setChangeRequests(changeRequests.map(cr => cr.id === editingChange.id ? { ...cr, ...changeData } : cr));
            } else {
              const newChange: ChangeRequest = {
                ...changeData,
                id: `cr-${Date.now()}`,
                projectId: selectedProject.id,
                changeRequestNumber: `CR-${new Date().getFullYear()}-${String(changeRequests.length + 1).padStart(3, '0')}`,
                status: 'draft',
                implemented: false,
                createdAt: new Date().toISOString(),
                createdBy: 'user-1',
                createdByName: 'User',
                updatedAt: new Date().toISOString(),
              } as ChangeRequest;
              setChangeRequests([...changeRequests, newChange]);
            }
            setChangeModalOpen(false);
            setEditingChange(null);
          }}
        />
      )}
    </MainLayout>
  );
}
