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
import { CustomFieldsEditor } from '@/components/structure/CustomFieldsEditor';
import { Upload, X } from 'lucide-react';
import type { Asset, AssetLocation, AssetCategory } from '@/types/assets';
import { generateVisualFingerprint } from '@/lib/assets/cv-verification';

interface AssetMasterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
  locations: AssetLocation[];
  categories: Array<{ id: string; name: string; category: AssetCategory }>;
  onSave: (asset: Partial<Asset>) => void;
}

export function AssetMasterModal({
  open,
  onOpenChange,
  asset,
  locations,
  categories,
  onSave,
}: AssetMasterModalProps) {
  const [formData, setFormData] = useState({
    assetCode: '',
    name: '',
    nameEnglish: '',
    category: 'operational' as AssetCategory,
    subCategory: '',
    description: '',
    acquisitionType: 'purchased' as 'purchased' | 'donated' | 'historical',
    acquisitionDate: '',
    acquisitionYear: undefined as number | undefined,
    sensitivity: 'normal' as 'normal' | 'high_value' | 'sacred',
    condition: 'good' as 'excellent' | 'good' | 'fair' | 'poor' | 'condemned',
    lifecycleStatus: 'active' as 'active' | 'in_use' | 'under_maintenance' | 'disposed' | 'condemned',
    currentValuation: 0,
    valuationDate: new Date().toISOString().split('T')[0],
    valuationCertificate: '',
    donorId: '',
    donorName: '',
    donorReceiptNumber: '',
    legalIdentifiers: {
      surveyNumber: '',
      serialNumber: '',
      chassisNumber: '',
      registrationNumber: '',
    },
    currentLocationId: '',
    primaryImage: '',
    additionalImages: [] as string[],
    documents: [] as Array<{ type: string; name: string; url: string; uploadedAt: string }>,
    depreciationRate: 0,
    customFields: {} as Record<string, string>,
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        assetCode: asset.assetCode || '',
        name: asset.name,
        nameEnglish: asset.nameEnglish || '',
        category: asset.category,
        subCategory: asset.subCategory || '',
        description: asset.description || '',
        acquisitionType: asset.acquisitionType,
        acquisitionDate: asset.acquisitionDate || '',
        acquisitionYear: asset.acquisitionYear,
        sensitivity: asset.sensitivity,
        condition: asset.condition,
        lifecycleStatus: asset.lifecycleStatus,
        currentValuation: asset.currentValuation,
        valuationDate: asset.valuationDate.split('T')[0],
        valuationCertificate: asset.valuationCertificate || '',
        donorId: asset.donorId || '',
        donorName: asset.donorName || '',
        donorReceiptNumber: asset.donorReceiptNumber || '',
        legalIdentifiers: asset.legalIdentifiers || {
          surveyNumber: '',
          serialNumber: '',
          chassisNumber: '',
          registrationNumber: '',
        },
        currentLocationId: asset.currentLocationId,
        primaryImage: asset.primaryImage || '',
        additionalImages: asset.additionalImages || [],
        documents: asset.documents || [],
        depreciationRate: asset.depreciationRate || 0,
        customFields: asset.customFields || {},
        status: asset.status,
      });
    } else {
      // Generate asset code for new asset
      const code = `AST-${String(Date.now()).slice(-6)}`;
      setFormData({
        assetCode: code,
        name: '',
        nameEnglish: '',
        category: 'operational',
        subCategory: '',
        description: '',
        acquisitionType: 'purchased',
        acquisitionDate: '',
        acquisitionYear: undefined,
        sensitivity: 'normal',
        condition: 'good',
        lifecycleStatus: 'active',
        currentValuation: 0,
        valuationDate: new Date().toISOString().split('T')[0],
        valuationCertificate: '',
        donorId: '',
        donorName: '',
        donorReceiptNumber: '',
        legalIdentifiers: {
          surveyNumber: '',
          serialNumber: '',
          chassisNumber: '',
          registrationNumber: '',
        },
        currentLocationId: locations[0]?.id || '',
        primaryImage: '',
        additionalImages: [],
        documents: [],
        depreciationRate: 0,
        customFields: {},
        status: 'active',
      });
    }
  }, [asset, open, locations]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isPrimary = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (isPrimary) {
        setFormData({ ...formData, primaryImage: base64 });
        // Generate CV fingerprint
        const fingerprint = generateVisualFingerprint(base64);
        // Store fingerprint in formData (will be saved with asset)
      } else {
        setFormData({
          ...formData,
          additionalImages: [...formData.additionalImages, base64],
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      additionalImages: formData.additionalImages.filter((_, i) => i !== index),
    });
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData({
        ...formData,
        documents: [
          ...formData.documents,
          {
            type,
            name: file.name,
            url: base64,
            uploadedAt: new Date().toISOString(),
          },
        ],
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const location = locations.find(l => l.id === formData.currentLocationId);
    const cvFingerprint = formData.primaryImage
      ? generateVisualFingerprint(formData.primaryImage)
      : undefined;

    onSave({
      ...formData,
      currentLocationName: location?.fullPath || '',
      cvFingerprint,
      id: asset?.id || `ast-${Date.now()}`,
      createdAt: asset?.createdAt || new Date().toISOString(),
      createdBy: asset?.createdBy || 'user-1',
      createdByName: asset?.createdByName || 'Current User',
      updatedAt: new Date().toISOString(),
    });
  };

  const locationOptions = locations.map(loc => ({
    value: loc.id,
    label: loc.fullPath,
  }));

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="valuation">Valuation</TabsTrigger>
              <TabsTrigger value="legal">Legal</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetCode">Asset Code *</Label>
                  <Input
                    id="assetCode"
                    value={formData.assetCode}
                    onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                    required
                    disabled={!!asset} // Immutable after creation
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as AssetCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immovable">Immovable</SelectItem>
                      <SelectItem value="sacred">Sacred</SelectItem>
                      <SelectItem value="valuables">Valuables</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="vehicles">Vehicles</SelectItem>
                      <SelectItem value="it">IT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name (Local) *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter asset name in local language"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameEnglish">Name (English)</Label>
                <Input
                  id="nameEnglish"
                  value={formData.nameEnglish}
                  onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                  placeholder="Enter asset name in English"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="acquisitionType">Acquisition Type *</Label>
                  <Select
                    value={formData.acquisitionType}
                    onValueChange={(value) => setFormData({ ...formData, acquisitionType: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchased">Purchased</SelectItem>
                      <SelectItem value="donated">Donated</SelectItem>
                      <SelectItem value="historical">Historical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  {formData.acquisitionType === 'historical' ? (
                    <>
                      <Label htmlFor="acquisitionYear">Approximate Year</Label>
                      <Input
                        id="acquisitionYear"
                        type="number"
                        value={formData.acquisitionYear || ''}
                        onChange={(e) => setFormData({ ...formData, acquisitionYear: parseInt(e.target.value) || undefined })}
                        placeholder="e.g., 1950"
                      />
                    </>
                  ) : (
                    <>
                      <Label htmlFor="acquisitionDate">Acquisition Date</Label>
                      <Input
                        id="acquisitionDate"
                        type="date"
                        value={formData.acquisitionDate}
                        onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sensitivity">Sensitivity *</Label>
                  <Select
                    value={formData.sensitivity}
                    onValueChange={(value) => setFormData({ ...formData, sensitivity: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high_value">High Value</SelectItem>
                      <SelectItem value="sacred">Sacred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => setFormData({ ...formData, condition: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="condemned">Condemned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Enter asset description"
                />
              </div>
            </TabsContent>

            <TabsContent value="valuation" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentValuation">Current Valuation (₹) *</Label>
                  <Input
                    id="currentValuation"
                    type="number"
                    value={formData.currentValuation}
                    onChange={(e) => setFormData({ ...formData, currentValuation: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valuationDate">Valuation Date *</Label>
                  <Input
                    id="valuationDate"
                    type="date"
                    value={formData.valuationDate}
                    onChange={(e) => setFormData({ ...formData, valuationDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depreciationRate">Depreciation Rate (% per year)</Label>
                <Input
                  id="depreciationRate"
                  type="number"
                  value={formData.depreciationRate}
                  onChange={(e) => setFormData({ ...formData, depreciationRate: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 15"
                />
              </div>

              {formData.acquisitionType === 'donated' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="donorName">Donor Name</Label>
                    <Input
                      id="donorName"
                      value={formData.donorName}
                      onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                      placeholder="Enter donor name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="donorReceiptNumber">Donor Receipt Number</Label>
                    <Input
                      id="donorReceiptNumber"
                      value={formData.donorReceiptNumber}
                      onChange={(e) => setFormData({ ...formData, donorReceiptNumber: e.target.value })}
                      placeholder="Enter receipt number"
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="legal" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="surveyNumber">Survey Number</Label>
                  <Input
                    id="surveyNumber"
                    value={formData.legalIdentifiers.surveyNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      legalIdentifiers: { ...formData.legalIdentifiers, surveyNumber: e.target.value },
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    value={formData.legalIdentifiers.serialNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      legalIdentifiers: { ...formData.legalIdentifiers, serialNumber: e.target.value },
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chassisNumber">Chassis Number</Label>
                  <Input
                    id="chassisNumber"
                    value={formData.legalIdentifiers.chassisNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      legalIdentifiers: { ...formData.legalIdentifiers, chassisNumber: e.target.value },
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.legalIdentifiers.registrationNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      legalIdentifiers: { ...formData.legalIdentifiers, registrationNumber: e.target.value },
                    })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="currentLocationId">Current Location *</Label>
                <SearchableSelect
                  options={locationOptions}
                  value={formData.currentLocationId}
                  onChange={(value) => setFormData({ ...formData, currentLocationId: value })}
                  placeholder="Select location"
                />
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Primary Image *</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="flex-1"
                  />
                  {formData.primaryImage && (
                    <img
                      src={formData.primaryImage}
                      alt="Primary"
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Primary image will be used for CV fingerprint generation
                </p>
              </div>

              <div className="space-y-2">
                <Label>Additional Images</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                />
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {formData.additionalImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Additional ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Valuation Certificate</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload(e, 'valuation_certificate')}
                />
              </div>
              {formData.acquisitionType === 'donated' && (
                <div className="space-y-2">
                  <Label>Donor Receipt</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleDocumentUpload(e, 'donor_receipt')}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Other Documents</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload(e, 'other')}
                />
              </div>
              {formData.documents.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Documents</Label>
                  <div className="space-y-1">
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{doc.name} ({doc.type})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
              <CustomFieldsEditor
                customFields={formData.customFields}
                onChange={(fields) => setFormData({ ...formData, customFields: fields })}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {asset ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
