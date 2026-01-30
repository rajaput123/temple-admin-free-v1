import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ExpensePolicy } from '@/types/hr';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';

interface ExpensePoliciesProps {
  policies: ExpensePolicy[];
  onSavePolicy: (policy: Partial<ExpensePolicy>) => void;
  onDeletePolicy: (policyId: string) => void;
  departments: Array<{ id: string; name: string }>;
  designations: Array<{ id: string; name: string }>;
}

export function ExpensePolicies({
  policies,
  onSavePolicy,
  onDeletePolicy,
  departments,
  designations,
}: ExpensePoliciesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<ExpensePolicy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'travel' as 'travel' | 'office_supplies' | 'meals' | 'accommodation' | 'other',
    applicableTo: 'all' as 'all' | 'department' | 'designation',
    applicableIds: [] as string[],
    dailyLimit: 0,
    monthlyLimit: 0,
    perDiem: 0,
    mileageRate: 0,
    cityLimits: [] as Array<{ city: string; limit: number }>,
    effectiveDate: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive',
  });

  const handleCreate = () => {
    setEditingPolicy(null);
    setFormData({
      name: '',
      category: 'travel',
      applicableTo: 'all',
      applicableIds: [],
      dailyLimit: 0,
      monthlyLimit: 0,
      perDiem: 0,
      mileageRate: 0,
      cityLimits: [],
      effectiveDate: new Date().toISOString().split('T')[0],
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (policy: ExpensePolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      category: policy.category,
      applicableTo: policy.applicableTo,
      applicableIds: policy.applicableIds || [],
      dailyLimit: policy.dailyLimit || 0,
      monthlyLimit: policy.monthlyLimit || 0,
      perDiem: policy.perDiem || 0,
      mileageRate: policy.mileageRate || 0,
      cityLimits: policy.cityLimits || [],
      effectiveDate: policy.effectiveDate || new Date().toISOString().split('T')[0],
      status: policy.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    onSavePolicy({
      ...formData,
      id: editingPolicy?.id,
      version: editingPolicy?.version || 1,
    });
    setIsModalOpen(false);
  };

  const columns = [
    {
      key: 'name',
      label: 'Policy Name',
      sortable: true,
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: unknown) => {
        const category = value as string;
        const labels: Record<string, string> = {
          travel: 'Travel',
          office_supplies: 'Office Supplies',
          meals: 'Meals',
          accommodation: 'Accommodation',
          other: 'Other',
        };
        return <span className="capitalize">{labels[category] || category}</span>;
      },
    },
    {
      key: 'dailyLimit',
      label: 'Daily Limit',
      render: (value: unknown) => value ? `₹${value}` : '-',
    },
    {
      key: 'monthlyLimit',
      label: 'Monthly Limit',
      render: (value: unknown) => value ? `₹${value}` : '-',
    },
    {
      key: 'applicableTo',
      label: 'Applicable To',
      render: (_: unknown, row: ExpensePolicy) => {
        if (row.applicableTo === 'all') return 'All Employees';
        if (row.applicableTo === 'department') return `${row.applicableIds?.length || 0} Departments`;
        return `${row.applicableIds?.length || 0} Designations`;
      },
    },
    {
      key: 'effectiveDate',
      label: 'Effective Date',
      render: (value: unknown) => value ? format(new Date(value as string), 'MMM d, yyyy') : '-',
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
          <h3 className="text-lg font-semibold text-foreground">Expense Policies</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Configure expense policies by category and employee level
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Policy
        </Button>
      </div>

      <DataTable
        data={policies}
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
              onClick={() => onDeletePolicy(row.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </>
        )}
      />

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? 'Edit Expense Policy' : 'Create Expense Policy'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Policy Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Travel Policy - Executive Level"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as typeof formData.category })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="office_supplies">Office Supplies</SelectItem>
                  <SelectItem value="meals">Meals</SelectItem>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Daily Limit (₹)</Label>
                <Input
                  type="number"
                  value={formData.dailyLimit}
                  onChange={(e) => setFormData({ ...formData, dailyLimit: Number(e.target.value) })}
                  min="0"
                />
              </div>
              <div>
                <Label>Monthly Limit (₹)</Label>
                <Input
                  type="number"
                  value={formData.monthlyLimit}
                  onChange={(e) => setFormData({ ...formData, monthlyLimit: Number(e.target.value) })}
                  min="0"
                />
              </div>
            </div>
            {formData.category === 'travel' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Per Diem (₹)</Label>
                  <Input
                    type="number"
                    value={formData.perDiem}
                    onChange={(e) => setFormData({ ...formData, perDiem: Number(e.target.value) })}
                    min="0"
                  />
                </div>
                <div>
                  <Label>Mileage Rate (₹/km)</Label>
                  <Input
                    type="number"
                    value={formData.mileageRate}
                    onChange={(e) => setFormData({ ...formData, mileageRate: Number(e.target.value) })}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            )}
            {formData.category === 'accommodation' && (
              <div>
                <Label>City-wise Limits</Label>
                <div className="space-y-2 mt-2">
                  {formData.cityLimits.map((cityLimit, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="City name"
                        value={cityLimit.city}
                        onChange={(e) => {
                          const newLimits = [...formData.cityLimits];
                          newLimits[index].city = e.target.value;
                          setFormData({ ...formData, cityLimits: newLimits });
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Limit (₹)"
                        value={cityLimit.limit}
                        onChange={(e) => {
                          const newLimits = [...formData.cityLimits];
                          newLimits[index].limit = Number(e.target.value);
                          setFormData({ ...formData, cityLimits: newLimits });
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            cityLimits: formData.cityLimits.filter((_, i) => i !== index),
                          });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        cityLimits: [...formData.cityLimits, { city: '', limit: 0 }],
                      });
                    }}
                  >
                    Add City
                  </Button>
                </div>
              </div>
            )}
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
            <div>
              <Label>Effective Date</Label>
              <Input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              />
            </div>
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
              {editingPolicy ? 'Save Changes' : 'Create Policy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
