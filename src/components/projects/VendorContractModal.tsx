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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Project, ProjectVendor } from '@/types/projects';

interface VendorContractModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  vendor?: ProjectVendor;
  onSave: (data: Partial<ProjectVendor>) => void;
}

export function VendorContractModal({
  open,
  onClose,
  project,
  vendor,
  onSave,
}: VendorContractModalProps) {
  const [formData, setFormData] = useState({
    vendorName: '',
    vendorType: 'contractor' as 'contractor' | 'supplier' | 'consultant' | 'other',
    contractNumber: '',
    contractValue: 0,
    scopeOfWork: '',
    performanceRating: undefined as number | undefined,
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        vendorName: vendor.vendorName,
        vendorType: vendor.vendorType,
        contractNumber: vendor.contractNumber || '',
        contractValue: vendor.contractValue,
        scopeOfWork: vendor.scopeOfWork,
        performanceRating: vendor.performanceRating,
      });
    } else {
      setFormData({
        vendorName: '',
        vendorType: 'contractor',
        contractNumber: '',
        contractValue: 0,
        scopeOfWork: '',
        performanceRating: undefined,
      });
    }
  }, [vendor]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {vendor ? 'Edit Vendor' : 'Add Vendor'} - {project.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vendor Name *</Label>
              <Input
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                placeholder="Enter vendor name"
              />
            </div>
            <div className="space-y-2">
              <Label>Vendor Type *</Label>
              <Select
                value={formData.vendorType}
                onValueChange={(value) => setFormData({ ...formData, vendorType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contract Number</Label>
              <Input
                value={formData.contractNumber}
                onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                placeholder="Enter contract number"
              />
            </div>
            <div className="space-y-2">
              <Label>Contract Value (₹)</Label>
              <Input
                type="number"
                value={formData.contractValue}
                onChange={(e) => setFormData({ ...formData, contractValue: parseFloat(e.target.value) || 0 })}
                placeholder="Enter contract value"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Scope of Work</Label>
            <Textarea
              value={formData.scopeOfWork}
              onChange={(e) => setFormData({ ...formData, scopeOfWork: e.target.value })}
              placeholder="Enter scope of work"
              rows={4}
            />
          </div>

          {vendor && (
            <div className="space-y-2">
              <Label>Performance Rating (1-5)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={formData.performanceRating || ''}
                onChange={(e) => setFormData({ ...formData, performanceRating: parseInt(e.target.value) || undefined })}
                placeholder="Enter rating"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {vendor ? 'Update' : 'Add'} Vendor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
