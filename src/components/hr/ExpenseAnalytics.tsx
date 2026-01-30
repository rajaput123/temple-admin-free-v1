import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Building2, User, ShoppingCart } from 'lucide-react';
import { Expense } from '@/types/hr';
import { Employee } from '@/types/erp';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface ExpenseAnalyticsProps {
  expenses: Expense[];
  employees: Employee[];
  dateRange?: { start: Date; end: Date };
}

export function ExpenseAnalytics({ expenses, employees, dateRange }: ExpenseAnalyticsProps) {
  const [viewMode, setViewMode] = useState<'category' | 'vendor' | 'department' | 'employee'>('category');

  const filteredExpenses = useMemo(() => {
    if (!dateRange) return expenses;
    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= dateRange.start && expenseDate <= dateRange.end;
    });
  }, [expenses, dateRange]);

  const categoryAnalytics = useMemo(() => {
    const categoryMap = new Map<string, { total: number; count: number }>();
    
    filteredExpenses.forEach(expense => {
      const existing = categoryMap.get(expense.expenseType) || { total: 0, count: 0 };
      categoryMap.set(expense.expenseType, {
        total: existing.total + expense.amount,
        count: existing.count + 1,
      });
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        average: data.total / data.count,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  const vendorAnalytics = useMemo(() => {
    const vendorMap = new Map<string, { total: number; count: number }>();
    
    filteredExpenses.forEach(expense => {
      const vendor = expense.vendor || 'Unknown';
      const existing = vendorMap.get(vendor) || { total: 0, count: 0 };
      vendorMap.set(vendor, {
        total: existing.total + expense.amount,
        count: existing.count + 1,
      });
    });

    return Array.from(vendorMap.entries())
      .map(([vendor, data]) => ({
        vendor,
        total: data.total,
        count: data.count,
        average: data.total / data.count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredExpenses]);

  const departmentAnalytics = useMemo(() => {
    const deptMap = new Map<string, { total: number; count: number }>();
    
    filteredExpenses.forEach(expense => {
      const emp = employees.find(e => e.id === expense.employeeId);
      const dept = emp?.department || 'Unknown';
      const existing = deptMap.get(dept) || { total: 0, count: 0 };
      deptMap.set(dept, {
        total: existing.total + expense.amount,
        count: existing.count + 1,
      });
    });

    return Array.from(deptMap.entries())
      .map(([department, data]) => ({
        department,
        total: data.total,
        count: data.count,
        average: data.total / data.count,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses, employees]);

  const employeeAnalytics = useMemo(() => {
    const empMap = new Map<string, { total: number; count: number; name: string }>();
    
    filteredExpenses.forEach(expense => {
      const emp = employees.find(e => e.id === expense.employeeId);
      const empId = expense.employeeId;
      const existing = empMap.get(empId) || { total: 0, count: 0, name: emp?.name || 'Unknown' };
      empMap.set(empId, {
        total: existing.total + expense.amount,
        count: existing.count + 1,
        name: existing.name,
      });
    });

    return Array.from(empMap.entries())
      .map(([employeeId, data]) => ({
        employeeId,
        employeeName: data.name,
        total: data.total,
        count: data.count,
        average: data.total / data.count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredExpenses, employees]);

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const averageExpense = filteredExpenses.length > 0 ? totalSpent / filteredExpenses.length : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Expense Analytics</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Analyze expenses by category, vendor, department, and employee
          </p>
        </div>
        <Select value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="category">By Category</SelectItem>
            <SelectItem value="vendor">By Vendor</SelectItem>
            <SelectItem value="department">By Department</SelectItem>
            <SelectItem value="employee">By Employee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold text-foreground">
                ₹{totalSpent.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold text-foreground">
                {filteredExpenses.length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold text-foreground">
                ₹{averageExpense.toFixed(0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics by View Mode */}
      {viewMode === 'category' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryAnalytics.map(analytics => (
                <div key={analytics.category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground capitalize">
                      {analytics.category.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.count} expenses | Avg: ₹{analytics.average.toFixed(0)}
                    </p>
                  </div>
                  <Badge variant="success" className="text-lg">
                    ₹{analytics.total.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'vendor' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vendorAnalytics.map(analytics => (
                <div key={analytics.vendor} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{analytics.vendor}</p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.count} transactions | Avg: ₹{analytics.average.toFixed(0)}
                    </p>
                  </div>
                  <Badge variant="success" className="text-lg">
                    ₹{analytics.total.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'department' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {departmentAnalytics.map(analytics => (
                <div key={analytics.department} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{analytics.department}</p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.count} expenses | Avg: ₹{analytics.average.toFixed(0)}
                    </p>
                  </div>
                  <Badge variant="success" className="text-lg">
                    ₹{analytics.total.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'employee' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employeeAnalytics.map(analytics => (
                <div key={analytics.employeeId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{analytics.employeeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.count} expenses | Avg: ₹{analytics.average.toFixed(0)}
                    </p>
                  </div>
                  <Badge variant="success" className="text-lg">
                    ₹{analytics.total.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
