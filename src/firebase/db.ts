import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  where,
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

// --- USERS ---
export const saveUserToFirestore = async (user: User): Promise<void> => {
  try {
    const clean = sanitizeFirestoreData(user);
    await setDoc(doc(db, USERS_COLLECTION, user.id), clean, { merge: true });
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    throw error;
  }
};

export const getUserFromFirestore = async (userId: string): Promise<User | null> => {
  try {
    const snap = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user from Firestore:', error);
    return null;
  }
};

export const updateUserInFirestore = async (userId: string, data: Partial<User>): Promise<void> => {
  try {
    const clean = sanitizeFirestoreData(data);
    await updateDoc(doc(db, USERS_COLLECTION, userId), clean);
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    throw error;
  }
};

// --- GROUPS ---
export const saveGroupToFirestore = async (group: Group): Promise<void> => {
  try {
    const clean = sanitizeFirestoreData(group);
    await setDoc(doc(db, GROUPS_COLLECTION, group.id), clean, { merge: true });
  } catch (error) {
    console.error('Error saving group to Firestore:', error);
    throw error;
  }
};

export const updateGroupInFirestore = async (groupId: string, data: Partial<Group>): Promise<void> => {
  try {
    const clean = sanitizeFirestoreData(data);
    await updateDoc(doc(db, GROUPS_COLLECTION, groupId), clean);
  } catch (error) {
    console.error('Error updating group in Firestore:', error);
    throw error;
  }
};

export const deleteGroupFromFirestore = async (groupId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, GROUPS_COLLECTION, groupId));
  } catch (error) {
    console.error('Error deleting group from Firestore:', error);
    throw error;
  }
};

// --- EXPENSES ---
export const saveExpenseToFirestore = async (expense: Expense): Promise<void> => {
  try {
    const memberIds = Array.from(
      new Set(
        [expense.paidBy, ...(expense.splits || []).map((s) => s.memberId)].filter(Boolean)
      )
    );
    const enrichedExpense: Expense = {
      ...expense,
      memberIds,
    };
    const clean = sanitizeFirestoreData(enrichedExpense);
    await setDoc(doc(db, EXPENSES_COLLECTION, expense.id), clean, { merge: true });
  } catch (error) {
    console.error('Error saving expense to Firestore:', error);
    throw error;
  }
};

export const updateExpenseInFirestore = async (
  expenseId: string,
  data: Partial<Expense>
): Promise<void> => {
  try {
    const clean = sanitizeFirestoreData(data);
    await updateDoc(doc(db, EXPENSES_COLLECTION, expenseId), clean);
  } catch (error) {
    console.error('Error updating expense in Firestore:', error);
    throw error;
  }
};

export const deleteExpenseFromFirestore = async (expenseId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, EXPENSES_COLLECTION, expenseId));
  } catch (error) {
    console.error('Error deleting expense from Firestore:', error);
    throw error;
  }
};

// --- SETTLEMENTS ---
export const saveSettlementToFirestore = async (settlement: SettlementRecord): Promise<void> => {
  try {
    const participantIds = Array.from(
      new Set([settlement.fromId, settlement.toId].filter(Boolean))
    );
    const enrichedSettlement: SettlementRecord = {
      ...settlement,
      participantIds,
    };
    const clean = sanitizeFirestoreData(enrichedSettlement);
    await setDoc(doc(db, SETTLEMENTS_COLLECTION, settlement.id), clean, { merge: true });
  } catch (error) {
    console.error('Error saving settlement to Firestore:', error);
    throw error;
  }
};

export const deleteSettlementFromFirestore = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SETTLEMENTS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting settlement from Firestore:', error);
    throw error;
  }
};

// --- GROUP CHAT MESSAGES ---
export const saveMessageToFirestore = async (message: GroupChatMessage): Promise<void> => {
  try {
    const clean = sanitizeFirestoreData(message);
    await setDoc(doc(db, MESSAGES_COLLECTION, message.id), clean, { merge: true });
  } catch (error) {
    console.error('Error saving message to Firestore:', error);
    throw error;
  }
};

export const deleteMessageFromFirestore = async (messageId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, MESSAGES_COLLECTION, messageId));
  } catch (error) {
    console.error('Error deleting message from Firestore:', error);
    throw error;
  }
};

export const subscribeToGroupMessages = (
  groupId: string | null,
  callback: (messages: GroupChatMessage[]) => void,
  onError?: (err: Error) => void
) => {
  if (!groupId) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, MESSAGES_COLLECTION), where('groupId', '==', groupId));
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => d.data() as GroupChatMessage);
      data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      callback(data);
    },
    (error) => {
      console.warn(`Firestore Messages subscription error for group ${groupId}:`, error);
      onError?.(error);
    }
  );
};

