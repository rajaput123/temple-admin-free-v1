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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { AssetMovement, Asset, AssetLocation } from '@/types/assets';
import { determineMovementApprovalWorkflow } from '@/lib/assets/asset-movement-approval-workflow';

interface MovementRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movement?: AssetMovement | null;
  assets: Asset[];
  locations: AssetLocation[];
  onSave: (movement: Partial<AssetMovement>) => void;
}

export function MovementRequestModal({
  open,
  onOpenChange,
  movement,
  assets,
  locations,
  onSave,
}: MovementRequestModalProps) {
  const [formData, setFormData] = useState({
    sourceLocationId: '',
    destinationLocationId: '',
    reason: '',
    validityFrom: '',
    validityTo: '',
    selectedAssets: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (movement) {
      setFormData({
        sourceLocationId: movement.sourceLocationId,
        destinationLocationId: movement.destinationLocationId,
        reason: movement.reason,
        validityFrom: movement.validityPeriod?.from || '',
        validityTo: movement.validityPeriod?.to || '',
        selectedAssets: movement.assets.map(a => a.assetId),
      });
    } else {
      setFormData({
        sourceLocationId: '',
        destinationLocationId: '',
        reason: '',
        validityFrom: '',
        validityTo: '',
        selectedAssets: [],
      });
    }
  }, [movement, open]);

  const selectedAssetObjects = assets.filter(a => formData.selectedAssets.includes(a.id));
  const workflow = determineMovementApprovalWorkflow(selectedAssetObjects);

  const locationOptions = locations.map(loc => ({
    value: loc.id,
    label: loc.fullPath,
  }));

  // Filter assets by source location if selected
  const availableAssets = formData.sourceLocationId
    ? assets.filter(a => a.currentLocationId === formData.sourceLocationId)
    : assets;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sourceLocationId) {
      newErrors.sourceLocationId = 'Source location is required';
    }
    if (!formData.destinationLocationId) {
      newErrors.destinationLocationId = 'Destination location is required';
    }
    if (formData.sourceLocationId === formData.destinationLocationId) {
      newErrors.destinationLocationId = 'Destination must be different from source';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for movement is required';
    }
    if (formData.selectedAssets.length === 0) {
      newErrors.selectedAssets = 'At least one asset must be selected';
    }
    if (formData.validityFrom && formData.validityTo) {
      if (new Date(formData.validityFrom) > new Date(formData.validityTo)) {
        newErrors.validityTo = 'Validity To must be after Validity From';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setActiveTab('basic');
      return;
    }

    const sourceLoc = locations.find(l => l.id === formData.sourceLocationId);
    const destLoc = locations.find(l => l.id === formData.destinationLocationId);
    
    onSave({
      ...formData,
      movementNumber: movement?.movementNumber || `MOV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      sourceLocationName: sourceLoc?.fullPath || '',
      destinationLocationName: destLoc?.fullPath || '',
      assets: selectedAssetObjects.map(a => ({
        assetId: a.id,
        assetName: a.name,
        assetCode: a.assetCode,
      })),
      validityPeriod: formData.validityFrom && formData.validityTo ? {
        from: formData.validityFrom,
        to: formData.validityTo,
      } : undefined,
      approvalWorkflow: workflow.levels,
      currentApprovalLevel: 1,
      handoverAcknowledged: false,
      status: 'draft',
      createdBy: 'user-1',
      createdByName: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{movement ? 'Edit Movement Request' : 'New Movement Request'}</DialogTitle>
          <DialogDescription>
            Transfer assets between locations with approval workflow
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Details</TabsTrigger>
              <TabsTrigger value="assets">
                Assets {formData.selectedAssets.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {formData.selectedAssets.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="review">Review & Submit</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sourceLocationId">
                    Source Location <span className="text-red-500">*</span>
                  </Label>
                  <SearchableSelect
                    options={locationOptions}
                    value={formData.sourceLocationId}
                    onChange={(value) => {
                      setFormData({ ...formData, sourceLocationId: value, selectedAssets: [] });
                      setErrors({ ...errors, sourceLocationId: '' });
                    }}
                    placeholder="Select source location"
                  />
                  {errors.sourceLocationId && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {errors.sourceLocationId}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destinationLocationId">
                    Destination Location <span className="text-red-500">*</span>
                  </Label>
                  <SearchableSelect
                    options={locationOptions.filter(loc => loc.value !== formData.sourceLocationId)}
                    value={formData.destinationLocationId}
                    onChange={(value) => {
                      setFormData({ ...formData, destinationLocationId: value });
                      setErrors({ ...errors, destinationLocationId: '' });
                    }}
                    placeholder="Select destination location"
                  />
                  {errors.destinationLocationId && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {errors.destinationLocationId}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Reason for Movement <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => {
                    setFormData({ ...formData, reason: e.target.value });
                    setErrors({ ...errors, reason: '' });
                  }}
                  rows={3}
                  placeholder="Enter reason for movement (e.g., maintenance, event, storage relocation)"
                  className={errors.reason ? 'border-red-500' : ''}
                />
                {errors.reason && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {errors.reason}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validityFrom">Validity From (Optional)</Label>
                  <Input
                    id="validityFrom"
                    type="date"
                    value={formData.validityFrom}
                    onChange={(e) => {
                      setFormData({ ...formData, validityFrom: e.target.value });
                      setErrors({ ...errors, validityTo: '' });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validityTo">Validity To (Optional)</Label>
                  <Input
                    id="validityTo"
                    type="date"
                    value={formData.validityTo}
                    onChange={(e) => {
                      setFormData({ ...formData, validityTo: e.target.value });
                      setErrors({ ...errors, validityTo: '' });
                    }}
                    min={formData.validityFrom}
                  />
                  {errors.validityTo && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {errors.validityTo}
                    </p>
                  )}
                </div>
              </div>
              {formData.sourceLocationId && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Assets from this location will be shown in the Assets tab. Select source location first to filter available assets.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="assets" className="space-y-4 mt-4">
              {!formData.sourceLocationId ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please select a source location in the Basic Details tab first.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>
                      Select Assets <span className="text-red-500">*</span>
                      {formData.selectedAssets.length > 0 && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({formData.selectedAssets.length} selected)
                        </span>
                      )}
                    </Label>
                    {availableAssets.length === 0 ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No assets found at the selected source location.
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
                              {asset.nameEnglish && (
                                <div className="text-xs text-muted-foreground">{asset.nameEnglish}</div>
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
                  {formData.selectedAssets.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Assets Summary</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedAssetObjects.map(asset => (
                          <Badge key={asset.id} variant="secondary" className="text-xs">
                            {asset.assetCode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="review" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Movement Summary</Label>
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-xs">Source Location</Label>
                        <p className="font-medium">
                          {locations.find(l => l.id === formData.sourceLocationId)?.fullPath || 'Not selected'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Destination Location</Label>
                        <p className="font-medium">
                          {locations.find(l => l.id === formData.destinationLocationId)?.fullPath || 'Not selected'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-muted-foreground text-xs">Reason</Label>
                        <p className="font-medium">{formData.reason || 'Not provided'}</p>
                      </div>
                      {formData.validityFrom && formData.validityTo && (
                        <div className="col-span-2">
                          <Label className="text-muted-foreground text-xs">Validity Period</Label>
                          <p className="font-medium">
                            {new Date(formData.validityFrom).toLocaleDateString()} - {new Date(formData.validityTo).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Selected Assets ({formData.selectedAssets.length})</Label>
                  {formData.selectedAssets.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>No assets selected. Please go to Assets tab to select assets.</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-3">
                      {selectedAssetObjects.map(asset => (
                        <div key={asset.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                          <div>
                            <div className="text-sm font-medium">{asset.assetCode}</div>
                            <div className="text-xs text-muted-foreground">{asset.name}</div>
                          </div>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {workflow.levels.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Approval Workflow</Label>
                    <div className="space-y-2">
                      {workflow.levels.map((level, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Level {level.level}: {level.approverRole}</div>
                              <div className="text-sm text-muted-foreground">Status: {level.status}</div>
                            </div>
                            <Badge variant={level.status === 'approved' ? 'default' : 'secondary'}>
                              {level.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(errors).length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please fix the errors in the form before submitting.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {movement ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
