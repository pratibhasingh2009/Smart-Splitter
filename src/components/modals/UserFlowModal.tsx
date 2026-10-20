import React from 'react';
import {
  X,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  Users,
  Receipt,
  PlusCircle,
  Scale,
  PieChart,
  RotateCw,
  LogIn,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageView } from '../../types';

export const UserFlowModal: React.FC = () => {
  const { isFlowModalOpen, closeFlowModal, setCurrentView, openAddExpenseModal } = useApp();

  if (!isFlowModalOpen) return null;

  const flowSteps: {
    id: string;
    view: PageView;
    title: string;
    description: string;
    icon: any;
    color: string;
  }[] = [
    {
      id: '1',
      view: 'landing',
      title: '1. Landing Page',
      description: 'Introduction, hero presentation, interactive split sandbox calculator, and feature breakdown.',
      icon: Layers,
      color: '#1E88E5',
    },
    {
      id: '2',
      view: 'login',
      title: '2. Register & Login',
      description: 'Secure user onboarding, sample 1-click profiles, and credential authentication.',
      icon: LogIn,
      color: '#145DA0',
    },
    {
      id: '3',
      view: 'dashboard',
      title: '3. Main Dashboard',
      description: 'Total balances (You Owe vs You Receive), quick actions, recent expenses, and active groups overview.',
      icon: LayoutDashboard,
      color: '#22C55E',
    },
    {
      id: '4',
      view: 'groups',
      title: '4. Groups & Details',
      description: 'Trips, flatmates, and friend circles with member management and group-specific balances.',
      icon: Users,
      color: '#F59E0B',
    },
    {
      id: '5',
      view: 'add-expense',
      title: '5. Add & Split Expense',
      description: 'Record expense with Equal, Percentage (%), and Custom (₹) splits with live validation.',
      icon: PlusCircle,
      color: '#EC4899',
    },
    {
      id: '6',
      view: 'settlement',
      title: '6. Smart Settlement',
      description: 'Greedy min-flow algorithm simplifications, "Who Owes Whom", and 1-click payment settlement.',
      icon: Scale,
      color: '#06B6D4',
    },
    {
      id: '7',
      view: 'analytics',
      title: '7. Analytics & Insights',
      description: 'Spending by category donut chart, highest spend category badge, and monthly spending comparisons.',
      icon: PieChart,
      color: '#8B5CF6',
    },
    {
      id: '8',
      view: 'recurring',
      title: '8. Recurring Subscriptions',
      description: 'Auto-split monthly rent, broadband, maid salaries, and entertainment subscriptions.',
      icon: RotateCw,
      color: '#10B981',
    },
  ];

  const handleNavigate = (view: PageView) => {
    closeFlowModal();
    if (view === 'add-expense') {
      openAddExpenseModal();
    } else {
      setCurrentView(view);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#145DA0] to-[#1E88E5] text-white flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg tracking-tight">
              Application Architecture & Navigation Flow
            </h3>
            <p className="text-xs text-white/80">
              Interactive roadmap connecting all user flows and features.
            </p>
          </div>
          <button
            onClick={closeFlowModal}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Grid */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-4">
          <p className="text-xs text-slate-500 font-semibold">
            Click on any page below to jump straight into that view:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {flowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => handleNavigate(step.view)}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#1E88E5] hover:shadow-md transition-all text-left group flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                      style={{ backgroundColor: step.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-sm text-slate-800 group-hover:text-[#145DA0] transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#1E88E5] group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs font-semibold text-[#145DA0] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F5B942] shrink-0" />
            <span>
              All state transitions, debt calculations, and split adjustments update synchronously across every view.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
