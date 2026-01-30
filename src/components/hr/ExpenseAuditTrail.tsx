import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Download, Filter } from 'lucide-react';
import { ExpenseAuditLog } from '@/types/hr';
import { format } from 'date-fns';

interface ExpenseAuditTrailProps {
  auditLogs: ExpenseAuditLog[];
  onExport?: (format: 'csv' | 'pdf') => void;
}

export function ExpenseAuditTrail({ auditLogs, onExport }: ExpenseAuditTrailProps) {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = auditLogs.filter(log => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (filterUser !== 'all' && log.userId !== filterUser) return false;
    if (searchTerm && !log.expenseId.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (value: unknown) => format(new Date(value as string), 'MMM d, yyyy HH:mm'),
    },
    {
      key: 'action',
      label: 'Action',
      render: (value: unknown) => {
        const action = value as string;
        const variants: Record<string, 'success' | 'warning' | 'neutral' | 'destructive'> = {
          created: 'neutral',
          modified: 'warning',
          approved: 'success',
          rejected: 'destructive',
          paid: 'success',
        };
        return (
          <StatusBadge variant={variants[action] || 'neutral'}>
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </StatusBadge>
        );
      },
    },
    {
      key: 'expenseId',
      label: 'Expense ID',
      render: (value: unknown) => (
        <span className="font-mono text-sm">{value as string}</span>
      ),
    },
    {
      key: 'userId',
      label: 'User',
      render: (value: unknown) => (
        <span className="text-sm">{value as string}</span>
      ),
    },
    {
      key: 'changes',
      label: 'Changes',
      render: (value: unknown) => {
        const changes = value as Array<{ field: string; oldValue: unknown; newValue: unknown }>;
        if (!changes || changes.length === 0) return '-';
        return (
          <div className="text-xs text-muted-foreground">
            {changes.slice(0, 2).map((change, idx) => (
              <div key={idx}>
                {change.field}: {String(change.oldValue)} → {String(change.newValue)}
              </div>
            ))}
            {changes.length > 2 && <div>... and {changes.length - 2} more</div>}
          </div>
        );
      },
    },
    {
      key: 'remarks',
      label: 'Remarks',
      render: (value: unknown) => (
        <span className="text-sm text-muted-foreground">{value as string || '-'}</span>
      ),
    },
  ];

  const uniqueActions = Array.from(new Set(auditLogs.map(log => log.action)));
  const uniqueUsers = Array.from(new Set(auditLogs.map(log => log.userId)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Expense Audit Trail</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Complete transaction history and change tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onExport?.('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport?.('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Action</Label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>User</Label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map(user => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Search Expense ID</Label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter expense ID"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Audit Log ({filteredLogs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredLogs}
            columns={columns}
            searchable={false}
            viewToggle={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
