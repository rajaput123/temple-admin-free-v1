import type { CVEvidence, AuditResult, CVAlertLevel } from '@/types/assets';

/**
 * Mock CV Verification Library
 * 
 * This library provides mock Computer Vision functionality for asset verification.
 * It's designed to be easily replaceable with actual CV service integration.
 */

/**
 * Generate a visual fingerprint from an image (mock implementation)
 * In production, this would call a CV service to extract feature vectors
 */
export function generateVisualFingerprint(imageBase64: string): string {
  // Mock: Generate a hash-based fingerprint
  // In production, this would use actual CV algorithms to extract features
  const hash = simpleHash(imageBase64);
  return `fp-${hash}-mock`;
}

/**
 * Compare two images and return similarity result (mock implementation)
 * In production, this would call a CV service for actual image comparison
 */
export function compareImages(
  referenceImage: string,
  currentImage: string,
  referenceFingerprint?: string
): {
  result: AuditResult;
  similarityScore: number;
  alertLevel: CVAlertLevel;
} {
  // Mock: Calculate similarity based on image hash comparison
  // In production, this would use actual CV algorithms
  
  const refHash = referenceFingerprint || generateVisualFingerprint(referenceImage);
  const currHash = generateVisualFingerprint(currentImage);
  
  // Mock similarity calculation
  const similarity = calculateMockSimilarity(refHash, currHash);
  
  let result: AuditResult;
  let alertLevel: CVAlertLevel;
  
  if (similarity >= 95) {
    result = 'match';
    alertLevel = 'INFO';
  } else if (similarity >= 80) {
    result = 'partial_match';
    alertLevel = 'WARNING';
  } else {
    result = 'mismatch';
    alertLevel = 'CRITICAL';
  }
  
  return {
    result,
    similarityScore: similarity,
    alertLevel,
  };
}

/**
 * Verify asset during movement (entry/exit point)
 */
export function verifyAssetAtMovement(
  assetId: string,
  referenceImage: string,
  currentImage: string,
  referenceFingerprint?: string
): CVEvidence {
  const comparison = compareImages(referenceImage, currentImage, referenceFingerprint);
  
  return {
    id: `cv-${Date.now()}`,
    assetId,
    assetName: '', // Will be populated by caller
    assetCode: '', // Will be populated by caller
    eventType: 'movement',
    referenceImage,
    currentImage,
    visualFingerprint: referenceFingerprint || generateVisualFingerprint(referenceImage),
    comparisonResult: comparison.result,
    similarityScore: comparison.similarityScore,
    alertLevel: comparison.alertLevel,
    capturedBy: '', // Will be populated by caller
    capturedByName: '', // Will be populated by caller
    capturedAt: new Date().toISOString(),
    immutable: false, // Can be updated until movement is complete
    createdAt: new Date().toISOString(),
  };
}

/**
 * Verify asset during audit
 */
export function verifyAssetAtAudit(
  assetId: string,
  referenceImage: string,
  currentImage: string,
  referenceFingerprint?: string
): CVEvidence {
  const comparison = compareImages(referenceImage, currentImage, referenceFingerprint);
  
  return {
    id: `cv-${Date.now()}`,
    assetId,
    assetName: '', // Will be populated by caller
    assetCode: '', // Will be populated by caller
    eventType: 'audit',
    referenceImage,
    currentImage,
    visualFingerprint: referenceFingerprint || generateVisualFingerprint(referenceImage),
    comparisonResult: comparison.result,
    similarityScore: comparison.similarityScore,
    alertLevel: comparison.alertLevel,
    capturedBy: '', // Will be populated by caller
    capturedByName: '', // Will be populated by caller
    capturedAt: new Date().toISOString(),
    immutable: true, // Audit evidence is immutable
    createdAt: new Date().toISOString(),
  };
}

/**
 * Determine alert level based on mismatch severity
 */
export function determineAlertLevel(
  result: AuditResult,
  similarityScore: number,
  assetSensitivity: 'normal' | 'high_value' | 'sacred'
): CVAlertLevel {
  if (result === 'match') {
    return 'INFO';
  }
  
  if (result === 'partial_match') {
    // High-value and sacred assets get CRITICAL for partial matches
    if (assetSensitivity === 'high_value' || assetSensitivity === 'sacred') {
      return 'CRITICAL';
    }
    return 'WARNING';
  }
  
  // Mismatch or missing is always CRITICAL
  return 'CRITICAL';
}

// Helper functions

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

function calculateMockSimilarity(hash1: string, hash2: string): number {
  // Mock similarity: compare hash strings
  // In production, this would use actual CV feature comparison
  
  if (hash1 === hash2) {
    return 100;
  }
  
  // Simple character-by-character comparison
  let matches = 0;
  const minLength = Math.min(hash1.length, hash2.length);
  
  for (let i = 0; i < minLength; i++) {
    if (hash1[i] === hash2[i]) {
      matches++;
    }
  }
  
  // Base similarity from character matches
  const baseSimilarity = (matches / minLength) * 100;
  
  // Add some randomness to simulate real CV behavior
  // In production, this would be actual feature vector comparison
  const randomVariation = Math.random() * 5 - 2.5; // -2.5 to +2.5
  
  return Math.max(0, Math.min(100, baseSimilarity + randomVariation));
}

/**
 * Future CV Service Integration Interface
 * 
 * When integrating with actual CV service, replace the mock functions above
 * with API calls to the CV service:
 * 
 * export async function generateVisualFingerprint(imageBase64: string): Promise<string> {
 *   const response = await fetch('/api/cv/fingerprint', {
 *     method: 'POST',
 *     body: JSON.stringify({ image: imageBase64 }),
 *   });
 *   const data = await response.json();
 *   return data.fingerprint;
 * }
 * 
 * export async function compareImages(
 *   referenceImage: string,
 *   currentImage: string,
 *   referenceFingerprint?: string
 * ): Promise<{ result: AuditResult; similarityScore: number; alertLevel: CVAlertLevel }> {
 *   const response = await fetch('/api/cv/compare', {
 *     method: 'POST',
 *     body: JSON.stringify({
 *       referenceImage,
 *       currentImage,
 *       referenceFingerprint,
 *     }),
 *   });
 *   return await response.json();
 * }
 */
