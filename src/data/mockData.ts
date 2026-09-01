import { User, Group, Expense, RecurringExpense, AppNotification, SettlementRecord, GroupChatMessage } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Pratibha Singh',
    email: 'pratibha@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43210',
    upiId: 'pratibha@okaxis',
    monthlyBudget: 25000,
    currency: 'INR',
  },
  {
    id: 'u2',
    name: 'Pratiksha Gupta',
    email: 'pratiksha@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98123 45678',
    upiId: 'pratiksha@oksbi',
    monthlyBudget: 20000,
    currency: 'INR',
  },
  {
    id: 'u3',
    name: 'Priyansh Verma',
    email: 'priyansh@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 97234 56789',
    upiId: 'priyansh@paytm',
    monthlyBudget: 30000,
    currency: 'INR',
  },
  {
    id: 'u4',
    name: 'Priyam Yadav',
    email: 'priyam@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+91 96345 67890',
    upiId: 'priyam@okicici',
    monthlyBudget: 18000,
    currency: 'INR',
  },
  {
    id: 'u5',
    name: 'Aarav Sharma',
    email: 'aarav@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    phone: '+91 95456 78901',
    upiId: 'aarav@hdfcbank',
    monthlyBudget: 35000,
    currency: 'INR',
  },
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Trip 2026',
    description: 'Goa beach getaway, villas, bike rentals and dining',
    category: 'trip',
    color: '#1E88E5',
    iconName: 'Compass',
    members: ['u1', 'u2', 'u3', 'u4'],
    createdAt: '2025-05-01T10:00:00Z',
  },
  {
    id: 'g2',
    name: 'Roommates',
    description: 'Flat 402 rent, groceries, electricity, cook and broadband',
    category: 'home',
    color: '#22C55E',
    iconName: 'Home',
    members: ['u1', 'u2', 'u3'],
    createdAt: '2025-04-15T09:00:00Z',
  },
  {
    id: 'g3',
    name: 'College Friends',
    description: 'Weekend dinners, movie nights and reunion planning',
    category: 'friends',
    color: '#F59E0B',
    iconName: 'Users',
    members: ['u1', 'u2', 'u3', 'u4', 'u5'],
    createdAt: '2025-04-20T14:30:00Z',
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'e1',
    title: 'Dinner at Cafe',
    amount: 1200,
    date: '2025-05-15',
    paidBy: 'u1', // Pratibha
    groupId: 'g1', // Trip 2026
    category: 'food',
    splitMode: 'EQUAL',
    splits: [
      { memberId: 'u1', amount: 300 },
      { memberId: 'u2', amount: 300 },
      { memberId: 'u3', amount: 300 },
      { memberId: 'u4', amount: 300 },
    ],
    notes: 'Delicious seafood dinner by the shore',
    createdAt: '2025-05-15T20:30:00Z',
  },
  {
    id: 'e2',
    title: 'Hotel Booking',
    amount: 4000,
    date: '2025-05-14',
    paidBy: 'u3', // Priyansh
    groupId: 'g1', // Trip 2026
    category: 'travel',
    splitMode: 'EQUAL',
    splits: [
      { memberId: 'u1', amount: 1000 },
      { memberId: 'u2', amount: 1000 },
      { memberId: 'u3', amount: 1000 },
      { memberId: 'u4', amount: 1000 },
    ],
    notes: '2-night villa stay advance',
    createdAt: '2025-05-14T11:00:00Z',
  },
  {
    id: 'e3',
    title: 'Trip Tickets',
    amount: 3000,
    date: '2025-05-12',
    paidBy: 'u1', // Pratibha
    groupId: 'g1', // Trip 2026
    category: 'travel',
    splitMode: 'EQUAL',
    splits: [
      { memberId: 'u1', amount: 750 },
      { memberId: 'u2', amount: 750 },
      { memberId: 'u3', amount: 750 },
      { memberId: 'u4', amount: 750 },
    ],
    notes: 'Express train tickets booked on IRCTC',
    createdAt: '2025-05-12T09:15:00Z',
  },
  {
    id: 'e4',
    title: 'Beach Watersports & Scooters',
    amount: 4300,
    date: '2025-05-11',
    paidBy: 'u4', // Priyam
    groupId: 'g1', // Trip 2026
    category: 'entertainment',
    splitMode: 'EQUAL',
    splits: [
      { memberId: 'u1', amount: 1075 },
      { memberId: 'u2', amount: 1075 },
      { memberId: 'u3', amount: 1075 },
      { memberId: 'u4', amount: 1075 },
    ],
    notes: 'Parasailing and 2 rental scooters with fuel',
    createdAt: '2025-05-11T16:00:00Z',
  },
  {
    id: 'e5',
    title: 'Room Rent',
    amount: 8000,
    date: '2025-05-01',
    paidBy: 'u1', // Pratibha
    groupId: 'g2', // Roommates
    category: 'rent',
    splitMode: 'EQUAL',
    splits: [
      { memberId: 'u1', amount: 2666 },
      { memberId: 'u2', amount: 2667 },
      { memberId: 'u3', amount: 2667 },
    ],
    notes: 'May month flat rent transferred to owner',
    createdAt: '2025-05-01T08:00:00Z',
  },
  {
    id: 'e6',
    title: 'Organic Grocery Shopping',
    amount: 1500,
    date: '2025-05-08',
    paidBy: 'u2', // Pratiksha
    groupId: 'g2', // Roommates
    category: 'groceries',
    splitMode: 'EQUAL',
    splits: [
      { memberId: 'u1', amount: 500 },
      { memberId: 'u2', amount: 500 },
      { memberId: 'u3', amount: 500 },
    ],
    notes: 'Vegetables, milk, fruits, and daily supplies',
    createdAt: '2025-05-08T18:45:00Z',
  },
  {
    id: 'e7',
    title: 'Movie Night & Popcorn Combo',
    amount: 2500,
    date: '2025-05-06',
    paidBy: 'u5', // Aarav
    groupId: 'g3', // College Friends
    category: 'entertainment',
    splitMode: 'EQUAL',
    splits: [
      { memberId: 'u1', amount: 500 },
      { memberId: 'u2', amount: 500 },
      { memberId: 'u3', amount: 500 },
      { memberId: 'u4', amount: 500 },
      { memberId: 'u5', amount: 500 },
    ],
    notes: 'IMAX 3D tickets and snacks',
    createdAt: '2025-05-06T21:00:00Z',
  },
  {
    id: 'e8',
    title: 'Group BBQ & Dinner',
    amount: 3800,
    date: '2025-05-03',
    paidBy: 'u3', // Priyansh
    groupId: 'g3', // College Friends
    category: 'food',
    splitMode: 'EQUAL',
    splits: [
      { memberId: 'u1', amount: 760 },
      { memberId: 'u2', amount: 760 },
      { memberId: 'u3', amount: 760 },
      { memberId: 'u4', amount: 760 },
      { memberId: 'u5', amount: 760 },
    ],
    notes: 'BBQ grill platter and drinks',
    createdAt: '2025-05-03T20:15:00Z',
  },
];

