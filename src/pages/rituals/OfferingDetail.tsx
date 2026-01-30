import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Edit, Clock, Sparkles, Calendar, Info, DollarSign, Users } from 'lucide-react';
import { Offering, offeringTypeLabels, dayLabels } from '@/types/rituals';
import { OfferingModal } from '@/components/rituals/OfferingModal';
import { dummyOfferings } from '@/data/rituals-data';
import { dummySacreds } from '@/data/temple-structure-data';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function OfferingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offerings, setOfferings] = useState<Offering[]>(dummyOfferings);
  const [modalOpen, setModalOpen] = useState(false);
  
  const offering = offerings.find(o => o.id === id);
  const sacred = dummySacreds.find(s => s.id === offering?.sacredId);
  
  const canEdit = user?.role === 'super_admin' || user?.role === 'temple_administrator';

  const handleSave = (data: Partial<Offering>) => {
    if (offering) {
      setOfferings(offerings.map(o => o.id === offering.id ? { ...o, ...data } : o));
    }
    setModalOpen(false);
  };

  const toggleStatus = () => {
    if (offering) {
      setOfferings(offerings.map(o => 
        o.id === offering.id 
          ? { ...o, status: o.status === 'active' ? 'paused' : 'active' } 
          : o
      ));
    }
  };

  const formatTime = (start?: string, end?: string) => {
    if (!start || !end) return '-';
    return `${start} - ${end}`;
  };

  const formatDays = (days: string[]) => {
    if (days.includes('all')) return 'All Days';
    return days.map((d) => dayLabels[d] || d).join(', ');
  };

  if (!offering) {
    return (
      <MainLayout>
        <PageHeader title="Offering Not Found" />
        <div className="mt-6">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Offering not found.
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Offering Details"
        description={offering.name}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/rituals/offerings')}>
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
          {offering.image && (
            <div className="w-full h-64 md:h-80 bg-muted overflow-hidden">
              <img 
                src={offering.image} 
                alt={offering.name}
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
                    <h2 className="text-2xl font-semibold text-foreground">{offering.name}</h2>
                    <StatusBadge variant={offering.type === 'seva' ? 'primary' : 'secondary'}>
                      {offeringTypeLabels[offering.type]}
                    </StatusBadge>
                    <StatusBadge variant={offering.status === 'active' ? 'success' : 'neutral'}>
                      {offering.status === 'active' ? 'Active' : 'Paused'}
                    </StatusBadge>
                  </div>
                  {sacred && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="h-4 w-4" />
                      <span>Sacred: {sacred.name}</span>
                    </div>
                  )}
                </div>
                {canEdit && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Switch
                      checked={offering.status === 'active'}
                      onCheckedChange={toggleStatus}
                    />
                  </div>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Timing</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatTime(offering.startTime, offering.endTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Applicable Days</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDays(offering.applicableDays)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Amount</p>
                    <p className="text-sm font-medium text-foreground">
                      {offering.amount === 0 ? 'Free' : `₹${offering.amount}`}
                    </p>
                  </div>
                </div>
                {offering.capacity && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Capacity</p>
                      <p className="text-sm font-medium text-foreground">
                        {offering.capacity} people
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Metadata Section */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Offering ID</p>
                      <p className="text-sm font-medium text-foreground">{offering.id}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Created On</p>
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(offering.createdAt), 'MMMM dd, yyyy')}
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
        <OfferingModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          offering={offering}
          sacreds={dummySacreds.filter((s) => s.status === 'active')}
          onSave={handleSave}
        />
      )}
    </MainLayout>
  );
}
