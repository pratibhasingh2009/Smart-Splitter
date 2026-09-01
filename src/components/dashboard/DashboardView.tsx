import React, { useState } from 'react';
import { StatCards } from './StatCards';
import { RecentExpenses } from './RecentExpenses';
import { MyGroups } from './MyGroups';
import {
  ArrowRight,
  TrendingDown,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Zap,
  Target,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Share2,
  Users,
  CreditCard,
  Sparkles,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  calculateSmartSettlements,
  calculateUserMetrics,
  formatCurrency,
  getCategoryBreakdown,
} from '../../utils/settlementCalculator';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    expenses,
    settlements,
    groups,
    currency,
    monthlyBudget,
    setMonthlyBudget,
    setCurrentView,
    openAddExpenseModal,
    openCreateGroupModal,
    openSettleModal,
    clearAllData,
    loadDemoData,
  } = useApp();

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(monthlyBudget.toString());
  const [budgetSuccessToast, setBudgetSuccessToast] = useState(false);
  const [bannerToast, setBannerToast] = useState<string | null>(null);

  const showBannerToast = (msg: string) => {
    setBannerToast(msg);
    setTimeout(() => setBannerToast(null), 3000);
  };

  const metrics = calculateUserMetrics(currentUser.id, expenses, settlements);
  const smartTransactions = calculateSmartSettlements(expenses, settlements);
  const myReceivables = smartTransactions.filter(t => t.toId === currentUser.id);
  const myPayables = smartTransactions.filter(t => t.fromId === currentUser.id);
  const categoryStats = getCategoryBreakdown(expenses, currentUser.id);

  // Budget calculations
  const budgetSpent = metrics.youPaid;
  const budgetPercentage = Math.min(100, Math.round((budgetSpent / (monthlyBudget || 1)) * 100));
  const budgetRemaining = Math.max(0, monthlyBudget - budgetSpent);
  const isOverBudget = budgetSpent > monthlyBudget;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val > 0) {
      setMonthlyBudget(val);
      setIsEditingBudget(false);
      setBudgetSuccessToast(true);
      setTimeout(() => setBudgetSuccessToast(false), 2500);
    }
  };

  const sendWhatsAppReminder = (debtorName: string, amount: number) => {
    const text = encodeURIComponent(
      `Hi ${debtorName}, this is a gentle reminder from ${currentUser.name} via Personal Budget Splitter. You have a pending share balance of ${formatCurrency(amount, currency)}. You can pay via UPI to ${currentUser.upiId || 'my registered UPI'}. Thanks!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div id="dashboard-view" className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Perspective Simulator Bar */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
              Multi-User Perspective View
            </span>
            <p className="text-xs font-semibold text-white">
              Currently acting as <span className="text-blue-400 font-bold">{currentUser.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Switch view:</span>
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => switchUser(u.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentUser.id === u.id
                  ? 'bg-[#1E88E5] text-white shadow-sm ring-2 ring-blue-300/40'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover" />
              <span>{u.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Demo Data / Production Clean Mode Banner */}
      <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-white text-[#1E88E5] flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-800 block">
              {expenses.length > 0
                ? `Demo Mode Active (${expenses.length} sample expenses loaded)`
                : '✨ Clean Slate Mode (0 expenses — Ready for your live data)'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium block">
              {expenses.length > 0
                ? 'Want to use this for your real bills? Clear all demo data anytime in 1-click.'
                : 'Add your first real bill or reload demo sample data anytime.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {expenses.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear all demo data and start 100% fresh with 0 expenses?')) {
                  clearAllData();
                  showBannerToast('🧹 All demo data cleared! You are now in 100% fresh live mode.');
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200/80 text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:border-red-300 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Demo Data (Start Fresh)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                loadDemoData();
                showBannerToast('🔄 Demo sample dataset restored!');
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#145DA0] border border-blue-200/80 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Demo Sample Data</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => openAddExpenseModal()}
            className="px-3 py-1.5 rounded-xl bg-[#1E88E5] hover:bg-[#145DA0] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
          >
            <span>+ Add Real Bill</span>
          </button>
        </div>
      </div>

      {bannerToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{bannerToast}</span>
        </div>
      )}

      {/* Monthly Budget & Savings Target Tracker */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Monthly Spend Limit & Goal
                </span>
                <button
                  onClick={() => {
                    setTempBudget(monthlyBudget.toString());
                    setIsEditingBudget(true);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                  title="Edit Budget Target"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {budgetSuccessToast && (
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                    Updated!
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight mt-0.5">
                {formatCurrency(budgetSpent, currency)}{' '}
                <span className="text-xs font-semibold text-slate-400">
                  of {formatCurrency(monthlyBudget, currency)} budget
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-medium text-slate-400 block">Remaining Allowance</span>
              <span className={`text-base font-extrabold ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                {isOverBudget ? '-' : ''}{formatCurrency(isOverBudget ? budgetSpent - monthlyBudget : budgetRemaining, currency)}
              </span>
            </div>
            <div className={`px-3 py-1 rounded-xl text-xs font-extrabold ${
              isOverBudget
                ? 'bg-red-50 text-red-600 border border-red-200'
                : budgetPercentage > 80
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {budgetPercentage}% Spent
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-red-500'
                  : budgetPercentage > 80
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-[#145DA0] to-[#1E88E5]'
              }`}
              style={{ width: `${Math.min(100, budgetPercentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-1.5">
            <span>₹0 Start</span>
            {isOverBudget && (
              <span className="text-red-600 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Over budget by {formatCurrency(budgetSpent - monthlyBudget, currency)}
              </span>
            )}
            <span>Target: {formatCurrency(monthlyBudget, currency)}</span>
          </div>
        </div>

        {/* Edit Budget Modal / Dialog Inline */}
        {isEditingBudget && (
          <form onSubmit={handleSaveBudget} className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <label className="text-xs font-bold text-slate-700">Set Monthly Budget ({currency}):</label>
            <input
              type="number"
              value={tempBudget}
              onChange={e => setTempBudget(e.target.value)}
              className="w-36 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
              placeholder="e.g. 25000"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#1E88E5] text-white text-xs font-bold hover:bg-[#145DA0] transition-colors"
            >
              Save Goal
            </button>
            <button
              type="button"
              onClick={() => setIsEditingBudget(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* 4 Stat Metric Cards */}
      <StatCards />

      {/* Smart Settlement & Spending Insight Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Smart Settlement Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#145DA0] to-[#1E88E5] text-white shadow-lg shadow-blue-500/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#F5B942]" />
                Smart Settlement
              </span>
              <span className="text-xs text-white/80 font-medium">Optimal Net Flow</span>
            </div>

            <div className="mt-4">
              {metrics.youReceive > 0 ? (
                <div>
                  <p className="text-xs text-white/80 font-medium">You are in credit balance</p>
                  <h4 className="text-2xl font-black mt-0.5 text-white">
                    You will receive {formatCurrency(metrics.youReceive, currency)}
                  </h4>
                  <p className="text-xs text-white/90 mt-1">
                    Simplified across {myReceivables.length} payment{myReceivables.length > 1 ? 's' : ''} with 0 circular debts.
                  </p>

                  {/* Direct Reminder trigger */}
                  {myReceivables[0] && (
                    <div className="mt-3 pt-2">
                      <button
                        onClick={() => {
                          const debtor = users.find(u => u.id === myReceivables[0].fromId);
                          sendWhatsAppReminder(debtor?.name || 'Friend', myReceivables[0].amount);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Remind {users.find(u => u.id === myReceivables[0].fromId)?.name.split(' ')[0]} on WhatsApp</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : metrics.youOwe > 0 ? (
                <div>
                  <p className="text-xs text-white/80 font-medium">You have pending balance</p>
                  <h4 className="text-2xl font-black mt-0.5 text-amber-200">
                    You owe {formatCurrency(metrics.youOwe, currency)}
                  </h4>
                  <p className="text-xs text-white/90 mt-1">
                    Payable in {myPayables.length} simple transfer{myPayables.length > 1 ? 's' : ''}.
                  </p>

                  {/* Direct Settle trigger */}
                  {myPayables[0] && (
                    <div className="mt-3 pt-2">
                      <button
                        onClick={() => openSettleModal(currentUser.id, myPayables[0].toId, myPayables[0].amount)}
                        className="px-3 py-1.5 rounded-xl bg-[#F5B942] hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay {users.find(u => u.id === myPayables[0].toId)?.name.split(' ')[0]} Now</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-xs text-white/80 font-medium">All Clean!</p>
                  <h4 className="text-2xl font-black mt-0.5 text-white">All settled up 🎉</h4>
                  <p className="text-xs text-white/90 mt-1">
                    No active balances across all your groups.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between">
            <button
              onClick={() => setCurrentView('settlement')}
              className="text-xs font-bold text-[#F5B942] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>View Settlement Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-white/70">Algorithm Active</span>
          </div>
        </div>

        {/* Spending Category Insight */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-[#1E88E5]" />
                Top Spending Category
              </span>
              {categoryStats.highestCategory && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 font-bold text-[11px]">
                  {categoryStats.highestCategory.percentage}% of total
                </span>
              )}
            </div>

            <div className="mt-3">
              <h4 className="text-xl font-black text-slate-800">
                {categoryStats.highestCategory?.label || 'General Spending'}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Total spent: <span className="font-bold text-slate-700">{formatCurrency(categoryStats.highestCategory?.amount || 0, currency)}</span> across shared activities.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentView('analytics')}
              className="text-xs font-bold text-[#1E88E5] hover:text-[#145DA0] flex items-center gap-1"
            >
              <span>View Spending Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              On Track
            </span>
          </div>
        </div>

        {/* Quick Group Split Shortcut */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Split Modes Ready
              </span>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                3 Split Options
              </span>
            </div>

            <div className="mt-3">
              <h4 className="text-xl font-black text-slate-800">Equal, % or Custom</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Add an expense with instant automatic share recalculation, notes, and receipts.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={() => openAddExpenseModal()}
              className="flex-1 py-2 px-3 rounded-xl bg-[#1E88E5] hover:bg-[#145DA0] text-white text-xs font-bold text-center transition-colors shadow-sm"
            >
              + Add Expense
            </button>
            <button
              onClick={openCreateGroupModal}
              className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold text-center transition-colors"
            >
              + New Group
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Recent Expenses & My Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentExpenses />
        <MyGroups />
      </div>
    </div>
  );
};
