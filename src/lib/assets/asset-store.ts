import type { Asset } from '@/types/assets';
import { dummyAssets } from '@/data/assets-data';

const STORAGE_KEY = 'asset_master_data';

/**
 * Get all stored assets from localStorage
 * Falls back to dummyAssets if no stored data exists
 */
export function getStoredAssets(): Asset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return dummyAssets;
    return JSON.parse(stored);
  } catch {
    return dummyAssets;
  }
}

/**
 * Save assets to localStorage
 */
export function saveAssets(assets: Asset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  } catch (error) {
    console.error('Error saving assets:', error);
  }
}

/**
 * Update a specific asset by ID
 */
export function updateAsset(assetId: string, updates: Partial<Asset>): void {
  const assets = getStoredAssets();
  const updated = assets.map(a => 
    a.id === assetId ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
  );
  saveAssets(updated);
}

/**
 * Get a specific asset by ID
 */
export function getAssetById(assetId: string): Asset | undefined {
  const assets = getStoredAssets();
  return assets.find(a => a.id === assetId);
}
