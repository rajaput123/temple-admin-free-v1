import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Asset, AssetAudit, AuditResult } from '@/types/assets';
import { performAuditComparison } from '@/lib/assets/asset-audit-workflow';

interface AuditVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audit: AssetAudit;
  assets: Asset[];
  onSave: (audit: AssetAudit) => void;
}

export function AuditVerificationModal({
  open,
  onOpenChange,
  audit,
  assets,
  onSave,
}: AuditVerificationModalProps) {
  const [currentImages, setCurrentImages] = useState<Record<string, string>>({});

  const handleImageUpload = (assetId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setCurrentImages({ ...currentImages, [assetId]: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyAsset = (asset: Asset) => {
    const currentImage = currentImages[asset.id];
    if (!currentImage) return;

    const comparison = performAuditComparison(asset, currentImage);
    // Update audit with result
    const updatedAssets = audit.assets.map(a =>
      a.assetId === asset.id
        ? { ...a, cvComparisonResult: comparison.result, similarityScore: comparison.similarityScore, photoEvidence: currentImage }
        : a
    );
    
    onSave({
      ...audit,
      assets: updatedAssets,
    });
  };

  const getResultBadge = (result?: AuditResult) => {
    if (!result) return <Badge variant="secondary">Pending</Badge>;
    switch (result) {
      case 'match':
        return <Badge variant="default">Match</Badge>;
      case 'partial_match':
        return <Badge variant="default">Partial Match</Badge>;
      case 'mismatch':
        return <Badge variant="destructive">Mismatch</Badge>;
      case 'missing':
        return <Badge variant="destructive">Missing</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Audit Verification - {audit.auditNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {audit.assets.map(assetItem => {
            const asset = assets.find(a => a.id === assetItem.assetId);
            if (!asset) return null;

            return (
              <div key={assetItem.assetId} className="border rounded p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-muted-foreground">{asset.assetCode}</div>
                  </div>
                  {getResultBadge(assetItem.cvComparisonResult)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Reference Image</Label>
                    {asset.primaryImage ? (
                      <img src={asset.primaryImage} alt="Reference" className="w-full h-48 object-cover rounded border" />
                    ) : (
                      <div className="w-full h-48 border rounded flex items-center justify-center text-muted-foreground">
                        No reference image
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Current Image</Label>
                    {currentImages[asset.id] ? (
                      <img src={currentImages[asset.id]} alt="Current" className="w-full h-48 object-cover rounded border" />
                    ) : (
                      <div className="w-full h-48 border rounded flex items-center justify-center">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(asset.id, e)}
                          className="w-full"
                        />
                      </div>
                    )}
                    {currentImages[asset.id] && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleVerifyAsset(asset)}
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                </div>

                {assetItem.similarityScore !== undefined && (
                  <div className="text-sm">
                    <span className="font-medium">Similarity Score: </span>
                    <span>{assetItem.similarityScore}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type="button" onClick={() => onSave(audit)}>
            Complete Audit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
