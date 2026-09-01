import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Building,
  Smartphone,
  Coins,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/settlementCalculator';

export const SettlePaymentModal: React.FC = () => {
  const {
    settleModalState,
    closeSettleModal,
    users,
    groups,
    currency,
    recordSettlement,
  } = useApp();

  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [groupId, setGroupId] = useState('');
  const [method, setMethod] = useState<'upi' | 'cash' | 'bank_transfer' | 'other'>('upi');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (settleModalState.isOpen) {
      setFromId(settleModalState.fromId || users[1]?.id || users[0]?.id);
      setToId(settleModalState.toId || users[0]?.id);
      setAmount(settleModalState.amount ? settleModalState.amount.toString() : '');
      setGroupId(settleModalState.groupId || (groups[0]?.id || ''));
      setMethod('upi');
      setNotes('');
      setIsSuccess(false);
    }
  }, [settleModalState, users, groups]);

  if (!settleModalState.isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount <= 0 || fromId === toId) return;

    recordSettlement({
      fromId,
      toId,
      amount: parsedAmount,
      groupId: groupId || groups[0]?.id || 'general',
      method,
      notes: notes.trim(),
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      closeSettleModal();
    }, 1200);
  };

  const fromUser = users.find(u => u.id === fromId);
  const toUser = users.find(u => u.id === toId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            <h3 className="font-extrabold text-base tracking-tight">Record Debt Settlement</h3>
          </div>
          <button
            onClick={closeSettleModal}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-black text-xl text-slate-800">Settlement Recorded!</h4>
            <p className="text-xs text-slate-500 font-medium">
              Debt balances have been updated and simplified in real-time.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Visual Direction flow */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between gap-3 text-xs font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <img src={fromUser?.avatar} alt={fromUser?.name} className="w-7 h-7 rounded-full object-cover" />
                <span className="truncate max-w-[90px]">{fromUser?.name}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600" />
              <div className="flex items-center gap-2">
                <img src={toUser?.avatar} alt={toUser?.name} className="w-7 h-7 rounded-full object-cover" />
                <span className="truncate max-w-[90px]">{toUser?.name}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payer (From)
                </label>
                <select
                  value={fromId}
                  onChange={e => setFromId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:outline-none"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Receiver (To)
                </label>
                <select
                  value={toId}
                  onChange={e => setToId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:outline-none"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {method === 'upi' && toUser?.upiId && (
              <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#1E88E5]" />
                  <span className="font-bold text-slate-700">{toUser.name}'s UPI ID:</span>
                </div>
                <span className="font-mono font-bold text-[#145DA0] bg-white px-2.5 py-1 rounded-lg border border-blue-200 select-all">
                  {toUser.upiId}
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Settlement Amount ({currency})
              </label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 450"
                required
                min="1"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-black text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <select
                  value={method}
                  onChange={e => setMethod(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:outline-none uppercase"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="cash">Cash in Hand</option>
                  <option value="bank">Net Banking Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Group Context
                </label>
                <select
                  value={groupId}
                  onChange={e => setGroupId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:bg-white focus:outline-none"
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Notes / Reference ID (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. UPI Ref #409283109"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeSettleModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all"
              >
                Mark as Settled
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
