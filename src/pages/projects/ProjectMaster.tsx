import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Eye, Archive, FileText } from 'lucide-react';
import { Project, ProjectStatus, ProjectType } from '@/types/projects';
import { ProjectMasterModal } from '@/components/projects/ProjectMasterModal';
import { dummyProjects } from '@/data/projects-data';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';

const statusLabels: Record<ProjectStatus, string> = {
  draft: 'Draft',
  approved: 'Approved',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
  closed: 'Closed',
};

const typeLabels: Record<ProjectType, string> = {
  construction: 'Construction',
  renovation: 'Renovation',
  restoration: 'Restoration',
  infrastructure: 'Infrastructure',
  it: 'IT / Digital',
};

export default function ProjectMaster() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(dummyProjects);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!checkModuleAccess('projects')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (typeFilter !== 'all' && project.projectType !== typeFilter) return false;
      if (statusFilter !== 'all' && project.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          project.projectCode.toLowerCase().includes(query) ||
          project.name.toLowerCase().includes(query) ||
          project.locationName?.toLowerCase().includes(query) ||
          project.donorName?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [projects, typeFilter, statusFilter, searchQuery]);

  const summaryStats = useMemo(() => {
    const active = projects.filter(p => p.status === 'in_progress').length;
    const onHold = projects.filter(p => p.status === 'on_hold').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => {
      // This would come from budget data
      return sum;
    }, 0);
    return { active, onHold, completed, totalBudget };
  }, [projects]);

  const handleSaveProject = (data: Partial<Project>) => {
    if (editingProject) {
      setProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...data, updatedAt: new Date().toISOString(), updatedBy: user?.id, updatedByName: user?.name } : p));
    } else {
      const newProject: Project = {
        ...data,
        id: `prj-${Date.now()}`,
        projectCode: `PRJ-${new Date().getFullYear()}-${String(projects.length + 1).padStart(3, '0')}`,
        status: 'draft',
        baselineLocked: false,
        baselineVersion: 1,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'user-1',
        createdByName: user?.name || 'User',
        updatedAt: new Date().toISOString(),
      } as Project;
      setProjects([...projects, newProject]);
    }
    setEditingProject(null);
    setProjectModalOpen(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setProjectModalOpen(true);
  };

  const handleView = (project: Project) => {
    setViewingProject(project);
    setProjectModalOpen(true);
  };

  const handleArchive = (project: Project) => {
    if (confirm(`Are you sure you want to archive project ${project.projectCode}?`)) {
      setProjects(projects.map(p => p.id === project.id ? { ...p, status: 'closed' as ProjectStatus } : p));
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const variants: Record<ProjectStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      approved: 'outline',
      in_progress: 'default',
      on_hold: 'outline',
      completed: 'default',
      closed: 'secondary',
    };
    return <Badge variant={variants[status]}>{statusLabels[status]}</Badge>;
  };

  const columns = [
    {
      accessorKey: 'projectCode',
      header: 'Project Code',
    },
    {
      accessorKey: 'name',
      header: 'Project Name',
    },
    {
      accessorKey: 'projectType',
      header: 'Type',
      cell: ({ row }: any) => typeLabels[row.original.projectType],
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'projectManagerName',
      header: 'Manager',
    },
    {
      accessorKey: 'targetCompletionDate',
      header: 'Target Date',
      cell: ({ row }: any) => row.original.targetCompletionDate ? new Date(row.original.targetCompletionDate).toLocaleDateString() : '-',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const project = row.original as Project;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleView(project)}>
              <Eye className="h-4 w-4" />
            </Button>
            {checkWriteAccess('projects', 'project_master') && (
              <>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                  <Edit className="h-4 w-4" />
                </Button>
                {project.status !== 'closed' && (
                  <Button variant="ghost" size="sm" onClick={() => handleArchive(project)}>
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Project Master"
        description="Manage all temple projects including construction, renovation, restoration, and infrastructure"
        actions={
          checkWriteAccess('projects', 'project_master') ? (
            <Button onClick={() => {
              setEditingProject(null);
              setProjectModalOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          ) : null
        }
      />

      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Active Projects</div>
            <div className="text-2xl font-bold">{summaryStats.active}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">On Hold</div>
            <div className="text-2xl font-bold">{summaryStats.onHold}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Completed</div>
            <div className="text-2xl font-bold">{summaryStats.completed}</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Total Budget</div>
            <div className="text-2xl font-bold">₹{summaryStats.totalBudget.toLocaleString()}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by code, name, location, donor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="construction">Construction</SelectItem>
              <SelectItem value="renovation">Renovation</SelectItem>
              <SelectItem value="restoration">Restoration</SelectItem>
              <SelectItem value="infrastructure">Infrastructure</SelectItem>
              <SelectItem value="it">IT / Digital</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Table */}
        <DataTable columns={columns} data={filteredProjects} />
      </div>

      {projectModalOpen && (
        <ProjectMasterModal
          open={projectModalOpen}
          onClose={() => {
            setProjectModalOpen(false);
            setEditingProject(null);
            setViewingProject(null);
          }}
          onSave={handleSaveProject}
          project={editingProject || viewingProject || undefined}
          isViewMode={!!viewingProject}
        />
      )}
    </MainLayout>
  );
}
