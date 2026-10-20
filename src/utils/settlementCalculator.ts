import { Expense, SettlementRecord, SettlementTransaction, User, ExpenseCategory, CurrencyCode } from '../types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  CAD: 'CA$',
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const formattedNumber = Math.abs(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
  return `${symbol}${formattedNumber}`;
}

export function formatCurrencyWithDecimals(amount: number, currency: CurrencyCode = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const formattedNumber = Math.abs(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return `${symbol}${formattedNumber}`;
}

export interface NetBalances {
  [userId: string]: number; // Positive = is owed money (creditor), Negative = owes money (debtor)
}

/**
 * Calculates net balance for every member based on expenses and settlements.
 * Uses integer paise / cents internally to avoid IEEE 754 floating point drift.
 */
export function calculateNetBalances(
  expenses: Expense[],
  settlements: SettlementRecord[] = [],
  groupId?: string
): NetBalances {
  const balancesInCents: Record<string, number> = {};

  const filteredExpenses = groupId
    ? expenses.filter(e => e.groupId === groupId)
    : expenses;

  const filteredSettlements = groupId
    ? settlements.filter(s => s.groupId === groupId)
    : settlements;

  // Process Expenses
  filteredExpenses.forEach(expense => {
    if (!expense || typeof expense.amount !== 'number' || isNaN(expense.amount)) return;
    const expensePayer = expense.paidBy;
    if (!expensePayer) return;

    const totalCents = Math.round(expense.amount * 100);
    balancesInCents[expensePayer] = (balancesInCents[expensePayer] || 0) + totalCents;

    // Participants get debited for their share
    if (Array.isArray(expense.splits)) {
      expense.splits.forEach(split => {
        if (!split || !split.memberId) return;
        const splitCents = Math.round((Number(split.amount) || 0) * 100);
        balancesInCents[split.memberId] = (balancesInCents[split.memberId] || 0) - splitCents;
      });
    }
  });

  // Process Settlements already completed
  filteredSettlements.forEach(settlement => {
    if (!settlement || !settlement.fromId || !settlement.toId) return;
    const amt = Number(settlement.amount);
    if (!amt || isNaN(amt) || amt <= 0) return;

    const settlementCents = Math.round(amt * 100);
    // fromId paid money to toId, so fromId's liability is reduced (credited)
    balancesInCents[settlement.fromId] = (balancesInCents[settlement.fromId] || 0) + settlementCents;
    // toId received money, so toId's receivable is reduced (debited)
    balancesInCents[settlement.toId] = (balancesInCents[settlement.toId] || 0) - settlementCents;
  });

  // Convert back to standard currency units (e.g. Rupee, Dollar) rounded to 2 decimals
  const balances: NetBalances = {};
  Object.entries(balancesInCents).forEach(([userId, cents]) => {
    balances[userId] = cents / 100;
  });

  return balances;
}

/**
 * SMART SETTLEMENT ALGORITHM:
 * Minimizes the total number of peer-to-peer cash transfer transactions
 * using a Greedy Net Balance reduction graph.
 * Guarantees at most (N - 1) transactions for N active balance holders.
 */
export function calculateSmartSettlements(
  expenses: Expense[],
  settlements: SettlementRecord[] = [],
  groupId?: string
): SettlementTransaction[] {
  const balances = calculateNetBalances(expenses, settlements, groupId);
  const transactions: SettlementTransaction[] = [];

  // Work with integer cents to ensure exact rounding with zero drift
  const debtors: { userId: string; cents: number }[] = [];
  const creditors: { userId: string; cents: number }[] = [];

  Object.entries(balances).forEach(([userId, net]) => {
    const netCents = Math.round(net * 100);
    if (netCents < -50) { // More than 50 paise debt
      debtors.push({ userId, cents: -netCents });
    } else if (netCents > 50) { // More than 50 paise receivable
      creditors.push({ userId, cents: netCents });
    }
  });

  // Sort descending by amount to maximize greediness
  debtors.sort((a, b) => b.cents - a.cents);
  creditors.sort((a, b) => b.cents - a.cents);

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settledCents = Math.min(debtor.cents, creditor.cents);
    const roundedAmount = Math.round(settledCents / 100);

    if (roundedAmount > 0) {
      transactions.push({
        id: `tx_${debtor.userId}_${creditor.userId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        fromId: debtor.userId,
        toId: creditor.userId,
        amount: roundedAmount,
        groupId,
      });
    }

    debtor.cents -= settledCents;
    creditor.cents -= settledCents;

    if (debtor.cents < 50) {
      dIdx++;
    }
    if (creditor.cents < 50) {
      cIdx++;
    }
  }

  return transactions;
}

/**
 * User Financial Metrics (Matches the 4 stat cards on Dashboard)
 */
export function calculateUserMetrics(
  userId: string,
  expenses: Expense[],
  settlements: SettlementRecord[] = []
) {
  let totalSpending = 0; // Total expense share that belongs to this user
  let youPaid = 0;       // Total upfront money paid by this user
  
  // Calculate total user share and total user payments
  expenses.forEach(exp => {
    if (exp.paidBy === userId) {
      youPaid += exp.amount;
    }
    const mySplit = exp.splits.find(s => s.memberId === userId);
    if (mySplit) {
      totalSpending += mySplit.amount;
    }
  });

  const netBalances = calculateNetBalances(expenses, settlements);
  const myNet = Math.round((netBalances[userId] || 0) * 100) / 100;

  let youOwe = 0;
  let youReceive = 0;

  if (myNet < 0) {
    youOwe = Math.abs(myNet);
  } else if (myNet > 0) {
    youReceive = myNet;
  }

  return {
    totalSpending: Math.round(totalSpending),
    youPaid: Math.round(youPaid),
    youOwe: Math.round(youOwe),
    youReceive: Math.round(youReceive),
    netBalance: myNet,
  };
}

/**
 * Category breakdown and percentage calculations
 */
export function getCategoryBreakdown(expenses: Expense[], userId?: string) {
  const categoryTotals: Record<ExpenseCategory, number> = {
    food: 0,
    travel: 0,
    shopping: 0,
    entertainment: 0,
    rent: 0,
    utilities: 0,
    groceries: 0,
    health: 0,
    others: 0,
  };

  let total = 0;

  expenses.forEach(exp => {
    let amountToAdd = 0;
    if (userId) {
      const mySplit = exp.splits.find(s => s.memberId === userId);
      amountToAdd = mySplit ? mySplit.amount : 0;
    } else {
      amountToAdd = exp.amount;
    }

    if (amountToAdd > 0) {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amountToAdd;
      total += amountToAdd;
    }
  });

  const breakdown = Object.entries(categoryTotals)
    .filter(([_, amount]) => amount > 0)
    .map(([cat, amount]) => {
      const category = cat as ExpenseCategory;
      const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
      return {
        category,
        amount: Math.round(amount),
        percentage,
        color: CATEGORY_CONFIG[category]?.color || '#94A3B8',
        label: CATEGORY_CONFIG[category]?.label || category,
        icon: CATEGORY_CONFIG[category]?.iconName || 'HelpCircle',
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const highestCategory = breakdown.length > 0 ? breakdown[0] : null;

  return {
    breakdown,
    total: Math.round(total),
    highestCategory,
  };
}

export const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; color: string; bgColor: string; iconName: string; textColor: string }
> = {
  food: {
    label: 'Food & Dining',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    iconName: 'Utensils',
    textColor: '#DC2626',
  },
  travel: {
    label: 'Travel & Transport',
    color: '#1E88E5',
    bgColor: '#E0F2FE',
    iconName: 'Plane',
    textColor: '#0284C7',
  },
  shopping: {
    label: 'Shopping',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    iconName: 'ShoppingBag',
    textColor: '#D97706',
  },
  entertainment: {
    label: 'Entertainment',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    iconName: 'Film',
    textColor: '#7C3AED',
  },
  rent: {
    label: 'Rent & Stay',
    color: '#10B981',
    bgColor: '#D1FAE5',
    iconName: 'Home',
    textColor: '#059669',
  },
  utilities: {
    label: 'Utilities & Bills',
    color: '#06B6D4',
    bgColor: '#CFFAFE',
    iconName: 'Zap',
    textColor: '#0891B2',
  },
  groceries: {
    label: 'Groceries',
    color: '#22C55E',
    bgColor: '#DCFCE7',
    iconName: 'ShoppingCart',
    textColor: '#16A34A',
  },
  health: {
    label: 'Health & Medical',
    color: '#EC4899',
    bgColor: '#FCE7F3',
    iconName: 'HeartPulse',
    textColor: '#DB2777',
  },
  others: {
    label: 'Others',
    color: '#64748B',
    bgColor: '#F1F5F9',
    iconName: 'MoreHorizontal',
    textColor: '#475569',
  },
};
