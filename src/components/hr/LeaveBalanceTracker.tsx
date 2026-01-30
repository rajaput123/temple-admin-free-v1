import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, TrendingUp, AlertCircle, Bell } from 'lucide-react';
import { Employee } from '@/types/erp';
import { LeaveType, LeaveApplication } from '@/types/hr';
import { format, differenceInDays, addMonths, isAfter } from 'date-fns';
import { DataTable } from '@/components/ui/data-table';

interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  totalBalance: number;
  used: number;
  available: number;
  accrued: number;
  carryForward: number;
  expiring: number;
  expiryDate?: string;
  lastAccrualDate?: string;
}

interface LeaveBalanceTrackerProps {
  employees: Employee[];
  leaveTypes: LeaveType[];
  leaveApplications: LeaveApplication[];
  balances: LeaveBalance[];
  onUpdateBalance?: (balance: Partial<LeaveBalance>) => void;
}

export function LeaveBalanceTracker({
  employees,
  leaveTypes,
  leaveApplications,
  balances,
  onUpdateBalance,
}: LeaveBalanceTrackerProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('all');

  const filteredBalances = useMemo(() => {
    let filtered = balances;

    if (selectedEmployee !== 'all') {
      filtered = filtered.filter(b => b.employeeId === selectedEmployee);
    }

    if (selectedLeaveType !== 'all') {
      filtered = filtered.filter(b => b.leaveTypeId === selectedLeaveType);
    }

    return filtered;
  }, [balances, selectedEmployee, selectedLeaveType]);

  const alerts = useMemo(() => {
    const alertList: Array<{ type: 'low' | 'expiring' | 'accrual'; message: string; balance: LeaveBalance }> = [];

    filteredBalances.forEach(balance => {
      // Low balance alert (less than 3 days)
      if (balance.available < 3 && balance.available > 0) {
        alertList.push({
          type: 'low',
          message: `Low balance: ${balance.employeeName} has only ${balance.available} ${balance.leaveTypeName} days remaining`,
          balance,
        });
      }

      // Expiring leave alert
      if (balance.expiring > 0 && balance.expiryDate) {
        const daysUntilExpiry = differenceInDays(new Date(balance.expiryDate), new Date());
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          alertList.push({
            type: 'expiring',
            message: `${balance.employeeName} has ${balance.expiring} ${balance.leaveTypeName} days expiring on ${format(new Date(balance.expiryDate), 'MMM d, yyyy')}`,
            balance,
          });
        }
      }

      // Accrual update
      if (balance.lastAccrualDate) {
        const monthsSinceAccrual = differenceInDays(new Date(), new Date(balance.lastAccrualDate)) / 30;
        if (monthsSinceAccrual >= 1) {
          alertList.push({
            type: 'accrual',
            message: `${balance.employeeName} - ${balance.leaveTypeName} accrual update available`,
            balance,
          });
        }
      }
    });

    return alertList;
  }, [filteredBalances]);

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      sortable: true,
    },
    {
      key: 'leaveTypeName',
      label: 'Leave Type',
      sortable: true,
    },
    {
      key: 'totalBalance',
      label: 'Total Balance',
      render: (_: unknown, row: LeaveBalance) => (
        <span className="font-semibold text-foreground">{row.totalBalance}</span>
      ),
    },
    {
      key: 'used',
      label: 'Used',
      render: (_: unknown, row: LeaveBalance) => (
        <span className="text-muted-foreground">{row.used}</span>
      ),
    },
    {
      key: 'available',
      label: 'Available',
      render: (_: unknown, row: LeaveBalance) => (
        <Badge variant={row.available < 3 ? 'warning' : 'success'}>
          {row.available}
        </Badge>
      ),
    },
    {
      key: 'accrued',
      label: 'Accrued',
      render: (_: unknown, row: LeaveBalance) => (
        <div className="flex items-center gap-1 text-success">
          <TrendingUp className="h-3 w-3" />
          <span>{row.accrued}</span>
        </div>
      ),
    },
    {
      key: 'carryForward',
      label: 'Carry Forward',
      render: (_: unknown, row: LeaveBalance) => row.carryForward > 0 ? (
        <Badge variant="secondary">{row.carryForward}</Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
    },
    {
      key: 'expiring',
      label: 'Expiring',
      render: (_: unknown, row: LeaveBalance) => {
        if (row.expiring > 0 && row.expiryDate) {
          const daysUntilExpiry = differenceInDays(new Date(row.expiryDate), new Date());
          return (
            <div className="flex items-center gap-1">
              <Badge variant={daysUntilExpiry <= 30 ? 'warning' : 'neutral'}>
                {row.expiring}
              </Badge>
              {daysUntilExpiry <= 30 && (
                <span className="text-xs text-muted-foreground">
                  ({daysUntilExpiry}d)
                </span>
              )}
            </div>
          );
        }
        return <span className="text-muted-foreground">-</span>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Leave Balance Tracker</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Track real-time leave balances, accruals, and carry forward
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Leave Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leave Types</SelectItem>
              {leaveTypes.map(lt => (
                <SelectItem key={lt.id} value={lt.id}>
                  {lt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 5).map((alert, index) => (
            <Alert
              key={index}
              variant={alert.type === 'low' ? 'warning' : alert.type === 'expiring' ? 'warning' : 'default'}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{alert.message}</AlertDescription>
            </Alert>
          ))}
          {alerts.length > 5 && (
            <p className="text-xs text-muted-foreground text-center">
              ... and {alerts.length - 5} more alerts
            </p>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold text-foreground">
                {new Set(filteredBalances.map(b => b.employeeId)).size}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Balance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold text-foreground">
                {alerts.filter(a => a.type === 'low').length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold text-foreground">
                {alerts.filter(a => a.type === 'expiring').length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Available Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-foreground">
              {filteredBalances.reduce((sum, b) => sum + b.available, 0)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Balance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredBalances}
            columns={columns}
            searchable={false}
            viewToggle={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
