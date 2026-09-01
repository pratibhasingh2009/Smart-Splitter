import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { GroupsView } from './components/groups/GroupsView';
import { GroupDetailsView } from './components/groups/GroupDetailsView';
import { ExpenseHistoryView } from './components/expenses/ExpenseHistoryView';
import { SettlementView } from './components/settlement/SettlementView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { RecurringExpensesView } from './components/recurring/RecurringExpensesView';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView';
import { GroupChatView } from './components/chat/GroupChatView';
import { LandingPage } from './components/auth/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { AddExpenseModal } from './components/expenses/AddExpenseModal';
import { CreateGroupModal } from './components/modals/CreateGroupModal';
import { SettlePaymentModal } from './components/modals/SettlePaymentModal';
import { UserFlowModal } from './components/modals/UserFlowModal';

const AppContent: React.FC = () => {
  const {
    currentView,
    selectedGroupId,
    isAddExpenseModalOpen,
    closeAddExpenseModal,
    editingExpense,
    isAuthenticated,
  } = useApp();

  // If user is not authenticated or is viewing unauthenticated views:
  if (!isAuthenticated) {
    if (currentView === 'login') return <LoginPage />;
    if (currentView === 'register') return <RegisterPage />;
    return <LandingPage />;
  }

  // If authenticated but explicitly on landing / auth pages:
  if (currentView === 'landing') return <LandingPage />;
  if (currentView === 'login') return <LoginPage />;
  if (currentView === 'register') return <RegisterPage />;

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden select-none">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic Main View */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'groups' && <GroupsView />}
          {currentView === 'chat' && <GroupChatView />}
          {currentView === 'group-details' && (
            <GroupDetailsView groupId={selectedGroupId || ''} />
          )}
          {(currentView === 'expenses' || currentView === 'expense-history') && <ExpenseHistoryView />}
          {currentView === 'settlement' && <SettlementView />}
          {currentView === 'analytics' && <AnalyticsView />}
          {currentView === 'recurring' && <RecurringExpensesView />}
          {(currentView === 'profile' || currentView === 'settings') && <ProfileSettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={closeAddExpenseModal}
        initialGroupId={selectedGroupId}
        editingExpense={editingExpense}
      />
      <CreateGroupModal />
      <SettlePaymentModal />
      <UserFlowModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
