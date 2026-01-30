import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Eye, FileText } from 'lucide-react';
import { DisciplinaryAction } from '@/types/hr';
import { Employee } from '@/types/erp';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface DisciplinaryActionsProps {
  actions: DisciplinaryAction[];
  employees: Employee[];
  onSaveAction: (action: Partial<DisciplinaryAction>) => void;
  onViewAction?: (action: DisciplinaryAction) => void;
}

export function DisciplinaryActions({
  actions,
  employees,
  onSaveAction,
  onViewAction,
}: DisciplinaryActionsProps) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<DisciplinaryAction | null>(null);
  const [viewingAction, setViewingAction] = useState<DisciplinaryAction | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    actionType: 'warning' as 'warning' | 'suspension' | 'termination',
    actionSubType: '' as 'verbal_warning' | 'written_warning' | undefined,
    reason: '',
    description: '',
    status: 'initiated' as 'initiated' | 'investigation' | 'decision' | 'executed',
  });

  const handleCreate = () => {
    setEditingAction(null);
    setFormData({
      employeeId: '',
      actionType: 'warning',
      actionSubType: undefined,
      reason: '',
      description: '',
      status: 'initiated',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (action: DisciplinaryAction) => {
    setEditingAction(action);
    setFormData({
      employeeId: action.employeeId,
      actionType: action.actionType,
      actionSubType: action.actionSubType,
      reason: action.reason,
      description: action.description,
      status: action.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    onSaveAction({
      ...formData,
      id: editingAction?.id,
      initiatedBy: user?.id || '',
      initiatedOn: editingAction?.initiatedOn || new Date().toISOString(),
    });
    setIsModalOpen(false);
  };

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      render: (_: unknown, row: DisciplinaryAction) => {
        const emp = employees.find(e => e.id === row.employeeId);
        return emp?.name || 'Unknown';
      },
    },
    {
      key: 'actionType',
      label: 'Action Type',
      render: (value: unknown, row: DisciplinaryAction) => {
        const type = value as string;
        const label = row.actionSubType
          ? `${type} (${row.actionSubType.replace('_', ' ')})`
          : type;
        return <Badge variant={type === 'termination' ? 'destructive' : type === 'suspension' ? 'warning' : 'neutral'}>
          {label}
        </Badge>;
      },
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (value: unknown) => (
        <span className="text-sm text-muted-foreground">{value as string}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => {
        const status = value as string;
        const variants: Record<string, 'success' | 'warning' | 'neutral' | 'destructive'> = {
          initiated: 'neutral',
          investigation: 'warning',
          decision: 'warning',
          executed: 'success',
        };
        return <StatusBadge variant={variants[status] || 'neutral'}>{status}</StatusBadge>;
      },
    },
    {
      key: 'initiatedOn',
      label: 'Initiated On',
      render: (value: unknown) => format(new Date(value as string), 'MMM d, yyyy'),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Disciplinary Actions</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Track and manage disciplinary actions
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Action
        </Button>
      </div>

      <DataTable
        data={actions}
        columns={columns}
        searchable={false}
        viewToggle={false}
        onRowClick={(row) => {
          setViewingAction(row);
          setViewModalOpen(true);
        }}
        actions={(row) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => {
              setViewingAction(row);
              setViewModalOpen(true);
            }}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </>
        )}
      />

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAction ? 'Edit Disciplinary Action' : 'New Disciplinary Action'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Employee</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                disabled={!!editingAction}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Action Type</Label>
              <Select
                value={formData.actionType}
                onValueChange={(value) => setFormData({ ...formData, actionType: value as typeof formData.actionType, actionSubType: value === 'warning' ? undefined : formData.actionSubType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="suspension">Suspension</SelectItem>
                  <SelectItem value="termination">Termination</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.actionType === 'warning' && (
              <div>
                <Label>Warning Type</Label>
                <Select
                  value={formData.actionSubType || ''}
                  onValueChange={(value) => setFormData({ ...formData, actionSubType: value as 'verbal_warning' | 'written_warning' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verbal_warning">Verbal Warning</SelectItem>
                    <SelectItem value="written_warning">Written Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Reason</Label>
              <Input
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Brief reason for action"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description"
                rows={4}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as typeof formData.status })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initiated">Initiated</SelectItem>
                  <SelectItem value="investigation">Investigation</SelectItem>
                  <SelectItem value="decision">Decision</SelectItem>
                  <SelectItem value="executed">Executed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.employeeId || !formData.reason}>
              {editingAction ? 'Save Changes' : 'Create Action'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Disciplinary Action Details</DialogTitle>
          </DialogHeader>
          {viewingAction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Employee</Label>
                  <p className="font-medium text-foreground">
                    {employees.find(e => e.id === viewingAction.employeeId)?.name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Action Type</Label>
                  <p className="font-medium text-foreground capitalize">
                    {viewingAction.actionType} {viewingAction.actionSubType ? `(${viewingAction.actionSubType.replace('_', ' ')})` : ''}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <StatusBadge variant={viewingAction.status === 'executed' ? 'success' : 'warning'}>
                    {viewingAction.status}
                  </StatusBadge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Initiated On</Label>
                  <p className="font-medium text-foreground">
                    {format(new Date(viewingAction.initiatedOn), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Reason</Label>
                <p className="font-medium text-foreground">{viewingAction.reason}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className="text-sm text-foreground">{viewingAction.description}</p>
              </div>
              {viewingAction.documents && viewingAction.documents.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Documents</Label>
                  <div className="flex gap-2 mt-1">
                    {viewingAction.documents.map((doc, idx) => (
                      <Button key={idx} variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Document {idx + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
