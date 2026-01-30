import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Edit, Building2, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Sacred, Temple, ChildTemple } from '@/types/temple-structure';
import { sacredTypeLabels } from '@/types/temple-structure';
import { SacredModal } from '@/components/structure/SacredModal';
import { dummyTemples, dummyChildTemples, dummySacreds } from '@/data/temple-structure-data';
import { format } from 'date-fns';

export default function SacredDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [temples] = useState<Temple[]>(dummyTemples);
  const [childTemples] = useState<ChildTemple[]>(dummyChildTemples);
  const [sacreds, setSacreds] = useState<Sacred[]>(dummySacreds);
  const [sacredModalOpen, setSacredModalOpen] = useState(false);

  const sacred = sacreds.find(s => s.id === id);

  const getTempleName = (id: string) => temples.find(t => t.id === id)?.name || 'Unknown';
  const getChildTempleName = (id: string) => childTemples.find(t => t.id === id)?.name || 'Unknown';
  const getAssociatedTempleName = (templeId: string, templeType: 'temple' | 'child_temple') => {
    if (templeType === 'temple') return getTempleName(templeId);
    return getChildTempleName(templeId);
  };

  const handleSaveSacred = (data: Partial<Sacred>) => {
    if (sacred) {
      setSacreds(sacreds.map(s => s.id === sacred.id ? { ...s, ...data } : s));
    }
    setSacredModalOpen(false);
  };

  const toggleSacredStatus = () => {
    if (sacred) {
      setSacreds(sacreds.map(s =>
        s.id === sacred.id
          ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
          : s
      ));
    }
  };

  if (!sacred) {
    return (
      <MainLayout>
        <PageHeader title="Sacred Item Not Found" />
        <div className="mt-6 text-center py-16 text-muted-foreground">
          <p className="text-base">Sacred item not found.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Sacred Items"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/structure/sacred')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={() => setSacredModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        }
      />

      <div className="mt-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start mb-6 flex-wrap">
            <TabsTrigger value="overview" className="text-base">Overview</TabsTrigger>
            <TabsTrigger value="sacred-info" className="text-base">Sacred Info</TabsTrigger>
            <TabsTrigger value="services" className="text-base">Services</TabsTrigger>
            <TabsTrigger value="schedule" className="text-base">Schedule</TabsTrigger>
            <TabsTrigger value="details" className="text-base">Details</TabsTrigger>
            <TabsTrigger value="gallery" className="text-base">Gallery</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-6">
            {/* Hero Image */}
            {sacred.image && (
              <div className="w-full rounded-lg overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
                <div className="relative w-full flex items-center justify-center" style={{ minHeight: '300px', maxHeight: '500px' }}>
                  <img
                    src={sacred.image}
                    alt={sacred.name}
                    className="w-full h-full object-contain"
                    style={{ maxHeight: '500px' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Sacred Name & Info */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-4 border-b">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{sacred.name}</h1>
                  <StatusBadge variant={sacred.sacredType === 'deity' ? 'primary' : 'warning'} className="px-3 py-1.5 h-auto text-sm">
                    {sacredTypeLabels[sacred.sacredType]}
                  </StatusBadge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-base">Temple: {getAssociatedTempleName(sacred.associatedTempleId, sacred.associatedTempleType)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge variant={sacred.status === 'active' ? 'success' : 'neutral'} className="px-3 py-1.5 h-auto text-sm">
                  {sacred.status === 'active' ? 'Active' : 'Inactive'}
                </StatusBadge>
                <Switch
                  checked={sacred.status === 'active'}
                  onCheckedChange={toggleSacredStatus}
                />
              </div>
            </div>

            {/* Description */}
            {sacred.description && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">About</h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {sacred.description}
                </p>
              </div>
            )}

            {/* Associated Temple */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Associated Temple</h2>
              <dl className="space-y-0 divide-y divide-border/50 max-w-2xl">
                <div className="py-4 flex justify-between items-start">
                  <dt className="text-base text-muted-foreground font-medium">Temple Name</dt>
                  <dd className="text-base font-semibold text-foreground">{getAssociatedTempleName(sacred.associatedTempleId, sacred.associatedTempleType)}</dd>
                </div>
                <div className="py-4 flex justify-between items-start">
                  <dt className="text-base text-muted-foreground font-medium">Temple Type</dt>
                  <dd className="text-base font-semibold text-foreground">{sacred.associatedTempleType === 'temple' ? 'Main Temple' : 'Child Temple'}</dd>
                </div>
              </dl>
            </div>
          </TabsContent>

          {/* Sacred Info Tab */}
          <TabsContent value="sacred-info" className="mt-0">
            <div className="max-w-3xl space-y-8">
              {/* Samadhi Details */}
              {sacred.sacredType === 'samadhi' && (sacred.jagadguruName || sacred.peetha || sacred.samadhiYear) && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Samadhi Details
                  </h2>
                  <dl className="space-y-0 divide-y divide-border/50">
                    {sacred.jagadguruName && (
                      <div className="py-4 flex justify-between items-start">
                        <dt className="text-base text-muted-foreground font-medium">Jagadguru Name</dt>
                        <dd className="text-base font-semibold text-foreground">{sacred.jagadguruName}</dd>
                      </div>
                    )}
                    {sacred.peetha && (
                      <div className="py-4 flex justify-between items-start">
                        <dt className="text-base text-muted-foreground font-medium">Peetha</dt>
                        <dd className="text-base font-semibold text-foreground">{sacred.peetha}</dd>
                      </div>
                    )}
                    {sacred.samadhiYear && (
                      <div className="py-4 flex justify-between items-start">
                        <dt className="text-base text-muted-foreground font-medium">Samadhi Year</dt>
                        <dd className="text-base font-semibold text-foreground">{sacred.samadhiYear}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Sacred Objects */}
              {sacred.sacredObjects && sacred.sacredObjects.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Sacred Objects</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {sacred.sacredObjects.map((obj, index) => (
                      <div key={index} className="px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-sm font-medium text-foreground">{obj.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{obj.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Festivals */}
              {sacred.festivals && sacred.festivals.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Festivals</h2>
                  <div className="space-y-3">
                    {sacred.festivals.map((festival, index) => (
                      <div key={index} className="px-4 py-3 bg-muted/30 border rounded-lg">
                        <p className="font-semibold text-foreground">{festival.name}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(festival.date), 'MMMM dd, yyyy')}</p>
                        {festival.description && (
                          <p className="text-sm text-muted-foreground mt-1">{festival.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Installation Date */}
              {sacred.installationDate && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Installation Date</h2>
                  <p className="text-base text-muted-foreground">{format(new Date(sacred.installationDate), 'MMMM dd, yyyy')}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="mt-0">
            <div className="max-w-4xl space-y-8">
              {/* Eligible Pujas */}
              {sacred.eligiblePujas && sacred.eligiblePujas.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Eligible Pujas</h2>
                  <div className="flex flex-wrap gap-2">
                    {sacred.eligiblePujas.map((puja, index) => (
                      <span key={index} className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium border border-primary/20">
                        {puja}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligible Sevas */}
              {sacred.eligibleSevas && sacred.eligibleSevas.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Eligible Sevas</h2>
                  <div className="flex flex-wrap gap-2">
                    {sacred.eligibleSevas.map((seva, index) => (
                      <span key={index} className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium border border-primary/20">
                        {seva}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Darshan Priority */}
              {sacred.darshanPriority && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Darshan Priority</h2>
                  <dl className="space-y-0 divide-y divide-border/50 max-w-2xl">
                    <div className="py-4 flex justify-between items-start">
                      <dt className="text-base text-muted-foreground font-medium">Priority Level</dt>
                      <dd className="text-base font-semibold text-foreground capitalize">{sacred.darshanPriority}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="mt-0">
            <div className="max-w-3xl space-y-8">
              {/* Abhishekam Schedule */}
              {sacred.abhishekamSchedule && sacred.abhishekamSchedule.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Abhishekam Schedule</h2>
                  <div className="space-y-3">
                    {sacred.abhishekamSchedule.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center px-4 py-3 bg-muted/30 border rounded-lg">
                        <div>
                          <p className="font-semibold text-foreground">{schedule.day}</p>
                          <p className="text-sm text-muted-foreground">{schedule.time}</p>
                        </div>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                          {schedule.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Temporary Closure */}
              {sacred.temporaryClosure && sacred.temporaryClosure.isClosed && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Temporary Closure</h2>
                  <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="font-semibold text-destructive">Currently Closed</p>
                    {sacred.temporaryClosure.fromDate && (
                      <p className="text-sm text-muted-foreground mt-1">
                        From: {format(new Date(sacred.temporaryClosure.fromDate), 'MMMM dd, yyyy')}
                      </p>
                    )}
                    {sacred.temporaryClosure.toDate && (
                      <p className="text-sm text-muted-foreground">
                        To: {format(new Date(sacred.temporaryClosure.toDate), 'MMMM dd, yyyy')}
                      </p>
                    )}
                    {sacred.temporaryClosure.reason && (
                      <p className="text-sm text-muted-foreground mt-1">Reason: {sacred.temporaryClosure.reason}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-0">
            <div className="max-w-3xl space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Sacred Item Information</h2>
                <dl className="space-y-0 divide-y divide-border/50">
                  <div className="py-4 flex justify-between items-start">
                    <dt className="text-base text-muted-foreground font-medium">Sacred ID</dt>
                    <dd className="text-base font-semibold text-foreground font-mono text-sm">{sacred.id}</dd>
                  </div>
                  <div className="py-4 flex justify-between items-start">
                    <dt className="text-base text-muted-foreground font-medium">Created On</dt>
                    <dd className="text-base font-semibold text-foreground">{format(new Date(sacred.createdAt), 'MMMM dd, yyyy')}</dd>
                  </div>
                </dl>
              </div>

              {/* Custom Fields */}
              {sacred.customFields && Object.keys(sacred.customFields).length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Custom Fields</h2>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(sacred.customFields).map(([key, value]) => (
                      <div key={key} className="space-y-2 pb-4 border-b">
                        <dt className="text-sm text-muted-foreground font-medium uppercase tracking-wide">{key}</dt>
                        <dd className="text-base font-semibold text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="mt-0">
            <div className="max-w-6xl">
              <h2 className="text-2xl font-bold mb-6">Sacred Item Gallery</h2>
              {sacred.image ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity">
                    <img
                      src={sacred.image}
                      alt={sacred.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <p className="text-white text-sm font-medium">Main View</p>
                    </div>
                  </div>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted/30 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">More images coming soon</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-base">No images available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <SacredModal
        open={sacredModalOpen}
        onOpenChange={setSacredModalOpen}
        sacred={sacred}
        temples={temples}
        childTemples={childTemples}
        onSave={handleSaveSacred}
      />
    </MainLayout>
  );
}
