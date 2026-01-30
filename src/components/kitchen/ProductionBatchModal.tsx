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
import { ProductionBatch } from '@/types/kitchen';
import { Recipe } from '@/types/kitchen';

interface ProductionBatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch?: ProductionBatch | null;
  recipes: Recipe[];
  onSave: (batch: Partial<ProductionBatch>) => void;
}

export function ProductionBatchModal({
  open,
  onOpenChange,
  batch,
  recipes,
  onSave,
}: ProductionBatchModalProps) {
  const [formData, setFormData] = useState({
    actualQuantity: 0,
    waste: [] as Array<{ reasonCode: string; reason: string; quantity: number }>,
  });

  useEffect(() => {
    if (batch) {
      setFormData({
        actualQuantity: batch.actualQuantity,
        waste: batch.waste.map(w => ({
          reasonCode: w.reasonCode,
          reason: w.reason,
          quantity: w.quantity,
        })),
      });
    }
  }, [batch, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Production Batch: {batch?.batchId}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="production" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="production">Production</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="waste">Waste</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
            </TabsList>

            <TabsContent value="production" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Recipe: {batch?.recipeName}</Label>
                <Label>Planned Quantity: {batch?.plannedQuantity}</Label>
                <Label htmlFor="actualQuantity">Actual Quantity *</Label>
                <Input
                  id="actualQuantity"
                  type="number"
                  value={formData.actualQuantity || ''}
                  onChange={(e) => setFormData({ ...formData, actualQuantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="ingredients" className="space-y-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Ingredient usage will be tracked automatically from kitchen stores.
              </div>
            </TabsContent>

            <TabsContent value="waste" className="space-y-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Record waste/spillage with reason codes.
              </div>
            </TabsContent>

            <TabsContent value="quality" className="space-y-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Quality check workflow will be initiated after production completion.
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
