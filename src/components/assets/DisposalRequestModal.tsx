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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Asset } from '@/types/assets';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

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
    disposalValue: 0,
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        assetId: asset.id,
        disposalMethod: asset.disposalApproval?.disposalMethod || '',
        disposalValue: asset.disposalApproval?.disposalValue || 0,
      });
    } else {
      setFormData({
        assetId: '',
        disposalMethod: '',
        disposalValue: 0,
      });
    }
  }, [asset]);

  const selectedAsset = assets.find(a => a.id === formData.assetId);

  const handleSave = () => {
    if (!formData.assetId) return;
    
    const disposalData = {
      requestedBy: user?.id || 'user-1',
      requestedByName: user?.name || 'User',
      requestedAt: asset?.disposalApproval?.requestedAt || new Date().toISOString(),
      disposalMethod: formData.disposalMethod,
      disposalValue: formData.disposalValue,
    };
    
    onSave(formData.assetId, disposalData);
  };

  const canApprove = user?.role === 'trustee' || user?.role === 'finance' || user?.role === 'asset_admin';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {asset ? 'View/Approve Disposal Request' : 'Request Asset Disposal'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="approval">Approval</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {!asset && (
              <div className="space-y-2">
                <Label>Asset *</Label>
                <SearchableSelect
                  value={formData.assetId}
                  onValueChange={(value) => setFormData({ ...formData, assetId: value })}
                  options={assets.map(a => ({
                    value: a.id,
                    label: `${a.assetCode} - ${a.name}`,
                  }))}
                  placeholder="Select asset"
                />
              </div>
            )}

            {selectedAsset && (
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Asset Code:</span>
                  <span className="text-sm">{selectedAsset.assetCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Asset Name:</span>
                  <span className="text-sm">{selectedAsset.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Current Valuation:</span>
                  <span className="text-sm">₹{selectedAsset.currentValuation.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Sensitivity:</span>
                  <Badge variant={selectedAsset.sensitivity === 'sacred' ? 'destructive' : 'default'}>
                    {selectedAsset.sensitivity}
                  </Badge>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Disposal Method *</Label>
              <Select
                value={formData.disposalMethod}
                onValueChange={(value) => setFormData({ ...formData, disposalMethod: value })}
              >
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label>Disposal Value (₹)</Label>
              <Input
                type="number"
                value={formData.disposalValue}
                onChange={(e) => setFormData({ ...formData, disposalValue: parseFloat(e.target.value) || 0 })}
                placeholder="Enter disposal value"
              />
            </div>

          </TabsContent>

          <TabsContent value="approval" className="space-y-4">
            {asset?.disposalApproval ? (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Requested By:</span>
                    <span className="text-sm">{asset.disposalApproval.requestedByName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Requested At:</span>
                    <span className="text-sm">
                      {new Date(asset.disposalApproval.requestedAt).toLocaleString()}
                    </span>
                  </div>
                  {asset.disposalApproval.approvedAt && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Approved By:</span>
                        <span className="text-sm">{asset.disposalApproval.approvedByName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Approved At:</span>
                        <span className="text-sm">
                          {new Date(asset.disposalApproval.approvedAt).toLocaleString()}
                        </span>
                      </div>
                    </>
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
                    >
                      Approve Disposal
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        onSave(asset.id, {
                          ...asset.disposalApproval,
                          approvedAt: undefined,
                        });
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No approval workflow data available
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {asset ? 'Close' : 'Cancel'}
          </Button>
          {!asset && (
            <Button onClick={handleSave} disabled={!formData.assetId || !formData.disposalMethod}>
              Request Disposal
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
