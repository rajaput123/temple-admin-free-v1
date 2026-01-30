import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Project, ProjectType, RegulatorySensitivity, ProjectStatus } from '@/types/projects';
import { CustomFieldsEditor } from '@/components/structure/CustomFieldsEditor';
import { departments } from '@/data/hr-dummy-data';
import { dummyTemples } from '@/data/temple-structure-data';

interface ProjectMasterModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Project>) => void;
  project?: Project;
  isViewMode?: boolean;
}

export function ProjectMasterModal({
  open,
  onClose,
  onSave,
  project,
  isViewMode = false,
}: ProjectMasterModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectType: 'construction' as ProjectType,
    locationId: '',
    locationName: '',
    departmentId: '',
    departmentName: '',
    projectManagerId: '',
    projectManagerName: '',
    startDate: '',
    targetCompletionDate: '',
    regulatorySensitivity: 'normal' as RegulatorySensitivity,
    status: 'draft' as ProjectStatus,
    donorId: '',
    donorName: '',
    governmentApprovalRequired: false,
    governmentApprovalStatus: undefined as 'pending' | 'approved' | 'rejected' | undefined,
    heritageApprovalRequired: false,
    heritageApprovalStatus: undefined as 'pending' | 'approved' | 'rejected' | undefined,
    customFields: {} as Record<string, string>,
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        projectType: project.projectType,
        locationId: project.locationId || '',
        locationName: project.locationName || '',
        departmentId: project.departmentId || '',
        departmentName: project.departmentName || '',
        projectManagerId: project.projectManagerId || '',
        projectManagerName: project.projectManagerName || '',
        startDate: project.startDate || '',
        targetCompletionDate: project.targetCompletionDate || '',
        regulatorySensitivity: project.regulatorySensitivity,
        status: project.status,
        donorId: project.donorId || '',
        donorName: project.donorName || '',
        governmentApprovalRequired: project.governmentApprovalRequired || false,
        governmentApprovalStatus: project.governmentApprovalStatus,
        heritageApprovalRequired: project.heritageApprovalRequired || false,
        heritageApprovalStatus: project.heritageApprovalStatus,
        customFields: project.customFields || {},
      });
    } else {
      setFormData({
        name: '',
        description: '',
        projectType: 'construction',
        locationId: '',
        locationName: '',
        departmentId: '',
        departmentName: '',
        projectManagerId: '',
        projectManagerName: '',
        startDate: '',
        targetCompletionDate: '',
        regulatorySensitivity: 'normal',
        status: 'draft',
        donorId: '',
        donorName: '',
        governmentApprovalRequired: false,
        governmentApprovalStatus: undefined,
        heritageApprovalRequired: false,
        heritageApprovalStatus: undefined,
        customFields: {},
      });
    }
  }, [project]);

  const handleSave = () => {
    onSave(formData);
  };

  const handleLocationChange = (value: string) => {
    // Mock location selection - in real app, would fetch from temple structure
    setFormData({ ...formData, locationId: value, locationName: value });
  };

  const handleDepartmentChange = (value: string) => {
    const dept = departments.find(d => d.id === value);
    setFormData({
      ...formData,
      departmentId: value,
      departmentName: dept?.name || '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isViewMode ? 'View Project' : project ? 'Edit Project' : 'New Project'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isViewMode}
                  placeholder="Enter project name"
                />
              </div>
              <div className="space-y-2">
                <Label>Project Type *</Label>
                <Select
                  value={formData.projectType}
                  onValueChange={(value) => setFormData({ ...formData, projectType: value as ProjectType })}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="renovation">Renovation</SelectItem>
                    <SelectItem value="restoration">Restoration</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="it">IT / Digital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isViewMode}
                placeholder="Enter project description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  disabled={isViewMode}
                  placeholder="Enter location"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={handleDepartmentChange}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Manager</Label>
                <Input
                  value={formData.projectManagerName}
                  onChange={(e) => setFormData({ ...formData, projectManagerName: e.target.value })}
                  disabled={isViewMode}
                  placeholder="Enter project manager name"
                />
              </div>
              <div className="space-y-2">
                <Label>Regulatory Sensitivity</Label>
                <Select
                  value={formData.regulatorySensitivity}
                  onValueChange={(value) => setFormData({ ...formData, regulatorySensitivity: value as RegulatorySensitivity })}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="heritage">Heritage</SelectItem>
                    <SelectItem value="government_approval_required">Government Approval Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={isViewMode}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Completion Date</Label>
                <Input
                  type="date"
                  value={formData.targetCompletionDate}
                  onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
                  disabled={isViewMode}
                />
              </div>
            </div>

            {formData.regulatorySensitivity === 'heritage' && (
              <div className="space-y-2">
                <Label>Heritage Approval Required</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.heritageApprovalRequired}
                    onChange={(e) => setFormData({ ...formData, heritageApprovalRequired: e.target.checked })}
                    disabled={isViewMode}
                  />
                  <span className="text-sm">Heritage approval required</span>
                </div>
                {formData.heritageApprovalRequired && (
                  <Select
                    value={formData.heritageApprovalStatus || ''}
                    onValueChange={(value) => setFormData({ ...formData, heritageApprovalStatus: value as 'pending' | 'approved' | 'rejected' })}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {formData.regulatorySensitivity === 'government_approval_required' && (
              <div className="space-y-2">
                <Label>Government Approval Required</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.governmentApprovalRequired}
                    onChange={(e) => setFormData({ ...formData, governmentApprovalRequired: e.target.checked })}
                    disabled={isViewMode}
                  />
                  <span className="text-sm">Government approval required</span>
                </div>
                {formData.governmentApprovalRequired && (
                  <Select
                    value={formData.governmentApprovalStatus || ''}
                    onValueChange={(value) => setFormData({ ...formData, governmentApprovalStatus: value as 'pending' | 'approved' | 'rejected' })}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Donor (if donor-funded)</Label>
                <Input
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  disabled={isViewMode}
                  placeholder="Enter donor name"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as ProjectStatus })}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="planning" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Initial planning details. Detailed WBS and milestones can be managed in the Planning & Milestones page.
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Initial budget allocation. Detailed budget breakdown can be managed in the Budget & Funding page.
            </div>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Initial vendor assignments. Detailed vendor management can be done in the Vendor & Contractor Management page.
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Project documents and approvals will be managed here.
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <CustomFieldsEditor
              fields={formData.customFields}
              onChange={(fields) => setFormData({ ...formData, customFields: fields })}
              disabled={isViewMode}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isViewMode ? 'Close' : 'Cancel'}
          </Button>
          {!isViewMode && (
            <Button onClick={handleSave}>
              {project ? 'Update' : 'Create'} Project
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
