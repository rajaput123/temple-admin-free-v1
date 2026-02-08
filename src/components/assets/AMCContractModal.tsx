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
import { XCircle } from 'lucide-react';
import type { AMCContract, Asset } from '@/types/assets';
import { useAuth } from '@/contexts/AuthContext';

interface AMCContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: AMCContract | null;
  assets: Asset[];
  onSave: (contract: Partial<AMCContract>) => void;
}

export function AMCContractModal({
  open,
  onOpenChange,
  contract,
  assets,
  onSave,
}: AMCContractModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    assetId: '',
    vendorId: '',
    vendorName: '',
    startDate: '',
    endDate: '',
    contractValue: '',
    paymentTerms: '',
    coverage: [] as string[],
    autoRenewal: false,
    renewalDate: '',
    status: 'active' as 'active' | 'expired' | 'cancelled',
    terms: '',
  });
  const [coverageInput, setCoverageInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (contract) {
      setFormData({
        assetId: contract.assetId,
        vendorId: contract.vendorId,
        vendorName: contract.vendorName,
        startDate: contract.startDate,
        endDate: contract.endDate,
        contractValue: contract.contractValue.toString(),
        paymentTerms: contract.paymentTerms,
        coverage: contract.coverage || [],
        autoRenewal: contract.autoRenewal || false,
        renewalDate: contract.renewalDate || '',
        status: contract.status,
        terms: contract.terms || '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setFormData({
        assetId: '',
        vendorId: '',
        vendorName: '',
        startDate: today,
        endDate: nextYear.toISOString().split('T')[0],
        contractValue: '',
        paymentTerms: 'Quarterly',
        coverage: [],
        autoRenewal: false,
        renewalDate: '',
        status: 'active',
        terms: '',
      });
    }
    setCoverageInput('');
    setErrors({});
  }, [contract, open]);

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
    if (!formData.vendorName.trim()) {
      newErrors.vendorName = 'Vendor name is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    if (!formData.contractValue || parseFloat(formData.contractValue) < 0) {
      newErrors.contractValue = 'Valid contract value is required';
    }
    if (!formData.paymentTerms.trim()) {
      newErrors.paymentTerms = 'Payment terms are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCoverage = () => {
    if (coverageInput.trim() && !formData.coverage.includes(coverageInput.trim())) {
      setFormData({
        ...formData,
        coverage: [...formData.coverage, coverageInput.trim()],
      });
      setCoverageInput('');
    }
  };

  const handleRemoveCoverage = (item: string) => {
    setFormData({
      ...formData,
      coverage: formData.coverage.filter(c => c !== item),
    });
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const selectedAssetObj = assets.find(a => a.id === formData.assetId);
    
    onSave({
      ...formData,
      id: contract?.id || `amc-${Date.now()}`,
      contractNumber: contract?.contractNumber || `AMC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      assetName: selectedAssetObj?.name || '',
      assetCode: selectedAssetObj?.assetCode || '',
      contractValue: parseFloat(formData.contractValue),
      createdAt: contract?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contract ? 'Edit AMC Contract' : 'New AMC Contract'}
          </DialogTitle>
          <DialogDescription>
            Manage Annual Maintenance Contracts for assets
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
                Vendor Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.vendorName}
                onChange={(e) => {
                  setFormData({ ...formData, vendorName: e.target.value, vendorId: e.target.value });
                  setErrors({ ...errors, vendorName: '' });
                }}
                placeholder="Enter vendor name"
                className={errors.vendorName ? 'border-red-500' : ''}
              />
              {errors.vendorName && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.vendorName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'expired' | 'cancelled') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  setFormData({ ...formData, startDate: e.target.value });
                  setErrors({ ...errors, startDate: '' });
                }}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.startDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => {
                  setFormData({ ...formData, endDate: e.target.value });
                  setErrors({ ...errors, endDate: '' });
                }}
                min={formData.startDate}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Contract Value (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.contractValue}
                onChange={(e) => {
                  setFormData({ ...formData, contractValue: e.target.value });
                  setErrors({ ...errors, contractValue: '' });
                }}
                placeholder="0.00"
                className={errors.contractValue ? 'border-red-500' : ''}
              />
              {errors.contractValue && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.contractValue}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Payment Terms <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.paymentTerms}
                onChange={(e) => {
                  setFormData({ ...formData, paymentTerms: e.target.value });
                  setErrors({ ...errors, paymentTerms: '' });
                }}
                placeholder="e.g., Quarterly, Monthly, Annual"
                className={errors.paymentTerms ? 'border-red-500' : ''}
              />
              {errors.paymentTerms && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.paymentTerms}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Coverage</Label>
            <div className="flex gap-2">
              <Input
                value={coverageInput}
                onChange={(e) => setCoverageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCoverage();
                  }
                }}
                placeholder="Add coverage item (e.g., Regular Service)"
              />
              <Button type="button" variant="outline" onClick={handleAddCoverage}>
                Add
              </Button>
            </div>
            {formData.coverage.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.coverage.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveCoverage(item)}
                      className="ml-1 hover:text-destructive"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Auto Renewal</Label>
              <Select
                value={formData.autoRenewal ? 'yes' : 'no'}
                onValueChange={(value) => setFormData({ ...formData, autoRenewal: value === 'yes' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.autoRenewal && (
              <div className="space-y-2">
                <Label>Renewal Date</Label>
                <Input
                  type="date"
                  value={formData.renewalDate}
                  onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Terms & Conditions</Label>
            <Textarea
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              rows={3}
              placeholder="Enter contract terms and conditions"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {contract ? 'Update' : 'Create'} Contract
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
