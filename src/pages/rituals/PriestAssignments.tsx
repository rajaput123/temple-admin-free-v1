import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Clock, TrendingUp, Users } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { PriestAssignmentModal } from '@/components/rituals/PriestAssignmentModal';
import { PriestAssignment, priestRoleLabels, Priest } from '@/types/rituals';
import { dummyPriestAssignments } from '@/data/rituals-data';
import { dummySacreds } from '@/data/temple-structure-data';
import { dummyOfferings } from '@/data/rituals-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function PriestAssignments() {
  const navigate = useNavigate();
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [assignments, setAssignments] = useState<PriestAssignment[]>(dummyPriestAssignments);
  const [priests, setPriests] = useState<Priest[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<PriestAssignment | null>(null);
  
  if (!checkModuleAccess('priests')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }
  
  const canEdit = checkWriteAccess('priests');

  const handleSave = (assignment: Partial<PriestAssignment>) => {
    if (assignment.id) {
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignment.id ? { ...a, ...assignment } : a))
      );
    } else {
      const newAssignment: PriestAssignment = {
        ...assignment,
        id: `assignment-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      } as PriestAssignment;
      setAssignments((prev) => [...prev, newAssignment]);
    }
  };

  const getSacredName = (sacredId: string) => {
    return dummySacreds.find((s) => s.id === sacredId)?.name || 'Unknown';
  };

  const getOfferingName = (offeringId: string) => {
    return dummyOfferings.find((o) => o.id === offeringId)?.name || 'Unknown';
  };

  const formatDateRange = (start: string, end: string) => {
    if (start === end) return start;
    return `${start} to ${end}`;
  };

  const columns = [
    { key: 'priestName', label: 'Priest Name', sortable: true },
    {
      key: 'sacredId',
      label: 'Sacred',
      render: (value: unknown) => getSacredName(value as string),
    },
    {
      key: 'offeringId',
      label: 'Offering / Ritual',
      render: (value: unknown) => getOfferingName(value as string),
    },
    {
      key: 'startDate',
      label: 'Effective Period',
      render: (_: unknown, row: PriestAssignment) => formatDateRange(row.startDate, row.endDate),
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: unknown, row: PriestAssignment) => (
        <div className="flex items-center gap-2">
          <StatusBadge variant={value === 'main' ? 'primary' : 'secondary'}>
            {priestRoleLabels[value as keyof typeof priestRoleLabels]}
          </StatusBadge>
          {row.isSubstitute && (
            <StatusBadge variant="warning" className="text-xs">Substitute</StatusBadge>
          )}
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Priest Assignment"
        description="Assign priests to rituals and sevas"
        actions={
          canEdit && (
            <Button
              size="sm"
              onClick={() => {
                setEditingAssignment(null);
                setModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Assignment
            </Button>
          )
        }
      />

      <div className="mt-6">
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Assignments</TabsTrigger>
            <TabsTrigger value="shifts">Shifts</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="roster">Festival Roster</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <DataTable
              data={assignments}
              columns={columns}
              searchPlaceholder="Search assignments..."
              defaultViewMode="grid"
              imageKey="image"
              onRowClick={(row) => navigate(`/rituals/priest-assignments/${row.id}`)}
              actions={
                canEdit
                  ? (row) => (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingAssignment(row);
                            setModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </>
                    )
                  : undefined
              }
            />
          </TabsContent>
          
          <TabsContent value="shifts">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {assignments.filter(a => a.shift).map(assignment => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{assignment.priestName}</h3>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-muted-foreground">Shift: </span>
                          <span className="font-medium">{assignment.shift}</span>
                        </div>
                        {assignment.restPeriods && assignment.restPeriods.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Rest Periods: </span>
                            <span>{assignment.restPeriods.map(rp => `${rp.start}-${rp.end}`).join(', ')}</span>
                          </div>
                        )}
                        {assignment.isSubstitute && (
                          <div>
                            <span className="text-muted-foreground">Substitute for: </span>
                            <span>Priest {assignment.originalPriestId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {assignments.filter(a => a.shift).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No shift assignments configured. Edit an assignment to add shift information.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {assignments.filter(a => a.performanceMetrics).map(assignment => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{assignment.priestName}</h3>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {assignment.performanceMetrics && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Completed: </span>
                            <span className="font-medium">{assignment.performanceMetrics.offeringsCompleted}</span>
                          </div>
                          {assignment.performanceMetrics.averageRating && (
                            <div>
                              <span className="text-muted-foreground">Rating: </span>
                              <span className="font-medium">{assignment.performanceMetrics.averageRating}/5</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {assignments.filter(a => a.performanceMetrics).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No performance metrics available. Performance tracking will appear here.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="roster">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {assignments.map(assignment => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{assignment.priestName}</h3>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-muted-foreground">Sacred: </span>
                          <span>{getSacredName(assignment.sacredId)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Offering: </span>
                          <span>{getOfferingName(assignment.offeringId)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Period: </span>
                          <span>{formatDateRange(assignment.startDate, assignment.endDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {canEdit && (
        <PriestAssignmentModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          assignment={editingAssignment}
          sacreds={dummySacreds.filter((s) => s.status === 'active')}
          offerings={dummyOfferings.filter((o) => o.status === 'active')}
          onSave={handleSave}
        />
      )}
    </MainLayout>
  );
}