export const INITIAL_SETTLEMENTS: SettlementRecord[] = [
  {
    id: 's1',
    fromId: 'u2',
    toId: 'u1',
    amount: 1500,
    date: '2025-05-02',
    groupId: 'g2',
    method: 'upi',
    notes: 'Rent split advance settlement',
  },
];

export const INITIAL_RECURRING: RecurringExpense[] = [
  {
    id: 'r1',
    title: 'Apartment Flat Rent',
    amount: 15000,
    category: 'rent',
    groupId: 'g2',
    paidBy: 'u1',
    splitMode: 'EQUAL',
    splits: [
      { memberId: 'u1', amount: 5000 },
      { memberId: 'u2', amount: 5000 },
      { memberId: 'u3', amount: 5000 },
    ],
    frequency: 'monthly',
    nextDueDate: '2025-06-01',
    status: 'active',
  },
  {
    id: 'r2',
    title: 'High-Speed WiFi Broadband',
    amount: 999,
    category: 'utilities',
    groupId: 'g2',
    paidBy: 'u2',
    splitMode: 'EQUAL',
    splits: [
      { memberId: 'u1', amount: 333 },
      { memberId: 'u2', amount: 333 },
      { memberId: 'u3', amount: 333 },
    ],
    frequency: 'monthly',
    nextDueDate: '2025-06-05',
    status: 'active',
  },
  {
    id: 'r3',
    title: 'Netflix 4K Subscription',
    amount: 649,
    category: 'entertainment',
    groupId: 'g3',
    paidBy: 'u1',
    splitMode: 'EQUAL',
    splits: [
      { memberId: 'u1', amount: 162 },
      { memberId: 'u2', amount: 162 },
      { memberId: 'u3', amount: 162 },
      { memberId: 'u4', amount: 163 },
    ],
    frequency: 'monthly',
    nextDueDate: '2025-06-15',
    status: 'active',
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'New Expense Added',
    message: 'Pratiksha Gupta added Organic Grocery Shopping (₹1,500) in Roommates',
    date: '10 mins ago',
    read: false,
    type: 'expense',
  },
  {
    id: 'n2',
    title: 'Settlement Reminder',
    message: 'Pratiksha owes you ₹300 for Trip 2026. Send a reminder or settle up.',
    date: '2 hours ago',
    read: false,
    type: 'settlement',
  },
  {
    id: 'n3',
    title: 'Upcoming Recurring Bill',
    message: 'WiFi Broadband (₹999) due in 5 days for Roommates group',
    date: '1 day ago',
    read: false,
    type: 'recurring',
  },
];

export const INITIAL_MESSAGES: GroupChatMessage[] = [
  {
    id: 'm1',
    groupId: 'g1',
    senderId: 'u2',
    senderName: 'Pratiksha Gupta',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    text: 'Hey everyone! I just booked the beach villa for our Goa Trip 🏖️',
    createdAt: '2025-05-01T11:30:00Z',
  },
  {
    id: 'm2',
    groupId: 'g1',
    senderId: 'u1',
    senderName: 'Pratibha Singh',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    text: 'Awesome! I have attached the flight tickets and booking receipt PDF below.',
    fileUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
    fileName: 'Goa_Villa_Confirmation.jpg',
    fileType: 'image',
    createdAt: '2025-05-01T11:35:00Z',
  },
  {
    id: 'm3',
    groupId: 'g2',
    senderId: 'u3',
    senderName: 'Priyansh Verma',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    text: 'Paid the monthly electricity bill for Flat 402 today! Added to split.',
    createdAt: '2025-05-02T09:15:00Z',
  },
];

