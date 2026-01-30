import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Edit, Monitor, DoorOpen, Calendar, Info, Clock, DollarSign, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Counter, HallRoom, counterTypeLabels } from '@/types/temple-structure';
import { CounterModal } from '@/components/structure/CounterModal';
import { dummyHallRooms, dummyCounters } from '@/data/temple-structure-data';
import { format } from 'date-fns';

export default function CounterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hallRooms] = useState<HallRoom[]>(dummyHallRooms);
  const [counters, setCounters] = useState<Counter[]>(dummyCounters);
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  
  const counter = counters.find(c => c.id === id);
  const hallRoom = hallRooms.find(h => h.id === counter?.hallRoomId);

  const handleSaveCounter = (data: Partial<Counter>) => {
    if (counter) {
      setCounters(counters.map(c => c.id === counter.id ? { ...c, ...data } : c));
    }
    setCounterModalOpen(false);
  };

  const toggleCounterStatus = () => {
    if (counter) {
      setCounters(counters.map(c => 
        c.id === counter.id 
          ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } 
          : c
      ));
    }
  };

  if (!counter) {
    return (
      <MainLayout>
        <PageHeader title="Counter Not Found" />
        <div className="mt-6">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Counter not found.
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Counter Details"
        description={counter.name}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/structure/counters')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={() => setCounterModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        }
      />

      <div className="mt-6">
        <Card className="overflow-hidden">
          {counter.image && (
            <div className="w-full h-64 md:h-80 bg-muted overflow-hidden">
              <img 
                src={counter.image} 
                alt={counter.name}
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
                  <h2 className="text-2xl font-semibold text-foreground">{counter.name}</h2>
                  <StatusBadge variant="primary">
                    {counterTypeLabels[counter.counterType]}
                  </StatusBadge>
                  <StatusBadge variant={counter.status === 'active' ? 'success' : 'neutral'}>
                    {counter.status === 'active' ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </div>
                {hallRoom && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DoorOpen className="h-4 w-4" />
                    <span>Hall / Room: {hallRoom.name}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Switch
                  checked={counter.status === 'active'}
                  onCheckedChange={toggleCounterStatus}
                />
              </div>
            </div>

            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-4 space-y-4">
                {counter.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Description
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {counter.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hallRoom && (
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <DoorOpen className="h-4 w-4" />
                        Hall / Room
                      </p>
                      <p className="font-semibold">{hallRoom.name}</p>
                    </div>
                  )}
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Counter ID</p>
                    <p className="font-semibold text-sm">{counter.id}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Created On</p>
                    <p className="font-semibold text-sm">
                      {format(new Date(counter.createdAt), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-4 space-y-4">
                {counter.shiftTimings && counter.shiftTimings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Shift Timings
                    </h3>
                    <div className="space-y-2">
                      {counter.shiftTimings.map((shift, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg border">
                          <p className="font-semibold text-sm">{shift.day}</p>
                          <p className="text-sm text-muted-foreground">{shift.openTime} - {shift.closeTime}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {counter.servicePricing && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Service Pricing
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/30 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">Base Rate</p>
                        <p className="font-semibold">{counter.servicePricing.currency} {counter.servicePricing.baseRate}</p>
                      </div>
                      {counter.servicePricing.specialRate && (
                        <div className="p-3 bg-muted/30 rounded-lg border">
                          <p className="text-sm text-muted-foreground mb-1">Special Rate</p>
                          <p className="font-semibold">{counter.servicePricing.currency} {counter.servicePricing.specialRate}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {counter.paymentMethods && counter.paymentMethods.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Payment Methods</h3>
                    <div className="flex flex-wrap gap-2">
                      {counter.paymentMethods.map((method, index) => (
                        <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm capitalize">
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {counter.queueLengthLimit !== undefined && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Queue Length Limit</h3>
                    <p className="text-muted-foreground">{counter.queueLengthLimit} people</p>
                  </div>
                )}

                {counter.customFields && Object.keys(counter.customFields).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(counter.customFields).map(([key, value]) => (
                        <div key={key} className="p-2 border rounded-md">
                          <p className="text-xs text-muted-foreground uppercase">{key}</p>
                          <p className="font-medium text-sm">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analytics" className="mt-4 space-y-4">
                {counter.performanceMetrics ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Performance Metrics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-muted/30 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
                        <p className="font-semibold text-lg">{counter.performanceMetrics.transactions}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                        <p className="font-semibold text-lg">₹{counter.performanceMetrics.revenue}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">Avg Wait Time</p>
                        <p className="font-semibold text-lg">{counter.performanceMetrics.avgWaitTime} min</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No analytics data available.</p>
                    {counter.analyticsEnabled === false && (
                      <p className="text-sm mt-2">Analytics is disabled for this counter.</p>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <CounterModal
        open={counterModalOpen}
        onOpenChange={setCounterModalOpen}
        counter={counter}
        hallRooms={hallRooms}
        onSave={handleSaveCounter}
      />
    </MainLayout>
  );
}
