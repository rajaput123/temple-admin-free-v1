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
import { Project, ChangeRequest, ChangeRequestType } from '@/types/projects';
import { useAuth } from '@/contexts/AuthContext';

interface ChangeRequestModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  changeRequest?: ChangeRequest;
  onSave: (data: Partial<ChangeRequest>) => void;
}

export function ChangeRequestModal({
  open,
  onClose,
  project,
  changeRequest,
  onSave,
}: ChangeRequestModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    changeType: 'scope' as ChangeRequestType,
    description: '',
    reason: '',
    costImpact: undefined as number | undefined,
    timeImpact: undefined as number | undefined,
    scopeImpact: '',
  });

  useEffect(() => {
    if (changeRequest) {
      setFormData({
        changeType: changeRequest.changeType,
        description: changeRequest.description,
        reason: changeRequest.reason,
        costImpact: changeRequest.costImpact,
        timeImpact: changeRequest.timeImpact,
        scopeImpact: changeRequest.scopeImpact || '',
      });
    } else {
      setFormData({
        changeType: 'scope',
        description: '',
        reason: '',
        costImpact: undefined,
        timeImpact: undefined,
        scopeImpact: '',
      });
    }
  }, [changeRequest]);

  const handleSave = () => {
    onSave({
      ...formData,
      approvalRequired: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {changeRequest ? 'Edit Change Request' : 'New Change Request'} - {project.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label>Change Type *</Label>
              <Select
                value={formData.changeType}
                onValueChange={(value) => setFormData({ ...formData, changeType: value as ChangeRequestType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scope">Scope</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="timeline">Timeline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the change request"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Explain why this change is needed"
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="impact" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cost Impact (₹)</Label>
                <Input
                  type="number"
                  value={formData.costImpact || ''}
                  onChange={(e) => setFormData({ ...formData, costImpact: parseFloat(e.target.value) || undefined })}
                  placeholder="Enter cost impact"
                />
              </div>
              <div className="space-y-2">
                <Label>Time Impact (Days)</Label>
                <Input
                  type="number"
                  value={formData.timeImpact || ''}
                  onChange={(e) => setFormData({ ...formData, timeImpact: parseInt(e.target.value) || undefined })}
                  placeholder="Enter time impact"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Scope Impact</Label>
              <Textarea
                value={formData.scopeImpact}
                onChange={(e) => setFormData({ ...formData, scopeImpact: e.target.value })}
                placeholder="Describe scope impact"
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {changeRequest ? 'Update' : 'Create'} Change Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
