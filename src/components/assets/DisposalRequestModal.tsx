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
import { XCircle, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Asset } from '@/types/assets';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface DisposalRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (assetId: string, data: any) => void;
  asset?: Asset;
  assets: Asset[];
}

export function DisposalRequestModal({
  open,
  onClose,
  onSave,
  asset,
  assets,
}: DisposalRequestModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    assetId: '',
    disposalMethod: '',
    disposalValue: '',
    reason: '',
    disposalDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (asset) {
      setFormData({
        assetId: asset.id,
        disposalMethod: asset.disposalApproval?.disposalMethod || '',
        disposalValue: asset.disposalApproval?.disposalValue?.toString() || '',
        reason: asset.disposalApproval?.reason || '',
        disposalDate: asset.disposalApproval?.disposalDate || '',
      });
    } else {
      setFormData({
        assetId: '',
        disposalMethod: '',
        disposalValue: '',
        reason: '',
        disposalDate: '',
      });
    }
    setErrors({});
  }, [asset, open]);

  const selectedAsset = assets.find(a => a.id === formData.assetId);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!asset && !formData.assetId) {
      newErrors.assetId = 'Asset is required';
    }
    if (!formData.disposalMethod) {
      newErrors.disposalMethod = 'Disposal method is required';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for disposal is required';
    }
    if (formData.disposalDate && formData.disposalDate < new Date().toISOString().split('T')[0]) {
      newErrors.disposalDate = 'Disposal date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    if (!formData.assetId && !asset) return;
    
    const assetId = formData.assetId || asset?.id || '';
    
    const disposalData: any = {
      requestedBy: user?.id || 'user-1',
      requestedByName: user?.name || 'User',
      requestedAt: asset?.disposalApproval?.requestedAt || new Date().toISOString(),
      disposalMethod: formData.disposalMethod,
      disposalValue: formData.disposalValue ? parseFloat(formData.disposalValue) : undefined,
      reason: formData.reason,
    };

    // If disposal date is set, mark as completed
    if (formData.disposalDate) {
      disposalData.disposalDate = formData.disposalDate;
    }
    
    onSave(assetId, disposalData);
  };

  const canApprove = user?.role === 'trustee' || user?.role === 'finance' || user?.role === 'asset_admin';

  const getDisposalStatus = () => {
    if (!asset?.disposalApproval) return 'none';
    if (asset.disposalApproval.disposalDate) return 'completed';
    if (asset.disposalApproval.approvedAt) return 'approved';
    if (asset.disposalApproval.requestedAt) return 'pending';
    return 'none';
  };

  const status = getDisposalStatus();
  const canComplete = status === 'approved' && !asset.disposalApproval?.disposalDate;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {asset ? 'View/Approve Disposal Request' : 'Request Asset Disposal'}
          </DialogTitle>
          <DialogDescription>
            {asset 
              ? 'Review and approve or reject the disposal request'
              : 'Request disposal of an asset with proper justification and approval workflow'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="approval">Approval</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {!asset && (
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
                  options={assets.map(a => ({
                    value: a.id,
                    label: `${a.assetCode} - ${a.name}`,
                  }))}
                  placeholder="Select asset"
                />
                {errors.assetId && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {errors.assetId}
                  </p>
                )}
              </div>
            )}

            {selectedAsset && (
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Asset Code:</span>
                    <div className="text-sm font-medium">{selectedAsset.assetCode}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Category:</span>
                    <div className="text-sm capitalize">{selectedAsset.category}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Current Valuation:</span>
                    <div className="text-sm font-medium">₹{selectedAsset.currentValuation.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Sensitivity:</span>
                    <Badge 
                      variant={selectedAsset.sensitivity === 'sacred' ? 'destructive' : 'default'}
                      className="ml-2"
                    >
                      {selectedAsset.sensitivity}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Asset Name:</span>
                  <div className="text-sm">{selectedAsset.name}</div>
                  {selectedAsset.nameEnglish && (
                    <div className="text-xs text-muted-foreground">{selectedAsset.nameEnglish}</div>
                  )}
                </div>
                {selectedAsset.sensitivity === 'sacred' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This is a sacred asset. Disposal requires special approval and documentation.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>
                Disposal Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.disposalMethod}
                onValueChange={(value) => {
                  setFormData({ ...formData, disposalMethod: value });
                  setErrors({ ...errors, disposalMethod: '' });
                }}
              >
                <SelectTrigger className={errors.disposalMethod ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select disposal method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="donation">Donation</SelectItem>
                  <SelectItem value="scrap">Scrap</SelectItem>
                  <SelectItem value="destruction">Destruction</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
              {errors.disposalMethod && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.disposalMethod}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Disposal Value (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.disposalValue}
                  onChange={(e) => setFormData({ ...formData, disposalValue: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              {canComplete && (
                <div className="space-y-2">
                  <Label>
                    Disposal Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.disposalDate}
                    onChange={(e) => {
                      setFormData({ ...formData, disposalDate: e.target.value });
                      setErrors({ ...errors, disposalDate: '' });
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className={errors.disposalDate ? 'border-red-500' : ''}
                  />
                  {errors.disposalDate && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {errors.disposalDate}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Reason for Disposal <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => {
                  setFormData({ ...formData, reason: e.target.value });
                  setErrors({ ...errors, reason: '' });
                }}
                rows={4}
                placeholder="Provide detailed justification for disposal (e.g., asset is obsolete, damaged beyond repair, replaced, etc.)"
                className={errors.reason ? 'border-red-500' : ''}
              />
              {errors.reason && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.reason}
                </p>
              )}
            </div>

          </TabsContent>

          <TabsContent value="approval" className="space-y-4">
            {asset?.disposalApproval ? (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge
                      className={cn(
                        status === 'completed' ? 'bg-green-500 text-white' :
                        status === 'approved' ? 'bg-blue-500 text-white' :
                        status === 'pending' ? 'bg-yellow-500 text-black' :
                        'bg-gray-500 text-white'
                      )}
                    >
                      {status === 'completed' ? 'Completed' :
                       status === 'approved' ? 'Approved' :
                       status === 'pending' ? 'Pending Approval' : 'No Request'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Requested By:</span>
                      <div className="text-sm">{asset.disposalApproval.requestedByName}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Requested At:</span>
                      <div className="text-sm">
                        {new Date(asset.disposalApproval.requestedAt).toLocaleString()}
                      </div>
                    </div>
                    {asset.disposalApproval.approvedAt && (
                      <>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Approved By:</span>
                          <div className="text-sm">{asset.disposalApproval.approvedByName}</div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Approved At:</span>
                          <div className="text-sm">
                            {new Date(asset.disposalApproval.approvedAt).toLocaleString()}
                          </div>
                        </div>
                      </>
                    )}
                    {asset.disposalApproval.disposalDate && (
                      <>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Disposal Date:</span>
                          <div className="text-sm font-medium text-green-600">
                            {new Date(asset.disposalApproval.disposalDate).toLocaleDateString()}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {asset.disposalApproval.reason && (
                    <div className="pt-2 border-t">
                      <span className="text-sm font-medium text-muted-foreground">Reason:</span>
                      <div className="text-sm mt-1">{asset.disposalApproval.reason}</div>
                    </div>
                  )}
                </div>

                {canApprove && !asset.disposalApproval.approvedAt && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        onSave(asset.id, {
                          ...asset.disposalApproval,
                          approvedBy: user?.id,
                          approvedByName: user?.name,
                          approvedAt: new Date().toISOString(),
                        });
                      }}
                      className="flex-1"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve Disposal
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Are you sure you want to reject this disposal request?')) {
                          onSave(asset.id, {
                            requestedBy: asset.disposalApproval.requestedBy,
                            requestedByName: asset.disposalApproval.requestedByName,
                            requestedAt: asset.disposalApproval.requestedAt,
                            disposalMethod: asset.disposalApproval.disposalMethod,
                            disposalValue: asset.disposalApproval.disposalValue,
                            reason: asset.disposalApproval.reason,
                            // Clear approval
                            approvedBy: undefined,
                            approvedByName: undefined,
                            approvedAt: undefined,
                          });
                        }
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {canComplete && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This disposal has been approved. Set the disposal date to mark it as completed.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No approval workflow data available. Create a disposal request first.
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {asset ? 'Close' : 'Cancel'}
          </Button>
          {!asset && (
            <Button onClick={handleSave}>
              Request Disposal
            </Button>
          )}
          {canComplete && (
            <Button onClick={handleSave}>
              Complete Disposal
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
