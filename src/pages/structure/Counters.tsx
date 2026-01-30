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
import { Plus, Edit, Monitor, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { Counter, HallRoom, counterTypeLabels } from '@/types/temple-structure';
import { CounterModal } from '@/components/structure/CounterModal';
import { dummyHallRooms, dummyCounters } from '@/data/temple-structure-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function Counters() {
  const navigate = useNavigate();
  const { checkModuleAccess } = usePermissions();
  const [hallRooms, setHallRooms] = useState<HallRoom[]>(dummyHallRooms);
  const [counters, setCounters] = useState<Counter[]>(dummyCounters);
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null);
  
  if (!checkModuleAccess('structure')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const getHallRoomName = (id: string) => hallRooms.find(h => h.id === id)?.name || 'Unknown';

  const handleSaveCounter = (data: Partial<Counter>) => {
    if (editingCounter) {
      setCounters(counters.map(c => c.id === editingCounter.id ? { ...c, ...data } : c));
    } else {
      setCounters([...counters, { ...data, id: `counter-${Date.now()}`, createdAt: new Date().toISOString() } as Counter]);
    }
    setEditingCounter(null);
    setCounterModalOpen(false);
  };

  const toggleCounterStatus = (id: string) => {
    setCounters(counters.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c));
  };

  const counterColumns = [
    { key: 'name', label: 'Counter Name', sortable: true },
    { 
      key: 'counterType', 
      label: 'Type', 
      render: (value: unknown) => counterTypeLabels[value as keyof typeof counterTypeLabels]
    },
    { 
      key: 'hallRoomId', 
      label: 'Hall / Room', 
      render: (value: unknown) => getHallRoomName(value as string)
    },
    { 
      key: 'servicePricing', 
      label: 'Base Rate', 
      render: (_: unknown, row: Counter) => 
        row.servicePricing ? `₹${row.servicePricing.baseRate.toLocaleString('en-IN')}` : '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: Counter) => (
        <Switch
          checked={row.status === 'active'}
          onCheckedChange={() => toggleCounterStatus(row.id)}
        />
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Counters"
        description="Manage seva counters"
        actions={
          <Button onClick={() => { setEditingCounter(null); setCounterModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Counter
          </Button>
        }
      />

      <div className="mt-6">
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Counters</TabsTrigger>
            <TabsTrigger value="shifts">Shifts & Staff</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <DataTable
              data={counters}
              columns={counterColumns}
              searchPlaceholder="Search counters..."
              defaultViewMode="grid"
              imageKey="image"
              onRowClick={(row) => navigate(`/structure/counters/${row.id}`)}
              actions={(row) => (
                <>
                  <DropdownMenuItem onClick={() => { setEditingCounter(row); setCounterModalOpen(true); }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </>
              )}
            />
          </TabsContent>
          
          <TabsContent value="shifts">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {counters.map(counter => (
                    counter.shiftTimings && counter.shiftTimings.length > 0 ? (
                      <div key={counter.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{counter.name}</h3>
                          <span className="text-sm text-muted-foreground">{counter.counterType}</span>
                        </div>
                        <div className="space-y-2">
                          {counter.shiftTimings.map((shift, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{shift.day}</span>
                              <span className="text-muted-foreground">{shift.openTime} - {shift.closeTime}</span>
                            </div>
                          ))}
                        </div>
                        {counter.staffAllocation && counter.staffAllocation.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm font-medium mb-1">Staff Allocation</p>
                            <div className="space-y-1">
                              {counter.staffAllocation.map((staff, idx) => (
                                <div key={idx} className="text-sm text-muted-foreground">
                                  Staff ID: {staff.staffId} - {staff.shift}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null
                  ))}
                  {counters.every(c => !c.shiftTimings || c.shiftTimings.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No shift timings configured. Edit a counter to add shift timings.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pricing">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {counters.filter(c => c.servicePricing).map(counter => (
                    <div key={counter.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{counter.name}</h3>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {counter.servicePricing && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Base Rate:</span>
                            <span className="font-medium">₹{counter.servicePricing.baseRate.toLocaleString('en-IN')} {counter.servicePricing.currency}</span>
                          </div>
                          {counter.servicePricing.specialRate && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Special Rate:</span>
                              <span className="font-medium">₹{counter.servicePricing.specialRate.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          {counter.paymentMethods && counter.paymentMethods.length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <span className="text-sm text-muted-foreground">Payment Methods: </span>
                              <span className="text-sm font-medium">{counter.paymentMethods.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {counters.filter(c => c.servicePricing).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No pricing configured. Edit a counter to set pricing.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {counters.filter(c => c.analyticsEnabled && c.performanceMetrics).map(counter => (
                    <div key={counter.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{counter.name}</h3>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {counter.performanceMetrics && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Transactions: </span>
                            <span className="font-medium">{counter.performanceMetrics.transactions}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Revenue: </span>
                            <span className="font-medium">₹{counter.performanceMetrics.revenue.toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Wait Time: </span>
                            <span className="font-medium">{counter.performanceMetrics.avgWaitTime} min</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {counters.filter(c => c.analyticsEnabled && c.performanceMetrics).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No analytics data available. Enable analytics for counters to see performance metrics.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CounterModal
        open={counterModalOpen}
        onOpenChange={setCounterModalOpen}
        counter={editingCounter}
        hallRooms={hallRooms}
        onSave={(data) => {
          handleSaveCounter(data);
          setHallRooms(hallRooms); // Update hallRooms if new one was added
        }}
      />
    </MainLayout>
  );
}
