import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db } from './config';
import {
  User,
  Group,
  Expense,
  SettlementRecord,
  RecurringExpense,
  GroupChatMessage,
} from '../types';

// Helper to remove undefined properties recursively before saving to Firestore
export const sanitizeFirestoreData = <T>(data: T): T => {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeFirestoreData(item)) as any;
  }
  if (typeof data === 'object' && data !== null) {
    if (data instanceof Date) return data;
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        clean[key] = sanitizeFirestoreData(value);
      }
    }
    return clean as T;
  }
  return data;
};

// Collection References
export const USERS_COLLECTION = 'users';
export const GROUPS_COLLECTION = 'groups';
export const EXPENSES_COLLECTION = 'expenses';
export const SETTLEMENTS_COLLECTION = 'settlements';
export const RECURRING_COLLECTION = 'recurringExpenses';
export const MESSAGES_COLLECTION = 'groupMessages';

// Firestore CRUD operations

// --- USERS ---
export const saveUserToFirestore = async (user: User) => {
  try {
    const clean = sanitizeFirestoreData(user);
    await setDoc(doc(db, USERS_COLLECTION, user.id), clean, { merge: true });
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
  }
};

export const updateUserInFirestore = async (userId: string, data: Partial<User>) => {
  try {
    const clean = sanitizeFirestoreData(data);
    await updateDoc(doc(db, USERS_COLLECTION, userId), clean);
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
  }
};

// --- GROUPS ---
export const saveGroupToFirestore = async (group: Group) => {
  try {
    const clean = sanitizeFirestoreData(group);
    await setDoc(doc(db, GROUPS_COLLECTION, group.id), clean, { merge: true });
  } catch (error) {
    console.error('Error saving group to Firestore:', error);
  }
};

export const updateGroupInFirestore = async (groupId: string, data: Partial<Group>) => {
  try {
    const clean = sanitizeFirestoreData(data);
    await updateDoc(doc(db, GROUPS_COLLECTION, groupId), clean);
  } catch (error) {
    console.error('Error updating group in Firestore:', error);
  }
};

export const deleteGroupFromFirestore = async (groupId: string) => {
  try {
    await deleteDoc(doc(db, GROUPS_COLLECTION, groupId));
  } catch (error) {
    console.error('Error deleting group from Firestore:', error);
  }
};

// --- EXPENSES ---
export const saveExpenseToFirestore = async (expense: Expense) => {
  try {
    const clean = sanitizeFirestoreData(expense);
    await setDoc(doc(db, EXPENSES_COLLECTION, expense.id), clean, { merge: true });
  } catch (error) {
    console.error('Error saving expense to Firestore:', error);
  }
};

export const updateExpenseInFirestore = async (expenseId: string, data: Partial<Expense>) => {
  try {
    const clean = sanitizeFirestoreData(data);
    await updateDoc(doc(db, EXPENSES_COLLECTION, expenseId), clean);
  } catch (error) {
    console.error('Error updating expense in Firestore:', error);
  }
};

export const deleteExpenseFromFirestore = async (expenseId: string) => {
  try {
    await deleteDoc(doc(db, EXPENSES_COLLECTION, expenseId));
  } catch (error) {
    console.error('Error deleting expense from Firestore:', error);
  }
};

// --- SETTLEMENTS ---
export const saveSettlementToFirestore = async (settlement: SettlementRecord) => {
  try {
    const clean = sanitizeFirestoreData(settlement);
    await setDoc(doc(db, SETTLEMENTS_COLLECTION, settlement.id), clean, { merge: true });
  } catch (error) {
    console.error('Error saving settlement to Firestore:', error);
  }
};

export const deleteSettlementFromFirestore = async (id: string) => {
  try {
    await deleteDoc(doc(db, SETTLEMENTS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting settlement from Firestore:', error);
  }
};

// --- GROUP CHAT MESSAGES ---
export const saveMessageToFirestore = async (message: GroupChatMessage) => {
  try {
    const clean = sanitizeFirestoreData(message);
    await setDoc(doc(db, MESSAGES_COLLECTION, message.id), clean, { merge: true });
  } catch (error) {
    console.error('Error saving message to Firestore:', error);
  }
};

export const deleteMessageFromFirestore = async (messageId: string) => {
  try {
    await deleteDoc(doc(db, MESSAGES_COLLECTION, messageId));
  } catch (error) {
    console.error('Error deleting message from Firestore:', error);
  }
};

export const subscribeToGroupMessages = (callback: (messages: GroupChatMessage[]) => void) => {
  return onSnapshot(collection(db, MESSAGES_COLLECTION), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as GroupChatMessage);
    data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    callback(data);
  }, (error) => {
    console.warn('Firestore Group Messages subscription error (falling back to local):', error);
  });
};

