import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { OvertimeRule } from '@/types/hr';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface OvertimeRulesProps {
  rules: OvertimeRule[];
  onSaveRule: (rule: Partial<OvertimeRule>) => void;
  onDeleteRule: (ruleId: string) => void;
  departments: Array<{ id: string; name: string }>;
  designations: Array<{ id: string; name: string }>;
}

export function OvertimeRules({
  rules,
  onSaveRule,
  onDeleteRule,
  departments,
  designations,
}: OvertimeRulesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<OvertimeRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dailyThreshold: 8,
    weeklyThreshold: 40,
    rateMultiplier: 1.5,
    holidayRateMultiplier: 2.0,
    applicableTo: 'all' as 'all' | 'department' | 'designation',
    applicableIds: [] as string[],
    status: 'active' as 'active' | 'inactive',
  });

  const handleCreate = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      dailyThreshold: 8,
      weeklyThreshold: 40,
      rateMultiplier: 1.5,
      holidayRateMultiplier: 2.0,
      applicableTo: 'all',
      applicableIds: [],
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (rule: OvertimeRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      dailyThreshold: rule.dailyThreshold,
      weeklyThreshold: rule.weeklyThreshold,
      rateMultiplier: rule.rateMultiplier,
      holidayRateMultiplier: rule.holidayRateMultiplier,
      applicableTo: rule.applicableTo,
      applicableIds: rule.applicableIds || [],
      status: rule.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    onSaveRule({
      ...formData,
      id: editingRule?.id,
    });
    setIsModalOpen(false);
  };

  const columns = [
    {
      key: 'name',
      label: 'Rule Name',
      sortable: true,
    },
    {
      key: 'dailyThreshold',
      label: 'Daily Threshold',
      render: (value: unknown) => `${value} hours`,
    },
    {
      key: 'weeklyThreshold',
      label: 'Weekly Threshold',
      render: (value: unknown) => `${value} hours`,
    },
    {
      key: 'rateMultiplier',
      label: 'OT Rate',
      render: (value: unknown) => `${value}x`,
    },
    {
      key: 'holidayRateMultiplier',
      label: 'Holiday Rate',
      render: (value: unknown) => `${value}x`,
    },
    {
      key: 'applicableTo',
      label: 'Applicable To',
      render: (_: unknown, row: OvertimeRule) => {
        if (row.applicableTo === 'all') return 'All Employees';
        if (row.applicableTo === 'department') return `${row.applicableIds?.length || 0} Departments`;
        return `${row.applicableIds?.length || 0} Designations`;
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown) => (
        <StatusBadge variant={value === 'active' ? 'success' : 'neutral'}>
          {value === 'active' ? 'Active' : 'Inactive'}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Overtime Rules</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Configure overtime calculation rules and rates
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      <DataTable
        data={rules}
        columns={columns}
        searchable={false}
        viewToggle={false}
        actions={(row) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteRule(row.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </>
        )}
      />

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Overtime Rule' : 'Create Overtime Rule'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Rule Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard Overtime"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Daily Threshold (hours)</Label>
                <Input
                  type="number"
                  value={formData.dailyThreshold}
                  onChange={(e) => setFormData({ ...formData, dailyThreshold: Number(e.target.value) })}
                  min="0"
                  step="0.5"
                />
              </div>
              <div>
                <Label>Weekly Threshold (hours)</Label>
                <Input
                  type="number"
                  value={formData.weeklyThreshold}
                  onChange={(e) => setFormData({ ...formData, weeklyThreshold: Number(e.target.value) })}
                  min="0"
                  step="0.5"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>OT Rate Multiplier</Label>
                <Input
                  type="number"
                  value={formData.rateMultiplier}
                  onChange={(e) => setFormData({ ...formData, rateMultiplier: Number(e.target.value) })}
                  min="1"
                  step="0.1"
                />
              </div>
              <div>
                <Label>Holiday Rate Multiplier</Label>
                <Input
                  type="number"
                  value={formData.holidayRateMultiplier}
                  onChange={(e) => setFormData({ ...formData, holidayRateMultiplier: Number(e.target.value) })}
                  min="1"
                  step="0.1"
                />
              </div>
            </div>
            <div>
              <Label>Applicable To</Label>
              <Select
                value={formData.applicableTo}
                onValueChange={(value) => setFormData({ ...formData, applicableTo: value as typeof formData.applicableTo, applicableIds: [] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="department">Specific Departments</SelectItem>
                  <SelectItem value="designation">Specific Designations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.applicableTo !== 'all' && (
              <div>
                <Label>
                  {formData.applicableTo === 'department' ? 'Departments' : 'Designations'}
                </Label>
                <Select
                  value={formData.applicableIds[0] || ''}
                  onValueChange={(value) => {
                    const ids = formData.applicableIds.includes(value)
                      ? formData.applicableIds.filter(id => id !== value)
                      : [...formData.applicableIds, value];
                    setFormData({ ...formData, applicableIds: ids });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${formData.applicableTo === 'department' ? 'departments' : 'designations'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.applicableTo === 'department' ? departments : designations).map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.applicableIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {formData.applicableIds.map(id => {
                      const item = (formData.applicableTo === 'department' ? departments : designations).find(i => i.id === id);
                      return item ? (
                        <span key={id} className="text-xs bg-muted px-2 py-1 rounded">
                          {item.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label>Status</Label>
              <Switch
                checked={formData.status === 'active'}
                onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name}>
              {editingRule ? 'Save Changes' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
