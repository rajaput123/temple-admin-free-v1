import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Clock, DollarSign, Users, CheckCircle } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { OfferingModal } from '@/components/rituals/OfferingModal';
import { Offering, offeringTypeLabels, dayLabels } from '@/types/rituals';
import { dummyOfferings } from '@/data/rituals-data';
import { dummySacreds } from '@/data/temple-structure-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function Offerings() {
  const navigate = useNavigate();
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [offerings, setOfferings] = useState<Offering[]>(dummyOfferings);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);
  
  if (!checkModuleAccess('offerings')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }
  
  const canEdit = checkWriteAccess('offerings');

  const handleSave = (offering: Partial<Offering>) => {
    if (offering.id) {
      setOfferings((prev) =>
        prev.map((o) => (o.id === offering.id ? { ...o, ...offering } : o))
      );
    } else {
      const newOffering: Offering = {
        ...offering,
        id: `offering-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      } as Offering;
      setOfferings((prev) => [...prev, newOffering]);
    }
  };

  const toggleStatus = (id: string) => {
    setOfferings((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: o.status === 'active' ? 'paused' : 'active' } : o
      )
    );
  };

  const getSacredName = (sacredId: string) => {
    return dummySacreds.find((s) => s.id === sacredId)?.name || 'Unknown';
  };

  const formatTime = (start?: string, end?: string) => {
    if (!start || !end) return '-';
    return `${start} - ${end}`;
  };

  const formatDays = (days: string[]) => {
    if (days.includes('all')) return 'All Days';
    return days.map((d) => dayLabels[d] || d).join(', ');
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'type',
      label: 'Type',
      render: (value: unknown, row: Offering) => (
        <div className="flex items-center gap-2">
          <StatusBadge variant={value === 'seva' ? 'primary' : 'secondary'}>
            {offeringTypeLabels[value as keyof typeof offeringTypeLabels]}
          </StatusBadge>
          {row.sevaType && <span className="text-xs text-muted-foreground">({row.sevaType})</span>}
          {row.darshanType && <span className="text-xs text-muted-foreground">({row.darshanType})</span>}
        </div>
      ),
    },
    {
      key: 'sacredId',
      label: 'Sacred',
      render: (value: unknown) => getSacredName(value as string),
    },
    {
      key: 'capacity',
      label: 'Capacity',
      render: (_: unknown, row: Offering) => (
        <div className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{row.capacity || '-'}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: unknown, row: Offering) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{value === 0 ? 'Free' : `₹${value}`}</span>
          {row.festivalPricing && (
            <span className="text-xs text-muted-foreground">(Fest: ₹{row.festivalPricing})</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: Offering) => (
        <Switch
          checked={row.status === 'active'}
          onCheckedChange={() => toggleStatus(row.id)}
          disabled={!canEdit}
        />
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Offerings (Sevas & Darshan)"
        description="Manage all sevas, darshans, their timings, amounts, and availability"
        actions={
          canEdit && (
            <Button
              size="sm"
              onClick={() => {
                setEditingOffering(null);
                setModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Offering
            </Button>
          )
        }
      />

      <div className="mt-6">
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Offerings</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="capacity">Capacity</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <DataTable
              data={offerings}
              columns={columns}
              searchPlaceholder="Search offerings..."
              defaultViewMode="grid"
              imageKey="image"
              onRowClick={(row) => navigate(`/rituals/offerings/${row.id}`)}
              actions={
                canEdit
                  ? (row) => (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingOffering(row);
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
          
          <TabsContent value="pricing">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {offerings.map(offering => (
                    <div key={offering.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{offering.name}</h3>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Base: </span>
                          <span className="font-medium">{offering.amount === 0 ? 'Free' : `₹${offering.amount}`}</span>
                        </div>
                        {offering.pricingByDayType && (
                          <>
                            {offering.pricingByDayType.weekday && (
                              <div>
                                <span className="text-muted-foreground">Weekday: </span>
                                <span className="font-medium">₹{offering.pricingByDayType.weekday}</span>
                              </div>
                            )}
                            {offering.pricingByDayType.weekend && (
                              <div>
                                <span className="text-muted-foreground">Weekend: </span>
                                <span className="font-medium">₹{offering.pricingByDayType.weekend}</span>
                              </div>
                            )}
                          </>
                        )}
                        {offering.festivalPricing && (
                          <div>
                            <span className="text-muted-foreground">Festival: </span>
                            <span className="font-medium">₹{offering.festivalPricing}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="capacity">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {offerings.map(offering => (
                    <div key={offering.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{offering.name}</h3>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total: </span>
                          <span className="font-medium">{offering.capacity || 'Unlimited'}</span>
                        </div>
                        {offering.capacityPerBatch && (
                          <div>
                            <span className="text-muted-foreground">Per Batch: </span>
                            <span className="font-medium">{offering.capacityPerBatch}</span>
                          </div>
                        )}
                        {offering.capacityPerTimeSlot && (
                          <div>
                            <span className="text-muted-foreground">Per Slot: </span>
                            <span className="font-medium">{offering.capacityPerTimeSlot}</span>
                          </div>
                        )}
                      </div>
                      {offering.eligibilityRules && (
                        <div className="mt-2 pt-2 border-t text-sm">
                          <span className="text-muted-foreground">Eligibility: </span>
                          {offering.eligibilityRules.minAge && (
                            <span>Min Age: {offering.eligibilityRules.minAge} </span>
                          )}
                          {offering.eligibilityRules.maxAge && (
                            <span>Max Age: {offering.eligibilityRules.maxAge} </span>
                          )}
                          {offering.eligibilityRules.genderRestriction !== 'all' && (
                            <span>Gender: {offering.eligibilityRules.genderRestriction} </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="availability">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {offerings.map(offering => (
                    <div key={offering.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{offering.name}</h3>
                        <CheckCircle className={`h-4 w-4 ${offering.status === 'active' ? 'text-success' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Status: </span>
                          <StatusBadge variant={offering.status === 'active' ? 'success' : 'neutral'}>
                            {offering.status}
                          </StatusBadge>
                        </div>
                        {offering.realTimeAvailability && (
                          <>
                            <div>
                              <span className="text-muted-foreground">Available: </span>
                              <span className="font-medium">{offering.realTimeAvailability.availableSlots}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Booked: </span>
                              <span className="font-medium">{offering.realTimeAvailability.bookedSlots}</span>
                            </div>
                            {offering.realTimeAvailability.nextAvailableSlot && (
                              <div>
                                <span className="text-muted-foreground">Next Slot: </span>
                                <span className="font-medium">{offering.realTimeAvailability.nextAvailableSlot}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {canEdit && (
        <OfferingModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          offering={editingOffering}
          sacreds={dummySacreds.filter((s) => s.status === 'active')}
          onSave={handleSave}
        />
      )}
    </MainLayout>
  );
}