// --- RECURRING EXPENSES ---
export const saveRecurringToFirestore = async (recurring: RecurringExpense) => {
  try {
    const clean = sanitizeFirestoreData(recurring);
    await setDoc(doc(db, RECURRING_COLLECTION, recurring.id), clean, { merge: true });
  } catch (error) {
    console.error('Error saving recurring expense to Firestore:', error);
  }
};

export const updateRecurringInFirestore = async (id: string, data: Partial<RecurringExpense>) => {
  try {
    const clean = sanitizeFirestoreData(data);
    await updateDoc(doc(db, RECURRING_COLLECTION, id), clean);
  } catch (error) {
    console.error('Error updating recurring in Firestore:', error);
  }
};

export const deleteRecurringFromFirestore = async (id: string) => {
  try {
    await deleteDoc(doc(db, RECURRING_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting recurring from Firestore:', error);
  }
};

// --- REAL-TIME LISTENERS ---
export const subscribeToUsers = (callback: (users: User[]) => void) => {
  return onSnapshot(collection(db, USERS_COLLECTION), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as User);
    callback(data);
  }, (error) => {
    console.warn('Firestore Users subscription error (falling back to local):', error);
  });
};

export const subscribeToGroups = (callback: (groups: Group[]) => void) => {
  return onSnapshot(collection(db, GROUPS_COLLECTION), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as Group);
    callback(data);
  }, (error) => {
    console.warn('Firestore Groups subscription error (falling back to local):', error);
  });
};

export const subscribeToExpenses = (callback: (expenses: Expense[]) => void) => {
  return onSnapshot(collection(db, EXPENSES_COLLECTION), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as Expense);
    // Sort descending by creation / date
    data.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
    callback(data);
  }, (error) => {
    console.warn('Firestore Expenses subscription error (falling back to local):', error);
  });
};

export const subscribeToSettlements = (callback: (settlements: SettlementRecord[]) => void) => {
  return onSnapshot(collection(db, SETTLEMENTS_COLLECTION), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as SettlementRecord);
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    callback(data);
  }, (error) => {
    console.warn('Firestore Settlements subscription error (falling back to local):', error);
  });
};

export const subscribeToRecurring = (callback: (recurring: RecurringExpense[]) => void) => {
  return onSnapshot(collection(db, RECURRING_COLLECTION), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data() as RecurringExpense);
    callback(data);
  }, (error) => {
    console.warn('Firestore Recurring subscription error (falling back to local):', error);
  });
};

// --- SEED INITIAL DATA IF FIRESTORE IS EMPTY ---
export const seedInitialFirestoreData = async (
  initialUsers: User[],
  initialGroups: Group[],
  initialExpenses: Expense[],
  initialSettlements: SettlementRecord[],
  initialRecurring: RecurringExpense[]
) => {
  try {
    const usersSnap = await getDocs(collection(db, USERS_COLLECTION));
    if (usersSnap.empty) {
      console.log('Seeding initial data to Firestore...');
      // Seed users
      for (const u of initialUsers) {
        await setDoc(doc(db, USERS_COLLECTION, u.id), u);
      }
      // Seed groups
      for (const g of initialGroups) {
        await setDoc(doc(db, GROUPS_COLLECTION, g.id), g);
      }
      // Seed expenses
      for (const e of initialExpenses) {
        await setDoc(doc(db, EXPENSES_COLLECTION, e.id), e);
      }
      // Seed settlements
      for (const s of initialSettlements) {
        await setDoc(doc(db, SETTLEMENTS_COLLECTION, s.id), s);
      }
      // Seed recurring
      for (const r of initialRecurring) {
        await setDoc(doc(db, RECURRING_COLLECTION, r.id), r);
      }
      console.log('Initial data seeded successfully to Firestore!');
    }
  } catch (error) {
    console.warn('Could not seed initial data to Firestore:', error);
  }
};
