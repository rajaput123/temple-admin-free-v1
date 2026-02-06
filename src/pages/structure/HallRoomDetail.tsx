import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Edit, DoorOpen, MapPin, Users, Calendar, Info, Wrench, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HallRoom, Zone, hallRoomTypeLabels } from '@/types/temple-structure';
import { HallRoomModal } from '@/components/structure/HallRoomModal';
import { dummyZones, dummyHallRooms } from '@/data/temple-structure-data';
import { format } from 'date-fns';

export default function HallRoomDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [zones] = useState<Zone[]>(dummyZones);
  const [hallRooms, setHallRooms] = useState<HallRoom[]>(dummyHallRooms);
  const [hallRoomModalOpen, setHallRoomModalOpen] = useState(false);

  const hallRoom = hallRooms.find(h => h.id === id);
  const zone = zones.find(z => z.id === hallRoom?.zoneId);

  const handleSaveHallRoom = (data: Partial<HallRoom>) => {
    if (hallRoom) {
      setHallRooms(hallRooms.map(h => h.id === hallRoom.id ? { ...h, ...data } : h));
    }
    setHallRoomModalOpen(false);
  };

  const toggleHallRoomStatus = () => {
    if (hallRoom) {
      setHallRooms(hallRooms.map(h =>
        h.id === hallRoom.id
          ? { ...h, status: h.status === 'active' ? 'inactive' : 'active' }
          : h
      ));
    }
  };

  if (!hallRoom) {
    return (
      <MainLayout>
        <PageHeader title="Hall / Room Not Found" />
        <div className="mt-6">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Hall or room not found.
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Hall / Room Details"
        description={hallRoom.name}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/structure/halls-rooms')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={() => setHallRoomModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        }
      />

      <div className="mt-6">
        <Card className="overflow-hidden">
          {hallRoom.image && (
            <div className="w-full h-64 md:h-80 bg-muted overflow-hidden">
              <img
                src={hallRoom.image}
                alt={hallRoom.name}
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
                  <h2 className="text-2xl font-semibold text-foreground">{hallRoom.name}</h2>
                  <StatusBadge variant="primary">
                    {hallRoomTypeLabels[hallRoom.type]}
                  </StatusBadge>
                  <StatusBadge variant={hallRoom.status === 'active' ? 'success' : 'neutral'}>
                    {hallRoom.status === 'active' ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </div>
                {zone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Zone: {zone.name}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Switch
                  checked={hallRoom.status === 'active'}
                  onCheckedChange={toggleHallRoomStatus}
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
                {hallRoom.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Description
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {hallRoom.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Capacity
                    </p>
                    <p className="font-semibold">{hallRoom.capacity} people</p>
                  </div>
                  {zone && (
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Zone
                      </p>
                      <p className="font-semibold">{zone.name}</p>
                    </div>
                  )}
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Hall / Room ID</p>
                    <p className="font-semibold text-sm">{hallRoom.id}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Created On</p>
                    <p className="font-semibold text-sm">
                      {format(new Date(hallRoom.createdAt), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hallRoom.roomType && (
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Room Type</p>
                      <p className="font-semibold capitalize">{hallRoom.roomType.replace('_', ' ')}</p>
                    </div>
                  )}
                  {hallRoom.isBookable !== undefined && (
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Bookable</p>
                      <p className="font-semibold">{hallRoom.isBookable ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {hallRoom.hasAC !== undefined && (
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Air Conditioning</p>
                      <p className="font-semibold">{hallRoom.hasAC ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {hallRoom.maintenanceStatus && (
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Maintenance Status</p>
                      <p className="font-semibold capitalize">{hallRoom.maintenanceStatus.replace('_', ' ')}</p>
                    </div>
                  )}
                </div>

                {hallRoom.bookingRates && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Booking Rates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-muted/30 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">Hourly</p>
                        <p className="font-semibold">₹{hallRoom.bookingRates.hourly}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">Daily</p>
                        <p className="font-semibold">₹{hallRoom.bookingRates.daily}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">Special</p>
                        <p className="font-semibold">₹{hallRoom.bookingRates.special}</p>
                      </div>
                    </div>
                  </div>
                )}

                {hallRoom.capacityOverride && hallRoom.capacityOverride.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Capacity Overrides</h3>
                    <div className="space-y-2">
                      {hallRoom.capacityOverride.map((override, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg border">
                          <p className="font-semibold text-sm">{override.eventType}</p>
                          <p className="text-sm text-muted-foreground">Capacity: {override.capacity} people</p>
                          {override.date && (
                            <p className="text-sm text-muted-foreground">Date: {format(new Date(override.date), 'MMMM dd, yyyy')}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hallRoom.customFields && Object.keys(hallRoom.customFields).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(hallRoom.customFields).map(([key, value]) => (
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
                {hallRoom.maintenanceSchedule && hallRoom.maintenanceSchedule.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-primary" />
                      Maintenance Schedule
                    </h3>
                    <div className="space-y-2">
                      {hallRoom.maintenanceSchedule.map((schedule, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg border">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-sm">{format(new Date(schedule.date), 'MMMM dd, yyyy')}</p>
                              <p className="text-sm text-muted-foreground">Type: {schedule.type}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-md text-xs ${schedule.status === 'completed' ? 'bg-success/10 text-success' :
                                schedule.status === 'in_progress' ? 'bg-warning/10 text-warning' :
                                  'bg-muted text-muted-foreground'
                              }`}>
                              {schedule.status.replace('_', ' ')}
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

      <HallRoomModal
        open={hallRoomModalOpen}
        onOpenChange={setHallRoomModalOpen}
        hallRoom={hallRoom}
        zones={zones}
        onSave={handleSaveHallRoom}
      />
    </MainLayout>
  );
}
