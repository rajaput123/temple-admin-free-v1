import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Calendar, Users, AlertCircle } from 'lucide-react';
import { Offering, offeringTypeLabels, DailySchedule } from '@/types/rituals';
import { dummyOfferings } from '@/data/rituals-data';
import { dummySacreds } from '@/data/temple-structure-data';
import { usePermissions } from '@/hooks/usePermissions';

interface ScheduleEntry {
  id: string;
  sacredName: string;
  offeringName: string;
  timeRange: string;
  type: string;
}

export default function DailySchedule() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedules, setSchedules] = useState<DailySchedule[]>([]);
  const selectedDateObj = new Date(selectedDate);
  const dayOfWeek = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  if (!checkModuleAccess('schedule')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }
  
  const canEdit = checkWriteAccess('schedule');

  const scheduleEntries = useMemo(() => {
    const entries: ScheduleEntry[] = [];
    const applicableOfferings = dummyOfferings.filter((offering) => {
      if (offering.status !== 'active') return false;
      if (offering.applicableDays.includes('all')) return true;
      return offering.applicableDays.includes(dayOfWeek);
    });

    applicableOfferings.forEach((offering) => {
      const sacred = dummySacreds.find((s) => s.id === offering.sacredId);
      if (sacred && offering.startTime && offering.endTime) {
        entries.push({
          id: `${offering.id}-${selectedDate}`,
          sacredName: sacred.name,
          offeringName: offering.name,
          timeRange: `${offering.startTime} - ${offering.endTime}`,
          type: offering.type,
        });
      }
    });

    // Group by Sacred and sort by time
    entries.sort((a, b) => {
      if (a.sacredName !== b.sacredName) {
        return a.sacredName.localeCompare(b.sacredName);
      }
      return a.timeRange.localeCompare(b.timeRange);
    });

    return entries;
  }, [selectedDate, dayOfWeek]);

  const columns = [
    { key: 'sacredName', label: 'Sacred', sortable: true },
    { key: 'offeringName', label: 'Offering', sortable: true },
    {
      key: 'timeRange',
      label: 'Time',
      render: (_: unknown, row: ScheduleEntry) => (
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{row.timeRange}</span>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: unknown) => (
        <StatusBadge variant={value === 'seva' ? 'primary' : 'secondary'}>
          {offeringTypeLabels[value as keyof typeof offeringTypeLabels]}
        </StatusBadge>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Daily Schedule"
        description="View temple schedule for rituals and darshans"
      />

      <div className="mb-4">
        <Label htmlFor="schedule-date">Select Date</Label>
        <Input
          id="schedule-date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="max-w-xs mt-1"
        />
      </div>

      <DataTable
        key={selectedDate}
        data={scheduleEntries}
        columns={columns}
        searchPlaceholder="Search schedule..."
        emptyMessage="No offerings scheduled for this date"
      />
    </MainLayout>
  );
}