// --- RECURRING EXPENSES ---
export const saveRecurringToFirestore = async (recurring: RecurringExpense): Promise<void> => {
  try {
    const memberIds = Array.from(
      new Set(
        [recurring.paidBy, ...(recurring.splits || []).map((s) => s.memberId)].filter(Boolean)
      )
    );
    const enrichedRecurring: RecurringExpense = {
      ...recurring,
      memberIds,
    };
    const clean = sanitizeFirestoreData(enrichedRecurring);
    await setDoc(doc(db, RECURRING_COLLECTION, recurring.id), clean, { merge: true });
  } catch (error) {
    console.error('Error saving recurring expense to Firestore:', error);
    throw error;
  }
};

export const updateRecurringInFirestore = async (
  id: string,
  data: Partial<RecurringExpense>
): Promise<void> => {
  try {
    const clean = sanitizeFirestoreData(data);
    await updateDoc(doc(db, RECURRING_COLLECTION, id), clean);
  } catch (error) {
    console.error('Error updating recurring in Firestore:', error);
    throw error;
  }
};

export const deleteRecurringFromFirestore = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, RECURRING_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting recurring from Firestore:', error);
    throw error;
  }
};

// --- REAL-TIME LISTENERS (Scoped to permitted user data) ---
export const subscribeToUsers = (
  callback: (users: User[]) => void,
  onError?: (err: Error) => void
) => {
  return onSnapshot(
    collection(db, USERS_COLLECTION),
    (snapshot) => {
      const data = snapshot.docs.map((d) => d.data() as User);
      callback(data);
    },
    (error) => {
      console.warn('Firestore Users subscription error:', error);
      onError?.(error);
    }
  );
};

export const subscribeToGroups = (
  userId: string,
  callback: (groups: Group[]) => void,
  onError?: (err: Error) => void
) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, GROUPS_COLLECTION),
    where('members', 'array-contains', userId)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => d.data() as Group);
      callback(data);
    },
    (error) => {
      console.warn('Firestore Groups subscription error:', error);
      onError?.(error);
    }
  );
};

export const subscribeToExpenses = (
  userId: string,
  callback: (expenses: Expense[]) => void,
  onError?: (err: Error) => void
) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('memberIds', 'array-contains', userId)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => d.data() as Expense);
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
  userId: string,
  callback: (settlements: SettlementRecord[]) => void,
  onError?: (err: Error) => void
) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, SETTLEMENTS_COLLECTION),
    where('participantIds', 'array-contains', userId)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => d.data() as SettlementRecord);
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
  userId: string,
  callback: (recurring: RecurringExpense[]) => void,
  onError?: (err: Error) => void
) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, RECURRING_COLLECTION),
    where('memberIds', 'array-contains', userId)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => d.data() as RecurringExpense);
      callback(data);
    },
    (error) => {
      console.warn('Firestore Recurring subscription error:', error);
      onError?.(error);
    }
  );
};

// Explicit demo-seeding helper (Only callable explicitly from settings if testing)
export const seedDemoDataToFirestore = async (
  demoUsers: User[],
  demoGroups: Group[],
  demoExpenses: Expense[],
  demoSettlements: SettlementRecord[],
  demoRecurring: RecurringExpense[]
): Promise<boolean> => {
  try {
    for (const u of demoUsers) {
      await setDoc(doc(db, USERS_COLLECTION, u.id), sanitizeFirestoreData(u), { merge: true });
    }
    for (const g of demoGroups) {
      await setDoc(doc(db, GROUPS_COLLECTION, g.id), sanitizeFirestoreData(g), { merge: true });
    }
    for (const e of demoExpenses) {
      const memberIds = Array.from(
        new Set([e.paidBy, ...(e.splits || []).map((s) => s.memberId)].filter(Boolean))
      );
      await setDoc(
        doc(db, EXPENSES_COLLECTION, e.id),
        sanitizeFirestoreData({ ...e, memberIds }),
        { merge: true }
      );
    }
    for (const s of demoSettlements) {
      const participantIds = Array.from(new Set([s.fromId, s.toId].filter(Boolean)));
      await setDoc(
        doc(db, SETTLEMENTS_COLLECTION, s.id),
        sanitizeFirestoreData({ ...s, participantIds }),
        { merge: true }
      );
    }
    for (const r of demoRecurring) {
      const memberIds = Array.from(
        new Set([r.paidBy, ...(r.splits || []).map((s) => s.memberId)].filter(Boolean))
      );
      await setDoc(
        doc(db, RECURRING_COLLECTION, r.id),
        sanitizeFirestoreData({ ...r, memberIds }),
        { merge: true }
      );
    }
    return true;
  } catch (error) {
    console.error('Failed to seed demo data to Firestore:', error);
    throw error;
  }
};
