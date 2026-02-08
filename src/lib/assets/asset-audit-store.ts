import type { Asset, AssetAuditEntry } from '@/types/assets';

const STORAGE_KEY = 'asset_audit_entries';

/**
 * Get all audit entries from storage
 */
function getStoredAuditEntries(): AssetAuditEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading audit entries from storage:', error);
    return [];
  }
}

/**
 * Save audit entries to storage
 */
function saveAuditEntries(entries: AssetAuditEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving audit entries to storage:', error);
  }
}

/**
 * Create an audit entry when an asset is created or updated
 */
export function createAssetAuditEntry(
  asset: Asset,
  action: 'created' | 'updated',
  userId: string,
  userName: string
): AssetAuditEntry {
  const auditEntry: AssetAuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    assetId: asset.id,
    assetCode: asset.assetCode,
    action,
    assetData: { ...asset }, // Full asset details snapshot
    createdBy: userId,
    createdByName: userName,
    createdAt: new Date().toISOString(),
  };

  // Store the audit entry
  const existingEntries = getStoredAuditEntries();
  existingEntries.push(auditEntry);
  saveAuditEntries(existingEntries);

  return auditEntry;
}

/**
 * Get all audit entries for a specific asset
 */
export function getAssetAuditEntries(assetId: string): AssetAuditEntry[] {
  const allEntries = getStoredAuditEntries();
  return allEntries.filter(entry => entry.assetId === assetId);
}

/**
 * Get all audit entries
 */
export function getAllAuditEntries(): AssetAuditEntry[] {
  return getStoredAuditEntries();
}
