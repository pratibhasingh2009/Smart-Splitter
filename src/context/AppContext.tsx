import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  Group,
  Expense,
  SettlementRecord,
  RecurringExpense,
  AppNotification,
  PageView,
  CurrencyCode,
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
  getUserFromFirestore,
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
} from '../firebase/db';
import { auth } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

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
  clearAuthError: () => void;
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
  isReportModalOpen: boolean;
  settleModalState: SettleModalState;

  // Navigation & Auth Actions
  setCurrentView: (view: PageView, groupId?: string) => void;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsDemo: (demoEmail?: string) => void;
  loginWithQR: (qrData: string) => boolean;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;
  setCurrency: (c: CurrencyCode) => void;

  // Chat Actions
  sendGroupMessage: (
    groupId: string,
    text?: string,
    fileData?: { url: string; name: string; type: 'image' | 'pdf' | 'file' }
  ) => void;
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
    fromId:
      | string
      | {
          fromId: string;
          toId: string;
          amount: number;
          groupId?: string;
          method?: 'cash' | 'upi' | 'bank_transfer' | 'other';
          notes?: string;
        },
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
  openReportModal: () => void;
  closeReportModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEMO_STORAGE_KEYS = {
  ACTIVE: 'pbs_is_demo_active_v1',
  USERS: 'pbs_demo_users_v1',
  GROUPS: 'pbs_demo_groups_v1',
  EXPENSES: 'pbs_demo_expenses_v1',
  SETTLEMENTS: 'pbs_demo_settlements_v1',
  RECURRING: 'pbs_demo_recurring_v1',
  NOTIFICATIONS: 'pbs_demo_notifications_v1',
  MESSAGES: 'pbs_demo_messages_v1',
  CURRENT_USER_ID: 'pbs_demo_current_user_id_v1',
  CURRENCY: 'pbs_currency_preference_v1',
  MONTHLY_BUDGET: 'pbs_monthly_budget_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Demo Mode state
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem(DEMO_STORAGE_KEYS.ACTIVE) === 'true';
  });

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Current User profile
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (localStorage.getItem(DEMO_STORAGE_KEYS.ACTIVE) === 'true') {
      const savedId = localStorage.getItem(DEMO_STORAGE_KEYS.CURRENT_USER_ID);
      const found = INITIAL_USERS.find(u => u.id === savedId);
      return found || INITIAL_USERS[0];
    }
    return INITIAL_USERS[0];
  });

  // Navigation & UI States
  const [currentView, setCurrentViewInternal] = useState<PageView>('dashboard');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem(DEMO_STORAGE_KEYS.CURRENCY);
    return (saved as CurrencyCode) || 'INR';
  });

  // Main collections: for Demo mode, initialize from mockData; for real accounts, populated via Firestore
  const [users, setUsers] = useState<User[]>(() => {
    if (localStorage.getItem(DEMO_STORAGE_KEYS.ACTIVE) === 'true') {
      const saved = localStorage.getItem(DEMO_STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    }
    return INITIAL_USERS;
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    if (localStorage.getItem(DEMO_STORAGE_KEYS.ACTIVE) === 'true') {
      const saved = localStorage.getItem(DEMO_STORAGE_KEYS.GROUPS);
      return saved ? JSON.parse(saved) : INITIAL_GROUPS;
    }
    return [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (localStorage.getItem(DEMO_STORAGE_KEYS.ACTIVE) === 'true') {
      const saved = localStorage.getItem(DEMO_STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    }
    return [];
  });

  const [settlements, setSettlements] = useState<SettlementRecord[]>(() => {
    if (localStorage.getItem(DEMO_STORAGE_KEYS.ACTIVE) === 'true') {
      const saved = localStorage.getItem(DEMO_STORAGE_KEYS.SETTLEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_SETTLEMENTS;
    }
    return [];
  });

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => {
    if (localStorage.getItem(DEMO_STORAGE_KEYS.ACTIVE) === 'true') {
      const saved = localStorage.getItem(DEMO_STORAGE_KEYS.RECURRING);
      return saved ? JSON.parse(saved) : INITIAL_RECURRING;
    }
    return [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (localStorage.getItem(DEMO_STORAGE_KEYS.ACTIVE) === 'true') {
      const saved = localStorage.getItem(DEMO_STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    }
    return [];
  });

  const [groupMessages, setGroupMessages] = useState<GroupChatMessage[]>(() => {
    if (localStorage.getItem(DEMO_STORAGE_KEYS.ACTIVE) === 'true') {
      const saved = localStorage.getItem(DEMO_STORAGE_KEYS.MESSAGES);
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    }
    return [];
  });

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  // Modal states
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [settleModalState, setSettleModalState] = useState<SettleModalState>({
    isOpen: false,
    fromId: '',
    toId: '',
    amount: 0,
  });

  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(() => {
    const saved = localStorage.getItem(DEMO_STORAGE_KEYS.MONTHLY_BUDGET);
    return saved ? Number(saved) : 25000;
  });

  // --- Real Firebase Authentication Observer ---
  useEffect(() => {
    const isDemoActive = localStorage.getItem(DEMO_STORAGE_KEYS.ACTIVE) === 'true';

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser) {
        // Authenticated through Firebase
        setIsAuthenticated(true);
        setIsDemoMode(false);
        localStorage.removeItem(DEMO_STORAGE_KEYS.ACTIVE);

        try {
          let userProfile = await getUserFromFirestore(firebaseUser.uid);
          if (!userProfile) {
            userProfile = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              avatar:
                firebaseUser.photoURL ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              phone: '',
              upiId: `${(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'user').toLowerCase().replace(/\s+/g, '')}@upi`,
              monthlyBudget: 25000,
              currency: 'INR',
              isDemo: false,
            };
            await saveUserToFirestore(userProfile);
          }
          setCurrentUser(userProfile);
          if (userProfile.currency) setCurrencyState(userProfile.currency);
          if (userProfile.monthlyBudget) setMonthlyBudgetState(userProfile.monthlyBudget);
        } catch (err) {
          console.warn('Could not read/sync user profile from Firestore:', err);
          // Fallback minimal authenticated user
          setCurrentUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            avatar:
              firebaseUser.photoURL ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            isDemo: false,
          });
        }
        setIsCloudSynced(true);
      } else {
        // No Firebase session
        if (isDemoActive) {
          setIsAuthenticated(true);
          setIsDemoMode(true);
          setIsCloudSynced(false);
          const savedId = localStorage.getItem(DEMO_STORAGE_KEYS.CURRENT_USER_ID);
          const found = INITIAL_USERS.find(u => u.id === savedId) || INITIAL_USERS[0];
          setCurrentUser(found);
        } else {
          setIsAuthenticated(false);
          setIsDemoMode(false);
          setIsCloudSynced(false);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- Real-time Cloud Synchronization (Firebase Firestore) for Authenticated Users ---
  useEffect(() => {
    // Only subscribe to Firestore when real user is authenticated and NOT in demo mode
    if (!isAuthenticated || isDemoMode || !auth.currentUser) {
      return;
    }

    const userId = auth.currentUser.uid;
    setIsCloudSynced(true);

    // 1. All Users (to show member names, avatars)
    const unsubUsers = subscribeToUsers(
      (cloudUsers) => {
        if (cloudUsers && cloudUsers.length > 0) {
          // Merge current user with cloud users
          setUsers(cloudUsers);
        }
      },
      (error) => {
        console.warn('Firestore Users subscription error:', error.message);
      }
    );

    // 2. Scoped Groups (where user is a member)
    const unsubGroups = subscribeToGroups(
      userId,
      (cloudGroups) => {
        setGroups(cloudGroups || []);
      },
      (error) => {
        console.warn('Firestore Groups subscription error:', error.message);
      }
    );

    // 3. Scoped Expenses (where user paid or participated in split)
    const unsubExpenses = subscribeToExpenses(
      userId,
      (cloudExpenses) => {
        setExpenses(cloudExpenses || []);
      },
      (error) => {
        console.warn('Firestore Expenses subscription error:', error.message);
      }
    );

    // 4. Scoped Settlements (where user is debtor or creditor)
    const unsubSettlements = subscribeToSettlements(
      userId,
      (cloudSettlements) => {
        setSettlements(cloudSettlements || []);
      },
      (error) => {
        console.warn('Firestore Settlements subscription error:', error.message);
      }
    );

    // 5. Scoped Recurring Expenses
    const unsubRecurring = subscribeToRecurring(
      userId,
      (cloudRecurring) => {
        setRecurringExpenses(cloudRecurring || []);
      },
      (error) => {
        console.warn('Firestore Recurring subscription error:', error.message);
      }
    );

    return () => {
      unsubUsers();
      unsubGroups();
      unsubExpenses();
      unsubSettlements();
      unsubRecurring();
    };
  }, [isAuthenticated, isDemoMode, currentUser?.id]);

  // Scoped Group Messages Subscription (when a group is selected)
  useEffect(() => {
    if (!isAuthenticated || isDemoMode || !selectedGroupId) {
      return;
    }

    const unsubMessages = subscribeToGroupMessages(
      selectedGroupId,
      (cloudMessages) => {
        setGroupMessages(cloudMessages || []);
      },
      (error) => {
        console.warn('Firestore Group Messages subscription error:', error.message);
      }
    );

    return () => {
      unsubMessages();
    };
  }, [isAuthenticated, isDemoMode, selectedGroupId]);

  // Local demo persistence (Only saves in demo mode)
  useEffect(() => {
    if (isDemoMode) {
      localStorage.setItem(DEMO_STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }, [isDemoMode, users]);

  useEffect(() => {
    if (isDemoMode) {
      localStorage.setItem(DEMO_STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    }
  }, [isDemoMode, groups]);

  useEffect(() => {
    if (isDemoMode) {
      localStorage.setItem(DEMO_STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    }
  }, [isDemoMode, expenses]);

  useEffect(() => {
    if (isDemoMode) {
      localStorage.setItem(DEMO_STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));
    }
  }, [isDemoMode, settlements]);

  useEffect(() => {
    if (isDemoMode) {
      localStorage.setItem(DEMO_STORAGE_KEYS.RECURRING, JSON.stringify(recurringExpenses));
    }
  }, [isDemoMode, recurringExpenses]);

  useEffect(() => {
    if (isDemoMode) {
      localStorage.setItem(DEMO_STORAGE_KEYS.MESSAGES, JSON.stringify(groupMessages));
    }
  }, [isDemoMode, groupMessages]);

  useEffect(() => {
    if (isDemoMode) {
      localStorage.setItem(DEMO_STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
    }
  }, [isDemoMode, currentUser]);

  useEffect(() => {
    localStorage.setItem(DEMO_STORAGE_KEYS.CURRENCY, currency);
  }, [currency]);

  // Set Currency
  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    if (!isDemoMode && currentUser?.id && auth.currentUser) {
      updateUserInFirestore(currentUser.id, { currency: c });
    }
  };

  // Navigation
  const setCurrentView = (view: PageView, groupId?: string) => {
    setCurrentViewInternal(view);
    if (groupId !== undefined) {
      setSelectedGroupId(groupId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Firebase Real Login
  const login = async (email: string, password?: string): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);

    if (!email.trim() || !password) {
      setAuthError('Please enter both your email and password.');
      setAuthLoading(false);
      return false;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setIsDemoMode(false);
      localStorage.removeItem(DEMO_STORAGE_KEYS.ACTIVE);
      setCurrentViewInternal('dashboard');
      setAuthLoading(false);
      return true;
    } catch (err: any) {
      console.error('Firebase Auth Login Error:', err);
      let message = 'Failed to login. Please verify your credentials.';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        message = 'Invalid email or password. Please verify your credentials or sign up.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/operation-not-allowed') {
        message =
          'Email/Password sign-in is not enabled in Firebase Console. Please enable Email/Password provider under Firebase Authentication -> Sign-in method.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again in a few moments.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Network connection failed. Please check your internet connection.';
      } else if (err.message) {
        message = err.message;
      }
      setAuthError(message);
      setAuthLoading(false);
      return false;
    }
  };

  // Dedicated Demo Login (Isolated from Firebase Firestore)
  const loginAsDemo = (demoEmail: string = 'pratibha@gmail.com') => {
    setAuthLoading(false);
    setAuthError(null);
    setIsDemoMode(true);
    setIsAuthenticated(true);
    setIsCloudSynced(false);
    localStorage.setItem(DEMO_STORAGE_KEYS.ACTIVE, 'true');

    const demoUser =
      INITIAL_USERS.find(u => u.email.toLowerCase() === demoEmail.toLowerCase()) ||
      INITIAL_USERS[0];
    setCurrentUser(demoUser);
    setUsers(INITIAL_USERS);
    setGroups(INITIAL_GROUPS);
    setExpenses(INITIAL_EXPENSES);
    setSettlements(INITIAL_SETTLEMENTS);
    setRecurringExpenses(INITIAL_RECURRING);
    setNotifications(INITIAL_NOTIFICATIONS);
    setGroupMessages(INITIAL_MESSAGES);
    setCurrentViewInternal('dashboard');
  };

  // QR Login Scanner (Supports Demo profiles or real auth deep links)
  const loginWithQR = (qrData: string): boolean => {
    try {
      let targetUser: User | undefined;
      if (qrData.trim().startsWith('{') && qrData.trim().endsWith('}')) {
        const parsed = JSON.parse(qrData);
        if (parsed.email) {
          targetUser = INITIAL_USERS.find(
            u => u.email.toLowerCase() === parsed.email.toLowerCase()
          );
        }
      }

      if (!targetUser) {
        targetUser = INITIAL_USERS.find(
          u =>
            u.email.toLowerCase() === qrData.toLowerCase().trim() ||
            u.id === qrData.trim()
        );
      }

      if (targetUser) {
        loginAsDemo(targetUser.email);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  // Firebase Real Registration
  const register = async (name: string, email: string, password?: string): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);

    if (!name.trim()) {
      setAuthError('Please enter your full name.');
      setAuthLoading(false);
      return false;
    }
    if (!email.trim()) {
      setAuthError('Please enter your email address.');
      setAuthLoading(false);
      return false;
    }
    if (!password || password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      setAuthLoading(false);
      return false;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const newUser: User = {
        id: cred.user.uid,
        name: name.trim(),
        email: email.trim(),
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        phone: '',
        upiId: `${name.toLowerCase().replace(/\s+/g, '')}@upi`,
        monthlyBudget: 25000,
        currency: 'INR',
        isDemo: false,
      };

      await saveUserToFirestore(newUser);
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      setIsDemoMode(false);
      localStorage.removeItem(DEMO_STORAGE_KEYS.ACTIVE);

      // Clean, unpolluted state for genuine new user account
      setGroups([]);
      setExpenses([]);
      setSettlements([]);
      setRecurringExpenses([]);
      setGroupMessages([]);
      setNotifications([
        {
          id: `welcome_${Date.now()}`,
          title: 'Welcome to Personal Budget Splitter!',
          message: `Hello ${newUser.name}! Your account is now active. Create a group or add your first expense to begin.`,
          date: 'Just now',
          read: false,
          type: 'group',
        },
      ]);

      setCurrentViewInternal('dashboard');
      setAuthLoading(false);
      return true;
    } catch (err: any) {
      console.error('Firebase Auth Register Error:', err);
      let message = 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Please login instead.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/operation-not-allowed') {
        message =
          'Email/Password sign-up is not enabled in Firebase Console. Please enable Email/Password provider under Firebase Authentication -> Sign-in method.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Network connection failed. Please check your internet connection.';
      } else if (err.message) {
        message = err.message;
      }
      setAuthError(message);
      setAuthLoading(false);
      return false;
    }
  };

  // Logout Flow
  const logout = async (): Promise<void> => {
    try {
      localStorage.removeItem(DEMO_STORAGE_KEYS.ACTIVE);
      setIsDemoMode(false);
      setIsAuthenticated(false);
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
      setIsDemoMode(false);
      setGroups([]);
      setExpenses([]);
      setSettlements([]);
      setRecurringExpenses([]);
      setGroupMessages([]);
      setCurrentViewInternal('landing');
    }
  };

  // Switch Active Perspective (For demo testing or member view)
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
        title: 'Switched Active View',
        message: `Now viewing budget & debt ledger as ${found.name}`,
        date: 'Just now',
        read: false,
        type: 'group',
      };
      setNotifications(prev => [note, ...prev]);
    }
  };

  // Chat Actions
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

    if (!isDemoMode && auth.currentUser) {
      saveMessageToFirestore(newMessage).catch(err => {
        console.warn('Could not save group message to cloud:', err);
      });
    }
  };

  const deleteGroupMessage = (messageId: string) => {
    setGroupMessages(prev => prev.filter(m => m.id !== messageId));
    if (!isDemoMode && auth.currentUser) {
      deleteMessageFromFirestore(messageId).catch(err => {
        console.warn('Could not delete group message from cloud:', err);
      });
    }
  };

  // Expense Handlers
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExpense: Expense = {
      ...expenseData,
      id: `e_${Date.now()}`,
      paidBy: expenseData.paidBy || currentUser.id,
      memberIds: Array.from(
        new Set(
          [expenseData.paidBy || currentUser.id, ...(expenseData.splits || []).map(s => s.memberId)].filter(
            Boolean
          )
        )
      ),
      createdAt: new Date().toISOString(),
    };

    setExpenses(prev => [newExpense, ...prev]);

    if (!isDemoMode && auth.currentUser) {
      saveExpenseToFirestore(newExpense).catch(err => {
        console.warn('Could not save expense to cloud:', err);
      });
    }

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
    if (!isDemoMode && auth.currentUser) {
      updateExpenseInFirestore(id, updatedFields).catch(err => {
        console.warn('Could not update expense in cloud:', err);
      });
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    if (!isDemoMode && auth.currentUser) {
      deleteExpenseFromFirestore(id).catch(err => {
        console.warn('Could not delete expense from cloud:', err);
      });
    }
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

  // Group Handlers
  const createGroup = (groupData: Omit<Group, 'id' | 'createdAt'>): Group => {
    const newGroup: Group = {
      ...groupData,
      id: `g_${Date.now()}`,
      createdBy: currentUser.id,
      members: Array.from(new Set([currentUser.id, ...(groupData.members || [])])),
      createdAt: new Date().toISOString(),
    };

    setGroups(prev => [...prev, newGroup]);

    if (!isDemoMode && auth.currentUser) {
      saveGroupToFirestore(newGroup).catch(err => {
        console.warn('Could not save group to cloud:', err);
      });
    }

    setSelectedGroupId(newGroup.id);
    return newGroup;
  };

  const updateGroup = (id: string, updatedFields: Partial<Group>) => {
    setGroups(prev =>
      prev.map(grp => (grp.id === id ? { ...grp, ...updatedFields } : grp))
    );
    if (!isDemoMode && auth.currentUser) {
      updateGroupInFirestore(id, updatedFields).catch(err => {
        console.warn('Could not update group in cloud:', err);
      });
    }
  };

  const deleteGroup = (id: string) => {
    setGroups(prev => prev.filter(grp => grp.id !== id));
    if (!isDemoMode && auth.currentUser) {
      deleteGroupFromFirestore(id).catch(err => {
        console.warn('Could not delete group from cloud:', err);
      });
    }
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
        createdBy: currentUser.id,
      };
      setUsers(prev => [...prev, member!]);
      if (!isDemoMode && auth.currentUser) {
        saveUserToFirestore(member).catch(err => console.warn('Could not save contact to cloud:', err));
      }
    }

    const memberId = member.id;
    setGroups(prev =>
      prev.map(grp => {
        if (grp.id === groupId && !grp.members.includes(memberId)) {
          const updatedMembers = [...grp.members, memberId];
          if (!isDemoMode && auth.currentUser) {
            updateGroupInFirestore(groupId, { members: updatedMembers });
          }
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
          if (!isDemoMode && auth.currentUser) {
            updateGroupInFirestore(groupId, { members: updatedMembers });
          }
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

  // Settlement Handlers
  const recordSettlement = (
    fromIdOrObj:
      | string
      | {
          fromId: string;
          toId: string;
          amount: number;
          groupId?: string;
          method?: 'cash' | 'upi' | 'bank_transfer' | 'other';
          notes?: string;
        },
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
      participantIds: [actualFromId, actualToId],
    };

    setSettlements(prev => [newRecord, ...prev]);

    if (!isDemoMode && auth.currentUser) {
      saveSettlementToFirestore(newRecord).catch(err => {
        console.warn('Could not save settlement to cloud:', err);
      });
    }

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
    if (!isDemoMode && auth.currentUser) {
      deleteSettlementFromFirestore(id).catch(err => {
        console.warn('Could not delete settlement from cloud:', err);
      });
    }
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

  // Recurring Expenses Handlers
  const addRecurringExpense = (rec: Omit<RecurringExpense, 'id'>) => {
    const newRec: RecurringExpense = {
      ...rec,
      id: `r_${Date.now()}`,
      paidBy: rec.paidBy || currentUser.id,
      memberIds: Array.from(
        new Set([rec.paidBy || currentUser.id, ...(rec.splits || []).map(s => s.memberId)].filter(Boolean))
      ),
    };

    setRecurringExpenses(prev => [...prev, newRec]);

    if (!isDemoMode && auth.currentUser) {
      saveRecurringToFirestore(newRec).catch(err => {
        console.warn('Could not save recurring expense to cloud:', err);
      });
    }
  };

  const toggleRecurringStatus = (id: string) => {
    setRecurringExpenses(prev =>
      prev.map(r => {
        if (r.id === id) {
          const newStatus = r.status === 'active' ? 'paused' : 'active';
          if (!isDemoMode && auth.currentUser) {
            updateRecurringInFirestore(id, { status: newStatus });
          }
          return { ...r, status: newStatus };
        }
        return r;
      })
    );
  };

  const deleteRecurringExpense = (id: string) => {
    setRecurringExpenses(prev => prev.filter(r => r.id !== id));
    if (!isDemoMode && auth.currentUser) {
      deleteRecurringFromFirestore(id).catch(err => {
        console.warn('Could not delete recurring expense from cloud:', err);
      });
    }
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
      memberIds: Array.from(
        new Set([rec.paidBy, ...(rec.splits || []).map(s => s.memberId)].filter(Boolean))
      ),
      notes: `Generated from recurring subscription (${rec.frequency})`,
      createdAt: new Date().toISOString(),
    };

    setExpenses(prev => [newExpense, ...prev]);
    if (!isDemoMode && auth.currentUser) {
      saveExpenseToFirestore(newExpense).catch(err => {
        console.warn('Could not save recurring generated expense:', err);
      });
    }

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
      prev.map(r => (r.id === id ? { ...r, nextDueDate: nextDueDateStr } : r))
    );
    if (!isDemoMode && auth.currentUser) {
      updateRecurringInFirestore(id, { nextDueDate: nextDueDateStr });
    }

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

  const setMonthlyBudget = (b: number) => {
    setMonthlyBudgetState(b);
    localStorage.setItem(DEMO_STORAGE_KEYS.MONTHLY_BUDGET, b.toString());
    if (!isDemoMode && currentUser?.id && auth.currentUser) {
      updateUserInFirestore(currentUser.id, { monthlyBudget: b });
    }
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
          if (!isDemoMode && auth.currentUser) {
            updateGroupInFirestore(groupId, { notes: updatedNotes });
          }
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
          if (!isDemoMode && auth.currentUser) {
            updateGroupInFirestore(groupId, { notes: updatedNotes });
          }
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
          if (!isDemoMode && auth.currentUser) {
            updateGroupInFirestore(groupId, { budget });
          }
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
      createdBy: currentUser.id,
    };
    setUsers(prev => [...prev, newFriend]);
    if (!isDemoMode && auth.currentUser) {
      saveUserToFirestore(newFriend).catch(err => {
        console.warn('Could not save friend to cloud:', err);
      });
    }
    return newFriend;
  };

  const updateUserProfile = (userId: string, data: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, ...data } : u))
    );
    if (!isDemoMode && auth.currentUser) {
      updateUserInFirestore(userId, data).catch(err => {
        console.warn('Could not update user profile in cloud:', err);
      });
    }
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...data }));
    }
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.users && Array.isArray(parsed.users)) {
        setUsers(parsed.users);
      }
      if (parsed.groups && Array.isArray(parsed.groups)) {
        setGroups(parsed.groups);
      }
      if (parsed.expenses && Array.isArray(parsed.expenses)) {
        setExpenses(parsed.expenses);
      }
      if (parsed.settlements && Array.isArray(parsed.settlements)) {
        setSettlements(parsed.settlements);
      }
      if (parsed.recurringExpenses && Array.isArray(parsed.recurringExpenses)) {
        setRecurringExpenses(parsed.recurringExpenses);
      }
      return true;
    } catch {
      return false;
    }
  };

  // Safe Reset & Export (Scoped only to app keys, never clears user's whole browser storage)
  const resetData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setGroups(INITIAL_GROUPS);
    setExpenses(INITIAL_EXPENSES);
    setSettlements(INITIAL_SETTLEMENTS);
    setRecurringExpenses(INITIAL_RECURRING);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrencyState('INR');
    setIsDemoMode(true);
    setIsAuthenticated(true);
    // Only clean app-specific keys
    Object.values(DEMO_STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.setItem(DEMO_STORAGE_KEYS.ACTIVE, 'true');
  };

  const clearAllData = () => {
    setExpenses([]);
    setGroups([]);
    setSettlements([]);
    setRecurringExpenses([]);
    setNotifications([]);
    setGroupMessages([]);
    localStorage.removeItem(DEMO_STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(DEMO_STORAGE_KEYS.GROUPS);
    localStorage.removeItem(DEMO_STORAGE_KEYS.SETTLEMENTS);
    localStorage.removeItem(DEMO_STORAGE_KEYS.RECURRING);
    localStorage.removeItem(DEMO_STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(DEMO_STORAGE_KEYS.MESSAGES);
  };

  const loadDemoData = () => {
    loginAsDemo('pratibha@gmail.com');
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
  const openReportModal = () => setIsReportModalOpen(true);
  const closeReportModal = () => setIsReportModalOpen(false);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isDemoMode,
        authLoading,
        authError,
        clearAuthError,
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
        isReportModalOpen,
        settleModalState,
        setCurrentView,
        login,
        loginAsDemo,
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
        openReportModal,
        closeReportModal,
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
