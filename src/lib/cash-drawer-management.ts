import type { CashDrawer, CashTransaction } from '@/types/seva';

/**
 * Calculate current cash balance from transactions
 */
export function calculateCashBalance(
  openingBalance: number,
  transactions: CashTransaction[]
): number {
  return transactions.reduce((balance, transaction) => {
    switch (transaction.type) {
      case 'opening':
        return transaction.amount;
      case 'sale':
        return balance + transaction.amount;
      case 'refund':
        return balance - transaction.amount;
      case 'adjustment':
        return balance + transaction.amount; // Can be positive or negative
      default:
        return balance;
    }
  }, openingBalance);
}

/**
 * Add cash transaction to drawer
 */
export function addCashTransaction(
  drawer: CashDrawer,
  type: CashTransaction['type'],
  amount: number,
  operatorId: string,
  operatorName: string,
  reason?: string,
  bookingId?: string
): CashDrawer {
  const transaction: CashTransaction = {
    id: `cash-txn-${Date.now()}`,
    type,
    amount,
    reason,
    bookingId,
    operatorId,
    operatorName,
    timestamp: new Date().toISOString(),
  };

  const newTransactions = [...drawer.transactions, transaction];
  const currentBalance = calculateCashBalance(drawer.openingBalance, newTransactions);

  return {
    ...drawer,
    transactions: newTransactions,
    currentBalance,
  };
}

/**
 * Open cash drawer
 */
export function openCashDrawer(
  counterId: string,
  counterName: string,
  date: string,
  openingBalance: number,
  operatorId: string,
  operatorName: string
): CashDrawer {
  const drawer: CashDrawer = {
    id: `drawer-${counterId}-${date}`,
    counterId,
    counterName,
    date,
    openingBalance,
    currentBalance: openingBalance,
    closingBalance: undefined,
    transactions: [
      {
        id: `cash-txn-opening-${Date.now()}`,
        type: 'opening',
        amount: openingBalance,
        operatorId,
        operatorName,
        timestamp: new Date().toISOString(),
      },
    ],
    status: 'open',
    openedBy: operatorId,
    openedByName: operatorName,
    openedAt: new Date().toISOString(),
  };

  return drawer;
}

/**
 * Close cash drawer
 */
export function closeCashDrawer(
  drawer: CashDrawer,
  closingBalance: number,
  operatorId: string,
  operatorName: string
): CashDrawer {
  return {
    ...drawer,
    closingBalance,
    status: 'closed',
    closedBy: operatorId,
    closedByName: operatorName,
    closedAt: new Date().toISOString(),
  };
}
