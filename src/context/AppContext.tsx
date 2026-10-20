import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Group,
  Expense,
  SettlementRecord,
  RecurringExpense,
  AppNotification,
  PageView,
  CurrencyCode,
  ExpenseCategory,
  SplitMode,
  GroupChatMessage,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_GROUPS,
  INITIAL_EXPENSES,
  INITIAL_SETTLEMENTS,
  INITIAL_RECURRING,
  INITIAL_NOTIFICATIONS,
  INITIAL_MESSAGES,
} from '../data/mockData';
import {
  saveUserToFirestore,
  updateUserInFirestore,
  saveGroupToFirestore,
  updateGroupInFirestore,
  deleteGroupFromFirestore,
  saveExpenseToFirestore,
  updateExpenseInFirestore,
  deleteExpenseFromFirestore,
  saveSettlementToFirestore,
  deleteSettlementFromFirestore,
  saveRecurringToFirestore,
  updateRecurringInFirestore,
  deleteRecurringFromFirestore,
  saveMessageToFirestore,
  deleteMessageFromFirestore,
  subscribeToUsers,
  subscribeToGroups,
  subscribeToExpenses,
  subscribeToSettlements,
  subscribeToRecurring,
  subscribeToGroupMessages,
  seedDemoDataToFirestore,
} from '../firebase/db';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';

interface SettleModalState {
  isOpen: boolean;
  fromId: string;
  toId: string;
  amount: number;
  groupId?: string;
}

interface AppContextType {
  currentUser: User;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  authLoading: boolean;
  authError: string | null;
  currentView: PageView;
  selectedGroupId: string | null;
  currency: CurrencyCode;
  users: User[];
  groups: Group[];
  expenses: Expense[];
  settlements: SettlementRecord[];
  recurringExpenses: RecurringExpense[];
  notifications: AppNotification[];
  groupMessages: GroupChatMessage[];
  unreadNotificationCount: number;
  editingExpense: Expense | null;
  isCloudSynced: boolean;
  
  // Modals
  isAddExpenseModalOpen: boolean;
  isCreateGroupModalOpen: boolean;
  isFlowModalOpen: boolean;
  settleModalState: SettleModalState;

  // Navigation & Auth Actions
  setCurrentView: (view: PageView, groupId?: string) => void;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsDemo: (demoEmail?: string) => void;
  loginWithQR: (qrData: string) => boolean;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (userId: string) => void;
  setCurrency: (c: CurrencyCode) => void;

  // Chat Actions
  sendGroupMessage: (groupId: string, text?: string, fileData?: { url: string; name: string; type: 'image' | 'pdf' | 'file' }) => void;
  deleteGroupMessage: (messageId: string) => void;

  // Expense Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  openAddExpenseModal: (groupId?: string, editExpense?: Expense) => void;
  closeAddExpenseModal: () => void;

