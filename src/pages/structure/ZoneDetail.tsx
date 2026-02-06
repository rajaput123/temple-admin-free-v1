import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Edit, MapPin, Building2, Calendar, Info, Users, Wrench } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zone, Temple, ChildTemple, zoneTypeLabels } from '@/types/temple-structure';
import { ZoneModal } from '@/components/structure/ZoneModal';
import { dummyTemples, dummyChildTemples, dummyZones } from '@/data/temple-structure-data';
import { format } from 'date-fns';

export default function ZoneDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [temples] = useState<Temple[]>(dummyTemples);
  const [childTemples] = useState<ChildTemple[]>(dummyChildTemples);
  const [zones, setZones] = useState<Zone[]>(dummyZones);
  const [zoneModalOpen, setZoneModalOpen] = useState(false);

  const zone = zones.find(z => z.id === id);

  const getTempleName = (id: string) => temples.find(t => t.id === id)?.name || 'Unknown';
  const getChildTempleName = (id: string) => childTemples.find(t => t.id === id)?.name || 'Unknown';
  const getAssociatedTempleName = (templeId: string, templeType: 'temple' | 'child_temple') => {
    if (templeType === 'temple') return getTempleName(templeId);
    return getChildTempleName(templeId);
  };

  const handleSaveZone = (data: Partial<Zone>) => {
    if (zone) {
      setZones(zones.map(z => z.id === zone.id ? { ...z, ...data } : z));
    }
    setZoneModalOpen(false);
  };

  const toggleZoneStatus = () => {
    if (zone) {
      setZones(zones.map(z =>
        z.id === zone.id
          ? { ...z, status: z.status === 'active' ? 'inactive' : 'active' }
          : z
      ));
    }
  };

  if (!zone) {
    return (
      <MainLayout>
        <PageHeader title="Zone Not Found" />
        <div className="mt-6">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Zone not found.
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Zone Details"
        description={zone.name}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/structure/zones')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={() => setZoneModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        }
      />

      <div className="mt-6">
        <Card className="overflow-hidden">
          {zone.image && (
            <div className="w-full h-64 md:h-80 bg-muted overflow-hidden">
              <img
                src={zone.image}
                alt={zone.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold text-foreground">{zone.name}</h2>
                  <StatusBadge variant="primary">
                    {zoneTypeLabels[zone.zoneType]}
                  </StatusBadge>
                  <StatusBadge variant={zone.status === 'active' ? 'success' : 'neutral'}>
                    {zone.status === 'active' ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Associated Temple: {getAssociatedTempleName(zone.associatedTempleId, zone.associatedTempleType)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Switch
                  checked={zone.status === 'active'}
                  onCheckedChange={toggleZoneStatus}
                />
              </div>
            </div>

            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-4 space-y-4">
                {zone.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Description
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {zone.description}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Associated Temple
                  </h3>
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <p className="font-semibold">{getAssociatedTempleName(zone.associatedTempleId, zone.associatedTempleType)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Zone ID</p>
                    <p className="font-semibold text-sm">{zone.id}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Created On</p>
                    <p className="font-semibold text-sm">
                      {format(new Date(zone.createdAt), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {zone.capacity !== undefined && (
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Capacity
                      </p>
                      <p className="font-semibold">{zone.capacity} people</p>
                    </div>
                  )}
                  {zone.queueLengthLimit !== undefined && (
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Queue Length Limit</p>
                      <p className="font-semibold">{zone.queueLengthLimit} people</p>
                    </div>
                  )}
                  {zone.pradakshinaSequence !== undefined && (
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Pradakshina Sequence</p>
                      <p className="font-semibold">{zone.pradakshinaSequence}</p>
                    </div>
                  )}
                </div>

                {zone.accessRestrictions && zone.accessRestrictions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Access Restrictions</h3>
                    <div className="flex flex-wrap gap-2">
                      {zone.accessRestrictions.map((restriction, index) => (
                        <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm capitalize">
                          {restriction}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {zone.peakHourCapacity && zone.peakHourCapacity.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Peak Hour Capacity</h3>
                    <div className="space-y-2">
                      {zone.peakHourCapacity.map((peak, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg border">
                          <p className="font-semibold text-sm">{peak.timeRange}</p>
                          <p className="text-sm text-muted-foreground">Capacity: {peak.capacity} people</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {zone.customFields && Object.keys(zone.customFields).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(zone.customFields).map(([key, value]) => (
                        <div key={key} className="p-2 border rounded-md">
                          <p className="text-xs text-muted-foreground uppercase">{key}</p>
                          <p className="font-medium text-sm">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="maintenance" className="mt-4 space-y-4">
                {zone.maintenanceSchedule && zone.maintenanceSchedule.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-primary" />
                      Maintenance Schedule
                    </h3>
                    <div className="space-y-2">
                      {zone.maintenanceSchedule.map((schedule, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg border">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{schedule.day}</p>
                              <p className="text-sm text-muted-foreground">{schedule.time}</p>
                              <p className="text-sm text-muted-foreground mt-1">Type: {schedule.type}</p>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {schedule.duration} min
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wrench className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No maintenance schedule available.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <ZoneModal
        open={zoneModalOpen}
        onOpenChange={setZoneModalOpen}
        zone={zone}
        temples={temples}
        childTemples={childTemples}
        onSave={handleSaveZone}
      />
    </MainLayout>
  );
}
