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
import { Switch } from '@/components/ui/switch';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { Item, ItemCategory, UOM, Godown, Supplier, ItemStatus } from '@/types/inventory';
import { CustomFieldsEditor } from '@/components/structure/CustomFieldsEditor';

interface ItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Item | null;
  categories: ItemCategory[];
  uoms: UOM[];
  godowns: Godown[];
  suppliers: Supplier[];
  onSave: (item: Partial<Item>) => void;
}

export function ItemModal({
  open,
  onOpenChange,
  item,
  categories,
  uoms,
  godowns,
  suppliers,
  onSave,
}: ItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    categoryId: '',
    subCategory: '',
    description: '',
    baseUOM: '',
    alternateUOMs: [] as Array<{ uomId: string; uomName: string; conversionFactor: number }>,
    minStockLevel: 0,
    reorderPoint: 0,
    stockAllocations: [] as Array<{ godownId: string; godownName: string; quantity: number }>,
    preferredSupplierId: '',
    supplierPricing: [] as Array<{ supplierId: string; supplierName: string; rate: number; uom: string; lastUpdated: string }>,
    hsnCode: '',
    gstSlab: 0,
    taxCategory: '',
    isPerishable: false,
    expiryTracking: false,
    shelfLife: 0,
    temperatureRange: { min: 0, max: 0 },
    status: 'active' as ItemStatus,
    customFields: {} as Record<string, string>,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        code: item.code || '',
        categoryId: item.categoryId,
        subCategory: item.subCategory || '',
        description: item.description || '',
        baseUOM: item.baseUOM,
        alternateUOMs: item.alternateUOMs || [],
        minStockLevel: item.minStockLevel,
        reorderPoint: item.reorderPoint,
        stockAllocations: item.stockAllocations || [],
        preferredSupplierId: item.preferredSupplierId || '',
        supplierPricing: item.supplierPricing || [],
        hsnCode: item.hsnCode || '',
        gstSlab: item.gstSlab || 0,
        taxCategory: item.taxCategory || '',
        isPerishable: item.isPerishable,
        expiryTracking: item.expiryTracking || false,
        shelfLife: item.shelfLife || 0,
        temperatureRange: item.temperatureRange || { min: 0, max: 0 },
        status: item.status,
        customFields: item.customFields || {},
      });
    } else {
      setFormData({
        name: '',
        code: '',
        categoryId: '',
        subCategory: '',
        description: '',
        baseUOM: '',
        alternateUOMs: [],
        minStockLevel: 0,
        reorderPoint: 0,
        stockAllocations: [],
        preferredSupplierId: '',
        supplierPricing: [],
        hsnCode: '',
        gstSlab: 0,
        taxCategory: '',
        isPerishable: false,
        expiryTracking: false,
        shelfLife: 0,
        temperatureRange: { min: 0, max: 0 },
        status: 'active',
        customFields: {},
      });
    }
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const category = categories.find(c => c.id === formData.categoryId);
    onSave({
      ...formData,
      categoryName: category?.name || '',
      totalStock: formData.stockAllocations.reduce((sum, alloc) => sum + alloc.quantity, 0),
    });
  };

  const addAlternateUOM = () => {
    setFormData({
      ...formData,
      alternateUOMs: [...formData.alternateUOMs, { uomId: '', uomName: '', conversionFactor: 0 }],
    });
  };

  const removeAlternateUOM = (index: number) => {
    setFormData({
      ...formData,
      alternateUOMs: formData.alternateUOMs.filter((_, i) => i !== index),
    });
  };

  const updateAlternateUOM = (index: number, field: 'uomId' | 'conversionFactor', value: string | number) => {
    const newAlternateUOMs = [...formData.alternateUOMs];
    if (field === 'uomId') {
      const uom = uoms.find(u => u.id === value);
      newAlternateUOMs[index] = { ...newAlternateUOMs[index], uomId: value as string, uomName: uom?.name || '' };
    } else {
      newAlternateUOMs[index] = { ...newAlternateUOMs[index], conversionFactor: value as number };
    }
    setFormData({ ...formData, alternateUOMs: newAlternateUOMs });
  };

  const addStockAllocation = () => {
    setFormData({
      ...formData,
      stockAllocations: [...formData.stockAllocations, { godownId: '', godownName: '', quantity: 0 }],
    });
  };

  const removeStockAllocation = (index: number) => {
    setFormData({
      ...formData,
      stockAllocations: formData.stockAllocations.filter((_, i) => i !== index),
    });
  };

  const updateStockAllocation = (index: number, field: 'godownId' | 'quantity', value: string | number) => {
    const newAllocations = [...formData.stockAllocations];
    if (field === 'godownId') {
      const godown = godowns.find(g => g.id === value);
      newAllocations[index] = { ...newAllocations[index], godownId: value as string, godownName: godown?.name || '' };
    } else {
      newAllocations[index] = { ...newAllocations[index], quantity: value as number };
    }
    setFormData({ ...formData, stockAllocations: newAllocations });
  };

  const addSupplierPricing = () => {
    setFormData({
      ...formData,
      supplierPricing: [...formData.supplierPricing, { supplierId: '', supplierName: '', rate: 0, uom: formData.baseUOM, lastUpdated: new Date().toISOString().split('T')[0] }],
    });
  };

  const removeSupplierPricing = (index: number) => {
    setFormData({
      ...formData,
      supplierPricing: formData.supplierPricing.filter((_, i) => i !== index),
    });
  };

  const updateSupplierPricing = (index: number, field: 'supplierId' | 'rate', value: string | number) => {
    const newPricing = [...formData.supplierPricing];
    if (field === 'supplierId') {
      const supplier = suppliers.find(s => s.id === value);
      newPricing[index] = { ...newPricing[index], supplierId: value as string, supplierName: supplier?.name || '' };
    } else {
      newPricing[index] = { ...newPricing[index], rate: value as number };
    }
    setFormData({ ...formData, supplierPricing: newPricing });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Item' : 'Add Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="stock">Stock</TabsTrigger>
              <TabsTrigger value="supplier">Supplier</TabsTrigger>
              <TabsTrigger value="tax">Tax</TabsTrigger>
              <TabsTrigger value="perishable">Perishable</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Item Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Enter item code"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <SearchableSelect
                    options={categories.map(c => ({ value: c.id, label: c.name }))}
                    value={formData.categoryId}
                    onChange={(value) => setFormData({ ...formData, categoryId: value })}
                    placeholder="Select category"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subCategory">Sub Category</Label>
                  <Input
                    id="subCategory"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    placeholder="Enter sub category"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: ItemStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="stock" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="baseUOM">Base Unit of Measurement *</Label>
                <SearchableSelect
                  options={uoms.map(u => ({ value: u.id, label: `${u.name} (${u.code})` }))}
                  value={formData.baseUOM}
                  onChange={(value) => setFormData({ ...formData, baseUOM: value })}
                  placeholder="Select base UOM"
                />
              </div>

              <div className="space-y-2">
                <Label>Alternate UOMs</Label>
                {formData.alternateUOMs.map((altUOM, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">UOM</Label>
                      <SearchableSelect
                        options={uoms.map(u => ({ value: u.id, label: `${u.name} (${u.code})` }))}
                        value={altUOM.uomId}
                        onChange={(value) => updateAlternateUOM(index, 'uomId', value)}
                        placeholder="Select UOM"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Conversion Factor</Label>
                      <Input
                        type="number"
                        value={altUOM.conversionFactor}
                        onChange={(e) => updateAlternateUOM(index, 'conversionFactor', parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 50 (1 bag = 50kg)"
                      />
                    </div>
                    <Button type="button" variant="outline" size="icon" onClick={() => removeAlternateUOM(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addAlternateUOM} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Alternate UOM
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: parseFloat(e.target.value) || 0 })}
                    placeholder="Enter min stock level"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorderPoint">Reorder Point</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    value={formData.reorderPoint}
                    onChange={(e) => setFormData({ ...formData, reorderPoint: parseFloat(e.target.value) || 0 })}
                    placeholder="Enter reorder point"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Godown-wise Stock Allocation</Label>
                {formData.stockAllocations.map((alloc, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Godown</Label>
                      <SearchableSelect
                        options={godowns.map(g => ({ value: g.id, label: g.name }))}
                        value={alloc.godownId}
                        onChange={(value) => updateStockAllocation(index, 'godownId', value)}
                        placeholder="Select godown"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        value={alloc.quantity}
                        onChange={(e) => updateStockAllocation(index, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="Enter quantity"
                      />
                    </div>
                    <Button type="button" variant="outline" size="icon" onClick={() => removeStockAllocation(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addStockAllocation} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Godown Allocation
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="supplier" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="preferredSupplierId">Preferred Supplier</Label>
                <SearchableSelect
                  options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                  value={formData.preferredSupplierId}
                  onChange={(value) => setFormData({ ...formData, preferredSupplierId: value })}
                  placeholder="Select preferred supplier"
                />
              </div>

              <div className="space-y-2">
                <Label>Supplier Pricing History</Label>
                {formData.supplierPricing.map((pricing, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Supplier</Label>
                      <SearchableSelect
                        options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                        value={pricing.supplierId}
                        onChange={(value) => updateSupplierPricing(index, 'supplierId', value)}
                        placeholder="Select supplier"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Rate</Label>
                      <Input
                        type="number"
                        value={pricing.rate}
                        onChange={(e) => updateSupplierPricing(index, 'rate', parseFloat(e.target.value) || 0)}
                        placeholder="Enter rate"
                      />
                    </div>
                    <Button type="button" variant="outline" size="icon" onClick={() => removeSupplierPricing(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addSupplierPricing} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier Pricing
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="tax" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="hsnCode">HSN Code</Label>
                <Input
                  id="hsnCode"
                  value={formData.hsnCode}
                  onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                  placeholder="Enter HSN code"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gstSlab">GST Slab (%)</Label>
                  <Input
                    id="gstSlab"
                    type="number"
                    value={formData.gstSlab}
                    onChange={(e) => setFormData({ ...formData, gstSlab: parseFloat(e.target.value) || 0 })}
                    placeholder="Enter GST percentage"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxCategory">Tax Category</Label>
                  <Input
                    id="taxCategory"
                    value={formData.taxCategory}
                    onChange={(e) => setFormData({ ...formData, taxCategory: e.target.value })}
                    placeholder="Enter tax category"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="perishable" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Is Perishable</Label>
                  <p className="text-sm text-muted-foreground">Enable expiry tracking for this item</p>
                </div>
                <Switch
                  checked={formData.isPerishable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPerishable: checked, expiryTracking: checked })}
                />
              </div>

              {formData.isPerishable && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Expiry Tracking</Label>
                      <p className="text-sm text-muted-foreground">Track expiry dates for batches</p>
                    </div>
                    <Switch
                      checked={formData.expiryTracking}
                      onCheckedChange={(checked) => setFormData({ ...formData, expiryTracking: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shelfLife">Shelf Life (Days)</Label>
                    <Input
                      id="shelfLife"
                      type="number"
                      value={formData.shelfLife}
                      onChange={(e) => setFormData({ ...formData, shelfLife: parseInt(e.target.value) || 0 })}
                      placeholder="Enter shelf life in days"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tempMin">Min Temperature (°C)</Label>
                      <Input
                        id="tempMin"
                        type="number"
                        value={formData.temperatureRange.min}
                        onChange={(e) => setFormData({
                          ...formData,
                          temperatureRange: { ...formData.temperatureRange, min: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="Min temp"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tempMax">Max Temperature (°C)</Label>
                      <Input
                        id="tempMax"
                        type="number"
                        value={formData.temperatureRange.max}
                        onChange={(e) => setFormData({
                          ...formData,
                          temperatureRange: { ...formData.temperatureRange, max: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="Max temp"
                      />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-4">
              <CustomFieldsEditor
                customFields={formData.customFields}
                onChange={(fields) => setFormData({ ...formData, customFields: fields })}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{item ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
