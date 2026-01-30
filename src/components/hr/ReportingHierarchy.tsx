import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Users, ArrowRight, Edit2 } from 'lucide-react';
import { Department } from '@/types/hr';
import { Employee } from '@/types/erp';
import { cn } from '@/lib/utils';

interface ReportingHierarchyProps {
  departments: Department[];
  employees: Employee[];
  onUpdateReportingManager?: (employeeId: string, managerId: string) => void;
}

export function ReportingHierarchy({
  departments,
  employees,
  onUpdateReportingManager,
}: ReportingHierarchyProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [newManagerId, setNewManagerId] = useState<string>('');

  const filteredEmployees = useMemo(() => {
    if (selectedDepartment === 'all') return employees;
    return employees.filter(emp => emp.department === selectedDepartment);
  }, [employees, selectedDepartment]);

  const buildHierarchy = useMemo(() => {
    const managerMap = new Map<string, Employee[]>();
    const topLevel: Employee[] = [];

    filteredEmployees.forEach(emp => {
      if (!emp.reportingToId) {
        topLevel.push(emp);
      } else {
        if (!managerMap.has(emp.reportingToId)) {
          managerMap.set(emp.reportingToId, []);
        }
        managerMap.get(emp.reportingToId)!.push(emp);
      }
    });

    return { topLevel, managerMap };
  }, [filteredEmployees]);

  const getDirectReportsCount = (employeeId: string): number => {
    return buildHierarchy.managerMap.get(employeeId)?.length || 0;
  };

  const handleSaveManager = (employeeId: string) => {
    if (onUpdateReportingManager && newManagerId) {
      onUpdateReportingManager(employeeId, newManagerId);
      setEditingEmployee(null);
      setNewManagerId('');
    }
  };

  const renderEmployeeNode = (employee: Employee, level: number = 0): React.ReactNode => {
    const directReports = buildHierarchy.managerMap.get(employee.id) || [];
    const spanOfControl = getDirectReportsCount(employee.id);

    return (
      <div key={employee.id} className={cn("relative", level > 0 && "ml-8 mt-4")}>
        <div className="flex items-start gap-3">
          {/* Connector Line */}
          {level > 0 && (
            <div className="absolute -left-8 top-0 bottom-0 w-px bg-border" />
          )}

          {/* Employee Card */}
          <Card className={cn("flex-1", level === 0 && "border-primary")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted text-foreground text-sm font-semibold">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{employee.name}</p>
                    <p className="text-xs text-muted-foreground">{employee.designation}</p>
                    <p className="text-xs text-muted-foreground">{employee.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {spanOfControl > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{spanOfControl} reports</span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingEmployee(employee.id);
                      setNewManagerId(employee.reportingToId || '');
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Manager Selection */}
              {editingEmployee === employee.id && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <Label className="text-xs">Change Reporting Manager</Label>
                  <div className="flex gap-2">
                    <Select value={newManagerId} onValueChange={setNewManagerId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Manager</SelectItem>
                        {filteredEmployees
                          .filter(emp => emp.id !== employee.id)
                          .map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name} - {emp.designation}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={() => handleSaveManager(employee.id)}>
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingEmployee(null);
                        setNewManagerId('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Direct Reports */}
        {directReports.length > 0 && (
          <div className="mt-2">
            {directReports.map(report => renderEmployeeNode(report, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Reporting Hierarchy</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Visualize and manage organizational reporting structure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Filter by Department</Label>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {buildHierarchy.topLevel.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No top-level employees found</p>
            </CardContent>
          </Card>
        ) : (
          buildHierarchy.topLevel.map(emp => renderEmployeeNode(emp, 0))
        )}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Span of Control Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Total Employees</Label>
              <p className="text-lg font-semibold text-foreground">{filteredEmployees.length}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Managers</Label>
              <p className="text-lg font-semibold text-foreground">
                {filteredEmployees.filter(emp => getDirectReportsCount(emp.id) > 0).length}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Avg Reports per Manager</Label>
              <p className="text-lg font-semibold text-foreground">
                {filteredEmployees.filter(emp => getDirectReportsCount(emp.id) > 0).length > 0
                  ? (filteredEmployees.filter(emp => !emp.reportingToId).length /
                      filteredEmployees.filter(emp => getDirectReportsCount(emp.id) > 0).length).toFixed(1)
                  : '0'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
