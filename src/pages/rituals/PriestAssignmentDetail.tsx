import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { ArrowLeft, Edit, UserCog, Sparkles, Flame, Calendar, Info } from 'lucide-react';
import { PriestAssignment, priestRoleLabels } from '@/types/rituals';
import { PriestAssignmentModal } from '@/components/rituals/PriestAssignmentModal';
import { dummyPriestAssignments } from '@/data/rituals-data';
import { dummySacreds } from '@/data/temple-structure-data';
import { dummyOfferings } from '@/data/rituals-data';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function PriestAssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<PriestAssignment[]>(dummyPriestAssignments);
  const [modalOpen, setModalOpen] = useState(false);
  
  const assignment = assignments.find(a => a.id === id);
  const sacred = dummySacreds.find(s => s.id === assignment?.sacredId);
  const offering = dummyOfferings.find(o => o.id === assignment?.offeringId);
  
  const canEdit = user?.role === 'super_admin' || user?.role === 'temple_administrator';

  const handleSave = (data: Partial<PriestAssignment>) => {
    if (assignment) {
      setAssignments(assignments.map(a => a.id === assignment.id ? { ...a, ...data } : a));
    }
    setModalOpen(false);
  };

  const formatDateRange = (start: string, end: string) => {
    if (start === end) return format(new Date(start), 'MMMM dd, yyyy');
    return `${format(new Date(start), 'MMMM dd, yyyy')} to ${format(new Date(end), 'MMMM dd, yyyy')}`;
  };

  if (!assignment) {
    return (
      <MainLayout>
        <PageHeader title="Priest Assignment Not Found" />
        <div className="mt-6">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Priest assignment not found.
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Priest Assignment Details"
        description={assignment.priestName}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/rituals/priests')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {canEdit && (
              <Button onClick={() => setModalOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        }
      />

      <div className="mt-6">
        <Card className="overflow-hidden">
          {assignment.image && (
            <div className="w-full h-64 md:h-80 bg-muted overflow-hidden">
              <img 
                src={assignment.image} 
                alt={assignment.priestName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-semibold text-foreground">{assignment.priestName}</h2>
                    <StatusBadge variant={assignment.role === 'main' ? 'primary' : 'secondary'}>
                      {priestRoleLabels[assignment.role]}
                    </StatusBadge>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Sacred</p>
                    <p className="text-sm font-medium text-foreground">
                      {sacred?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Flame className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Offering / Ritual</p>
                    <p className="text-sm font-medium text-foreground">
                      {offering?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Effective Period</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDateRange(assignment.startDate, assignment.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UserCog className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Role</p>
                    <p className="text-sm font-medium text-foreground">
                      {priestRoleLabels[assignment.role]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata Section */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Assignment ID</p>
                      <p className="text-sm font-medium text-foreground">{assignment.id}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Created On</p>
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(assignment.createdAt), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {canEdit && (
        <PriestAssignmentModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          assignment={assignment}
          sacreds={dummySacreds.filter((s) => s.status === 'active')}
          offerings={dummyOfferings.filter((o) => o.status === 'active')}
          onSave={handleSave}
        />
      )}
    </MainLayout>
  );
}