  // Group Actions
  createGroup: (group: Omit<Group, 'id' | 'createdAt'>) => Group;
  updateGroup: (id: string, group: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  addMemberToGroup: (groupId: string, name: string, email: string) => void;
  removeMemberFromGroup: (groupId: string, memberId: string) => void;
  openCreateGroupModal: () => void;
  closeCreateGroupModal: () => void;

  // Settlement Actions
  recordSettlement: (
    fromId: string | { fromId: string; toId: string; amount: number; groupId?: string; method?: 'cash' | 'upi' | 'bank_transfer' | 'other'; notes?: string },
    toId?: string,
    amount?: number,
    groupId?: string,
    method?: 'cash' | 'upi' | 'bank_transfer' | 'other',
    notes?: string
  ) => void;
  deleteSettlement: (id: string) => void;
  openSettleModal: (fromId?: string, toId?: string, amount?: number, groupId?: string) => void;
  closeSettleModal: () => void;

  // Recurring Actions
  addRecurringExpense: (rec: Omit<RecurringExpense, 'id'>) => void;
  toggleRecurringStatus: (id: string) => void;
  deleteRecurringExpense: (id: string) => void;
  applyRecurringExpense: (id: string) => void;
  autoApplyDueRecurring: () => number;

  // Group Enrichment
  addGroupNote: (groupId: string, text: string) => void;
  deleteGroupNote: (groupId: string, noteId: string) => void;
  updateGroupBudget: (groupId: string, budget: number) => void;

  // Profile & Friends Enrichment
  monthlyBudget: number;
  setMonthlyBudget: (b: number) => void;
  addNewFriend: (name: string, email: string, phone?: string, upiId?: string) => User;
  updateUserProfile: (userId: string, data: Partial<User>) => void;

  // Sidebar Layout State
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Data & Reset
  resetData: () => void;
  clearAllData: () => void;
  loadDemoData: () => void;
  exportData: (format: 'json' | 'csv') => void;
  importData: (jsonData: string) => boolean;
  openFlowModal: () => void;
  closeFlowModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'pbs_users_v1',
  GROUPS: 'pbs_groups_v1',
  EXPENSES: 'pbs_expenses_v1',
  SETTLEMENTS: 'pbs_settlements_v1',
  RECURRING: 'pbs_recurring_v1',
  NOTIFICATIONS: 'pbs_notifications_v1',
  MESSAGES: 'pbs_messages_v1',
  CURRENT_USER_ID: 'pbs_current_user_id_v1',
  IS_AUTH: 'pbs_is_auth_v1',
  CURRENCY: 'pbs_currency_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence state loaders with fallback to initial data
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const found = users.find(u => u.id === savedId);
    return found || users[0] || INITIAL_USERS[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_AUTH);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [currentView, setCurrentViewInternal] = useState<PageView>('dashboard');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    return (saved as CurrencyCode) || 'INR';
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GROUPS);
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [settlements, setSettlements] = useState<SettlementRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_SETTLEMENTS;
  });

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECURRING);
    return saved ? JSON.parse(saved) : INITIAL_RECURRING;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [groupMessages, setGroupMessages] = useState<GroupChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  // Modal states
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [settleModalState, setSettleModalState] = useState<SettleModalState>({
    isOpen: false,
    fromId: '',
    toId: '',
    amount: 0,
  });

  // --- Real-time Cloud Synchronization (Firebase Firestore) ---
  useEffect(() => {
    // Subscribe to Firestore collections
    const unsubUsers = subscribeToUsers((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers(cloudUsers);
        setIsCloudSynced(true);
      }
    });

    const unsubGroups = subscribeToGroups((cloudGroups) => {
      if (cloudGroups && cloudGroups.length > 0) {
        setGroups(cloudGroups);
      }
    });

    const unsubExpenses = subscribeToExpenses((cloudExpenses) => {
      if (cloudExpenses && cloudExpenses.length > 0) {
        setExpenses(cloudExpenses);
      }
    });

    const unsubSettlements = subscribeToSettlements((cloudSettlements) => {
      if (cloudSettlements && cloudSettlements.length > 0) {
        setSettlements(cloudSettlements);
      }
    });

    const unsubRecurring = subscribeToRecurring((cloudRecurring) => {
      if (cloudRecurring && cloudRecurring.length > 0) {
        setRecurringExpenses(cloudRecurring);
      }
    });

    const unsubMessages = subscribeToGroupMessages((cloudMessages) => {
      if (cloudMessages && cloudMessages.length > 0) {
        setGroupMessages(cloudMessages);
      }
    });

    return () => {
      unsubUsers();
      unsubGroups();
      unsubExpenses();
      unsubSettlements();
      unsubRecurring();
      unsubMessages();
    };
  }, []);

  // Save to local storage for instant offline recovery
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));
  }, [settlements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurringExpenses));
  }, [recurringExpenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(groupMessages));
  }, [groupMessages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_AUTH, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  }, [currency]);

  // Set Currency
  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
  };

  // Navigation
  const setCurrentView = (view: PageView, groupId?: string) => {
    setCurrentViewInternal(view);
    if (groupId !== undefined) {
      setSelectedGroupId(groupId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth actions
  const login = (email: string): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setCurrentViewInternal('dashboard');
      return true;
    }
    // If user doesn't exist, create one & persist in Cloud Firestore
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/^\w/, c => c.toUpperCase()),
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    setUsers(prev => [...prev, newUser]);
    saveUserToFirestore(newUser);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setCurrentViewInternal('dashboard');
    return true;
  };

  const loginWithQR = (qrData: string): boolean => {
    try {
      // 1. Try parsing JSON format (e.g. {"id": "u1", "email": "pratibha@gmail.com"})
      let targetUser: User | undefined;
      if (qrData.trim().startsWith('{') && qrData.trim().endsWith('}')) {
        const parsed = JSON.parse(qrData);
        if (parsed.email) {
          targetUser = users.find(u => u.email.toLowerCase() === parsed.email.toLowerCase());
        }
        if (!targetUser && parsed.id) {
          targetUser = users.find(u => u.id === parsed.id);
        }
        if (!targetUser && parsed.name && parsed.email) {
          return register(parsed.name, parsed.email);
        }
      }

      // 2. Try raw email / user ID
      if (!targetUser) {
        targetUser = users.find(
          u => u.email.toLowerCase() === qrData.toLowerCase().trim() || u.id === qrData.trim()
        );
      }

      // 3. Try custom scheme like splitsmart://login?email=...
      if (!targetUser && qrData.includes('email=')) {
        const match = qrData.match(/email=([^&]+)/);
        if (match && match[1]) {
          const decodedEmail = decodeURIComponent(match[1]);
          return login(decodedEmail);
        }
      }

      if (targetUser) {
        setCurrentUser(targetUser);
        setIsAuthenticated(true);
        setCurrentViewInternal('dashboard');
        return true;
      }

      // If valid email string provided in QR
      if (qrData.includes('@')) {
        return login(qrData.trim());
      }

      return false;
    } catch {
      return false;
    }
  };

  // Group Chat Message Handlers
  const sendGroupMessage = (
    groupId: string,
    text?: string,
    fileData?: { url: string; name: string; type: 'image' | 'pdf' | 'file' }
  ) => {
    if (!text?.trim() && !fileData?.url) return;

    const newMessage: GroupChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      groupId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: text?.trim() || '',
      createdAt: new Date().toISOString(),
      ...(fileData?.url ? { fileUrl: fileData.url } : {}),
      ...(fileData?.name ? { fileName: fileData.name } : {}),
      ...(fileData?.type ? { fileType: fileData.type } : {}),
    };

    setGroupMessages(prev => [...prev, newMessage]);
    saveMessageToFirestore(newMessage);
  };

  const deleteGroupMessage = (messageId: string) => {
    setGroupMessages(prev => prev.filter(m => m.id !== messageId));
    deleteMessageFromFirestore(messageId);
  };

  const register = (name: string, email: string): boolean => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
      setIsAuthenticated(true);
      setCurrentViewInternal('dashboard');
      return true;
    }
    const newUser: User = {
      id: `u_${Date.now()}`,
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    setUsers(prev => [...prev, newUser]);
    saveUserToFirestore(newUser);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setCurrentViewInternal('dashboard');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentViewInternal('landing');
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      if (found.currency) {
        setCurrencyState(found.currency);
      }
      if (found.monthlyBudget) {
        setMonthlyBudgetState(found.monthlyBudget);
      }
      const note: AppNotification = {
        id: `n_${Date.now()}`,
        title: 'Switched Active User',
        message: `Now viewing budget & debt ledger as ${found.name}`,
        date: 'Just now',
        read: false,
        type: 'group',
      };
      setNotifications(prev => [note, ...prev]);
    }
  };

  // Expense Handlers (Cloud Persisted)
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExpense: Expense = {
      ...expenseData,
      id: `e_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    // Save locally and in Firestore
    setExpenses(prev => [newExpense, ...prev]);
    saveExpenseToFirestore(newExpense);

    // Send notification
    const payer = users.find(u => u.id === newExpense.paidBy)?.name || 'Someone';
    const groupName = groups.find(g => g.id === newExpense.groupId)?.name || 'General';
    const note: AppNotification = {
      id: `n_${Date.now()}`,
      title: 'New Expense Added',
      message: `${payer} added '${newExpense.title}' for ₹${newExpense.amount} in ${groupName}`,
      date: 'Just now',
      read: false,
      type: 'expense',
    };
    setNotifications(prev => [note, ...prev]);

    return newExpense;
  };

  const updateExpense = (id: string, updatedFields: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(exp => (exp.id === id ? { ...exp, ...updatedFields } : exp))
    );
    updateExpenseInFirestore(id, updatedFields);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    deleteExpenseFromFirestore(id);
  };

  const openAddExpenseModal = (groupId?: string, editExp?: Expense) => {
    if (groupId) {
      setSelectedGroupId(groupId);
    }
    setEditingExpense(editExp || null);
    setIsAddExpenseModalOpen(true);
  };

  const closeAddExpenseModal = () => {
    setIsAddExpenseModalOpen(false);
    setEditingExpense(null);
  };

  // Group Handlers (Cloud Persisted)
  const createGroup = (groupData: Omit<Group, 'id' | 'createdAt'>): Group => {
    const newGroup: Group = {
      ...groupData,
      id: `g_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setGroups(prev => [...prev, newGroup]);
    saveGroupToFirestore(newGroup);
    setSelectedGroupId(newGroup.id);
    return newGroup;
  };

  const updateGroup = (id: string, updatedFields: Partial<Group>) => {
    setGroups(prev =>
      prev.map(grp => (grp.id === id ? { ...grp, ...updatedFields } : grp))
    );
    updateGroupInFirestore(id, updatedFields);
  };

  const deleteGroup = (id: string) => {
    setGroups(prev => prev.filter(grp => grp.id !== id));
    deleteGroupFromFirestore(id);
    // also remove expenses belonging to this group
    setExpenses(prev => prev.filter(exp => exp.groupId !== id));
    if (selectedGroupId === id) {
      setSelectedGroupId(null);
      setCurrentViewInternal('groups');
    }
  };

  const addMemberToGroup = (groupId: string, name: string, email: string) => {
    let member = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!member) {
      member = {
        id: `u_${Date.now()}`,
        name: name || email.split('@')[0],
        email,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      };
      setUsers(prev => [...prev, member!]);
      saveUserToFirestore(member);
    }

    const memberId = member.id;
    setGroups(prev =>
      prev.map(grp => {
        if (grp.id === groupId && !grp.members.includes(memberId)) {
          const updatedMembers = [...grp.members, memberId];
          updateGroupInFirestore(groupId, { members: updatedMembers });
          return {
            ...grp,
            members: updatedMembers,
          };
        }
        return grp;
      })
    );
  };

  const removeMemberFromGroup = (groupId: string, memberId: string) => {
    setGroups(prev =>
      prev.map(grp => {
        if (grp.id === groupId) {
          const updatedMembers = grp.members.filter(m => m !== memberId);
          updateGroupInFirestore(groupId, { members: updatedMembers });
          return {
            ...grp,
            members: updatedMembers,
          };
        }
        return grp;
      })
    );
  };

  const openCreateGroupModal = () => setIsCreateGroupModalOpen(true);
  const closeCreateGroupModal = () => setIsCreateGroupModalOpen(false);

  // Settlement Handlers (Cloud Persisted)
  const recordSettlement = (
    fromIdOrObj: string | { fromId: string; toId: string; amount: number; groupId?: string; method?: 'cash' | 'upi' | 'bank_transfer' | 'other'; notes?: string },
    toIdArg?: string,
    amountArg?: number,
    groupIdArg?: string,
    methodArg: 'cash' | 'upi' | 'bank_transfer' | 'other' = 'upi',
    notesArg: string = 'Settled via smart settlement'
  ) => {
    let actualFromId: string;
    let actualToId: string;
    let actualAmount: number;
    let actualGroupId: string | undefined;
    let actualMethod: 'cash' | 'upi' | 'bank_transfer' | 'other';
    let actualNotes: string;

    if (typeof fromIdOrObj === 'object' && fromIdOrObj !== null) {
      actualFromId = fromIdOrObj.fromId;
      actualToId = fromIdOrObj.toId;
      actualAmount = Number(fromIdOrObj.amount) || 0;
      actualGroupId = fromIdOrObj.groupId;
      actualMethod = fromIdOrObj.method || 'upi';
      actualNotes = fromIdOrObj.notes || 'Settled via smart settlement';
    } else {
      actualFromId = typeof fromIdOrObj === 'string' ? fromIdOrObj : '';
      actualToId = toIdArg || '';
      actualAmount = Number(amountArg) || 0;
      actualGroupId = groupIdArg;
      actualMethod = methodArg;
      actualNotes = notesArg;
    }

    if (!actualFromId || !actualToId || actualAmount <= 0) return;

    const newRecord: SettlementRecord = {
      id: `s_${Date.now()}`,
      fromId: actualFromId,
      toId: actualToId,
      amount: actualAmount,
      date: new Date().toISOString().split('T')[0],
      groupId: actualGroupId,
      method: actualMethod,
      notes: actualNotes,
    };
    setSettlements(prev => [newRecord, ...prev]);
    saveSettlementToFirestore(newRecord);

    const fromUser = users.find(u => u.id === actualFromId)?.name || 'Someone';
    const toUser = users.find(u => u.id === actualToId)?.name || 'Someone';

    const note: AppNotification = {
      id: `n_${Date.now()}`,
      title: 'Settlement Recorded',
      message: `${fromUser} paid ₹${actualAmount} to ${toUser} via ${actualMethod.toUpperCase()}`,
      date: 'Just now',
      read: false,
      type: 'settlement',
    };
    setNotifications(prev => [note, ...prev]);
  };

  const deleteSettlement = (id: string) => {
    setSettlements(prev => prev.filter(s => s.id !== id));
    deleteSettlementFromFirestore(id);
  };

  const openSettleModal = (fromId?: string, toId?: string, amount?: number, groupId?: string) => {
    setSettleModalState({
      isOpen: true,
      fromId: fromId || currentUser.id,
      toId: toId || (users.find(u => u.id !== currentUser.id)?.id || ''),
      amount: amount || 0,
      groupId,
    });
  };

  const closeSettleModal = () => {
    setSettleModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Recurring Handlers (Cloud Persisted)
  const addRecurringExpense = (rec: Omit<RecurringExpense, 'id'>) => {
    const newRec: RecurringExpense = {
      ...rec,
      id: `r_${Date.now()}`,
    };
    setRecurringExpenses(prev => [...prev, newRec]);
    saveRecurringToFirestore(newRec);
  };

  const toggleRecurringStatus = (id: string) => {
    setRecurringExpenses(prev =>
      prev.map(r => {
        if (r.id === id) {
          const newStatus = r.status === 'active' ? 'paused' : 'active';
          updateRecurringInFirestore(id, { status: newStatus });
          return { ...r, status: newStatus };
        }
        return r;
      })
    );
  };

  const deleteRecurringExpense = (id: string) => {
    setRecurringExpenses(prev => prev.filter(r => r.id !== id));
    deleteRecurringFromFirestore(id);
  };

  const applyRecurringExpense = (id: string) => {
    const rec = recurringExpenses.find(r => r.id === id);
    if (!rec) return;

    const newExpense: Expense = {
      id: `e_${Date.now()}`,
      title: `${rec.title} (Recurring)`,
      amount: rec.amount,
      date: new Date().toISOString().split('T')[0],
      paidBy: rec.paidBy,
      groupId: rec.groupId,
      category: rec.category,
      splitMode: rec.splitMode,
      splits: rec.splits,
      notes: `Generated from recurring subscription (${rec.frequency})`,
      createdAt: new Date().toISOString(),
    };

    setExpenses(prev => [newExpense, ...prev]);
    saveExpenseToFirestore(newExpense);

    const nextDate = new Date();
    if (rec.frequency === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (rec.frequency === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    const nextDueDateStr = nextDate.toISOString().split('T')[0];
    setRecurringExpenses(prev =>
      prev.map(r =>
        r.id === id ? { ...r, nextDueDate: nextDueDateStr } : r
      )
    );
    updateRecurringInFirestore(id, { nextDueDate: nextDueDateStr });

    const note: AppNotification = {
      id: `n_${Date.now()}`,
      title: 'Recurring Bill Logged',
      message: `${rec.title} (₹${rec.amount}) applied as an active expense for this month`,
      date: 'Just now',
      read: false,
      type: 'recurring',
    };
    setNotifications(prev => [note, ...prev]);
  };

  // Notification Handlers
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(() => {
    const saved = localStorage.getItem('pbs_monthly_budget_v1');
    return saved ? Number(saved) : 25000;
  });

  const setMonthlyBudget = (b: number) => {
    setMonthlyBudgetState(b);
    localStorage.setItem('pbs_monthly_budget_v1', b.toString());
  };

  const autoApplyDueRecurring = () => {
    let appliedCount = 0;
    const now = new Date();
    recurringExpenses.forEach(r => {
      if (r.status === 'active') {
        const dueDate = new Date(r.nextDueDate);
        if (dueDate <= now || r.frequency === 'monthly') {
          applyRecurringExpense(r.id);
          appliedCount++;
        }
      }
    });
    return appliedCount;
  };

  // Group Enrichment (Notes & Budget)
  const addGroupNote = (groupId: string, text: string) => {
    if (!text.trim()) return;
    const newNote = {
      id: `gn_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setGroups(prev =>
      prev.map(g => {
        if (g.id === groupId) {
          const updatedNotes = [...(g.notes || []), newNote];
          updateGroupInFirestore(groupId, { notes: updatedNotes });
          return { ...g, notes: updatedNotes };
        }
        return g;
      })
    );
  };

  const deleteGroupNote = (groupId: string, noteId: string) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.id === groupId) {
          const updatedNotes = (g.notes || []).filter(n => n.id !== noteId);
          updateGroupInFirestore(groupId, { notes: updatedNotes });
          return { ...g, notes: updatedNotes };
        }
        return g;
      })
    );
  };

  const updateGroupBudget = (groupId: string, budget: number) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.id === groupId) {
          updateGroupInFirestore(groupId, { budget });
          return { ...g, budget };
        }
        return g;
      })
    );
  };

  // User & Friend Management
  const addNewFriend = (name: string, email: string, phone?: string, upiId?: string): User => {
    const newFriend: User = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      phone: phone || '+91 99887 76655',
      upiId: upiId || `${name.toLowerCase().replace(/\s+/g, '')}@upi`,
    };
    setUsers(prev => [...prev, newFriend]);
    saveUserToFirestore(newFriend);
    return newFriend;
  };

  const updateUserProfile = (userId: string, data: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, ...data } : u))
    );
    updateUserInFirestore(userId, data);
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...data }));
    }
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.users) {
        setUsers(parsed.users);
        parsed.users.forEach((u: User) => saveUserToFirestore(u));
      }
      if (parsed.groups) {
        setGroups(parsed.groups);
        parsed.groups.forEach((g: Group) => saveGroupToFirestore(g));
      }
      if (parsed.expenses) {
        setExpenses(parsed.expenses);
        parsed.expenses.forEach((e: Expense) => saveExpenseToFirestore(e));
      }
      if (parsed.settlements) {
        setSettlements(parsed.settlements);
        parsed.settlements.forEach((s: SettlementRecord) => saveSettlementToFirestore(s));
      }
      if (parsed.recurringExpenses) {
        setRecurringExpenses(parsed.recurringExpenses);
        parsed.recurringExpenses.forEach((r: RecurringExpense) => saveRecurringToFirestore(r));
      }
      return true;
    } catch {
      return false;
    }
  };

  // Reset & Export
  const resetData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setGroups(INITIAL_GROUPS);
    setExpenses(INITIAL_EXPENSES);
    setSettlements(INITIAL_SETTLEMENTS);
    setRecurringExpenses(INITIAL_RECURRING);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrencyState('INR');
    setIsAuthenticated(true);
    localStorage.clear();
  };

  const clearAllData = () => {
    // Keeps current user profile, wipes all sample expenses, settlements, groups & messages
    setExpenses([]);
    setGroups([]);
    setSettlements([]);
    setRecurringExpenses([]);
    setNotifications([]);
    setGroupMessages([]);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.GROUPS);
    localStorage.removeItem(STORAGE_KEYS.SETTLEMENTS);
    localStorage.removeItem(STORAGE_KEYS.RECURRING);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  };

  const loadDemoData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setGroups(INITIAL_GROUPS);
    setExpenses(INITIAL_EXPENSES);
    setSettlements(INITIAL_SETTLEMENTS);
    setRecurringExpenses(INITIAL_RECURRING);
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(INITIAL_GROUPS));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(INITIAL_SETTLEMENTS));
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(INITIAL_RECURRING));
  };

  const exportData = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(
        { users, groups, expenses, settlements, recurringExpenses },
        null,
        2
      );
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personal_budget_splitter_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } else {
      const headers = ['ID', 'Title', 'Amount', 'Date', 'Category', 'PaidBy', 'Group', 'SplitMode', 'Notes'];
      const rows = expenses.map(e => [
        e.id,
        `"${e.title.replace(/"/g, '""')}"`,
        e.amount,
        e.date,
        e.category,
        users.find(u => u.id === e.paidBy)?.name || e.paidBy,
        groups.find(g => g.id === e.groupId)?.name || 'General',
        e.splitMode,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  const openFlowModal = () => setIsFlowModalOpen(true);
  const closeFlowModal = () => setIsFlowModalOpen(false);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        currentView,
        selectedGroupId,
        currency,
        users,
        groups,
        expenses,
        settlements,
        recurringExpenses,
        notifications,
        groupMessages,
        unreadNotificationCount,
        editingExpense,
        isCloudSynced,
        isAddExpenseModalOpen,
        isCreateGroupModalOpen,
        isFlowModalOpen,
        settleModalState,
        setCurrentView,
        login,
        loginWithQR,
        register,
        logout,
        switchUser,
        setCurrency,
        sendGroupMessage,
        deleteGroupMessage,
        addExpense,
        updateExpense,
        deleteExpense,
        openAddExpenseModal,
        closeAddExpenseModal,
        createGroup,
        updateGroup,
        deleteGroup,
        addMemberToGroup,
        removeMemberFromGroup,
        openCreateGroupModal,
        closeCreateGroupModal,
        recordSettlement,
        deleteSettlement,
        openSettleModal,
        closeSettleModal,
        addRecurringExpense,
        toggleRecurringStatus,
        deleteRecurringExpense,
        applyRecurringExpense,
        autoApplyDueRecurring,
        addGroupNote,
        deleteGroupNote,
        updateGroupBudget,
        monthlyBudget,
        setMonthlyBudget,
        addNewFriend,
        updateUserProfile,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetData,
        clearAllData,
        loadDemoData,
        exportData,
        importData,
        openFlowModal,
        closeFlowModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
