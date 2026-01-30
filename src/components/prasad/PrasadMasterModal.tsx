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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { PrasadMaster, PrasadStatus } from '@/types/prasad';

interface PrasadMasterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prasad?: PrasadMaster | null;
  onSave: (prasad: Partial<PrasadMaster>) => void;
}

export function PrasadMasterModal({
  open,
  onOpenChange,
  prasad,
  onSave,
}: PrasadMasterModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    prasadType: 'laddu' as 'laddu' | 'pongal' | 'sweet' | 'savory' | 'other',
    packSizes: [] as Array<{ size: 'small' | 'medium' | 'large' | 'custom'; name: string; salePrice: number; annadanamPrice: number }>,
    shelfLife: 0,
    status: 'active' as PrasadStatus,
  });

  useEffect(() => {
    if (prasad) {
      setFormData({
        name: prasad.name,
        code: prasad.code,
        description: prasad.description || '',
        prasadType: prasad.prasadType,
        packSizes: prasad.packSizes.map(ps => ({
          size: ps.size,
          name: ps.name,
          salePrice: ps.salePrice,
          annadanamPrice: ps.annadanamPrice,
        })),
        shelfLife: prasad.shelfLife,
        status: prasad.status,
      });
    }
  }, [prasad, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{prasad ? 'Edit Prasad' : 'Create Prasad'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="packSizes">Pack Sizes</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Prasad Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter prasad name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Enter code"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prasadType">Prasad Type</Label>
                  <Select
                    value={formData.prasadType}
                    onValueChange={(value: any) => setFormData({ ...formData, prasadType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laddu">Laddu</SelectItem>
                      <SelectItem value="pongal">Pongal</SelectItem>
                      <SelectItem value="sweet">Sweet</SelectItem>
                      <SelectItem value="savory">Savory</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shelfLife">Shelf Life (days)</Label>
                  <Input
                    id="shelfLife"
                    type="number"
                    value={formData.shelfLife || ''}
                    onChange={(e) => setFormData({ ...formData, shelfLife: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="packSizes" className="space-y-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Configure pack sizes and pricing.
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Configure pricing rules for sale, donation, and annadanam.
              </div>
            </TabsContent>

            <TabsContent value="storage" className="space-y-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Configure storage conditions and requirements.
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{prasad ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
