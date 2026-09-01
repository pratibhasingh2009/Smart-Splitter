import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  Plus,
  Scale,
  Receipt,
  UserPlus,
  Trash2,
  CalendarClock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  MoreVertical,
  Edit2,
  Zap,
  Download,
  Search,
  MessageSquare,
  Smartphone,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Target,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  calculateNetBalances,
  calculateSmartSettlements,
  CATEGORY_CONFIG,
} from '../../utils/settlementCalculator';

export const GroupDetailsView: React.FC = () => {
  const {
    selectedGroupId,
    groups,
    users,
    expenses,
    settlements,
    recurringExpenses,
    currentUser,
    currency,
    setCurrentView,
    openAddExpenseModal,
    openSettleModal,
    addMemberToGroup,
    removeMemberFromGroup,
    deleteGroup,
    deleteExpense,
    addGroupNote,
    deleteGroupNote,
    updateGroupBudget,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'expenses' | 'settlement' | 'members' | 'notes' | 'recurring'>('expenses');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedExistingUserId, setSelectedExistingUserId] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('all');

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [groupBudgetInput, setGroupBudgetInput] = useState('');

  const [newNoteText, setNewNoteText] = useState('');
  const [activeQrModal, setActiveQrModal] = useState<{ toName: string; toUpi: string; amount: number } | null>(null);

  const group = groups.find(g => g.id === selectedGroupId) || groups[0];

  if (!group) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl">
        <p className="text-slate-500 text-sm">Group not found.</p>
        <button
          onClick={() => setCurrentView('groups')}
          className="mt-3 px-4 py-2 rounded-xl bg-[#1E88E5] text-white text-xs font-bold"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  const groupExpenses = expenses.filter(e => e.groupId === group.id);
  const totalGroupExpense = groupExpenses.reduce((sum, e) => sum + e.amount, 0);

  const groupMembers = users.filter(u => group.members.includes(u.id));
  const nonGroupUsers = users.filter(u => !group.members.includes(u.id));
  const netBalances = calculateNetBalances(expenses, settlements, group.id);
  const smartTransactions = calculateSmartSettlements(expenses, settlements, group.id);
  const groupRecurring = recurringExpenses.filter(r => r.groupId === group.id);

  // Group Budget Calculation
  const groupBudget = group.budget || 40000;
  const budgetPercentage = Math.min(100, Math.round((totalGroupExpense / groupBudget) * 100));
  const isOverBudget = totalGroupExpense > groupBudget;

  const filteredGroupExpenses = groupExpenses.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(expenseSearch.toLowerCase()));
    const matchCat = expenseCategoryFilter === 'all' || e.category === expenseCategoryFilter;
    return matchSearch && matchCat;
  });

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExistingUserId) {
      const existing = users.find(u => u.id === selectedExistingUserId);
      if (existing) {
        addMemberToGroup(group.id, existing.name, existing.email);
      }
    } else if (newMemberEmail && newMemberName) {
      addMemberToGroup(group.id, newMemberName, newMemberEmail);
    }
    setNewMemberName('');
    setNewMemberEmail('');
    setSelectedExistingUserId('');
    setIsAddMemberOpen(false);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(groupBudgetInput);
    if (!isNaN(val) && val > 0) {
      updateGroupBudget(group.id, val);
      setIsEditingBudget(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteText.trim()) {
      addGroupNote(group.id, newNoteText.trim());
      setNewNoteText('');
    }
  };

  const exportGroupCSV = () => {
    const headers = ['Expense Title', 'Amount', 'Date', 'Category', 'Paid By', 'Split Mode', 'Notes'];
    const rows = groupExpenses.map(e => [
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount,
      e.date,
      e.category,
      users.find(u => u.id === e.paidBy)?.name || e.paidBy,
      e.splitMode,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${group.name.replace(/\s+/g, '_')}_expenses.csv`;
    a.click();
  };

  const sendWhatsAppReminder = (debtorName: string, amount: number) => {
    const text = encodeURIComponent(
      `Hi ${debtorName}, reminder from ${currentUser.name} for our group '${group.name}'. You have an unsettled balance of ${formatCurrency(amount, currency)}. Pay via UPI: ${currentUser.upiId || 'my registered UPI'}. Thanks!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div id="group-details-view" className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('groups')}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-slate-600 shadow-sm transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Groups / {group.name}
          </span>
        </div>

        <button
          onClick={exportGroupCSV}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#1E88E5]" />
          <span>Export Group CSV</span>
        </button>
      </div>

      {/* Group Header Hero Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#145DA0] to-[#1E88E5] text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md">
                {group.category} Group
              </span>
              <span className="text-xs text-white/80 font-semibold">
                Created {new Date(group.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight mt-2 text-white">
              {group.name}
            </h1>
            <p className="text-sm text-white/85 font-medium mt-1 max-w-xl">
              {group.description}
            </p>

            {/* Member Avatars */}
            <div className="flex items-center gap-2 mt-4">
              <div className="flex -space-x-2 overflow-hidden">
                {groupMembers.map(m => (
                  <img
                    key={m.id}
                    src={m.avatar}
                    alt={m.name}
                    title={m.name}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm"
                  />
                ))}
              </div>
              <span className="text-xs text-white/90 font-bold ml-1">
                {groupMembers.length} Members
              </span>
            </div>
          </div>

          {/* Group Total & Action Buttons */}
          <div className="flex flex-col items-start md:items-end gap-3 bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/15">
            <span className="text-xs uppercase font-bold text-white/80 tracking-wider">
              Total Group Expense
            </span>
            <span className="text-3xl font-black text-white tracking-tight">
              {formatCurrency(totalGroupExpense, currency)}
            </span>

            <div className="flex items-center gap-2 mt-2 w-full">
              <button
                onClick={() => openAddExpenseModal(group.id)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F5B942] hover:bg-amber-400 text-[#1F2937] text-xs font-extrabold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
              <button
                onClick={() => openSettleModal(undefined, undefined, undefined, group.id)}
                className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md transition-all flex items-center justify-center gap-1.5"
              >
                <Scale className="w-4 h-4" />
                Settle Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Group Budget Tracker Card */}
      <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#145DA0] flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Group Spending Budget
                </span>
                <button
                  onClick={() => {
                    setGroupBudgetInput(groupBudget.toString());
                    setIsEditingBudget(true);
                  }}
                  className="text-slate-400 hover:text-[#1E88E5] p-0.5"
                  title="Change budget"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
              <p className="text-sm font-black text-slate-800">
                {formatCurrency(totalGroupExpense, currency)}{' '}
                <span className="text-xs font-normal text-slate-400">
                  of {formatCurrency(groupBudget, currency)} target
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-xl ${
              isOverBudget ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {budgetPercentage}% Consumed
            </span>
            <span className="text-xs font-medium text-slate-500">
              {isOverBudget ? 'Over by ' : 'Remaining: '}{' '}
              <strong className={isOverBudget ? 'text-red-600' : 'text-slate-800'}>
                {formatCurrency(Math.abs(groupBudget - totalGroupExpense), currency)}
              </strong>
            </span>
          </div>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-100 mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget ? 'bg-red-500' : 'bg-gradient-to-r from-[#145DA0] to-[#1E88E5]'
            }`}
            style={{ width: `${budgetPercentage}%` }}
          />
        </div>

        {isEditingBudget && (
          <form onSubmit={handleSaveBudget} className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">New Budget ({currency}):</span>
            <input
              type="number"
              value={groupBudgetInput}
              onChange={e => setGroupBudgetInput(e.target.value)}
              className="w-32 px-2.5 py-1 text-xs border border-slate-200 rounded-lg font-bold"
              placeholder="e.g. 50000"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1 bg-[#1E88E5] text-white text-xs font-bold rounded-lg"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditingBudget(false)}
              className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'expenses'
              ? 'bg-[#145DA0] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Expenses ({groupExpenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settlement')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'settlement'
              ? 'bg-[#145DA0] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4 text-[#F5B942]" />
          <span>Smart Settlements ({smartTransactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'members'
              ? 'bg-[#145DA0] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Members & Balances ({groupMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'notes'
              ? 'bg-[#145DA0] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Group Notes ({(group.notes || []).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recurring')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'recurring'
              ? 'bg-[#145DA0] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span>Recurring Bills ({groupRecurring.length})</span>
        </button>
      </div>

      {/* Tab 1: Expenses */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search & Category filter */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={expenseSearch}
                  onChange={e => setExpenseSearch(e.target.value)}
                  placeholder="Search group bills..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                />
              </div>
              <select
                value={expenseCategoryFilter}
                onChange={e => setExpenseCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600"
              >
                <option value="all">All Types</option>
                <option value="food">Food</option>
                <option value="travel">Travel</option>
                <option value="groceries">Groceries</option>
                <option value="utilities">Utilities</option>
                <option value="entertainment">Fun</option>
              </select>
            </div>

            <button
              onClick={() => openAddExpenseModal(group.id)}
              className="px-4 py-2 rounded-xl bg-[#1E88E5] hover:bg-[#145DA0] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>

          {filteredGroupExpenses.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8">
              <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No matching expenses found</p>
              <p className="text-xs text-slate-400 mt-1">Split a bill, dinner, or ticket with your group.</p>
              <button
                onClick={() => openAddExpenseModal(group.id)}
                className="mt-4 px-4 py-2 rounded-xl bg-[#1E88E5] text-white text-xs font-bold"
              >
                + Add Expense
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGroupExpenses.map(expense => {
                const config = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.others;
                const payer = users.find(u => u.id === expense.paidBy);
                const isPaidByMe = expense.paidBy === currentUser.id;
                const mySplit = expense.splits.find(s => s.memberId === currentUser.id);

                return (
                  <div
                    key={expense.id}
                    className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: config.bgColor, color: config.textColor }}
                      >
                        <span className="font-bold text-xs uppercase">{expense.category.slice(0, 2)}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800 truncate">{expense.title}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                            {expense.splitMode} Split
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Paid by <strong className="text-slate-700">{isPaidByMe ? 'You' : payer?.name}</strong> • {new Date(expense.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-black text-[#145DA0] block">
                          {formatCurrency(expense.amount, currency)}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {mySplit ? `Your share: ${formatCurrency(mySplit.amount, currency)}` : 'Not in split'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openAddExpenseModal(group.id, expense)}
                          className="p-2 rounded-xl text-slate-400 hover:text-[#1E88E5] hover:bg-blue-50 transition-colors"
                          title="Edit Expense"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Smart Settlement */}
      {activeTab === 'settlement' && (
        <div className="space-y-6">
          {/* Settle info card */}
          <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#22C55E] text-white flex items-center justify-center shadow-md">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-emerald-900">
                  Minimum Settlement Flow
                </h4>
                <p className="text-xs text-emerald-700 font-medium mt-0.5">
                  Our smart graph algorithm reduces circular debts so you only need {smartTransactions.length} transfer{smartTransactions.length > 1 ? 's' : ''}.
                </p>
              </div>
            </div>

            <button
              onClick={() => openSettleModal(undefined, undefined, undefined, group.id)}
              className="px-4 py-2.5 rounded-xl bg-[#22C55E] hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all shrink-0"
            >
              Record Payment
            </button>
          </div>

          {/* Who Owes Whom List */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-base text-slate-800">Who Owes Whom in {group.name}</h4>

            {smartTransactions.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs font-medium">
                🎉 All balances are settled up in this group! No pending payments.
              </div>
            ) : (
              <div className="space-y-3">
                {smartTransactions.map((tx, idx) => {
                  const fromUser = users.find(u => u.id === tx.fromId);
                  const toUser = users.find(u => u.id === tx.toId);
                  const isUserDebtor = tx.fromId === currentUser.id;
                  const isUserCreditor = tx.toId === currentUser.id;

                  return (
                    <div
                      key={tx.id || idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={fromUser?.avatar}
                          alt={fromUser?.name}
                          className="w-9 h-9 rounded-xl object-cover ring-2 ring-red-300 shrink-0"
                        />
                        <span className="font-bold text-xs text-slate-800 truncate">
                          {fromUser?.name} {isUserDebtor && '(You)'}
                        </span>
                        <div className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[10px] font-bold uppercase">
                          owes
                        </div>
                        <img
                          src={toUser?.avatar}
                          alt={toUser?.name}
                          className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-300 shrink-0"
                        />
                        <span className="font-bold text-xs text-slate-800 truncate">
                          {toUser?.name} {isUserCreditor && '(You)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <span className="text-base font-black text-[#22C55E] mr-2">
                          {formatCurrency(tx.amount, currency)}
                        </span>

                        {/* UPI QR trigger */}
                        <button
                          onClick={() =>
                            setActiveQrModal({
                              toName: toUser?.name || 'Friend',
                              toUpi: toUser?.upiId || `${toUser?.name.toLowerCase().replace(/\s+/g, '')}@upi`,
                              amount: tx.amount,
                            })
                          }
                          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 shadow-xs"
                          title="Generate UPI QR Code"
                        >
                          <QrCode className="w-4 h-4 text-[#1E88E5]" />
                        </button>

                        {/* WhatsApp reminder */}
                        <button
                          onClick={() => sendWhatsAppReminder(fromUser?.name || 'Friend', tx.amount)}
                          className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 shadow-xs"
                          title="Send WhatsApp Reminder"
                        >
                          <Smartphone className="w-4 h-4 text-emerald-600" />
                        </button>

                        <button
                          onClick={() => openSettleModal(tx.fromId, tx.toId, tx.amount, group.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#1E88E5] hover:bg-[#145DA0] text-white text-xs font-bold shadow-sm transition-all"
                        >
                          Settle
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Members */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-800">Group Members & Net Balances</h3>
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#1E88E5] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Member
            </button>
          </div>

          {/* Add member modal/inline form */}
          {isAddMemberOpen && (
            <form
              onSubmit={handleAddMemberSubmit}
              className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3"
            >
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Add Member to {group.name}
              </h4>

              {nonGroupUsers.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Quick Pick from existing friends:
                  </label>
                  <select
                    value={selectedExistingUserId}
                    onChange={e => setSelectedExistingUserId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                  >
                    <option value="">-- Or enter new friend info below --</option>
                    {nonGroupUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!selectedExistingUserId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Member Name (e.g. Rahul Sharma)"
                    value={newMemberName}
                    onChange={e => setNewMemberName(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                    required={!selectedExistingUserId}
                  />
                  <input
                    type="email"
                    placeholder="Member Email (e.g. rahul@gmail.com)"
                    value={newMemberEmail}
                    onChange={e => setNewMemberEmail(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                    required={!selectedExistingUserId}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#1E88E5] text-white text-xs font-bold shadow-sm"
                >
                  Add to Group
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupMembers.map(member => {
              const memberNet = Math.round((netBalances[member.id] || 0) * 100) / 100;
              const isCurrentUser = member.id === currentUser.id;

              return (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-11 h-11 rounded-2xl object-cover shadow-sm ring-2 ring-slate-100"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{member.name}</h4>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-[#145DA0] text-[10px] font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{member.email}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Net Balance
                    </span>
                    {memberNet > 0 ? (
                      <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5 justify-end">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +{formatCurrency(memberNet, currency)}
                      </span>
                    ) : memberNet < 0 ? (
                      <span className="text-xs font-black text-red-600 flex items-center gap-0.5 justify-end">
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        -{formatCurrency(Math.abs(memberNet), currency)}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">Settled (₹0)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Group Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#1E88E5]" />
              Shared Notes & Reminders
            </h3>

            {/* Add note input */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder="Add a reminder (e.g. Resort booking ID: #8492, Wi-Fi: TripVilla2026)"
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-[#1E88E5] hover:bg-[#145DA0] text-white text-xs font-bold shadow-sm transition-colors"
              >
                Post Note
              </button>
            </form>

            <div className="space-y-2.5 pt-2">
              {(!group.notes || group.notes.length === 0) ? (
                <div className="py-8 text-center text-slate-400 text-xs font-medium">
                  No notes posted yet. Post flight codes, ticket numbers, or itinerary details above!
                </div>
              ) : (
                group.notes.map(note => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{note.text}</p>
                      <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                        Posted by {note.authorName} • {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteGroupNote(group.id, note.id)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Recurring */}
      {activeTab === 'recurring' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-800">Recurring Bills for {group.name}</h3>
            <button
              onClick={() => setCurrentView('recurring')}
              className="text-xs font-bold text-[#1E88E5] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Manage All Recurring
            </button>
          </div>

          {groupRecurring.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-slate-100 p-8">
              <CalendarClock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No recurring bills in this group</p>
              <p className="text-xs text-slate-400 mt-1">Set up monthly rent, utilities or subscriptions.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {groupRecurring.map(rec => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{rec.title}</h4>
                    <p className="text-xs text-slate-500">
                      Frequency: <strong className="capitalize">{rec.frequency}</strong> • Next Due: {rec.nextDueDate}
                    </p>
                  </div>
                  <span className="text-base font-black text-[#145DA0]">
                    {formatCurrency(rec.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Danger Zone: Delete Group */}
      <div className="pt-8 border-t border-slate-200/80 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Group Actions</h4>
          <p className="text-xs text-slate-400">Removing this group will delete all associated expense splits.</p>
        </div>
        <button
          onClick={() => deleteGroup(group.id)}
          className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          Delete Group
        </button>
      </div>

      {/* QR Code Modal */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E88E5] flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-800">Scan & Pay via UPI</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Pay <strong className="text-slate-800">{activeQrModal.toName}</strong>: {formatCurrency(activeQrModal.amount, currency)}
              </p>
            </div>

            {/* Authentic SVG UPI QR Code representation */}
            <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `upi://pay?pa=${activeQrModal.toUpi}&pn=${encodeURIComponent(activeQrModal.toName)}&am=${activeQrModal.amount}&cu=INR`
                )}`}
                alt="UPI QR Code"
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600">
              UPI ID: <span className="font-bold text-[#145DA0]">{activeQrModal.toUpi}</span>
            </div>

            <button
              onClick={() => setActiveQrModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
