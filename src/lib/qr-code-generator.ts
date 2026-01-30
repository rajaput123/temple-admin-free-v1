/**
 * Generate QR code data for booking verification
 * Format: {tokenNumber}|{date}|{slotStartTime}|{receiptNumber}
 */
export function generateQRCodeData(
  tokenNumber: string,
  date: string,
  slotStartTime: string,
  receiptNumber: string
): string {
  return `${tokenNumber}|${date}|${slotStartTime}|${receiptNumber}`;
}

/**
 * Parse QR code data
 */
export function parseQRCodeData(qrData: string): {
  tokenNumber: string;
  date: string;
  slotStartTime: string;
  receiptNumber: string;
} | null {
  const parts = qrData.split('|');
  if (parts.length !== 4) return null;

  return {
    tokenNumber: parts[0],
    date: parts[1],
    slotStartTime: parts[2],
    receiptNumber: parts[3],
  };
}

/**
 * Generate unique receipt number
 * Format: RCP-{YYYYMMDD}-{COUNTER}-{SEQUENCE}
 */
export function generateReceiptNumber(
  counterId: string,
  date: string,
  existingReceipts: string[] = []
): string {
  const dateStr = date.replace(/-/g, '');
  const prefix = `RCP-${dateStr}-${counterId}-`;
  
  const matchingReceipts = existingReceipts
    .filter(r => r.startsWith(prefix))
    .map(r => {
      const sequence = r.replace(prefix, '');
      return parseInt(sequence, 10);
    })
    .filter(n => !isNaN(n));

  const maxSequence = matchingReceipts.length > 0 ? Math.max(...matchingReceipts) : 0;
  const nextSequence = maxSequence + 1;

  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
}
