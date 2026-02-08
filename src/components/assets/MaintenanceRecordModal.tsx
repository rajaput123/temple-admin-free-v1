import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, AlertCircle } from 'lucide-react';
import type { MaintenanceRecord, Asset, MaintenanceType } from '@/types/assets';
import { useAuth } from '@/contexts/AuthContext';

interface MaintenanceRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: MaintenanceRecord | null;
  assets: Asset[];
  onSave: (record: Partial<MaintenanceRecord>) => void;
}

export function MaintenanceRecordModal({
  open,
  onOpenChange,
  record,
  assets,
  onSave,
}: MaintenanceRecordModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    assetId: '',
    maintenanceType: 'preventive' as MaintenanceType,
    scheduledDate: '',
    actualDate: '',
    vendorName: '',
    serviceProvider: '',
    description: '',
    cost: '',
    nextMaintenanceDate: '',
    status: 'scheduled' as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
    remarks: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (record) {
      setFormData({
        assetId: record.assetId,
        maintenanceType: record.maintenanceType,
        scheduledDate: record.scheduledDate || '',
        actualDate: record.actualDate,
        vendorName: record.vendorName || '',
        serviceProvider: record.serviceProvider || '',
        description: record.description,
        cost: record.cost.toString(),
        nextMaintenanceDate: record.nextMaintenanceDate || '',
        status: record.status,
        remarks: record.remarks || '',
      });
    } else {
      setFormData({
        assetId: '',
        maintenanceType: 'preventive',
        scheduledDate: '',
        actualDate: new Date().toISOString().split('T')[0],
        vendorName: '',
        serviceProvider: '',
        description: '',
        cost: '',
        nextMaintenanceDate: '',
        status: 'scheduled',
        remarks: '',
      });
    }
    setErrors({});
  }, [record, open]);

  const selectedAsset = assets.find(a => a.id === formData.assetId);

  const assetOptions = assets.map(asset => ({
    value: asset.id,
    label: `${asset.assetCode} - ${asset.name}`,
  }));

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.assetId) {
      newErrors.assetId = 'Asset is required';
    }
    if (!formData.actualDate) {
      newErrors.actualDate = 'Actual date is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.cost || parseFloat(formData.cost) < 0) {
      newErrors.cost = 'Valid cost is required';
    }
    if (formData.scheduledDate && formData.actualDate) {
      if (new Date(formData.actualDate) < new Date(formData.scheduledDate)) {
        // Allow actual date before scheduled for repairs
        if (formData.maintenanceType === 'preventive') {
          newErrors.actualDate = 'Actual date should not be before scheduled date for preventive maintenance';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const selectedAssetObj = assets.find(a => a.id === formData.assetId);
    
    onSave({
      ...formData,
      id: record?.id || `maint-${Date.now()}`,
      maintenanceNumber: record?.maintenanceNumber || `MAINT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      assetName: selectedAssetObj?.name || '',
      assetCode: selectedAssetObj?.assetCode || '',
      cost: parseFloat(formData.cost),
      conductedBy: user?.id || 'user-1',
      conductedByName: user?.name || 'Current User',
      createdAt: record?.createdAt || new Date().toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {record ? 'Edit Maintenance Record' : 'New Maintenance Record'}
          </DialogTitle>
          <DialogDescription>
            Record preventive maintenance, repairs, or AMC services for assets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Asset <span className="text-red-500">*</span>
            </Label>
            <SearchableSelect
              value={formData.assetId}
              onValueChange={(value) => {
                setFormData({ ...formData, assetId: value });
                setErrors({ ...errors, assetId: '' });
              }}
              options={assetOptions}
              placeholder="Select asset"
            />
            {errors.assetId && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {errors.assetId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Maintenance Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.maintenanceType}
                onValueChange={(value: MaintenanceType) => setFormData({ ...formData, maintenanceType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="amc">AMC Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'scheduled' | 'in_progress' | 'completed' | 'cancelled') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Scheduled Date</Label>
              <Input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => {
                  setFormData({ ...formData, scheduledDate: e.target.value });
                  setErrors({ ...errors, scheduledDate: '' });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Actual Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.actualDate}
                onChange={(e) => {
                  setFormData({ ...formData, actualDate: e.target.value });
                  setErrors({ ...errors, actualDate: '' });
                }}
                className={errors.actualDate ? 'border-red-500' : ''}
              />
              {errors.actualDate && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.actualDate}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vendor Name</Label>
              <Input
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                placeholder="Enter vendor name"
              />
            </div>

            <div className="space-y-2">
              <Label>Service Provider</Label>
              <Input
                value={formData.serviceProvider}
                onChange={(e) => setFormData({ ...formData, serviceProvider: e.target.value })}
                placeholder="Enter service provider"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                setErrors({ ...errors, description: '' });
              }}
              rows={3}
              placeholder="Describe the maintenance work performed"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Cost (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => {
                  setFormData({ ...formData, cost: e.target.value });
                  setErrors({ ...errors, cost: '' });
                }}
                placeholder="0.00"
                className={errors.cost ? 'border-red-500' : ''}
              />
              {errors.cost && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.cost}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Next Maintenance Date</Label>
              <Input
                type="date"
                value={formData.nextMaintenanceDate}
                onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={2}
              placeholder="Additional notes or remarks"
            />
          </div>

          {formData.status === 'completed' && !formData.nextMaintenanceDate && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Consider setting a next maintenance date for preventive maintenance tracking.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {record ? 'Update' : 'Create'} Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
