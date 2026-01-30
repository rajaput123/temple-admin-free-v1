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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductionPlan } from '@/types/kitchen';
import { Recipe } from '@/types/kitchen';

interface ProductionPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: ProductionPlan | null;
  recipes: Recipe[];
  onSave: (plan: Partial<ProductionPlan>) => void;
}

export function ProductionPlanModal({
  open,
  onOpenChange,
  plan,
  recipes,
  onSave,
}: ProductionPlanModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'morning' as 'morning' | 'afternoon' | 'evening' | 'night',
    recipeId: '',
    recipeName: '',
    plannedQuantity: 0,
    batchSize: 'medium' as 'small' | 'medium' | 'large',
    bufferQuantity: 0,
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        date: plan.date,
        shift: plan.shift,
        recipeId: plan.recipeId,
        recipeName: plan.recipeName,
        plannedQuantity: plan.plannedQuantity,
        batchSize: plan.batchSize,
        bufferQuantity: plan.bufferQuantity || 0,
      });
    }
  }, [plan, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const recipeOptions = recipes.filter(r => r.status === 'approved').map(r => ({
    value: r.id,
    label: r.name,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{plan ? 'Edit Production Plan' : 'Create Production Plan'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="demand">Demand</TabsTrigger>
              <TabsTrigger value="rawMaterials">Raw Materials</TabsTrigger>
              <TabsTrigger value="buffer">Buffer</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="shift">Shift *</Label>
                  <Select
                    value={formData.shift}
                    onValueChange={(value: any) => setFormData({ ...formData, shift: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipe">Recipe *</Label>
                <SearchableSelect
                  options={recipeOptions}
                  value={formData.recipeId}
                  onChange={(value) => {
                    const recipe = recipes.find(r => r.id === value);
                    setFormData({
                      ...formData,
                      recipeId: value,
                      recipeName: recipe?.name || '',
                    });
                  }}
                  placeholder="Select recipe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plannedQuantity">Planned Quantity *</Label>
                  <Input
                    id="plannedQuantity"
                    type="number"
                    value={formData.plannedQuantity || ''}
                    onChange={(e) => setFormData({ ...formData, plannedQuantity: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batchSize">Batch Size</Label>
                  <Select
                    value={formData.batchSize}
                    onValueChange={(value: any) => setFormData({ ...formData, batchSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="demand" className="space-y-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Demand forecast will be calculated automatically based on historical footfall and festival multipliers.
              </div>
            </TabsContent>

            <TabsContent value="rawMaterials" className="space-y-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Raw material requirements will be calculated from recipe and validated against kitchen stores availability.
              </div>
            </TabsContent>

            <TabsContent value="buffer" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="bufferQuantity">Buffer Quantity (VIP/Emergency)</Label>
                <Input
                  id="bufferQuantity"
                  type="number"
                  value={formData.bufferQuantity || ''}
                  onChange={(e) => setFormData({ ...formData, bufferQuantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{plan ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
