import React, { useState } from 'react';
import {
  Scale,
  ArrowRight,
  CheckCircle2,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  History,
  CreditCard,
  Building,
  Smartphone,
  ShieldCheck,
  QrCode,
  Download,
  Trash2,
  FileSpreadsheet,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  calculateSmartSettlements,
  calculateNetBalances,
  calculateUserMetrics,
  formatCurrency,
} from '../../utils/settlementCalculator';

export const SettlementView: React.FC = () => {
  const {
    expenses,
    settlements,
    groups,
    users,
    currentUser,
    currency,
    openSettleModal,
    deleteSettlement,
  } = useApp();

  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [activeQrModal, setActiveQrModal] = useState<{ toName: string; toUpi: string; amount: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteSettlement = (id: string, amount: number) => {
    deleteSettlement(id);
    showToast(`🗑️ Settlement payment record removed.`);
  };

  const activeGroupId = selectedGroupFilter === 'all' ? undefined : selectedGroupFilter;
  const metrics = calculateUserMetrics(currentUser.id, expenses, settlements);
  const smartTransactions = calculateSmartSettlements(expenses, settlements, activeGroupId);
  const netBalances = calculateNetBalances(expenses, settlements, activeGroupId);

  const filteredSettlementHistory = activeGroupId
    ? settlements.filter(s => s.groupId === activeGroupId)
    : settlements;

  const currentGroupName = activeGroupId
    ? groups.find(g => g.id === activeGroupId)?.name
    : 'All Groups';

  const sendWhatsAppReminder = (debtorName: string, amount: number, creditorName: string, upi: string) => {
    const text = encodeURIComponent(
      `Hi ${debtorName}, this is a friendly balance settlement reminder from ${creditorName} via Personal Budget Splitter. You have a pending share of ${formatCurrency(amount, currency)}. Pay via UPI: ${upi || 'my registered UPI'}. Thank you!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const exportSettlementsReport = () => {
    const headers = ['From Member', 'To Member', 'Amount', 'Date', 'Payment Method', 'Group'];
    const rows = settlements.map(s => [
      users.find(u => u.id === s.fromId)?.name || s.fromId,
      users.find(u => u.id === s.toId)?.name || s.toId,
      s.amount,
      s.date,
      s.method,
      groups.find(g => g.id === s.groupId)?.name || 'Direct / General',
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settlement_history_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div id="settlement-page-view" className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-lg flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Group Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Settlement - {currentGroupName}
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Smart Flow
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Minimal-flow debt simplification to clear shared expenses with the fewest transactions.
          </p>
        </div>

        {/* Group Selector Dropdown & Export */}
        <div className="flex items-center gap-2">
          <select
            value={selectedGroupFilter}
            onChange={e => setSelectedGroupFilter(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
          >
            <option value="all">Across All Groups</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <button
            onClick={exportSettlementsReport}
            className="px-3 py-2 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
            title="Export Settlement Report (CSV)"
          >
            <Download className="w-3.5 h-3.5 text-[#1E88E5]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Highlights Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        {metrics.youReceive > 0 ? (
          <div className="p-5 rounded-2xl bg-[#DCFCE7] border border-emerald-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#22C55E] text-white flex items-center justify-center shadow-md">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Overall Settlement Status
                </p>
                <h3 className="text-2xl font-black text-emerald-950 tracking-tight">
                  You will receive {formatCurrency(metrics.youReceive, currency)}
                </h3>
              </div>
            </div>

            <button
              onClick={() => openSettleModal(undefined, currentUser.id, metrics.youReceive, activeGroupId)}
              className="px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all shrink-0"
            >
              Record Received
            </button>
          </div>
        ) : metrics.youOwe > 0 ? (
          <div className="p-5 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EF4444] text-white flex items-center justify-center shadow-md">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
                  Pending Settlement
                </p>
                <h3 className="text-2xl font-black text-red-900 tracking-tight">
                  You owe {formatCurrency(metrics.youOwe, currency)}
                </h3>
              </div>
            </div>

            <button
              onClick={() => openSettleModal(currentUser.id, undefined, metrics.youOwe, activeGroupId)}
              className="px-5 py-2.5 rounded-xl bg-[#EF4444] hover:bg-red-600 text-white font-bold text-xs shadow-md transition-all shrink-0"
            >
              Pay & Settle
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1E88E5] text-white flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                All Settled Up
              </p>
              <h3 className="text-2xl font-black text-blue-950 tracking-tight">
                No outstanding balances 🎉
              </h3>
            </div>
          </div>
        )}

        {/* Who Owes Whom */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-extrabold text-lg text-slate-800 tracking-tight">
              Who Owes Whom (Graph Simplification)
            </h4>
            <span className="text-xs font-bold text-slate-500">
              {smartTransactions.length} simplified transfer{smartTransactions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {smartTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
              <p className="font-bold text-sm text-slate-700">All balances are completely squared away!</p>
              <p className="text-xs text-slate-400 mt-1">There are no pending debts in this group.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {smartTransactions.map((tx, idx) => {
                const fromUser = users.find(u => u.id === tx.fromId);
                const toUser = users.find(u => u.id === tx.toId);
                const isFromMe = tx.fromId === currentUser.id;
                const isToMe = tx.toId === currentUser.id;
                const creditorUpi = toUser?.upiId || `${toUser?.name.toLowerCase().replace(/\s+/g, '')}@okaxis`;

                return (
                  <div
                    key={tx.id || idx}
                    id={`settlement-row-${idx}`}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      isToMe
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : isFromMe
                        ? 'bg-red-50/40 border-red-200'
                        : 'bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    {/* Left: From User -> To User */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center gap-2">
                        <img
                          src={fromUser?.avatar}
                          alt={fromUser?.name}
                          className="w-9 h-9 rounded-xl object-cover ring-2 ring-red-200"
                        />
                        <span className="font-bold text-sm text-slate-800 truncate">
                          {fromUser?.name} {isFromMe && '(You)'}
                        </span>
                      </div>

                      <div className="flex items-center text-slate-400">
                        <ArrowRight className="w-4 h-4" />
                      </div>

                      <div className="flex items-center gap-2">
                        <img
                          src={toUser?.avatar}
                          alt={toUser?.name}
                          className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-200"
                        />
                        <span className="font-bold text-sm text-slate-800 truncate">
                          {toUser?.name} {isToMe && '(You)'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Amount & Actions (UPI QR, WhatsApp, Settle) */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                      <span className="text-lg font-black text-[#22C55E] mr-1">
                        {formatCurrency(tx.amount, currency)}
                      </span>

                      {/* QR Code */}
                      <button
                        onClick={() =>
                          setActiveQrModal({
                            toName: toUser?.name || 'Friend',
                            toUpi: creditorUpi,
                            amount: tx.amount,
                          })
                        }
                        className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 shadow-xs"
                        title="Generate UPI QR Code"
                      >
                        <QrCode className="w-4 h-4 text-[#1E88E5]" />
                      </button>

                      {/* WhatsApp Reminder */}
                      <button
                        onClick={() =>
                          sendWhatsAppReminder(
                            fromUser?.name || 'Friend',
                            tx.amount,
                            toUser?.name || currentUser.name,
                            creditorUpi
                          )
                        }
                        className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 shadow-xs"
                        title="Send WhatsApp Reminder"
                      >
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                      </button>

                      <button
                        id={`btn-settle-tx-${idx}`}
                        onClick={() => openSettleModal(tx.fromId, tx.toId, tx.amount, tx.groupId)}
                        className="px-4 py-2 rounded-xl bg-[#1E88E5] hover:bg-[#145DA0] text-white font-bold text-xs shadow-sm hover:shadow transition-all"
                      >
                        Settle Payment
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Explanation Footer */}
          <div className="mt-6 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs font-semibold text-[#145DA0] flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-[#F5B942] shrink-0" />
            <span>Smart settlement eliminates circular payments (A owes B, B owes C is converted into A owes C).</span>
          </div>
        </div>
      </div>

      {/* Net Balances Overview Grid */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-extrabold text-base text-slate-800">Member Net Position</h4>
            <p className="text-xs text-slate-500 font-medium">
              Real-time summary of who is owed money and who owes money across all expenses.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-100">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              -₹ Amount: Debtor (Must Pay)
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              +₹ Amount: Creditor (Will Receive)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {users.map(u => {
            const net = Math.round((netBalances[u.id] || 0) * 100) / 100;
            return (
              <div
                key={u.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-white shadow-xs" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate block">{u.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {net > 0 ? 'To receive' : net < 0 ? 'Owes group' : 'All clear'}
                    </span>
                  </div>
                </div>
                <div>
                  {net > 0 ? (
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      +{formatCurrency(net, currency)}
                    </span>
                  ) : net < 0 ? (
                    <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200">
                      -{formatCurrency(Math.abs(net), currency)}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-lg">
                      Settled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Settlement History */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-[#1E88E5]" />
              Settlement Payment History
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Click the trash icon on any record to delete or undo that settlement.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {filteredSettlementHistory.length} records
          </span>
        </div>

        {filteredSettlementHistory.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No settlement records</p>
            <p className="text-[11px] text-slate-400">
              When someone pays their share and clicks "Settle Payment", the transaction record will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSettlementHistory.map(rec => {
              const fromUser = users.find(u => u.id === rec.fromId);
              const toUser = users.find(u => u.id === rec.toId);
              const group = groups.find(g => g.id === rec.groupId);
              const isInvalid = !rec.amount || isNaN(rec.amount) || !fromUser || !toUser;

              return (
                <div key={rec.id} className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">
                      {fromUser ? fromUser.name : 'Unknown Member'} paid {toUser ? toUser.name : 'Unknown Member'}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                      <span>{rec.date ? new Date(rec.date).toLocaleDateString() : 'Recent'}</span>
                      <span>•</span>
                      <span>Method: <strong className="uppercase text-slate-600">{rec.method || 'UPI'}</strong></span>
                      <span>•</span>
                      <span>{group?.name || 'General Group'}</span>
                      {rec.notes && <span>• <em>{rec.notes}</em></span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {isInvalid ? (
                      <span className="font-bold text-amber-600 text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Invalid Record
                      </span>
                    ) : (
                      <span className="font-extrabold text-emerald-600 text-sm">
                        {formatCurrency(rec.amount, currency)}
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteSettlement(rec.id, rec.amount || 0)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-all cursor-pointer shadow-2xs"
                      title="Delete this settlement record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E88E5] flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-800">Scan & Pay via UPI</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Pay <strong className="text-slate-800">{activeQrModal.toName}</strong>: {formatCurrency(activeQrModal.amount, currency)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `upi://pay?pa=${activeQrModal.toUpi}&pn=${encodeURIComponent(activeQrModal.toName)}&am=${activeQrModal.amount}&cu=INR`
                )}`}
                alt="UPI QR Code"
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600">
              UPI ID: <span className="font-bold text-[#145DA0]">{activeQrModal.toUpi}</span>
            </div>

            <button
              onClick={() => setActiveQrModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
