import type { PrasadBatch, PrasadDistribution } from '@/types/prasad';

/**
 * Select batches using FIFO (First In First Out) for expiry management
 */
export function selectBatchesFIFO(
  batches: PrasadBatch[],
  requiredQuantity: number
): Array<{ batch: PrasadBatch; quantity: number }> {
  // Sort by expiry date (earliest first)
  const sortedBatches = [...batches].sort((a, b) => 
    new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  const selected: Array<{ batch: PrasadBatch; quantity: number }> = [];
  let remaining = requiredQuantity;

  for (const batch of sortedBatches) {
    if (remaining <= 0) break;
    if (batch.availableQuantity <= 0) continue;

    const quantity = Math.min(remaining, batch.availableQuantity);
    selected.push({ batch, quantity });
    remaining -= quantity;
  }

  return selected;
}

/**
 * Auto-deduct prasad stock when distribution is created
 */
export function deductPrasadStock(
  batchId: string,
  quantity: number,
  batches: PrasadBatch[]
): { success: boolean; availableAfter: number } {
  const batch = batches.find(b => b.id === batchId);
  if (!batch) {
    return { success: false, availableAfter: 0 };
  }

  if (batch.availableQuantity < quantity) {
    return { success: false, availableAfter: batch.availableQuantity };
  }

  const availableAfter = batch.availableQuantity - quantity;
  return { success: true, availableAfter };
}

/**
 * Check if prasad can be carried forward based on expiry
 */
export function canCarryForward(
  batch: PrasadBatch,
  daysToExpiryThreshold: number = 2
): boolean {
  const expiryDate = new Date(batch.expiryDate);
  const today = new Date();
  const daysToExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysToExpiry > daysToExpiryThreshold;
}

/**
 * Calculate end-of-day redistribution
 */
export function calculateEndOfDayRedistribution(
  unsoldBatches: Array<{ batch: PrasadBatch; quantity: number }>,
  daysToExpiryThreshold: number = 2
): {
  redistribute: Array<{ batchId: string; quantity: number; channel: string }>;
  carryForward: Array<{ batchId: string; quantity: number }>;
} {
  const redistribute: Array<{ batchId: string; quantity: number; channel: string }> = [];
  const carryForward: Array<{ batchId: string; quantity: number }> = [];

  for (const { batch, quantity } of unsoldBatches) {
    if (canCarryForward(batch, daysToExpiryThreshold)) {
      carryForward.push({ batchId: batch.id, quantity });
    } else {
      // Redistribute to annadanam if near expiry
      redistribute.push({
        batchId: batch.id,
        quantity,
        channel: 'annadanam',
      });
    }
  }

  return { redistribute, carryForward };
}
