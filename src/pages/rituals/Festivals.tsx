import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Calendar, Users, DollarSign } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { FestivalModal } from '@/components/rituals/FestivalModal';
import { FestivalEvent } from '@/types/rituals';
import { dummyFestivals } from '@/data/rituals-data';
import { dummySacreds } from '@/data/temple-structure-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function Festivals() {
  const navigate = useNavigate();
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [festivals, setFestivals] = useState<FestivalEvent[]>(dummyFestivals);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFestival, setEditingFestival] = useState<FestivalEvent | null>(null);
  
  if (!checkModuleAccess('festivals')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }
  
  const canEdit = checkWriteAccess('festivals');

  const handleSave = (festival: Partial<FestivalEvent>) => {
    if (festival.id) {
      setFestivals((prev) =>
        prev.map((f) => (f.id === festival.id ? { ...f, ...festival } : f))
      );
    } else {
      const newFestival: FestivalEvent = {
        ...festival,
        id: `festival-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      } as FestivalEvent;
      setFestivals((prev) => [...prev, newFestival]);
    }
  };

  const getSacredName = (sacredId: string) => {
    return dummySacreds.find((s) => s.id === sacredId)?.name || 'Unknown';
  };

  const formatDateRange = (start: string, end: string) => {
    if (start === end) return start;
    return `${start} to ${end}`;
  };

  const columns = [
    { key: 'name', label: 'Event Name', sortable: true },
    {
      key: 'sacredId',
      label: 'Sacred',
      render: (value: unknown) => getSacredName(value as string),
    },
    {
      key: 'startDate',
      label: 'Date Range',
      render: (_: unknown, row: FestivalEvent) => formatDateRange(row.startDate, row.endDate),
    },
    { key: 'notes', label: 'Notes' },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Festival / Special Days"
        description="Manage festival events and special day schedules"
        actions={
          canEdit && (
            <Button
              size="sm"
              onClick={() => {
                setEditingFestival(null);
                setModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Festival
            </Button>
          )
        }
      />

      <div className="mt-6">
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Festivals</TabsTrigger>
            <TabsTrigger value="overrides">Schedule Overrides</TabsTrigger>
            <TabsTrigger value="offerings">Special Offerings</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <DataTable
              data={festivals}
              columns={columns}
              searchPlaceholder="Search festivals..."
              defaultViewMode="grid"
              imageKey="image"
              onRowClick={(row) => navigate(`/rituals/festivals/${row.id}`)}
              actions={
                canEdit
                  ? (row) => (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingFestival(row);
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
          
          <TabsContent value="overrides">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {festivals.filter(f => f.scheduleOverrideRules?.overrideRegularSchedule).map(festival => (
                    <div key={festival.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{festival.name}</h3>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-muted-foreground">Override Period: </span>
                          <span>{festival.scheduleOverrideRules?.overrideStartDate} to {festival.scheduleOverrideRules?.overrideEndDate}</span>
                        </div>
                        {festival.specialRituals && festival.specialRituals.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Special Rituals: </span>
                            <span>{festival.specialRituals.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {festivals.filter(f => f.scheduleOverrideRules?.overrideRegularSchedule).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No schedule overrides configured. Edit a festival to configure overrides.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="offerings">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {festivals.filter(f => f.specialOfferings && f.specialOfferings.length > 0).map(festival => (
                    <div key={festival.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{festival.name}</h3>
                        <span className="text-sm text-muted-foreground">{festival.specialOfferings?.length} offerings</span>
                      </div>
                      {festival.pricingAdjustments && Object.keys(festival.pricingAdjustments).length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-sm font-medium mb-1">Pricing Adjustments:</p>
                          <div className="space-y-1">
                            {Object.entries(festival.pricingAdjustments).map(([offeringId, price]) => (
                              <div key={offeringId} className="text-sm">
                                <span className="text-muted-foreground">Offering {offeringId}: </span>
                                <span className="font-medium">₹{price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {festivals.filter(f => f.specialOfferings && f.specialOfferings.length > 0).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No special offerings configured. Edit a festival to add special offerings.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="planning">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {festivals.map(festival => (
                    <div key={festival.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{festival.name}</h3>
                        <span className="text-sm text-muted-foreground">{festival.duration || 1} days</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {festival.additionalPriestRequirements && festival.additionalPriestRequirements.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Priest Requirements: {festival.additionalPriestRequirements.length}</span>
                            </div>
                          </div>
                        )}
                        {festival.additionalStaffRequirements && festival.additionalStaffRequirements.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Staff Requirements: {festival.additionalStaffRequirements.length}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      {festival.postFestivalNormalization && (
                        <div className="mt-2 pt-2 border-t text-sm">
                          <span className="text-muted-foreground">Normalization Date: </span>
                          <span>{festival.postFestivalNormalization.normalizeDate}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {canEdit && (
        <FestivalModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          festival={editingFestival}
          sacreds={dummySacreds.filter((s) => s.status === 'active')}
          onSave={handleSave}
        />
      )}
    </MainLayout>
  );
}
