import type { Recipe, RecipeVersion, ProductionPlan, ProductionBatch, RawMaterialRequirement } from '@/types/kitchen';
import type { Item } from '@/types/inventory';

/**
 * Calculate ingredient requirements for a production plan
 */
export function calculateIngredientRequirements(
  recipe: Recipe,
  recipeVersion: RecipeVersion,
  plannedQuantity: number,
  batchSize: 'small' | 'medium' | 'large'
): RawMaterialRequirement[] {
  const batchSizeConfig = recipeVersion.batchSizes.find(bs => bs.size === batchSize);
  const scalingFactor = batchSizeConfig?.scalingFactor || 1;

  return recipeVersion.ingredients.map(ingredient => {
    const requiredQuantity = ingredient.quantity * scalingFactor * (plannedQuantity / 100); // Assuming base recipe is for 100 units
    return {
      itemId: ingredient.itemId,
      itemName: ingredient.itemName,
      itemCode: ingredient.itemCode,
      requiredQuantity,
      uomId: ingredient.uomId,
      uomName: ingredient.uomName,
      availableQuantity: 0, // Will be populated from kitchen stores
      shortfall: 0,
      status: 'available' as const,
    };
  });
}

/**
 * Validate raw material availability against kitchen stores
 */
export function validateRawMaterialAvailability(
  requirements: RawMaterialRequirement[],
  kitchenStock: Array<{ itemId: string; availableQuantity: number }>
): RawMaterialRequirement[] {
  return requirements.map(req => {
    const stock = kitchenStock.find(s => s.itemId === req.itemId);
    const available = stock?.availableQuantity || 0;
    const shortfall = Math.max(0, req.requiredQuantity - available);
    const status = shortfall === 0 ? 'available' : available > 0 ? 'shortfall' : 'unavailable';

    return {
      ...req,
      availableQuantity: available,
      shortfall,
      status,
    };
  });
}

/**
 * Generate batch ID
 */
export function generateBatchId(
  recipeCode: string,
  date: string,
  sequence: number
): string {
  const dateStr = date.replace(/-/g, '');
  return `BATCH-${recipeCode}-${dateStr}-${String(sequence).padStart(3, '0')}`;
}

/**
 * Auto-deduct ingredients from kitchen stores when production starts
 */
export function deductIngredientsFromKitchenStore(
  ingredientUsage: Array<{ itemId: string; quantity: number }>,
  kitchenStock: Array<{ itemId: string; availableQuantity: number }>
): Array<{ itemId: string; deducted: boolean; availableAfter: number }> {
  return ingredientUsage.map(usage => {
    const stock = kitchenStock.find(s => s.itemId === usage.itemId);
    const available = stock?.availableQuantity || 0;
    const deducted = available >= usage.quantity;
    const availableAfter = deducted ? available - usage.quantity : available;

    return {
      itemId: usage.itemId,
      deducted,
      availableAfter,
    };
  });
}

/**
 * Calculate prasad quantity to add to inventory after production
 */
export function calculatePrasadQuantity(
  actualQuantity: number,
  wasteQuantity: number
): number {
  return actualQuantity - wasteQuantity;
}
