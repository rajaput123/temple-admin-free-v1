import { Sacred } from '@/types/temple-structure';
import { Offering } from '@/types/rituals';
import { SevaBooking } from '@/types/seva';

/**
 * Extract short name from full name
 * Examples:
 * - "Sri Sharadamba" -> "SHARADAMBA"
 * - "Abhisheka Seva" -> "ABHISHEKA"
 * - "Jagadguru Samadhi – Sri Abhinava Vidyatheertha" -> "ABHINAVA"
 */
function extractShortName(fullName: string): string {
  // Remove common prefixes
  let name = fullName
    .replace(/^Sri\s+/i, '')
    .replace(/^Jagadguru\s+Samadhi\s*–\s*/i, '')
    .replace(/^Samadhi\s*–\s*/i, '')
    .trim();

  // Extract first significant word (usually the main name)
  const words = name.split(/\s+/);
  
  // For names like "Sri Abhinava Vidyatheertha", take "Abhinava"
  // For names like "Abhisheka Seva", take "Abhisheka"
  // For names like "Sarva Darshan", take "SARVA"
  if (words.length > 1) {
    // Skip common suffixes like "Seva", "Darshan", "Pooja"
    const skipWords = ['seva', 'darshan', 'pooja', 'archana', 'samadhi', 'tirtha', 'mahasanidhanam'];
    const mainWord = words.find(w => !skipWords.includes(w.toLowerCase()));
    if (mainWord) {
      name = mainWord;
    } else {
      name = words[0];
    }
  }

  // Convert to uppercase and remove special characters
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 15); // Limit length
}

/**
 * Generate token number in format: SB-{SACRED_SHORT}-{OFFERING_SHORT}-{XXX}
 * Example: SB-SHARADAMBA-ABHISHEKA-001
 */
export function generateTokenNumber(
  sacred: Sacred,
  offering: Offering,
  existingBookings: SevaBooking[]
): string {
  const sacredShort = extractShortName(sacred.name);
  const offeringShort = extractShortName(offering.name);

  // Find highest sequence number for this Sacred-Offering combination
  const prefix = `SB-${sacredShort}-${offeringShort}-`;
  const matchingTokens = existingBookings
    .filter(b => b.tokenNumber.startsWith(prefix))
    .map(b => {
      const sequence = b.tokenNumber.replace(prefix, '');
      return parseInt(sequence, 10);
    })
    .filter(n => !isNaN(n));

  const maxSequence = matchingTokens.length > 0 ? Math.max(...matchingTokens) : 0;
  const nextSequence = maxSequence + 1;

  // Pad to 3 digits
  const sequenceStr = String(nextSequence).padStart(3, '0');

  return `${prefix}${sequenceStr}`;
}
