import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Edit, Sparkles, Calendar, Info } from 'lucide-react';
import { FestivalEvent } from '@/types/rituals';
import { FestivalModal } from '@/components/rituals/FestivalModal';
import { dummyFestivals } from '@/data/rituals-data';
import { dummySacreds } from '@/data/temple-structure-data';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function FestivalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [festivals, setFestivals] = useState<FestivalEvent[]>(dummyFestivals);
  const [modalOpen, setModalOpen] = useState(false);
  
  const festival = festivals.find(f => f.id === id);
  const sacred = dummySacreds.find(s => s.id === festival?.sacredId);
  
  const canEdit = user?.role === 'super_admin' || user?.role === 'temple_administrator';

  const handleSave = (data: Partial<FestivalEvent>) => {
    if (festival) {
      setFestivals(festivals.map(f => f.id === festival.id ? { ...f, ...data } : f));
    }
    setModalOpen(false);
  };

  const formatDateRange = (start: string, end: string) => {
    if (start === end) return format(new Date(start), 'MMMM dd, yyyy');
    return `${format(new Date(start), 'MMMM dd, yyyy')} to ${format(new Date(end), 'MMMM dd, yyyy')}`;
  };

  if (!festival) {
    return (
      <MainLayout>
        <PageHeader title="Festival Not Found" />
        <div className="mt-6">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Festival not found.
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Festival Details"
        description={festival.name}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/rituals/festivals')}>
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
          {festival.image && (
            <div className="w-full h-64 md:h-80 bg-muted overflow-hidden">
              <img 
                src={festival.image} 
                alt={festival.name}
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
                  <h2 className="text-2xl font-semibold text-foreground mb-2">{festival.name}</h2>
                  {sacred && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="h-4 w-4" />
                      <span>Sacred: {sacred.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date Range</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDateRange(festival.startDate, festival.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <p className="text-sm font-medium text-foreground">
                      {(() => {
                        const start = new Date(festival.startDate);
                        const end = new Date(festival.endDate);
                        const diffTime = Math.abs(end.getTime() - start.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {festival.notes && (
                <div className="border-t pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <h3 className="text-lg font-medium text-foreground">Notes</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed ml-8">
                    {festival.notes}
                  </p>
                </div>
              )}

              {/* Metadata Section */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Festival ID</p>
                      <p className="text-sm font-medium text-foreground">{festival.id}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Created On</p>
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(festival.createdAt), 'MMMM dd, yyyy')}
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
        <FestivalModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          festival={festival}
          sacreds={dummySacreds.filter((s) => s.status === 'active')}
          onSave={handleSave}
        />
      )}
    </MainLayout>
  );
}
