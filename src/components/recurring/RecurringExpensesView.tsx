import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  Zap,
  RotateCw,
  Home,
  Tv,
  Wifi,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RecurringExpense, ExpenseCategory, SplitMode } from '../../types';
import { formatCurrency, CATEGORY_CONFIG } from '../../utils/settlementCalculator';

export const RecurringExpensesView: React.FC = () => {
  const {
    recurringExpenses,
    groups,
    users,
    currentUser,
    currency,
    setCurrentView,
    addRecurringExpense,
    toggleRecurringStatus,
    deleteRecurringExpense,
    applyRecurringExpense,
  } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [category, setCategory] = useState<ExpenseCategory>('rent');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleLogNow = (rec: RecurringExpense) => {
    applyRecurringExpense(rec.id);
    showToast(`✅ "${rec.title}" (₹${rec.amount}) has been recorded in your Expenses list & next due date was updated!`);
  };

  const handleDelete = (rec: RecurringExpense) => {
    deleteRecurringExpense(rec.id);
    showToast(`🗑️ "${rec.title}" recurring subscription deleted.`);
  };

  const totalMonthlyCommitment = recurringExpenses
    .filter(r => r.status === 'active')
    .reduce((sum, r) => {
      if (r.frequency === 'weekly') return sum + r.amount * 4;
      if (r.frequency === 'yearly') return sum + Math.round(r.amount / 12);
      return sum + r.amount;
    }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(amount) || 0;
    if (!title.trim() || parsedAmt <= 0) return;

    const selectedGroup = groups.find(g => g.id === groupId);
    const memberIds = selectedGroup ? selectedGroup.members : [currentUser.id];
    const perHead = parsedAmt / memberIds.length;

    addRecurringExpense({
      title: title.trim(),
      amount: parsedAmt,
      category,
      groupId,
      paidBy: currentUser.id,
      splitMode: 'EQUAL',
      splits: memberIds.map(mId => ({ memberId: mId, amount: perHead })),
      frequency,
      nextDueDate,
      status: 'active',
    });

    setTitle('');
    setAmount('');
    setIsAddOpen(false);
  };

  return (
    <div id="recurring-expenses-view" className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Recurring Expenses
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#145DA0] text-xs font-bold">
              Auto-Split
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Automate routine shared bills such as rent, broadband, maids, and streaming platforms.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E88E5] hover:bg-[#145DA0] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Recurring Bill</span>
        </button>
      </div>

      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setCurrentView('expenses')}
            className="px-3 py-1 rounded-xl bg-white text-emerald-800 text-[11px] font-extrabold hover:bg-emerald-50 transition-colors shrink-0"
          >
            Go to Expenses →
          </button>
        </div>
      )}

      {/* Monthly Commitment Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#145DA0] to-[#1E88E5] text-white shadow-xl shadow-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur-md">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-white/80 tracking-wider">
              Total Monthly Commitment
            </span>
            <h3 className="text-2xl font-black text-white">
              {formatCurrency(totalMonthlyCommitment, currency)} / month
            </h3>
          </div>
        </div>

        <div className="text-xs text-white/90 font-medium bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md border border-white/15">
          {recurringExpenses.filter(r => r.status === 'active').length} active recurring subscriptions
        </div>
      </div>

      {/* Add Recurring Form Modal / Card */}
      {isAddOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-3xl bg-white border-2 border-[#1E88E5] shadow-lg space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-slate-800">
              Create New Recurring Subscription
            </h3>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Bill Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. WiFi Broadband"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Amount ({currency})
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="999"
                required
                min="1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Group
              </label>
              <select
                value={groupId}
                onChange={e => setGroupId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:outline-none"
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:outline-none"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Next Due Date
              </label>
              <input
                type="date"
                value={nextDueDate}
                onChange={e => setNextDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:outline-none capitalize"
              >
                {Object.keys(CATEGORY_CONFIG).map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#1E88E5] text-white text-xs font-extrabold shadow-sm"
            >
              Save Recurring Bill
            </button>
          </div>
        </form>
      )}

      {/* Recurring List */}
      <div className="space-y-4">
        {recurringExpenses.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <CalendarClock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h4 className="text-base font-bold text-slate-700">No recurring expenses set up</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Add your recurring bills to automatically split rent, subscriptions, and utilities.
            </p>
          </div>
        ) : (
          recurringExpenses.map(rec => {
            const group = groups.find(g => g.id === rec.groupId);
            const config = CATEGORY_CONFIG[rec.category] || CATEGORY_CONFIG.others;
            const isPaused = rec.status === 'paused';

            return (
              <div
                key={rec.id}
                className={`p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isPaused ? 'opacity-65' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: config.bgColor, color: config.textColor }}
                  >
                    <RotateCw className="w-6 h-6" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-slate-800 truncate">
                        {rec.title}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase">
                        {rec.frequency}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isPaused ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Group: <strong className="text-slate-700">{group?.name || 'General'}</strong> • Next Due Date:{' '}
                      <span className="font-bold text-[#145DA0]">{rec.nextDueDate}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <span className="text-xl font-black text-[#145DA0]">
                    {formatCurrency(rec.amount, currency)}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLogNow(rec)}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-[#1E88E5] text-[#1E88E5] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                      title="Add this bill to Expenses list for this month"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Log Now</span>
                    </button>

                    <button
                      onClick={() => toggleRecurringStatus(rec.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                      title={isPaused ? 'Resume' : 'Pause'}
                    >
                      {isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4 text-amber-600" />}
                    </button>

                    <button
                      onClick={() => handleDelete(rec)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete Recurring Bill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
