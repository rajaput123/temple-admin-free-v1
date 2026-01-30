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
import { Project, ProjectPayment } from '@/types/projects';
import { dummyProjectVendors } from '@/data/projects-data';

interface PaymentBillModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  payment?: ProjectPayment;
  onSave: (data: Partial<ProjectPayment>) => void;
}

export function PaymentBillModal({
  open,
  onClose,
  project,
  payment,
  onSave,
}: PaymentBillModalProps) {
  const [formData, setFormData] = useState({
    vendorId: '',
    vendorName: '',
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    billAmount: 0,
    workDescription: '',
    netPayableAmount: 0,
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        vendorId: payment.vendorId,
        vendorName: payment.vendorName,
        billNumber: payment.billNumber,
        billDate: payment.billDate,
        billAmount: payment.billAmount,
        workDescription: payment.workDescription,
        netPayableAmount: payment.netPayableAmount,
      });
    } else {
      const projectVendors = dummyProjectVendors.filter(v => v.projectId === project.id);
      if (projectVendors.length > 0) {
        setFormData({
          vendorId: projectVendors[0].vendorId,
          vendorName: projectVendors[0].vendorName,
          billNumber: '',
          billDate: new Date().toISOString().split('T')[0],
          billAmount: 0,
          workDescription: '',
          netPayableAmount: 0,
        });
      }
    }
  }, [payment, project]);

  const handleSave = () => {
    onSave({
      ...formData,
      netPayableAmount: formData.netPayableAmount || formData.billAmount,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {payment ? 'Edit Payment' : 'Add Payment'} - {project.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vendor Name *</Label>
              <Input
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                placeholder="Enter vendor name"
              />
            </div>
            <div className="space-y-2">
              <Label>Bill Number *</Label>
              <Input
                value={formData.billNumber}
                onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
                placeholder="Enter bill number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bill Date *</Label>
              <Input
                type="date"
                value={formData.billDate}
                onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Bill Amount (₹) *</Label>
              <Input
                type="number"
                value={formData.billAmount}
                onChange={(e) => {
                  const amount = parseFloat(e.target.value) || 0;
                  setFormData({ ...formData, billAmount: amount, netPayableAmount: amount });
                }}
                placeholder="Enter bill amount"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Work Description *</Label>
            <Textarea
              value={formData.workDescription}
              onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
              placeholder="Describe the work completed"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {payment ? 'Update' : 'Add'} Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
