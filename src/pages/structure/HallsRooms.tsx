import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Switch } from '@/components/ui/switch';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, DoorOpen, Calendar, DollarSign } from 'lucide-react';
import { HallRoom, Zone, hallRoomTypeLabels } from '@/types/temple-structure';
import { HallRoomModal } from '@/components/structure/HallRoomModal';
import { dummyZones, dummyHallRooms } from '@/data/temple-structure-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function HallsRooms() {
  const navigate = useNavigate();
  const { checkModuleAccess } = usePermissions();
  const [zones, setZones] = useState<Zone[]>(dummyZones);
  const [hallRooms, setHallRooms] = useState<HallRoom[]>(dummyHallRooms);
  const [hallRoomModalOpen, setHallRoomModalOpen] = useState(false);
  const [editingHallRoom, setEditingHallRoom] = useState<HallRoom | null>(null);
  
  if (!checkModuleAccess('structure')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const getZoneName = (id: string) => zones.find(z => z.id === id)?.name || 'Unknown';

  const handleSaveHallRoom = (data: Partial<HallRoom>) => {
    if (editingHallRoom) {
      setHallRooms(hallRooms.map(h => h.id === editingHallRoom.id ? { ...h, ...data } : h));
    } else {
      setHallRooms([...hallRooms, { ...data, id: `hall-${Date.now()}`, createdAt: new Date().toISOString() } as HallRoom]);
    }
    setEditingHallRoom(null);
    setHallRoomModalOpen(false);
  };

  const toggleHallRoomStatus = (id: string) => {
    setHallRooms(hallRooms.map(h => h.id === id ? { ...h, status: h.status === 'active' ? 'inactive' : 'active' } : h));
  };

  const hallRoomColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { 
      key: 'type', 
      label: 'Type', 
      render: (value: unknown) => hallRoomTypeLabels[value as keyof typeof hallRoomTypeLabels]
    },
    { 
      key: 'zoneId', 
      label: 'Zone / Area', 
      render: (value: unknown) => getZoneName(value as string)
    },
    { key: 'capacity', label: 'Capacity', sortable: true },
    { 
      key: 'isBookable', 
      label: 'Bookable', 
      render: (_: unknown, row: HallRoom) => row.isBookable ? 'Yes' : 'No'
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: HallRoom) => (
        <Switch
          checked={row.status === 'active'}
          onCheckedChange={() => toggleHallRoomStatus(row.id)}
        />
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Halls & Rooms"
        description="Manage halls and rooms"
        actions={
          <Button onClick={() => { setEditingHallRoom(null); setHallRoomModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Hall / Room
          </Button>
        }
      />

      <div className="mt-6">
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Halls & Rooms</TabsTrigger>
            <TabsTrigger value="booking">Booking Settings</TabsTrigger>
            <TabsTrigger value="rates">Rates</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <DataTable
              data={hallRooms}
              columns={hallRoomColumns}
              searchPlaceholder="Search halls & rooms..."
              defaultViewMode="grid"
              imageKey="image"
              onRowClick={(row) => navigate(`/structure/halls-rooms/${row.id}`)}
              actions={(row) => (
                <>
                  <DropdownMenuItem onClick={() => { setEditingHallRoom(row); setHallRoomModalOpen(true); }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </>
              )}
            />
          </TabsContent>
          
          <TabsContent value="booking">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {hallRooms.filter(hr => hr.isBookable).map(hr => (
                    <div key={hr.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{hr.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          {hr.roomType ? hr.roomType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Other'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Capacity: </span>
                          <span className="font-medium">{hr.capacity}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">AC: </span>
                          <span className="font-medium">{hr.hasAC ? 'Yes' : 'No'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status: </span>
                          <span className="font-medium">{hr.maintenanceStatus || 'Available'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {hallRooms.filter(hr => hr.isBookable).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No bookable halls/rooms. Edit a hall/room to enable booking.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rates">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {hallRooms.filter(hr => hr.isBookable && hr.bookingRates).map(hr => (
                    <div key={hr.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{hr.name}</h3>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {hr.bookingRates && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Hourly: </span>
                            <span className="font-medium">₹{hr.bookingRates.hourly.toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Daily: </span>
                            <span className="font-medium">₹{hr.bookingRates.daily.toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Special: </span>
                            <span className="font-medium">₹{hr.bookingRates.special.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {hallRooms.filter(hr => hr.isBookable && hr.bookingRates).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No rates configured. Edit a bookable hall/room to set rates.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="maintenance">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {hallRooms.map(hr => (
                    hr.maintenanceSchedule && hr.maintenanceSchedule.length > 0 ? (
                      <div key={hr.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{hr.name}</h3>
                          <span className="text-sm text-muted-foreground">{hr.maintenanceStatus || 'Available'}</span>
                        </div>
                        <div className="space-y-2">
                          {hr.maintenanceSchedule.map((schedule, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{schedule.date}</span>
                              <span className="text-muted-foreground">- {schedule.type}</span>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                schedule.status === 'completed' ? 'bg-success/10 text-success' :
                                schedule.status === 'in_progress' ? 'bg-warning/10 text-warning' :
                                'bg-muted'
                              }`}>
                                {schedule.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null
                  ))}
                  {hallRooms.every(hr => !hr.maintenanceSchedule || hr.maintenanceSchedule.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No maintenance schedules configured. Edit a hall/room to add maintenance schedule.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <HallRoomModal
        open={hallRoomModalOpen}
        onOpenChange={setHallRoomModalOpen}
        hallRoom={editingHallRoom}
        zones={zones}
        onSave={(data) => {
          handleSaveHallRoom(data);
          setZones(zones); // Update zones if new one was added
        }}
      />
    </MainLayout>
  );
}
