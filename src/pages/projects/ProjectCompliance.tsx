import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import { Project, QualityCheck } from '@/types/projects';
import { QualityCheckModal } from '@/components/projects/QualityCheckModal';
import { dummyProjects, dummyQualityChecks } from '@/data/projects-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function ProjectCompliance() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>(dummyQualityChecks);
  const [qualityModalOpen, setQualityModalOpen] = useState(false);

  if (!checkModuleAccess('projects')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const projectQualityChecks = useMemo(() => {
    if (!selectedProject) return [];
    return qualityChecks.filter(qc => qc.projectId === selectedProject.id);
  }, [qualityChecks, selectedProject]);

  const qualityColumns = [
    {
      accessorKey: 'checkDate',
      header: 'Date',
      cell: ({ row }: any) => new Date(row.original.checkDate).toLocaleDateString(),
    },
    {
      accessorKey: 'checkType',
      header: 'Check Type',
      cell: ({ row }: any) => {
        const type = row.original.checkType;
        return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
      },
    },
    {
      accessorKey: 'safetyCompliance',
      header: 'Safety',
      cell: ({ row }: any) => {
        const compliant = row.original.safetyCompliance.compliant;
        return compliant ? (
          <Badge variant="default" className="flex items-center gap-1 w-fit">
            <CheckCircle className="h-3 w-3" />
            Compliant
          </Badge>
        ) : (
          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
            <XCircle className="h-3 w-3" />
            Non-Compliant
          </Badge>
        );
      },
    },
    {
      accessorKey: 'conductedByName',
      header: 'Conducted By',
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Quality, Safety & Compliance"
        description="Manage quality checks, safety compliance, heritage compliance, and government inspections"
        actions={
          selectedProject && checkWriteAccess('projects', 'project_compliance') ? (
            <Button onClick={() => setQualityModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Quality Check
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
          <DataTable columns={qualityColumns} data={projectQualityChecks} />
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Please select a project to view compliance records
          </div>
        )}
      </div>

      {qualityModalOpen && selectedProject && (
        <QualityCheckModal
          open={qualityModalOpen}
          onClose={() => setQualityModalOpen(false)}
          project={selectedProject}
          onSave={(qualityData) => {
            const newQuality: QualityCheck = {
              ...qualityData,
              id: `qc-${Date.now()}`,
              projectId: selectedProject.id,
              createdAt: new Date().toISOString(),
            } as QualityCheck;
            setQualityChecks([...qualityChecks, newQuality]);
            setQualityModalOpen(false);
          }}
        />
      )}
    </MainLayout>
  );
}
