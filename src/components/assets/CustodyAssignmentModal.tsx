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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { AssetCustody, Asset } from '@/types/assets';
import { departments } from '@/data/hr-dummy-data';
import { useAuth } from '@/contexts/AuthContext';

interface CustodyAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<AssetCustody>) => void;
  custody?: AssetCustody;
  assets: Asset[];
}

export function CustodyAssignmentModal({
  open,
  onClose,
  onSave,
  custody,
  assets,
}: CustodyAssignmentModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    assetId: '',
    assetName: '',
    custodianType: 'department' as 'department' | 'individual' | 'committee',
    custodianId: '',
    custodianName: '',
    terms: '',
  });

  useEffect(() => {
    if (custody) {
      setFormData({
        assetId: custody.assetId,
        assetName: custody.assetName,
        custodianType: custody.custodianType,
        custodianId: custody.custodianId,
        custodianName: custody.custodianName,
        terms: custody.terms || '',
      });
    } else {
      setFormData({
        assetId: '',
        assetName: '',
        custodianType: 'department',
        custodianId: '',
        custodianName: '',
        terms: '',
      });
    }
  }, [custody]);

  const handleAssetChange = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    setFormData({
      ...formData,
      assetId: assetId,
      assetName: asset?.name || '',
    });
  };

  const handleCustodianTypeChange = (type: 'department' | 'individual' | 'committee') => {
    setFormData({
      ...formData,
      custodianType: type,
      custodianId: '',
      custodianName: '',
    });
  };

  const handleCustodianChange = (value: string) => {
    if (formData.custodianType === 'department') {
      const dept = departments.find(d => d.id === value);
      setFormData({
        ...formData,
        custodianId: value,
        custodianName: dept?.name || '',
      });
    } else {
      setFormData({
        ...formData,
        custodianId: value,
        custodianName: value,
      });
    }
  };

  const handleSave = () => {
    onSave({
      ...formData,
      assignedDate: custody?.assignedDate || new Date().toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {custody ? 'Edit Custody Assignment' : 'Assign Custody'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Asset *</Label>
            <SearchableSelect
              value={formData.assetId}
              onValueChange={handleAssetChange}
              options={assets.map(a => ({
                value: a.id,
                label: `${a.assetCode} - ${a.name}`,
              }))}
              placeholder="Select asset"
            />
          </div>

          <div className="space-y-2">
            <Label>Custodian Type *</Label>
            <Select
              value={formData.custodianType}
              onValueChange={handleCustodianTypeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="committee">Committee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Custodian *</Label>
            {formData.custodianType === 'department' ? (
              <Select
                value={formData.custodianId}
                onValueChange={handleCustodianChange}
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
            ) : (
              <Input
                value={formData.custodianName}
                onChange={(e) => setFormData({ ...formData, custodianName: e.target.value, custodianId: e.target.value })}
                placeholder={`Enter ${formData.custodianType} name`}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Terms & Conditions</Label>
            <Textarea
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              placeholder="Enter custody terms and conditions"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.assetId || !formData.custodianId}>
            {custody ? 'Update' : 'Assign'} Custody
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
