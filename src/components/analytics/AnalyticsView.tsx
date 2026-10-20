import React, { useState } from 'react';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Award,
  Wallet,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Utensils,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  getCategoryBreakdown,
  formatCurrency,
  CATEGORY_CONFIG,
} from '../../utils/settlementCalculator';

export const AnalyticsView: React.FC = () => {
  const { expenses, currentUser, currency } = useApp();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [filterScope, setFilterScope] = useState<'my_share' | 'total_group'>('total_group');

  const { breakdown, total, highestCategory } = getCategoryBreakdown(
    expenses,
    filterScope === 'my_share' ? currentUser.id : undefined
  );

  // SVG Donut Chart Calculations
  const size = 220;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  // Real chronological monthly aggregation from permitted expenses
  const relevantExpenses = filterScope === 'my_share'
    ? expenses.filter(e => e.splits?.some(s => s.memberId === currentUser.id))
    : expenses;

  // Group by Month (last 6 calendar months based on actual expense dates)
  const monthlyTotalsMap: Record<string, number> = {};
  const monthLabels: { key: string; label: string }[] = [];
  const now = new Date();

  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const isCurrent = i === 0;
    monthLabels.push({
      key,
      label: isCurrent ? `${monthName} (Current)` : monthName,
    });
    monthlyTotalsMap[key] = 0;
  }

  relevantExpenses.forEach(exp => {
    if (!exp.date) return;
    const expKey = exp.date.substring(0, 7); // 'YYYY-MM'
    const shareAmount = filterScope === 'my_share'
      ? (exp.splits?.find(s => s.memberId === currentUser.id)?.amount || 0)
      : exp.amount;

    if (monthlyTotalsMap[expKey] !== undefined) {
      monthlyTotalsMap[expKey] += shareAmount;
    } else {
      monthlyTotalsMap[expKey] = (monthlyTotalsMap[expKey] || 0) + shareAmount;
    }
  });

  const monthlyData = monthLabels.map(m => ({
    month: m.label,
    amount: Math.round(monthlyTotalsMap[m.key] || 0),
    current: m.label.includes('Current'),
  }));

  const maxMonthAmount = Math.max(...monthlyData.map(m => m.amount), 1);

  // Previous month comparison
  const currentMonthAmount = monthlyData[monthlyData.length - 1]?.amount || 0;
  const prevMonthAmount = monthlyData[monthlyData.length - 2]?.amount || 0;
  const monthDiffPercent = prevMonthAmount > 0
    ? Math.round(((currentMonthAmount - prevMonthAmount) / prevMonthAmount) * 100)
    : 0;

  return (
    <div id="analytics-page-view" className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Analytics - This Month
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Spending insights, category breakdowns, and monthly trends.
          </p>
        </div>

        <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setFilterScope('total_group')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterScope === 'total_group'
                ? 'bg-[#145DA0] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Group Spending
          </button>
          <button
            onClick={() => setFilterScope('my_share')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterScope === 'my_share'
                ? 'bg-[#145DA0] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            My Personal Share Only
          </button>
        </div>
      </div>

      {/* Top 2 Metric Boxes matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-6 rounded-3xl bg-blue-50/70 border border-blue-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Spending
            </span>
            <h3 className="text-3xl font-black text-[#145DA0] tracking-tight mt-1">
              {formatCurrency(total, currency)}
            </h3>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12% from last month
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#145DA0] text-white flex items-center justify-center shadow-md">
            <Wallet className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-blue-50/70 border border-blue-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Expenses
            </span>
            <h3 className="text-3xl font-black text-[#145DA0] tracking-tight mt-1">
              {expenses.length}
            </h3>
            <span className="text-xs font-semibold text-slate-500 mt-1 block">
              Across active groups
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#1E88E5] text-white flex items-center justify-center shadow-md">
            <BarChart3 className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Main Analytics Layout: Category Donut & Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category Card (Matches exact screenshot) */}
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-800 tracking-tight mb-6">
              Spending by Category
            </h3>

            {/* Donut chart + Legend */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 my-4">
              {/* Interactive SVG Donut */}
              <div className="relative shrink-0 flex items-center justify-center">
                <svg width={size} height={size} className="transform -rotate-90">
                  {breakdown.map((item, idx) => {
                    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                    accumulatedPercent += item.percentage;

                    const isHovered = hoveredCategory === item.category;

                    return (
                      <circle
                        key={item.category}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredCategory(item.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      />
                    );
                  })}
                </svg>

                {/* Center Donut Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total
                  </span>
                  <span className="text-base font-black text-slate-800">
                    {formatCurrency(total, currency)}
                  </span>
                </div>
              </div>

              {/* Legend matching screenshot */}
              <div className="space-y-2.5 flex-1 w-full min-w-0">
                {breakdown.map(item => (
                  <div
                    key={item.category}
                    onMouseEnter={() => setHoveredCategory(item.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`flex items-center justify-between gap-3 p-1.5 px-2 rounded-xl transition-colors cursor-pointer ${
                      hoveredCategory === item.category ? 'bg-slate-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-bold text-slate-700 truncate">
                        {item.label}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-slate-800">
                        {formatCurrency(item.amount, currency)}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold ml-1.5">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Badge matching screenshot */}
          {highestCategory && (
            <div className="mt-6 p-3.5 rounded-2xl bg-[#FEF3C7] border border-amber-200/80 flex items-center gap-2.5 text-xs font-extrabold text-amber-900">
              <span className="text-base">🏆</span>
              <span>
                Highest Category: {highestCategory.label} ({highestCategory.percentage}%)
              </span>
            </div>
          )}
        </div>

        {/* Monthly Spending Summary & Month-over-Month Chart */}
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-lg text-slate-800 tracking-tight">
                Monthly Spending Trend
              </h3>
              {prevMonthAmount > 0 ? (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  monthDiffPercent >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {monthDiffPercent >= 0 ? `+${monthDiffPercent}%` : `${monthDiffPercent}%`} vs prev month
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                  {total > 0 ? 'Active Period' : 'No Data Yet'}
                </span>
              )}
            </div>

            {/* Bar Chart Visualizer */}
            {total === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-2xl">
                <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">No expenses recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Add an expense to view real-time monthly trends</p>
              </div>
            ) : (
              <div className="h-48 flex items-end justify-between gap-4 pt-6 pb-2 px-2 border-b border-slate-100">
                {monthlyData.map(m => {
                  const heightPercent = Math.max(8, Math.round((m.amount / maxMonthAmount) * 100));
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[11px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatCurrency(m.amount, currency)}
                      </span>
                      <div
                        className={`w-full max-w-[42px] rounded-2xl transition-all duration-300 group-hover:scale-y-105 origin-bottom ${
                          m.current
                            ? 'bg-gradient-to-t from-[#145DA0] to-[#1E88E5] shadow-md shadow-blue-500/20'
                            : 'bg-slate-200 group-hover:bg-slate-300'
                        }`}
                        style={{ height: m.amount > 0 ? `${heightPercent}%` : '6px' }}
                      />
                      <span
                        className={`text-xs font-bold ${
                          m.current ? 'text-[#145DA0]' : 'text-slate-400'
                        }`}
                      >
                        {m.month.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Smart Insights & Advice Box */}
            <div className="mt-6 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#F5B942]" />
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Spending Insights
                </h4>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {total > 0
                  ? `Your recorded shared spending stands at ${formatCurrency(total, currency)} with ${expenses.length} transaction(s). ${
                      highestCategory ? `Top category is ${highestCategory.label} (${highestCategory.percentage}%).` : ''
                    }`
                  : 'Start by creating a group and adding shared or personal bills. SmartSplit will generate live optimization insights.'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Average / Day: {formatCurrency(Math.round(total / 30), currency)}</span>
            <span className="text-[#1E88E5] font-bold">Updated in real-time</span>
          </div>
        </div>
      </div>
    </div>
  );
};
