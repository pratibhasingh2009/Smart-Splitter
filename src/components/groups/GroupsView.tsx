import React, { useState } from 'react';
import {
  Users,
  Compass,
  Home,
  Briefcase,
  Plus,
  Search,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Group } from '../../types';
import {
  formatCurrency,
  calculateNetBalances,
} from '../../utils/settlementCalculator';

export const GroupsView: React.FC = () => {
  const {
    groups,
    expenses,
    settlements,
    currentUser,
    currency,
    setCurrentView,
    openCreateGroupModal,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredGroups = groups.filter(g => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'all' || g.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const getGroupIcon = (category: string) => {
    switch (category) {
      case 'trip':
        return <Compass className="w-6 h-6" />;
      case 'home':
        return <Home className="w-6 h-6" />;
      case 'work':
        return <Briefcase className="w-6 h-6" />;
      default:
        return <Users className="w-6 h-6" />;
    }
  };

  return (
    <div id="groups-page-view" className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Bar matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">My Groups</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage your shared expenses, trips, flats, and projects.
          </p>
        </div>

        <button
          id="btn-create-group-header"
          onClick={openCreateGroupModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E88E5] hover:bg-[#145DA0] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Create Group</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search groups by name or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'trip', 'home', 'friends'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                filterCategory === cat
                  ? 'bg-[#145DA0] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'All Groups' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Groups Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGroups.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h4 className="text-base font-bold text-slate-700">No groups found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search term or clear the filter.'
                : 'Create your first group to start splitting bills and expenses with friends!'}
            </p>
            <button
              onClick={openCreateGroupModal}
              className="mt-4 px-4 py-2 rounded-xl bg-[#1E88E5] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Group
            </button>
          </div>
        ) : (
          filteredGroups.map(group => {
            const groupExpenses = expenses.filter(e => e.groupId === group.id);
            const totalExp = groupExpenses.reduce((sum, e) => sum + e.amount, 0);
            const netBalances = calculateNetBalances(expenses, settlements, group.id);
            const myNet = Math.round((netBalances[currentUser.id] || 0) * 100) / 100;

            return (
              <div
                key={group.id}
                id={`group-card-${group.id}`}
                onClick={() => setCurrentView('group-details', group.id)}
                className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_25px_-4px_rgba(30,136,229,0.12)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: group.color || '#1E88E5' }}
                    >
                      {getGroupIcon(group.category)}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                      {group.category}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-black text-slate-800 group-hover:text-[#1E88E5] transition-colors truncate">
                      {group.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1 min-h-[32px]">
                      {group.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Financial Overview */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Total Expense
                      </span>
                      <span className="text-base font-black text-[#145DA0]">
                        {formatCurrency(totalExp, currency)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Your Balance
                      </span>
                      {myNet > 0 ? (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 justify-end">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          +{formatCurrency(myNet, currency)}
                        </span>
                      ) : myNet < 0 ? (
                        <span className="text-xs font-bold text-red-600 flex items-center gap-0.5 justify-end">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          -{formatCurrency(Math.abs(myNet), currency)}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-500">
                          Settled (₹0)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{group.members.length} Members</span>
                  </div>

                  <span className="text-xs font-bold text-[#1E88E5] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
