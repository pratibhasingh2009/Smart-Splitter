import React from 'react';
import {
  Users,
  Compass,
  Home,
  UserCheck,
  Plus,
  ArrowRight,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Group } from '../../types';
import { formatCurrency } from '../../utils/settlementCalculator';

export const MyGroups: React.FC = () => {
  const { groups, expenses, currency, setCurrentView, openCreateGroupModal } = useApp();

  const getGroupIcon = (category: string) => {
    switch (category) {
      case 'trip':
        return <Compass className="w-5 h-5" />;
      case 'home':
        return <Home className="w-5 h-5" />;
      case 'work':
        return <Briefcase className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const getGroupTotal = (groupId: string) => {
    return expenses
      .filter(e => e.groupId === groupId)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const displayGroups = groups.slice(0, 4);

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-slate-800 tracking-tight">My Groups</h3>
          <button
            id="btn-view-all-groups"
            onClick={() => setCurrentView('groups')}
            className="text-xs font-bold text-[#1E88E5] hover:text-[#145DA0] hover:underline flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Groups List */}
        <div className="space-y-3.5">
          {displayGroups.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              No groups yet. Click Create Group below to start splitting!
            </div>
          ) : (
            displayGroups.map((group, idx) => {
              const totalExp = getGroupTotal(group.id);
              return (
                <div
                  key={group.id}
                  id={`dashboard-group-card-${idx}`}
                  onClick={() => setCurrentView('group-details', group.id)}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/60 hover:bg-blue-50/60 border border-slate-100/80 hover:border-blue-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: group.color || '#1E88E5' }}
                    >
                      {getGroupIcon(group.category)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-[#1E88E5] transition-colors">
                        {group.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {group.members.length} Members
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                        Total Expense
                      </span>
                      <span className="text-sm font-extrabold text-[#145DA0] tracking-tight">
                        {formatCurrency(totalExp, currency)}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E88E5] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Action Button matching screenshot */}
      <div className="mt-6 pt-2">
        <button
          id="btn-create-group-dashboard"
          onClick={openCreateGroupModal}
          className="w-full py-3 px-4 rounded-2xl border-2 border-[#1E88E5] text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-500/20 active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Create Group</span>
        </button>
      </div>
    </div>
  );
};
