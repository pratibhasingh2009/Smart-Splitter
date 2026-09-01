import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateUserMetrics, formatCurrency } from '../../utils/settlementCalculator';

export const StatCards: React.FC = () => {
  const { currentUser, expenses, settlements, currency, setCurrentView } = useApp();
  const metrics = calculateUserMetrics(currentUser.id, expenses, settlements);

  const cards = [
    {
      id: 'stat-total-spending',
      title: 'Total Spending',
      amount: metrics.totalSpending,
      icon: Wallet,
      iconBg: 'bg-[#145DA0]',
      cardBg: 'bg-white',
      accentColor: 'text-[#145DA0]',
      trend: '↑ 12%',
      trendColor: 'text-[#1E88E5]',
      subtitle: 'This Month',
      onClick: () => setCurrentView('analytics'),
    },
    {
      id: 'stat-you-paid',
      title: 'You Paid',
      amount: metrics.youPaid,
      icon: ArrowUpRight,
      iconBg: 'bg-[#22C55E]',
      cardBg: 'bg-white',
      accentColor: 'text-[#22C55E]',
      trend: '↑ 8%',
      trendColor: 'text-[#22C55E]',
      subtitle: 'This Month',
      onClick: () => setCurrentView('expenses'),
    },
    {
      id: 'stat-you-owe',
      title: 'You Owe',
      amount: metrics.youOwe,
      icon: ArrowDownLeft,
      iconBg: 'bg-[#EF4444]',
      cardBg: 'bg-white',
      accentColor: 'text-[#EF4444]',
      trend: metrics.youOwe > 0 ? '↑ 5%' : 'Settled',
      trendColor: 'text-[#EF4444]',
      subtitle: 'This Month',
      onClick: () => setCurrentView('settlement'),
    },
    {
      id: 'stat-you-receive',
      title: 'You Receive',
      amount: metrics.youReceive,
      icon: Coins,
      iconBg: 'bg-[#F5B942]',
      cardBg: 'bg-white',
      accentColor: 'text-[#F5B942]',
      trend: metrics.youReceive > 0 ? '↑ 10%' : 'All Clear',
      trendColor: 'text-amber-600',
      subtitle: 'This Month',
      onClick: () => setCurrentView('settlement'),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            onClick={card.onClick}
            className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_25px_-4px_rgba(30,136,229,0.12)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative overflow-hidden group"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl ${card.iconBg} text-white flex items-center justify-center shadow-md shadow-black/10 shrink-0 group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-500 tracking-wide">
                  {card.title}
                </p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5 truncate">
                  {formatCurrency(card.amount, currency)}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 text-xs font-semibold">
                  <span className="text-slate-400">{card.subtitle}</span>
                  <span className={`font-bold flex items-center gap-0.5 ${card.trendColor}`}>
                    {card.trend}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
