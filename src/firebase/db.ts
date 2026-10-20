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

// --- REAL-TIME LISTENERS (Scoped & Robust) ---
export const subscribeToUsers = (
  callback: (users: User[]) => void,
  onError?: (err: Error) => void
) => {
  return onSnapshot(
    collection(db, USERS_COLLECTION),
    (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data() as User);
      callback(data);
    },
    (error) => {
      console.warn('Firestore Users subscription error:', error);
      onError?.(error);
    }
  );
};

export const subscribeToGroups = (
  callback: (groups: Group[]) => void,
  userId?: string,
  onError?: (err: Error) => void
) => {
  return onSnapshot(
    collection(db, GROUPS_COLLECTION),
    (snapshot) => {
      let data = snapshot.docs.map((doc) => doc.data() as Group);
      if (userId) {
        data = data.filter((g) => g.members?.includes(userId));
      }
      callback(data);
    },
    (error) => {
      console.warn('Firestore Groups subscription error:', error);
      onError?.(error);
    }
  );
};

export const subscribeToExpenses = (
  callback: (expenses: Expense[]) => void,
  userId?: string,
  onError?: (err: Error) => void
) => {
  return onSnapshot(
    collection(db, EXPENSES_COLLECTION),
    (snapshot) => {
      let data = snapshot.docs.map((doc) => doc.data() as Expense);
      if (userId) {
        data = data.filter(
          (e) =>
            e.paidBy === userId ||
            e.splits?.some((s) => s.memberId === userId)
        );
      }
      // Sort descending by creation / date
      data.sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      );
      callback(data);
    },
    (error) => {
      console.warn('Firestore Expenses subscription error:', error);
      onError?.(error);
    }
  );
};

export const subscribeToSettlements = (
  callback: (settlements: SettlementRecord[]) => void,
  userId?: string,
  onError?: (err: Error) => void
) => {
  return onSnapshot(
    collection(db, SETTLEMENTS_COLLECTION),
    (snapshot) => {
      let data = snapshot.docs.map((doc) => doc.data() as SettlementRecord);
      if (userId) {
        data = data.filter((s) => s.fromId === userId || s.toId === userId);
      }
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(data);
    },
    (error) => {
      console.warn('Firestore Settlements subscription error:', error);
      onError?.(error);
    }
  );
};

export const subscribeToRecurring = (
  callback: (recurring: RecurringExpense[]) => void,
  userId?: string,
  onError?: (err: Error) => void
) => {
  return onSnapshot(
    collection(db, RECURRING_COLLECTION),
    (snapshot) => {
      let data = snapshot.docs.map((doc) => doc.data() as RecurringExpense);
      if (userId) {
        data = data.filter(
          (r) =>
            r.paidBy === userId ||
            r.splits?.some((s) => s.memberId === userId)
        );
      }
      callback(data);
    },
    (error) => {
      console.warn('Firestore Recurring subscription error:', error);
      onError?.(error);
    }
  );
};

// Explicit demo-seeding helper (NEVER invoked automatically on new user registration)
export const seedDemoDataToFirestore = async (
  demoUsers: User[],
  demoGroups: Group[],
  demoExpenses: Expense[],
  demoSettlements: SettlementRecord[],
  demoRecurring: RecurringExpense[]
) => {
  try {
    for (const u of demoUsers) {
      await setDoc(doc(db, USERS_COLLECTION, u.id), sanitizeFirestoreData(u), { merge: true });
    }
    for (const g of demoGroups) {
      await setDoc(doc(db, GROUPS_COLLECTION, g.id), sanitizeFirestoreData(g), { merge: true });
    }
    for (const e of demoExpenses) {
      await setDoc(doc(db, EXPENSES_COLLECTION, e.id), sanitizeFirestoreData(e), { merge: true });
    }
    for (const s of demoSettlements) {
      await setDoc(doc(db, SETTLEMENTS_COLLECTION, s.id), sanitizeFirestoreData(s), { merge: true });
    }
    for (const r of demoRecurring) {
      await setDoc(doc(db, RECURRING_COLLECTION, r.id), sanitizeFirestoreData(r), { merge: true });
    }
    return true;
  } catch (error) {
    console.error('Failed to seed demo data to Firestore:', error);
    throw error;
  }
};
