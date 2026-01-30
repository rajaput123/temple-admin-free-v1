import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { PermissionTemplate } from '@/types/hr';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PermissionTemplatesProps {
  templates: PermissionTemplate[];
  onSaveTemplate: (template: Partial<PermissionTemplate>) => void;
  onDeleteTemplate: (templateId: string) => void;
  currentUserId: string;
}

const availablePermissions = [
  'employees:read',
  'employees:write',
  'employees:delete',
  'organization:read',
  'organization:write',
  'shifts:read',
  'shifts:write',
  'leave:read',
  'leave:write',
  'leave:approve',
  'attendance:read',
  'attendance:write',
  'expenses:read',
  'expenses:write',
  'expenses:approve',
  'expenses:finance',
  'payroll:read',
  'audit:read',
];

const roleOptions = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'temple_administrator', label: 'Temple Administrator' },
  { value: 'hr_manager', label: 'HR Manager' },
  { value: 'department_head', label: 'Department Head' },
  { value: 'finance', label: 'Finance' },
  { value: 'audit', label: 'Audit' },
  { value: 'priest', label: 'Priest' },
];

export function PermissionTemplates({
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  currentUserId,
}: PermissionTemplatesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PermissionTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    applicableRoles: [] as string[],
    status: 'active' as 'active' | 'inactive',
  });

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      permissions: [],
      applicableRoles: [],
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (template: PermissionTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      permissions: template.permissions,
      applicableRoles: template.applicableRoles,
      status: template.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    onSaveTemplate({
      ...formData,
      id: editingTemplate?.id,
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
    });
    setIsModalOpen(false);
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      applicableRoles: prev.applicableRoles.includes(role)
        ? prev.applicableRoles.filter(r => r !== role)
        : [...prev.applicableRoles, role],
    }));
  };

  const columns = [
    {
      key: 'name',
      label: 'Template Name',
      sortable: true,
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: unknown) => value || '-',
    },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (_: unknown, row: PermissionTemplate) => (
        <span className="text-sm text-muted-foreground">
          {row.permissions.length} permissions
        </span>
      ),
    },
    {
      key: 'applicableRoles',
      label: 'Applicable Roles',
      render: (_: unknown, row: PermissionTemplate) => (
        <div className="flex flex-wrap gap-1">
          {row.applicableRoles.map(role => (
            <StatusBadge key={role} variant="neutral" className="text-xs">
              {roleOptions.find(r => r.value === role)?.label || role}
            </StatusBadge>
          ))}
        </div>
      ),
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
          <h3 className="text-lg font-semibold text-foreground">Permission Templates</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Create and manage permission templates for role-based access
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <DataTable
        data={templates}
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
              onClick={() => {
                const newTemplate = {
                  ...row,
                  id: undefined,
                  name: `${row.name} (Copy)`,
                  createdAt: new Date().toISOString(),
                };
                onSaveTemplate(newTemplate);
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteTemplate(row.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </>
        )}
      />

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Permission Template' : 'Create Permission Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Manager Template"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the template purpose"
                rows={3}
              />
            </div>
            <div>
              <Label>Applicable Roles</Label>
              <div className="mt-2 space-y-2">
                {roleOptions.map(role => (
                  <div key={role.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.value}`}
                      checked={formData.applicableRoles.includes(role.value)}
                      onCheckedChange={() => toggleRole(role.value)}
                    />
                    <Label htmlFor={`role-${role.value}`} className="text-sm font-normal cursor-pointer">
                      {role.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                {availablePermissions.map(permission => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={`perm-${permission}`}
                      checked={formData.permissions.includes(permission)}
                      onCheckedChange={() => togglePermission(permission)}
                    />
                    <Label htmlFor={`perm-${permission}`} className="text-sm font-normal cursor-pointer">
                      {permission}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || formData.permissions.length === 0}>
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
