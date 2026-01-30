import type { Asset, AssetAudit, AuditResult } from '@/types/assets';
import { compareImages, verifyAssetAtAudit } from './cv-verification';

/**
 * Generate audit list based on filters
 */
export function generateAuditList(
  assets: Asset[],
  filters: {
    category?: string;
    locationId?: string;
    sensitivity?: string;
  }
): Asset[] {
  let filteredAssets = [...assets];
  
  if (filters.category) {
    filteredAssets = filteredAssets.filter(a => a.category === filters.category);
  }
  
  if (filters.locationId) {
    filteredAssets = filteredAssets.filter(a => a.currentLocationId === filters.locationId);
  }
  
  if (filters.sensitivity) {
    filteredAssets = filteredAssets.filter(a => a.sensitivity === filters.sensitivity);
  }
  
  return filteredAssets;
}

/**
 * Perform CV-assisted comparison for audit
 */
export function performAuditComparison(
  asset: Asset,
  currentImage: string
): {
  result: AuditResult;
  similarityScore: number;
  cvEvidence: ReturnType<typeof verifyAssetAtAudit>;
} {
  if (!asset.primaryImage) {
    // No reference image available
    return {
      result: 'missing',
      similarityScore: 0,
      cvEvidence: verifyAssetAtAudit(
        asset.id,
        '', // No reference
        currentImage,
        asset.cvFingerprint
      ),
    };
  }
  
  const comparison = compareImages(
    asset.primaryImage,
    currentImage,
    asset.cvFingerprint
  );
  
  const cvEvidence = verifyAssetAtAudit(
    asset.id,
    asset.primaryImage,
    currentImage,
    asset.cvFingerprint
  );
  
  return {
    result: comparison.result,
    similarityScore: comparison.similarityScore,
    cvEvidence,
  };
}

/**
 * Calculate audit results summary
 */
export function calculateAuditResults(
  auditAssets: Array<{
    assetId: string;
    result?: AuditResult;
  }>
): {
  total: number;
  match: number;
  partialMatch: number;
  mismatch: number;
  missing: number;
} {
  const results = {
    total: auditAssets.length,
    match: 0,
    partialMatch: 0,
    mismatch: 0,
    missing: 0,
  };
  
  auditAssets.forEach(asset => {
    switch (asset.result) {
      case 'match':
        results.match++;
        break;
      case 'partial_match':
        results.partialMatch++;
        break;
      case 'mismatch':
        results.mismatch++;
        break;
      case 'missing':
        results.missing++;
        break;
    }
  });
  
  return results;
}

/**
 * Check if audit can be completed
 */
export function canCompleteAudit(audit: AssetAudit): boolean {
  // All assets must have results
  const allAssetsHaveResults = audit.assets.every(a => a.cvComparisonResult);
  
  // Supervisor sign-off required
  const hasSupervisorSignOff = !!audit.supervisorSignOff;
  
  return allAssetsHaveResults && hasSupervisorSignOff;
}

/**
 * Lock audit after completion
 */
export function lockAudit(audit: AssetAudit): AssetAudit {
  if (audit.locked) {
    return audit; // Already locked
  }
  
  return {
    ...audit,
    locked: true,
    status: 'completed',
    completedAt: new Date().toISOString(),
  };
}

/**
 * Create incident for mismatch/missing asset
 */
export function createAuditIncident(
  auditId: string,
  auditNumber: string,
  asset: Asset,
  incidentType: 'missing' | 'mismatch' | 'damage' | 'unauthorized_movement',
  description: string,
  reportedBy: string,
  reportedByName: string
) {
  const severity = asset.sensitivity === 'sacred' || asset.sensitivity === 'high_value'
    ? 'critical'
    : incidentType === 'missing' ? 'high' : 'medium';
  
  return {
    id: `inc-${Date.now()}`,
    incidentNumber: `INC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    auditId,
    auditNumber,
    assetId: asset.id,
    assetName: asset.name,
    assetCode: asset.assetCode,
    incidentType,
    severity,
    description,
    reportedBy,
    reportedByName,
    reportedAt: new Date().toISOString(),
    investigationStatus: 'pending' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
