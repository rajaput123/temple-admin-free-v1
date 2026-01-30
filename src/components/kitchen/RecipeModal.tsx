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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { Recipe, RecipeStatus } from '@/types/kitchen';
import { Item, UOM } from '@/types/inventory';
import { CustomFieldsEditor } from '@/components/structure/CustomFieldsEditor';

interface RecipeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe?: Recipe | null;
  items: Item[];
  uoms: UOM[];
  onSave: (recipe: Partial<Recipe>) => void;
}

export function RecipeModal({
  open,
  onOpenChange,
  recipe,
  items,
  uoms,
  onSave,
}: RecipeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    recipeType: 'prasad' as 'prasad' | 'naivedya' | 'annadanam' | 'special',
    status: 'draft' as RecipeStatus,
    ingredients: [] as Array<{ itemId: string; itemName: string; quantity: number; uomId: string; uomName: string }>,
    batchSizes: [] as Array<{ size: 'small' | 'medium' | 'large'; name: string; scalingFactor: number; preparationTime: number; manpower: number; equipment?: string[] }>,
    preparationTime: 0,
    manpower: 0,
    equipment: [] as string[],
    cookingInstructions: '',
    qualityStandards: '',
    storageRequirements: '',
  });

  useEffect(() => {
    if (recipe) {
      const currentVersion = recipe.versions.find(v => v.id === recipe.currentVersionId);
      setFormData({
        name: recipe.name,
        code: recipe.code,
        description: recipe.description || '',
        recipeType: recipe.recipeType,
        status: recipe.status,
        ingredients: currentVersion?.ingredients || [],
        batchSizes: currentVersion?.batchSizes || [],
        preparationTime: currentVersion?.preparationTime || 0,
        manpower: currentVersion?.manpower || 0,
        equipment: currentVersion?.equipment || [],
        cookingInstructions: currentVersion?.cookingInstructions || '',
        qualityStandards: currentVersion?.qualityStandards || '',
        storageRequirements: currentVersion?.storageRequirements || '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        recipeType: 'prasad',
        status: 'draft',
        ingredients: [],
        batchSizes: [
          { size: 'small', name: 'Small Batch', scalingFactor: 0.5, preparationTime: 0, manpower: 0 },
          { size: 'medium', name: 'Medium Batch', scalingFactor: 1, preparationTime: 0, manpower: 0 },
          { size: 'large', name: 'Large Batch', scalingFactor: 2, preparationTime: 0, manpower: 0 },
        ],
        preparationTime: 0,
        manpower: 0,
        equipment: [],
        cookingInstructions: '',
        qualityStandards: '',
        storageRequirements: '',
      });
    }
  }, [recipe, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { itemId: '', itemName: '', quantity: 0, uomId: '', uomName: '' }],
    });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const newIngredients = [...formData.ingredients];
    if (field === 'itemId') {
      const item = items.find(i => i.id === value);
      newIngredients[index] = {
        ...newIngredients[index],
        itemId: value,
        itemName: item?.name || '',
        itemCode: item?.code,
        uomId: item?.baseUOM || '',
        uomName: uoms.find(u => u.code === item?.baseUOM)?.name || '',
      };
    } else {
      newIngredients[index] = { ...newIngredients[index], [field]: value };
    }
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const updateBatchSize = (index: number, field: string, value: any) => {
    const newBatchSizes = [...formData.batchSizes];
    newBatchSizes[index] = { ...newBatchSizes[index], [field]: value };
    setFormData({ ...formData, batchSizes: newBatchSizes });
  };

  const itemOptions = items.map(item => ({ value: item.id, label: `${item.name} (${item.code || ''})` }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recipe ? 'Edit Recipe' : 'Create Recipe'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="batchSizes">Batch Sizes</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="costing">Costing</TabsTrigger>
              <TabsTrigger value="approval">Approval</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Recipe Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter recipe name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Recipe Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Enter recipe code"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter recipe description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipeType">Recipe Type</Label>
                  <Select
                    value={formData.recipeType}
                    onValueChange={(value: any) => setFormData({ ...formData, recipeType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prasad">Prasad</SelectItem>
                      <SelectItem value="naivedya">Naivedya</SelectItem>
                      <SelectItem value="annadanam">Annadanam</SelectItem>
                      <SelectItem value="special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: RecipeStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ingredients" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Label>Ingredients</Label>
                <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>

              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 items-end">
                  <div className="space-y-2">
                    <Label>Item</Label>
                    <SearchableSelect
                      options={itemOptions}
                      value={ingredient.itemId}
                      onChange={(value) => updateIngredient(index, 'itemId', value)}
                      placeholder="Select item"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={ingredient.quantity || ''}
                      onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>UOM</Label>
                    <Input
                      value={ingredient.uomName}
                      disabled
                      placeholder="UOM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Batch Multiplier</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={ingredient.batchSizeMultiplier || 1}
                      onChange={(e) => updateIngredient(index, 'batchSizeMultiplier', parseFloat(e.target.value) || 1)}
                      placeholder="1"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="batchSizes" className="space-y-4 mt-4">
              {formData.batchSizes.map((batchSize, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 items-end p-4 border rounded">
                  <div className="space-y-2">
                    <Label>Size</Label>
                    <Input value={batchSize.size} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={batchSize.name}
                      onChange={(e) => updateBatchSize(index, 'name', e.target.value)}
                      placeholder="Batch name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Scaling Factor</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={batchSize.scalingFactor}
                      onChange={(e) => updateBatchSize(index, 'scalingFactor', parseFloat(e.target.value) || 1)}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prep Time (min)</Label>
                    <Input
                      type="number"
                      value={batchSize.preparationTime}
                      onChange={(e) => updateBatchSize(index, 'preparationTime', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Manpower</Label>
                    <Input
                      type="number"
                      value={batchSize.manpower}
                      onChange={(e) => updateBatchSize(index, 'manpower', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="instructions" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="cookingInstructions">Cooking Instructions</Label>
                <Textarea
                  id="cookingInstructions"
                  value={formData.cookingInstructions}
                  onChange={(e) => setFormData({ ...formData, cookingInstructions: e.target.value })}
                  placeholder="Enter cooking instructions"
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualityStandards">Quality Standards</Label>
                <Textarea
                  id="qualityStandards"
                  value={formData.qualityStandards}
                  onChange={(e) => setFormData({ ...formData, qualityStandards: e.target.value })}
                  placeholder="Enter quality standards"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storageRequirements">Storage Requirements</Label>
                <Textarea
                  id="storageRequirements"
                  value={formData.storageRequirements}
                  onChange={(e) => setFormData({ ...formData, storageRequirements: e.target.value })}
                  placeholder="Enter storage requirements"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="costing" className="space-y-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Costing will be calculated automatically from ingredient prices when recipe is saved.
              </div>
            </TabsContent>

            <TabsContent value="approval" className="space-y-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Recipe approval workflow will be initiated when status is set to "Pending Approval".
                Kitchen Admin approval is required before recipe can be used in production.
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{recipe ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
