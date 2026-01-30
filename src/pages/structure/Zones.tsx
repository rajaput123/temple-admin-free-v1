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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, MapPin, Users, Clock } from 'lucide-react';
import { Zone, Temple, ChildTemple, zoneTypeLabels } from '@/types/temple-structure';
import { ZoneModal } from '@/components/structure/ZoneModal';
import { dummyTemples, dummyChildTemples, dummyZones } from '@/data/temple-structure-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function Zones() {
  const navigate = useNavigate();
  const { checkModuleAccess } = usePermissions();
  const [temples] = useState<Temple[]>(dummyTemples);
  const [childTemples] = useState<ChildTemple[]>(dummyChildTemples);
  const [zones, setZones] = useState<Zone[]>(dummyZones);
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  
  if (!checkModuleAccess('structure')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const getTempleName = (id: string) => temples.find(t => t.id === id)?.name || 'Unknown';
  const getChildTempleName = (id: string) => childTemples.find(t => t.id === id)?.name || 'Unknown';

  const getAssociatedTempleName = (templeId: string, templeType: 'temple' | 'child_temple') => {
    if (templeType === 'temple') return getTempleName(templeId);
    return getChildTempleName(templeId);
  };

  const handleSaveZone = (data: Partial<Zone>) => {
    if (editingZone) {
      setZones(zones.map(z => z.id === editingZone.id ? { ...z, ...data } : z));
    } else {
      setZones([...zones, { ...data, id: `zone-${Date.now()}`, createdAt: new Date().toISOString() } as Zone]);
    }
    setEditingZone(null);
    setZoneModalOpen(false);
  };

  const toggleZoneStatus = (id: string) => {
    setZones(zones.map(z => z.id === id ? { ...z, status: z.status === 'active' ? 'inactive' : 'active' } : z));
  };

  const zoneColumns = [
    { key: 'name', label: 'Zone Name', sortable: true },
    { 
      key: 'zoneType', 
      label: 'Type', 
      render: (value: unknown) => zoneTypeLabels[value as keyof typeof zoneTypeLabels]
    },
    { 
      key: 'associatedTempleId', 
      label: 'Temple', 
      render: (_: unknown, row: Zone) => getAssociatedTempleName(row.associatedTempleId, row.associatedTempleType)
    },
    { 
      key: 'capacity', 
      label: 'Capacity', 
      render: (_: unknown, row: Zone) => row.capacity || '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: Zone) => (
        <Switch
          checked={row.status === 'active'}
          onCheckedChange={() => toggleZoneStatus(row.id)}
        />
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Zones"
        description="Manage temple zones and areas"
        actions={
          <Button onClick={() => { setEditingZone(null); setZoneModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Zone
          </Button>
        }
      />

      <div className="mt-6">
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Zones</TabsTrigger>
            <TabsTrigger value="capacity">Capacity</TabsTrigger>
            <TabsTrigger value="access">Access Restrictions</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <DataTable
              data={zones}
              columns={zoneColumns}
              searchPlaceholder="Search zones..."
              defaultViewMode="grid"
              imageKey="image"
              onRowClick={(row) => {
                setSelectedZone(row);
                navigate(`/structure/zones/${row.id}`);
              }}
              actions={(row) => (
                <>
                  <DropdownMenuItem onClick={() => { setEditingZone(row); setZoneModalOpen(true); }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </>
              )}
            />
          </TabsContent>
          
          <TabsContent value="capacity">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {zones.map(zone => (
                    <div key={zone.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{zone.name}</h3>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Capacity: {zone.capacity || 'Not set'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Queue Limit: {zone.queueLengthLimit || 'Not set'}</span>
                          </div>
                        </div>
                      </div>
                      {zone.peakHourCapacity && zone.peakHourCapacity.length > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Peak Hours: {zone.peakHourCapacity.map(ph => `${ph.timeRange} (${ph.capacity})`).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="access">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {zones.map(zone => (
                    <div key={zone.id} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">{zone.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {zone.accessRestrictions && zone.accessRestrictions.length > 0 ? (
                          zone.accessRestrictions.map((access, idx) => (
                            <span key={idx} className="px-2 py-1 bg-muted rounded text-sm capitalize">
                              {access}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No restrictions</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="maintenance">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {zones.map(zone => (
                    zone.maintenanceSchedule && zone.maintenanceSchedule.length > 0 ? (
                      <div key={zone.id} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">{zone.name}</h3>
                        <div className="space-y-2">
                          {zone.maintenanceSchedule.map((schedule, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{schedule.day} at {schedule.time}</span>
                              <span className="text-muted-foreground">- {schedule.type} ({schedule.duration} min)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null
                  ))}
                  {zones.every(z => !z.maintenanceSchedule || z.maintenanceSchedule.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No maintenance schedules configured. Edit a zone to add maintenance schedule.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ZoneModal
        open={zoneModalOpen}
        onOpenChange={setZoneModalOpen}
        zone={editingZone}
        temples={temples}
        childTemples={childTemples}
        onSave={handleSaveZone}
      />
    </MainLayout>
  );
}
