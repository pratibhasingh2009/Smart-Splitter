import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Receipt,
  Calendar,
  Utensils,
  Plane,
  Home,
  ShoppingBag,
  Film,
  Zap,
  ShoppingCart,
  HeartPulse,
  MoreHorizontal,
  Edit2,
  Trash2,
  Users,
  ChevronDown,
  FileSpreadsheet,
  Eye,
  FileText,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, Expense } from '../../types';
import {
  CATEGORY_CONFIG,
  formatCurrency,
} from '../../utils/settlementCalculator';

export const ExpenseHistoryView: React.FC = () => {
  const {
    expenses,
    groups,
    users,
    currentUser,
    currency,
    openAddExpenseModal,
    deleteExpense,
    exportData,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [previewExpense, setPreviewExpense] = useState<Expense | null>(null);

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'food': return <Utensils className="w-5 h-5" />;
      case 'travel': return <Plane className="w-5 h-5" />;
      case 'rent': return <Home className="w-5 h-5" />;
      case 'shopping': return <ShoppingBag className="w-5 h-5" />;
      case 'entertainment': return <Film className="w-5 h-5" />;
      case 'utilities': return <Zap className="w-5 h-5" />;
      case 'groceries': return <ShoppingCart className="w-5 h-5" />;
      case 'health': return <HeartPulse className="w-5 h-5" />;
      default: return <MoreHorizontal className="w-5 h-5" />;
    }
  };

  // Filter & Sort
  const filteredExpenses = expenses
    .filter(exp => {
      const payer = users.find(u => u.id === exp.paidBy)?.name || '';
      const group = groups.find(g => g.id === exp.groupId)?.name || '';
      const matchesSearch =
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || exp.category === selectedCategory;
      const matchesGrp = selectedGroup === 'all' || exp.groupId === selectedGroup;

      return matchesSearch && matchesCat && matchesGrp;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'highest') return b.amount - a.amount;
      if (sortBy === 'lowest') return a.amount - b.amount;
      return 0;
    });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div id="expense-history-view" className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Expense History</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Complete transaction ledger with split details, receipts, and category filters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportData('csv')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            id="btn-add-expense-history"
            onClick={() => openAddExpenseModal()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E88E5] hover:bg-[#145DA0] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search expenses, notes, payers..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="food">Food & Dining</option>
            <option value="travel">Travel & Flights</option>
            <option value="rent">Rent & Stay</option>
            <option value="shopping">Shopping</option>
            <option value="entertainment">Entertainment</option>
            <option value="utilities">Utilities & Bills</option>
            <option value="groceries">Groceries</option>
            <option value="health">Health</option>
            <option value="others">Others</option>
          </select>

          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">All Groups</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>

        {/* Summary tag */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-700">{filteredExpenses.length}</strong> transactions
          </span>
          <span>
            Filtered Total:{' '}
            <strong className="text-[#145DA0] text-sm font-black">
              {formatCurrency(totalFilteredAmount, currency)}
            </strong>
          </span>
        </div>
      </div>

      {/* Expense Ledger List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h4 className="text-base font-bold text-slate-700">No matching expenses found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search keywords or category filters.
            </p>
          </div>
        ) : (
          filteredExpenses.map(expense => {
            const config = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.others;
            const payer = users.find(u => u.id === expense.paidBy);
            const group = groups.find(g => g.id === expense.groupId);
            const isPaidByMe = expense.paidBy === currentUser.id;
            const mySplit = expense.splits.find(s => s.memberId === currentUser.id);

            return (
              <div
                key={expense.id}
                className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: config.bgColor, color: config.textColor }}
                  >
                    {getCategoryIcon(expense.category)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-black text-slate-800 tracking-tight">
                        {expense.title}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase">
                        {expense.splitMode}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E88E5] text-[10px] font-extrabold">
                        {group?.name || 'General'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Paid by <strong className="text-slate-700">{isPaidByMe ? 'You' : payer?.name}</strong> • Date:{' '}
                      <span className="font-semibold">{new Date(expense.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      {expense.notes && ` • "${expense.notes}"`}
                    </p>

                    {/* Participant split breakdown chips */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Splits:</span>
                      {expense.splits.map(s => {
                        const member = users.find(u => u.id === s.memberId);
                        const isMe = s.memberId === currentUser.id;
                        return (
                          <span
                            key={s.memberId}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              isMe ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {member?.name.split(' ')[0]}: {formatCurrency(s.amount, currency)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <div className="text-right">
                    <span className="text-lg font-black text-[#145DA0] block">
                      {formatCurrency(expense.amount, currency)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {mySplit ? `Your share: ${formatCurrency(mySplit.amount, currency)}` : 'You were excluded'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {expense.receiptUrl && (
                      <button
                        onClick={() => setPreviewExpense(expense)}
                        className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1E88E5] font-bold text-xs flex items-center gap-1 transition-colors"
                        title="View Attached Receipt / Bill"
                      >
                        <Receipt className="w-4 h-4" />
                        <span className="hidden sm:inline">Receipt</span>
                      </button>
                    )}
                    <button
                      onClick={() => openAddExpenseModal(expense.groupId, expense)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-[#1E88E5] transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete Expense"
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

      {/* Full Preview Modal for Receipt */}
      {previewExpense && previewExpense.receiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">
                  {previewExpense.title} - Receipt
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {previewExpense.receiptName || 'Attached Document'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewExpense(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-2xl bg-slate-50 flex items-center justify-center p-2 border border-slate-200">
              {previewExpense.receiptType === 'pdf' ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    {previewExpense.receiptName || 'PDF Document'}
                  </p>
                  <a
                    href={previewExpense.receiptUrl}
                    download={previewExpense.receiptName || 'receipt.pdf'}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E88E5] text-white text-xs font-bold shadow-md hover:bg-[#145DA0] transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download / Open PDF
                  </a>
                </div>
              ) : (
                <img
                  src={previewExpense.receiptUrl}
                  alt={previewExpense.title}
                  className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-sm"
                />
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewExpense(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
