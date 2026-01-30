import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Switch } from '@/components/ui/switch';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Sparkles, Calendar, Clock } from 'lucide-react';
import type { Sacred, Temple, ChildTemple } from '@/types/temple-structure';
import { sacredTypeLabels } from '@/types/temple-structure';
import { SacredModal } from '@/components/structure/SacredModal';
import { dummyTemples, dummyChildTemples, dummySacreds } from '@/data/temple-structure-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function Sacred() {
  const navigate = useNavigate();
  const { checkModuleAccess } = usePermissions();
  const [temples] = useState<Temple[]>(dummyTemples);
  const [childTemples] = useState<ChildTemple[]>(dummyChildTemples);
  const [sacreds, setSacreds] = useState<Sacred[]>(dummySacreds);
  const [sacredModalOpen, setSacredModalOpen] = useState(false);
  const [editingSacred, setEditingSacred] = useState<Sacred | null>(null);
  const [selectedSacred, setSelectedSacred] = useState<Sacred | null>(null);
  
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

  const handleSaveSacred = (data: Partial<Sacred>) => {
    if (editingSacred) {
      setSacreds(sacreds.map(s => s.id === editingSacred.id ? { ...s, ...data } : s));
    } else {
      setSacreds([...sacreds, { ...data, id: `sacred-${Date.now()}`, createdAt: new Date().toISOString() } as Sacred]);
    }
    setEditingSacred(null);
    setSacredModalOpen(false);
  };

  const toggleSacredStatus = (id: string) => {
    setSacreds(sacreds.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
  };

  const sacredColumns = [
    { key: 'name', label: 'Sacred Name', sortable: true },
    { 
      key: 'sacredType', 
      label: 'Type', 
      render: (value: unknown) => (
        <StatusBadge variant={value === 'deity' ? 'primary' : 'warning'}>
          {sacredTypeLabels[value as keyof typeof sacredTypeLabels]}
        </StatusBadge>
      )
    },
    { 
      key: 'associatedTempleId', 
      label: 'Associated Temple', 
      render: (_: unknown, row: Sacred) => getAssociatedTempleName(row.associatedTempleId, row.associatedTempleType)
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: Sacred) => (
        <Switch
          checked={row.status === 'active'}
          onCheckedChange={() => toggleSacredStatus(row.id)}
        />
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Sacred"
        description="Manage deities and samadhi"
        actions={
          <Button onClick={() => { setEditingSacred(null); setSacredModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sacred
          </Button>
        }
      />

      <div className="mt-6">
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Sacred Entities</TabsTrigger>
            <TabsTrigger value="festivals">Festivals</TabsTrigger>
            <TabsTrigger value="schedule">Abhishekam Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <DataTable
              data={sacreds}
              columns={sacredColumns}
              searchPlaceholder="Search deities & samadhi..."
              defaultViewMode="grid"
              imageKey="image"
              onRowClick={(row) => {
                setSelectedSacred(row);
                navigate(`/structure/sacred/${row.id}`);
              }}
              actions={(row) => (
                <>
                  <DropdownMenuItem onClick={() => { setEditingSacred(row); setSacredModalOpen(true); }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </>
              )}
            />
          </TabsContent>
          
          <TabsContent value="festivals">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {sacreds.map(sacred => (
                    sacred.festivals && sacred.festivals.length > 0 ? (
                      <div key={sacred.id} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">{sacred.name}</h3>
                        <div className="space-y-2">
                          {sacred.festivals.map((festival, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{festival.name}</span>
                              <span className="text-muted-foreground">{festival.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null
                  ))}
                  {sacreds.every(s => !s.festivals || s.festivals.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No festivals configured. Edit a sacred entity to add festivals.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {sacreds.map(sacred => (
                    sacred.abhishekamSchedule && sacred.abhishekamSchedule.length > 0 ? (
                      <div key={sacred.id} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">{sacred.name}</h3>
                        <div className="space-y-2">
                          {sacred.abhishekamSchedule.map((schedule, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{schedule.day}</span>
                              <span className="text-muted-foreground">{schedule.time}</span>
                              <span className="text-muted-foreground">- {schedule.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null
                  ))}
                  {sacreds.every(s => !s.abhishekamSchedule || s.abhishekamSchedule.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No abhishekam schedule configured. Edit a sacred entity to add schedule.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <SacredModal
        open={sacredModalOpen}
        onOpenChange={setSacredModalOpen}
        sacred={editingSacred}
        temples={temples}
        childTemples={childTemples}
        onSave={handleSaveSacred}
      />
    </MainLayout>
  );
}
