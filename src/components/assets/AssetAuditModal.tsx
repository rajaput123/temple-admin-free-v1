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
import { XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { AssetAudit, Asset, AssetLocation, AssetCategory, AuditStatus } from '@/types/assets';
import { generateAuditList } from '@/lib/assets/asset-audit-workflow';
import { useAuth } from '@/contexts/AuthContext';
import { dummyAssetLocations } from '@/data/assets-data';

interface AssetAuditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audit?: AssetAudit | null;
  assets: Asset[];
  onSave: (audit: Partial<AssetAudit>) => void;
}

export function AssetAuditModal({
  open,
  onOpenChange,
  audit,
  assets,
  onSave,
}: AssetAuditModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    auditType: 'periodic' as 'periodic' | 'spot' | 'annual',
    date: '',
    categoryFilter: '' as AssetCategory | '',
    locationFilter: '',
    selectedAssets: [] as string[],
    remarks: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);

  useEffect(() => {
    if (audit) {
      setFormData({
        auditType: audit.auditType,
        date: audit.date,
        categoryFilter: audit.categoryFilter || '',
        locationFilter: audit.locationFilter || '',
        selectedAssets: audit.assets.map(a => a.assetId),
        remarks: audit.remarks || '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        auditType: 'periodic',
        date: today,
        categoryFilter: '',
        locationFilter: '',
        selectedAssets: [],
        remarks: '',
      });
    }
    setErrors({});
  }, [audit, open]);

  // Generate audit list based on filters
  useEffect(() => {
    if (formData.categoryFilter || formData.locationFilter) {
      const filtered = generateAuditList(assets, {
        category: formData.categoryFilter || undefined,
        locationId: formData.locationFilter || undefined,
      });
      setAvailableAssets(filtered);
    } else {
      setAvailableAssets(assets);
    }
  }, [formData.categoryFilter, formData.locationFilter, assets]);

  const locationOptions = dummyAssetLocations.map(loc => ({
    value: loc.id,
    label: loc.fullPath,
  }));

  const categoryOptions: { value: AssetCategory | ''; label: string }[] = [
    { value: '', label: 'All Categories' },
    { value: 'movable', label: 'Movable' },
    { value: 'immovable', label: 'Immovable' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Audit date is required';
    }
    if (formData.selectedAssets.length === 0) {
      newErrors.selectedAssets = 'At least one asset must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const selectedAssetObjects = assets.filter(a => formData.selectedAssets.includes(a.id));
    
    // Calculate audit results
    const auditResults = {
      total: selectedAssetObjects.length,
      match: 0,
      partialMatch: 0,
      mismatch: 0,
      missing: 0,
    };

    const auditAssets = selectedAssetObjects.map(asset => ({
      assetId: asset.id,
      assetName: asset.name,
      assetCode: asset.assetCode,
      expectedLocationId: asset.currentLocationId || '',
      expectedLocationName: asset.currentLocationName || '',
    }));

    onSave({
      ...formData,
      id: audit?.id || `audit-${Date.now()}`,
      auditNumber: audit?.auditNumber || `AUDIT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      assets: auditAssets,
      auditResults,
      conductedBy: user?.id || 'user-1',
      conductedByName: user?.name || 'Current User',
      status: (audit?.status || 'pending') as AuditStatus,
      locked: audit?.locked || false,
      createdAt: audit?.createdAt || new Date().toISOString(),
    });
  };

  const handleSelectAll = () => {
    if (formData.selectedAssets.length === availableAssets.length) {
      setFormData({ ...formData, selectedAssets: [] });
    } else {
      setFormData({ ...formData, selectedAssets: availableAssets.map(a => a.id) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {audit ? 'Edit Audit' : 'New Asset Audit'}
          </DialogTitle>
          <DialogDescription>
            Create a new audit for physical verification of assets with CV-assisted comparison
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Audit Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.auditType}
                onValueChange={(value: 'periodic' | 'spot' | 'annual') =>
                  setFormData({ ...formData, auditType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="periodic">Periodic</SelectItem>
                  <SelectItem value="spot">Spot Check</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Audit Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value });
                  setErrors({ ...errors, date: '' });
                }}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.date}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category Filter (Optional)</Label>
              <Select
                value={formData.categoryFilter}
                onValueChange={(value) => setFormData({ ...formData, categoryFilter: value as AssetCategory | '', selectedAssets: [] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location Filter (Optional)</Label>
              <SearchableSelect
                options={locationOptions}
                value={formData.locationFilter}
                onChange={(value) => setFormData({ ...formData, locationFilter: value, selectedAssets: [] })}
                placeholder="Select location"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Select Assets <span className="text-red-500">*</span>
                {formData.selectedAssets.length > 0 && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({formData.selectedAssets.length} selected)
                  </span>
                )}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {formData.selectedAssets.length === availableAssets.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            {availableAssets.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No assets found matching the selected filters. Please adjust your filters.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-3">
                {availableAssets.map(asset => (
                  <label
                    key={asset.id}
                    className="flex items-center space-x-3 p-2 hover:bg-muted rounded cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedAssets.includes(asset.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            selectedAssets: [...formData.selectedAssets, asset.id],
                          });
                          setErrors({ ...errors, selectedAssets: '' });
                        } else {
                          setFormData({
                            ...formData,
                            selectedAssets: formData.selectedAssets.filter(id => id !== asset.id),
                          });
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {asset.assetCode} - {asset.name}
                      </div>
                      {asset.currentLocationName && (
                        <div className="text-xs text-muted-foreground">
                          Location: {asset.currentLocationName}
                        </div>
                      )}
                    </div>
                    {formData.selectedAssets.includes(asset.id) && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </label>
                ))}
              </div>
            )}
            {errors.selectedAssets && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {errors.selectedAssets}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
              placeholder="Additional notes or remarks for this audit"
            />
          </div>

          {formData.selectedAssets.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {formData.selectedAssets.length} asset(s) selected. After creating the audit, you can verify each asset using CV comparison.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={audit?.locked}>
            {audit ? 'Update' : 'Create'} Audit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
