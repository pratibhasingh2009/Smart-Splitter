import React, { useState } from 'react';
import {
  Utensils,
  Plane,
  Home,
  ShoppingBag,
  Film,
  Zap,
  ShoppingCart,
  HeartPulse,
  MoreHorizontal,
  Plus,
  ArrowRight,
  Receipt,
  Search,
  Users,
  Info,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, Expense } from '../../types';
import { formatCurrency, CATEGORY_CONFIG } from '../../utils/settlementCalculator';

export const RecentExpenses: React.FC = () => {
  const { expenses, groups, users, currentUser, currency, setCurrentView, openAddExpenseModal } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeExpenseDetail, setActiveExpenseDetail] = useState<Expense | null>(null);

  const getCategoryIcon = (category: ExpenseCategory) => {
    switch (category) {
      case 'food':
        return <Utensils className="w-5 h-5" />;
      case 'travel':
        return <Plane className="w-5 h-5" />;
      case 'rent':
        return <Home className="w-5 h-5" />;
      case 'shopping':
        return <ShoppingBag className="w-5 h-5" />;
      case 'entertainment':
        return <Film className="w-5 h-5" />;
      case 'utilities':
        return <Zap className="w-5 h-5" />;
      case 'groceries':
        return <ShoppingCart className="w-5 h-5" />;
      case 'health':
        return <HeartPulse className="w-5 h-5" />;
      default:
        return <MoreHorizontal className="w-5 h-5" />;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const filteredExpenses = expenses
    .filter(e => {
      const matchSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCat = selectedCategory === 'all' || e.category === selectedCategory;
      return matchSearch && matchCat;
    })
    .slice(0, 5);

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between h-full">
      <div>
        {/* Header with Search and View All */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800 tracking-tight">Recent Expenses</h3>
            <p className="text-xs text-slate-400 font-medium">Click any bill to view split breakdown</p>
          </div>
          <button
            id="btn-view-all-expenses"
            onClick={() => setCurrentView('expenses')}
            className="text-xs font-bold text-[#1E88E5] hover:text-[#145DA0] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            View All ({expenses.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Search & Filter Chips */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search expenses..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
          >
            <option value="all">All Types</option>
            <option value="food">Food</option>
            <option value="travel">Travel</option>
            <option value="groceries">Groceries</option>
            <option value="utilities">Utilities</option>
            <option value="entertainment">Fun</option>
          </select>
        </div>

        {/* Expenses List */}
        <div className="space-y-2">
          {filteredExpenses.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs font-medium bg-slate-50/50 rounded-2xl">
              <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              No matching expenses found.
            </div>
          ) : (
            filteredExpenses.map((expense, idx) => {
              const config = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.others;
              const group = groups.find(g => g.id === expense.groupId);
              const payer = users.find(u => u.id === expense.paidBy);
              const isPaidByMe = expense.paidBy === currentUser.id;

              return (
                <div
                  key={expense.id}
                  id={`recent-expense-${idx}`}
                  onClick={() => setActiveExpenseDetail(expense)}
                  className={`flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200/60 transition-all`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: config.bgColor, color: config.textColor }}
                    >
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-[#1E88E5] transition-colors">
                        {expense.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium truncate">
                        {group?.name || 'General'} • Paid by <span className="font-semibold text-slate-700">{isPaidByMe ? 'You' : (payer?.name.split(' ')[0] || 'Friend')}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-semibold text-slate-400 block">
                      {formatDate(expense.date)}
                    </span>
                    <span className="text-xs font-black text-[#145DA0] tracking-tight">
                      {formatCurrency(expense.amount, currency)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Action Button matching screenshot outline style */}
      <div className="mt-5 pt-2">
        <button
          id="btn-add-expense-recent"
          onClick={() => openAddExpenseModal()}
          className="w-full py-2.5 px-4 rounded-2xl border-2 border-[#1E88E5] text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-500/20 active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Expense</span>
        </button>
      </div>

      {/* Split Details Popover / Modal */}
      {activeExpenseDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: CATEGORY_CONFIG[activeExpenseDetail.category]?.bgColor || '#EFF6FF',
                    color: CATEGORY_CONFIG[activeExpenseDetail.category]?.textColor || '#1E88E5',
                  }}
                >
                  {getCategoryIcon(activeExpenseDetail.category)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{activeExpenseDetail.title}</h3>
                  <span className="text-xs font-semibold text-slate-400">
                    {formatDate(activeExpenseDetail.date)} • {formatCurrency(activeExpenseDetail.amount, currency)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveExpenseDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Participants & Shares ({activeExpenseDetail.splitMode} split)
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeExpenseDetail.splits.map(split => {
                  const member = users.find(u => u.id === split.memberId);
                  const isPayer = activeExpenseDetail.paidBy === split.memberId;

                  return (
                    <div
                      key={split.memberId}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member?.avatar}
                          alt={member?.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800">
                            {member?.name} {member?.id === currentUser.id ? '(You)' : ''}
                          </span>
                          {isPayer && (
                            <span className="text-[10px] text-emerald-600 font-bold ml-1.5 bg-emerald-50 px-1.5 py-0.2 rounded">
                              Paid upfront
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-[#145DA0]">
                        {formatCurrency(split.amount, currency)}
                        {split.percentage ? ` (${split.percentage}%)` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {activeExpenseDetail.notes && (
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-600">
                <span className="font-bold text-[#145DA0] block mb-0.5">Notes / Memo:</span>
                {activeExpenseDetail.notes}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveExpenseDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
