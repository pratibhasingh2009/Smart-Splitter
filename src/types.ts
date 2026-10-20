export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'CAD';

export type SplitMode = 'EQUAL' | 'PERCENTAGE' | 'CUSTOM';

export type ExpenseCategory = 
  | 'food' 
  | 'travel' 
  | 'shopping' 
  | 'entertainment' 
  | 'rent' 
  | 'utilities' 
  | 'groceries' 
  | 'health' 
  | 'others';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  upiId?: string;
  monthlyBudget?: number;
  currency?: CurrencyCode;
  createdBy?: string;
  isDemo?: boolean;
}

export interface GroupNote {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface SplitDetail {
  memberId: string;
  amount: number;
  percentage?: number;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  assignedMembers: string[];
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paidBy: string; // User ID
  groupId: string; // Group ID or 'personal'
  category: ExpenseCategory;
  splitMode: SplitMode;
  splits: SplitDetail[];
  memberIds?: string[];
  notes?: string;
  receiptUrl?: string;
  receiptType?: 'image' | 'pdf';
  receiptName?: string;
  items?: ExpenseItem[];
  createdAt: string;
}

export interface GroupChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'image' | 'pdf' | 'file';
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: 'trip' | 'home' | 'friends' | 'work' | 'other';
  color: string;
  iconName: string;
  members: string[]; // User IDs
  budget?: number;
  notes?: GroupNote[];
  createdBy?: string;
  createdAt: string;
}

export interface SettlementTransaction {
  id: string;
  fromId: string; // Debtor (who pays)
  toId: string;   // Creditor (who receives)
  amount: number;
  groupId?: string;
  isSettled?: boolean;
}

export interface SettlementRecord {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  date: string;
  groupId?: string;
  method?: 'cash' | 'upi' | 'bank_transfer' | 'other';
  notes?: string;
  participantIds?: string[];
}

export interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  groupId: string;
  paidBy: string;
  splitMode: SplitMode;
  splits: SplitDetail[];
  memberIds?: string[];
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextDueDate: string;
  status: 'active' | 'paused';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'expense' | 'settlement' | 'group' | 'recurring';
}

export type PageView = 
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'groups'
  | 'group-details'
  | 'chat'
  | 'add-expense'
  | 'expenses'
  | 'settlement'
  | 'analytics'
  | 'recurring'
  | 'profile'
  | 'settings'
  | 'flow-diagram';
