import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DailyAttendance from './DailyAttendance';
import AttendanceReports from './AttendanceReports';
import AttendancePolicies from './AttendancePolicies';
import { AttendanceDashboard } from '@/components/hr/AttendanceDashboard';
import { ClockInOut } from '@/components/hr/ClockInOut';
import { DisciplinaryActions } from '@/components/hr/DisciplinaryActions';
import { attendanceRecords, employees } from '@/data/hr-dummy-data';
import type { Attendance, DisciplinaryAction } from '@/types/hr';
import { usePermissions } from '@/hooks/usePermissions';

export default function Attendance() {
  const { checkModuleAccess, checkWriteAccess, user } = usePermissions();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [attendance, setAttendance] = useState<Attendance[]>(attendanceRecords);
  const [disciplinaryActions, setDisciplinaryActions] = useState<DisciplinaryAction[]>([]);

  // Admin-level access check
  if (!checkModuleAccess('attendance')) {
    return (
      <MainLayout>
        <PageHeader
          title="Access Denied"
          description="You do not have permission to access this module"
        />
      </MainLayout>
    );
  }

  const handleMarkAttendance = (employeeId: string, date: string, status: Attendance['status'], checkIn?: string, checkOut?: string) => {
    setAttendance(prev => {
      const existing = prev.find(a => a.employeeId === employeeId && a.date === date);
      if (existing) {
        return prev.map(a => a.id === existing.id ? { 
          ...a, 
          status,
          checkIn: checkIn || a.checkIn,
          checkOut: checkOut || a.checkOut,
        } : a);
      }
      return [...prev, {
        id: `${employeeId}-${date}`,
        employeeId,
        employeeName: employees.find(e => e.id === employeeId)?.name || 'Unknown',
        date,
        status,
        checkIn,
        checkOut,
        markedBy: 'Current User',
        markedOn: new Date().toISOString().split('T')[0],
      }];
    });
  };

  const handleSaveDisciplinaryAction = (action: Partial<DisciplinaryAction>) => {
    if (action.id) {
      setDisciplinaryActions(prev => prev.map(a => a.id === action.id ? { ...a, ...action } as DisciplinaryAction : a));
    } else {
      setDisciplinaryActions(prev => [...prev, { ...action, id: String(prev.length + 1) } as DisciplinaryAction]);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Attendance Management"
        description="Manage daily attendance, view reports, and configure attendance policies"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'People / HR', href: '/hr' },
          { label: 'Attendance' },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="clock">Clock In/Out</TabsTrigger>
          <TabsTrigger value="daily">Daily Attendance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="disciplinary">Disciplinary Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="m-0">
          <AttendanceDashboard
            attendance={attendance}
            employees={employees}
            onMarkAttendance={handleMarkAttendance}
          />
        </TabsContent>

        <TabsContent value="clock" className="m-0">
          <div className="max-w-2xl mx-auto">
            <ClockInOut
              employees={employees}
              attendance={attendance}
              onMarkAttendance={(employeeId, date, status, checkIn, checkOut) => {
                handleMarkAttendance(employeeId, date, status, checkIn, checkOut);
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="daily" className="m-0">
          <DailyAttendance />
        </TabsContent>

        <TabsContent value="reports" className="m-0">
          <AttendanceReports />
        </TabsContent>

        <TabsContent value="policies" className="m-0">
          <AttendancePolicies />
        </TabsContent>

        <TabsContent value="disciplinary" className="m-0">
          <DisciplinaryActions
            actions={disciplinaryActions}
            employees={employees}
            onSaveAction={handleSaveDisciplinaryAction}
          />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
