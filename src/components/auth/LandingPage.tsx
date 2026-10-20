import React, { useState } from 'react';
import {
  Users,
  Zap,
  TrendingUp,
  RotateCw,
  Scale,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PieChart,
  Wallet,
  Coins,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/settlementCalculator';

export const LandingPage: React.FC = () => {
  const { setCurrentView, loginAsDemo, currency, openFlowModal } = useApp();

  // Mini live demo calculator on landing page
  const [demoAmount, setDemoAmount] = useState<number>(3000);
  const [demoPeople, setDemoPeople] = useState<number>(3);

  const handleLaunchDemo = () => {
    loginAsDemo('pratibha@gmail.com');
  };

  return (
    <div id="landing-page" className="min-h-screen bg-[#F3F8FF] text-slate-800 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#145DA0] text-white flex items-center justify-center shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-[#145DA0] leading-none">
              Personal
            </h1>
            <p className="text-xs font-bold text-slate-500">Budget Splitter</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openFlowModal}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-[#145DA0] hover:bg-blue-50 transition-colors"
          >
            <GitBranch className="w-4 h-4 text-[#F5B942]" />
            <span>Page Flow Guide</span>
          </button>
          <button
            id="landing-btn-login"
            onClick={() => setCurrentView('login')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-white transition-colors"
          >
            Login
          </button>
          <button
            id="landing-btn-register"
            onClick={() => setCurrentView('register')}
            className="px-5 py-2 rounded-xl bg-[#1E88E5] hover:bg-[#145DA0] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-105"
          >
            Sign Up Free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-[#145DA0] text-xs font-extrabold mb-6 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-[#F5B942]" />
          Smart Shared Expense Management & Debt Simplification
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-3xl leading-[1.15]">
          Split bills easily. Settle debts <span className="text-[#1E88E5]">smartly</span>.
        </h2>

        <p className="text-slate-600 font-medium text-base sm:text-lg mt-5 max-w-2xl leading-relaxed">
          Manage shared group expenses for roommates, trips, dinners, and events. Automatic calculations, equal, percentage & custom splits, with zero circular debts.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-8">
          <button
            id="btn-hero-launch-demo"
            onClick={handleLaunchDemo}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#1E88E5] hover:bg-[#145DA0] text-white font-black text-sm sm:text-base shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Explore Live Dashboard Demo</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            id="btn-hero-create-acc"
            onClick={() => setCurrentView('register')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm shadow-sm transition-all"
          >
            Create Free Account
          </button>
        </div>

        {/* Interactive Live Sandbox Preview */}
        <div className="mt-14 w-full max-w-3xl p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-2xl text-left">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-slate-400 ml-2">Quick Split Preview</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Live Interactive Math
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Total Bill Amount (₹)
              </label>
              <input
                type="number"
                value={demoAmount}
                onChange={e => setDemoAmount(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-black text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Number of Friends
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={demoPeople}
                onChange={e => setDemoPeople(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-black text-slate-800"
              />
            </div>

            <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-100 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-slate-500">Each Person Pays</span>
              <span className="text-2xl font-black text-[#145DA0]">
                {formatCurrency(Math.round(demoAmount / demoPeople), currency)}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Unique Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 text-left w-full">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#145DA0] flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#1E88E5]" />
            </div>
            <h4 className="font-extrabold text-base text-slate-800">1. Smart Settlement</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Eliminate circular debts. Our minimum-flow graph algorithm simplifies dozens of group transfers into the minimum transactions possible.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="font-extrabold text-base text-slate-800">2. Spending Insights</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Visual category donut charts, highest expense highlights, and month-over-month trend comparisons (+12%).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <RotateCw className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="font-extrabold text-base text-slate-800">3. Recurring Bills</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Manage ongoing flat rent, cook/maid salaries, WiFi, and streaming subscriptions with automatic monthly reminders.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Scale className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-extrabold text-base text-slate-800">4. Multiple Split Modes</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Flexible options: Split equally, by percentages (%), or exact custom currency amounts (₹) with real-time math validation.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
        <div>
          © 2026 Personal Budget Splitter. Designed with high-fidelity craft.
        </div>
        <div className="flex items-center gap-4">
          <button onClick={openFlowModal} className="hover:text-[#145DA0]">
            Architecture & Flow
          </button>
          <button onClick={handleLaunchDemo} className="hover:text-[#145DA0]">
            Interactive Demo
          </button>
        </div>
      </footer>
    </div>
  );
};
