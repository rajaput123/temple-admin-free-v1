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
import { PurchaseOrder, PurchaseOrderItem, PurchaseRequisition, POStatus, ApprovalStatus } from '@/types/inventory';
import { Supplier, Item } from '@/types/inventory';

interface PurchaseOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: PurchaseOrder | null;
  requisitions: PurchaseRequisition[];
  suppliers: Supplier[];
  items: Item[];
  onSave: (order: Partial<PurchaseOrder>) => void;
}

export function PurchaseOrderModal({
  open,
  onOpenChange,
  order,
  requisitions,
  suppliers,
  items,
  onSave,
}: PurchaseOrderModalProps) {
  const [formData, setFormData] = useState({
    requisitionId: '',
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    items: [] as Array<PurchaseOrderItem & { tempId?: string }>,
    paymentTerms: '30',
    dueDate: '',
    deliveryDate: '',
    status: 'draft' as POStatus,
    remarks: '',
  });

  useEffect(() => {
    if (order) {
      setFormData({
        requisitionId: order.requisitionId || '',
        supplierId: order.supplierId,
        date: order.date,
        items: order.items.map(item => ({ ...item, tempId: Math.random().toString() })),
        paymentTerms: order.paymentTerms || '30',
        dueDate: order.dueDate || '',
        deliveryDate: order.deliveryDate || '',
        status: order.status,
        remarks: order.remarks || '',
      });
    } else {
      setFormData({
        requisitionId: '',
        supplierId: '',
        date: new Date().toISOString().split('T')[0],
        items: [],
        paymentTerms: '30',
        dueDate: '',
        deliveryDate: '',
        status: 'draft',
        remarks: '',
      });
    }
  }, [order, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderItems = formData.items.map(({ tempId, ...item }) => item);
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const taxAmount = orderItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    const totalAmount = subtotal + taxAmount;

    const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);
    const dueDate = formData.paymentTerms ? 
      new Date(new Date(formData.date).getTime() + parseInt(formData.paymentTerms) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '';

    onSave({
      ...formData,
      items: orderItems,
      subtotal,
      taxAmount,
      totalAmount,
      supplierName: selectedSupplier?.name || '',
      dueDate,
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
        rate: 0,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 0,
      }],
    });
  };

  const removeItem = (tempId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.tempId !== tempId),
    });
  };

  const updateItem = (tempId: string, field: keyof PurchaseOrderItem, value: string | number) => {
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
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate' || field === 'taxRate') {
            const qty = field === 'quantity' ? (value as number) : item.quantity;
            const rate = field === 'rate' ? (value as number) : item.rate;
            const taxRate = field === 'taxRate' ? (value as number) : item.taxRate || 0;
            const subtotal = qty * rate;
            const taxAmount = subtotal * (taxRate / 100);
            updated.totalAmount = subtotal + taxAmount;
            updated.taxAmount = taxAmount;
          }
          return updated;
        }
        return item;
      }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? 'Edit Purchase Order' : 'New Purchase Order'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="approval">Approval</TabsTrigger>
              <TabsTrigger value="grn">GRN</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">PO Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requisitionId">Requisition</Label>
                  <SearchableSelect
                    options={requisitions.map(r => ({ value: r.id, label: r.requisitionNumber }))}
                    value={formData.requisitionId}
                    onChange={(value) => setFormData({ ...formData, requisitionId: value })}
                    placeholder="Select requisition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierId">Supplier *</Label>
                <SearchableSelect
                  options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                  value={formData.supplierId}
                  onChange={(value) => setFormData({ ...formData, supplierId: value })}
                  placeholder="Select supplier"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms (Days)</Label>
                  <Select
                    value={formData.paymentTerms}
                    onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="60">60 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: POStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Enter remarks"
                  rows={3}
                />
              </div>
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

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.tempId!, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="Qty"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>UOM</Label>
                      <Input
                        value={item.uom}
                        placeholder="UOM"
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Rate *</Label>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(item.tempId!, 'rate', parseFloat(e.target.value) || 0)}
                        placeholder="Rate"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tax Rate (%)</Label>
                      <Input
                        type="number"
                        value={item.taxRate || 0}
                        onChange={(e) => updateItem(item.tempId!, 'taxRate', parseFloat(e.target.value) || 0)}
                        placeholder="Tax %"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tax Amount</Label>
                      <Input
                        value={item.taxAmount || 0}
                        placeholder="Tax Amount"
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total Amount</Label>
                      <Input
                        value={item.totalAmount}
                        placeholder="Total"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </TabsContent>

            <TabsContent value="approval" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">Approval workflow will be configured based on order value thresholds</p>
            </TabsContent>

            <TabsContent value="grn" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">Goods receipt notes will be linked here after PO approval</p>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{order ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
