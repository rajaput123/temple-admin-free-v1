import type { DemandForecast } from '@/types/kitchen';
import type { FestivalEvent } from '@/types/rituals';

/**
 * Calculate demand forecast based on historical data and festival multipliers
 */
export function calculateDemandForecast(
  date: string,
  recipeId: string,
  recipeName: string,
  baseDemand: number,
  festival?: FestivalEvent,
  existingInventory?: number
): DemandForecast {
  let forecastedQuantity = baseDemand;
  let festivalMultiplier: number | undefined;
  let confidence: 'high' | 'medium' | 'low' = 'high';

  // Apply festival multiplier (10x-50x)
  if (festival) {
    festivalMultiplier = festival.multiplier || 10;
    forecastedQuantity = baseDemand * festivalMultiplier;
    confidence = 'high';
  } else {
    // Day of week adjustments
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') {
      forecastedQuantity = baseDemand * 1.5;
      confidence = 'medium';
    }
  }

  const netRequirement = Math.max(0, forecastedQuantity - (existingInventory || 0));

  return {
    date,
    recipeId,
    recipeName,
    baseDemand,
    festivalMultiplier,
    forecastedQuantity,
    existingInventory,
    netRequirement,
    confidence,
    basedOn: {
      dayOfWeek: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
      festivalId: festival?.id,
      festivalName: festival?.name,
    },
  };
}

/**
 * Auto-adjust production quantity based on existing prasad inventory
 */
export function adjustProductionQuantity(
  forecastedQuantity: number,
  existingInventory: number,
  bufferQuantity: number = 0
): number {
  const netRequirement = Math.max(0, forecastedQuantity - existingInventory);
  return netRequirement + bufferQuantity;
}
