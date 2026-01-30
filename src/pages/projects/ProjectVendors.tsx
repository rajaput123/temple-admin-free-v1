import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Star } from 'lucide-react';
import { Project, ProjectVendor } from '@/types/projects';
import { VendorContractModal } from '@/components/projects/VendorContractModal';
import { dummyProjects, dummyProjectVendors } from '@/data/projects-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function ProjectVendors() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [vendors, setVendors] = useState<ProjectVendor[]>(dummyProjectVendors);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<ProjectVendor | null>(null);

  if (!checkModuleAccess('projects')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const projectVendors = useMemo(() => {
    if (!selectedProject) return [];
    return vendors.filter(v => v.projectId === selectedProject.id);
  }, [vendors, selectedProject]);

  const vendorColumns = [
    {
      accessorKey: 'vendorName',
      header: 'Vendor Name',
    },
    {
      accessorKey: 'vendorType',
      header: 'Type',
      cell: ({ row }: any) => row.original.vendorType.charAt(0).toUpperCase() + row.original.vendorType.slice(1),
    },
    {
      accessorKey: 'contractValue',
      header: 'Contract Value',
      cell: ({ row }: any) => `₹${row.original.contractValue.toLocaleString()}`,
    },
    {
      accessorKey: 'performanceRating',
      header: 'Rating',
      cell: ({ row }: any) => {
        const rating = row.original.performanceRating;
        if (!rating) return '-';
        return (
          <div className="flex items-center gap-1">
            <Star className={`h-4 w-4 ${rating >= 1 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            <Star className={`h-4 w-4 ${rating >= 2 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            <Star className={`h-4 w-4 ${rating >= 3 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            <Star className={`h-4 w-4 ${rating >= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            <Star className={`h-4 w-4 ${rating >= 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
          active: 'default',
          completed: 'default',
          terminated: 'destructive',
        };
        return <Badge variant={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const vendor = row.original as ProjectVendor;
        return (
          <div className="flex items-center gap-2">
            {checkWriteAccess('projects', 'project_vendors') && (
              <Button variant="ghost" size="sm" onClick={() => {
                setEditingVendor(vendor);
                setVendorModalOpen(true);
              }}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Vendor & Contractor Management"
        description="Manage vendors, contractors, contracts, and performance tracking"
        actions={
          selectedProject && checkWriteAccess('projects', 'project_vendors') ? (
            <Button onClick={() => {
              setEditingVendor(null);
              setVendorModalOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
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
          <DataTable columns={vendorColumns} data={projectVendors} />
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Please select a project to view vendors
          </div>
        )}
      </div>

      {vendorModalOpen && selectedProject && (
        <VendorContractModal
          open={vendorModalOpen}
          onClose={() => {
            setVendorModalOpen(false);
            setEditingVendor(null);
          }}
          project={selectedProject}
          vendor={editingVendor || undefined}
          onSave={(vendorData) => {
            if (editingVendor) {
              setVendors(vendors.map(v => v.id === editingVendor.id ? { ...v, ...vendorData } : v));
            } else {
              const newVendor: ProjectVendor = {
                ...vendorData,
                id: `vendor-${Date.now()}`,
                projectId: selectedProject.id,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as ProjectVendor;
              setVendors([...vendors, newVendor]);
            }
            setVendorModalOpen(false);
            setEditingVendor(null);
          }}
        />
      )}
    </MainLayout>
  );
}
