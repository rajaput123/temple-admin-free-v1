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
import { StockEntry, StockEntryType, StockEntryItem, IssueDestination } from '@/types/inventory';
import { Item } from '@/types/inventory';
import { Godown } from '@/types/inventory';
import { Department } from '@/types/hr';
import { Counter } from '@/types/temple-structure';
import { Sacred } from '@/types/temple-structure';

interface StockEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: StockEntry | null;
  items: Item[];
  godowns: Godown[];
  departments: Department[];
  counters: Counter[];
  sacreds: Sacred[];
  onSave: (entry: Partial<StockEntry>) => void;
}

const entryTypeLabels: Record<StockEntryType, string> = {
  receipt: 'Receipt',
  issue: 'Issue',
  transfer: 'Transfer',
  adjustment: 'Adjustment',
  return: 'Return',
  free_issue: 'Free Issue',
};

const destinationLabels: Record<IssueDestination, string> = {
  kitchen: 'Kitchen',
  counter: 'Counter',
  rituals: 'Rituals',
  external_event: 'External Event',
  other: 'Other',
};

export function StockEntryModal({
  open,
  onOpenChange,
  entry,
  items,
  godowns,
  departments,
  counters,
  sacreds,
  onSave,
}: StockEntryModalProps) {
  const [formData, setFormData] = useState({
    type: 'receipt' as StockEntryType,
    date: new Date().toISOString().split('T')[0],
    items: [] as Array<StockEntryItem & { tempId?: string }>,
    sourceGodownId: '',
    destinationGodownId: '',
    destination: undefined as IssueDestination | undefined,
    destinationDetails: '',
    referenceNumber: '',
    supplierId: '',
    remarks: '',
    approvalStatus: undefined as 'pending' | 'approved' | 'rejected' | undefined,
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        type: entry.type,
        date: entry.date,
        items: entry.items.map(item => ({ ...item, tempId: Math.random().toString() })),
        sourceGodownId: entry.sourceGodownId || '',
        destinationGodownId: entry.destinationGodownId || '',
        destination: entry.destination,
        destinationDetails: entry.destinationDetails || '',
        referenceNumber: entry.referenceNumber || '',
        supplierId: entry.supplierId || '',
        remarks: entry.remarks || '',
        approvalStatus: entry.approvalStatus,
      });
    } else {
      setFormData({
        type: 'receipt',
        date: new Date().toISOString().split('T')[0],
        items: [],
        sourceGodownId: '',
        destinationGodownId: '',
        destination: undefined,
        destinationDetails: '',
        referenceNumber: '',
        supplierId: '',
        remarks: '',
        approvalStatus: undefined,
      });
    }
  }, [entry, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entryItems = formData.items.map(({ tempId, ...item }) => item);
    onSave({
      ...formData,
      items: entryItems,
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        tempId: Math.random().toString(),
        itemId: '',
        itemName: '',
        quantity: 0,
        uom: '',
        batchNumber: '',
        manufacturingDate: '',
        expiryDate: '',
        rate: 0,
        remarks: '',
      }],
    });
  };

  const removeItem = (tempId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.tempId !== tempId),
    });
  };

  const updateItem = (tempId: string, field: keyof StockEntryItem, value: string | number) => {
    setFormData({
      ...formData,
      items: formData.items.map(item => {
        if (item.tempId === tempId) {
          if (field === 'itemId') {
            const selectedItem = items.find(i => i.id === value);
            return {
              ...item,
              itemId: value as string,
              itemName: selectedItem?.name || '',
              uom: selectedItem?.baseUOM || '',
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      }),
    });
  };

  const needsApproval = formData.type === 'transfer' || formData.type === 'adjustment' || 
    (formData.type === 'issue' && formData.items.some(item => {
      const stockItem = items.find(i => i.id === item.itemId);
      if (!stockItem) return false;
      const allocation = stockItem.stockAllocations.find(a => a.godownId === formData.sourceGodownId);
      const availableStock = allocation?.quantity || 0;
      return item.quantity > availableStock;
    }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit Stock Entry' : 'New Stock Entry'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              {needsApproval && <TabsTrigger value="approval">Approval</TabsTrigger>}
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Entry Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: StockEntryType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(entryTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              {(formData.type === 'receipt' || formData.type === 'return') && (
                <div className="space-y-2">
                  <Label htmlFor="supplierId">Supplier</Label>
                  <Input
                    id="supplierId"
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    placeholder="Enter supplier ID or name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="referenceNumber">Reference Number</Label>
                <Input
                  id="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  placeholder="PO number, Requisition number, etc."
                />
              </div>

              {formData.type !== 'receipt' && formData.type !== 'return' && (
                <div className="space-y-2">
                  <Label htmlFor="sourceGodownId">Source Godown *</Label>
                  <SearchableSelect
                    options={godowns.map(g => ({ value: g.id, label: g.name }))}
                    value={formData.sourceGodownId}
                    onChange={(value) => setFormData({ ...formData, sourceGodownId: value })}
                    placeholder="Select source godown"
                  />
                </div>
              )}

              {formData.type !== 'adjustment' && (
                <div className="space-y-2">
                  <Label htmlFor="destinationGodownId">
                    {formData.type === 'receipt' || formData.type === 'return' ? 'Destination Godown *' : 'Destination Godown'}
                  </Label>
                  <SearchableSelect
                    options={godowns.map(g => ({ value: g.id, label: g.name }))}
                    value={formData.destinationGodownId}
                    onChange={(value) => setFormData({ ...formData, destinationGodownId: value })}
                    placeholder="Select destination godown"
                  />
                </div>
              )}

              {formData.type === 'issue' && (
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Select
                    value={formData.destination || ''}
                    onValueChange={(value: IssueDestination) => setFormData({ ...formData, destination: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(destinationLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.type === 'issue' && formData.destination && (
                <div className="space-y-2">
                  <Label htmlFor="destinationDetails">Destination Details</Label>
                  {formData.destination === 'kitchen' && (
                    <SearchableSelect
                      options={departments.filter(d => d.name === 'Kitchen').map(d => ({ value: d.id, label: d.name }))}
                      value={formData.destinationDetails}
                      onChange={(value) => {
                        const dept = departments.find(d => d.id === value);
                        setFormData({ ...formData, destinationDetails: dept?.name || value });
                      }}
                      placeholder="Select kitchen department"
                    />
                  )}
                  {formData.destination === 'counter' && (
                    <SearchableSelect
                      options={counters.map(c => ({ value: c.id, label: c.name }))}
                      value={formData.destinationDetails}
                      onChange={(value) => {
                        const counter = counters.find(c => c.id === value);
                        setFormData({ ...formData, destinationDetails: counter?.name || value });
                      }}
                      placeholder="Select counter"
                    />
                  )}
                  {formData.destination === 'rituals' && (
                    <SearchableSelect
                      options={sacreds.map(s => ({ value: s.id, label: s.name }))}
                      value={formData.destinationDetails}
                      onChange={(value) => {
                        const sacred = sacreds.find(s => s.id === value);
                        setFormData({ ...formData, destinationDetails: sacred?.name || value });
                      }}
                      placeholder="Select sacred/ritual"
                    />
                  )}
                  {(formData.destination === 'external_event' || formData.destination === 'other') && (
                    <Input
                      value={formData.destinationDetails}
                      onChange={(e) => setFormData({ ...formData, destinationDetails: e.target.value })}
                      placeholder="Enter destination details"
                    />
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="items" className="space-y-4 mt-4">
              {formData.items.map((item, index) => (
                <div key={item.tempId} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Item {index + 1}</Label>
                    <Button type="button" variant="outline" size="icon" onClick={() => removeItem(item.tempId!)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Item *</Label>
                    <SearchableSelect
                      options={items.map(i => ({ value: i.id, label: i.name }))}
                      value={item.itemId}
                      onChange={(value) => updateItem(item.tempId!, 'itemId', value)}
                      placeholder="Select item"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.tempId!, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="Enter quantity"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>UOM</Label>
                      <Input
                        value={item.uom}
                        onChange={(e) => updateItem(item.tempId!, 'uom', e.target.value)}
                        placeholder="Unit of measurement"
                        readOnly
                      />
                    </div>
                  </div>

                  {(formData.type === 'receipt' || formData.type === 'return') && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Batch Number</Label>
                          <Input
                            value={item.batchNumber || ''}
                            onChange={(e) => updateItem(item.tempId!, 'batchNumber', e.target.value)}
                            placeholder="Enter batch number"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Rate</Label>
                          <Input
                            type="number"
                            value={item.rate || 0}
                            onChange={(e) => updateItem(item.tempId!, 'rate', parseFloat(e.target.value) || 0)}
                            placeholder="Enter rate"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Manufacturing Date</Label>
                          <Input
                            type="date"
                            value={item.manufacturingDate || ''}
                            onChange={(e) => updateItem(item.tempId!, 'manufacturingDate', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Expiry Date</Label>
                          <Input
                            type="date"
                            value={item.expiryDate || ''}
                            onChange={(e) => updateItem(item.tempId!, 'expiryDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Remarks</Label>
                    <Input
                      value={item.remarks || ''}
                      onChange={(e) => updateItem(item.tempId!, 'remarks', e.target.value)}
                      placeholder="Enter remarks"
                    />
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Enter remarks"
                  rows={4}
                />
              </div>
            </TabsContent>

            {needsApproval && (
              <TabsContent value="approval" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Approval Status</Label>
                  <Select
                    value={formData.approvalStatus || 'pending'}
                    onValueChange={(value: 'pending' | 'approved' | 'rejected') => 
                      setFormData({ ...formData, approvalStatus: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            )}
          </Tabs>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{entry ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
