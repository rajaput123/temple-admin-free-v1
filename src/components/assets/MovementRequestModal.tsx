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
import { SearchableSelect } from '@/components/ui/searchable-select';
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

  const assetOptions = assets.map(asset => ({
    value: asset.id,
    label: `${asset.assetCode} - ${asset.name}`,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{movement ? 'Edit Movement' : 'New Movement Request'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="approval">Approval</TabsTrigger>
              <TabsTrigger value="cv">CV Verification</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sourceLocationId">Source Location *</Label>
                  <SearchableSelect
                    options={locationOptions}
                    value={formData.sourceLocationId}
                    onChange={(value) => setFormData({ ...formData, sourceLocationId: value })}
                    placeholder="Select source location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destinationLocationId">Destination Location *</Label>
                  <SearchableSelect
                    options={locationOptions}
                    value={formData.destinationLocationId}
                    onChange={(value) => setFormData({ ...formData, destinationLocationId: value })}
                    placeholder="Select destination location"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Movement *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  placeholder="Enter reason for movement"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validityFrom">Validity From</Label>
                  <Input
                    id="validityFrom"
                    type="date"
                    value={formData.validityFrom}
                    onChange={(e) => setFormData({ ...formData, validityFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validityTo">Validity To</Label>
                  <Input
                    id="validityTo"
                    type="date"
                    value={formData.validityTo}
                    onChange={(e) => setFormData({ ...formData, validityTo: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assets" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Select Assets</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2">
                  {assets.map(asset => (
                    <label key={asset.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selectedAssets.includes(asset.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              selectedAssets: [...formData.selectedAssets, asset.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selectedAssets: formData.selectedAssets.filter(id => id !== asset.id),
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{asset.assetCode} - {asset.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="approval" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Approval Workflow</Label>
                <div className="space-y-2">
                  {workflow.levels.map((level, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="font-medium">Level {level.level}: {level.approverRole}</div>
                      <div className="text-sm text-muted-foreground">Status: {level.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cv" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>CV Verification at Source</Label>
                <Input type="file" accept="image/*" />
                <p className="text-xs text-muted-foreground">
                  Capture image at source location for CV verification
                </p>
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Movement Status</Label>
                <div className="p-3 border rounded">
                  {movement?.status || 'Draft'}
                </div>
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
