import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  ChevronDown,
  Plus,
  CheckCheck,
  Globe,
  UserCheck,
  User as UserIcon,
  Settings,
  LogOut,
  Menu,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CurrencyCode } from '../../types';

export const Header: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    currency,
    setCurrency,
    openAddExpenseModal,
    setCurrentView,
    logout,
    isSidebarOpen,
    toggleSidebar,
    setIsSidebarOpen,
    isDemoMode,
    isCloudSynced,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currencies: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'INR', label: 'INR (₹)', symbol: '₹' },
    { code: 'USD', label: 'USD ($)', symbol: '$' },
    { code: 'EUR', label: 'EUR (€)', symbol: '€' },
    { code: 'GBP', label: 'GBP (£)', symbol: '£' },
  ];

  return (
    <header id="app-header" className="bg-transparent pt-5 pb-3 px-4 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left: Brand Toggle & Greeting */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Personal Button / Sidebar Toggle */}
        <button
          id="btn-toggle-personal-sidebar"
          onClick={toggleSidebar}
          className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[#145DA0] hover:bg-[#1E88E5] text-white shadow-md shadow-blue-900/10 transition-all hover:scale-[1.02] active:scale-[0.98] group shrink-0"
          title={isSidebarOpen ? "Hide sidebar" : "Show Personal menu"}
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white">
            <Menu className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-xs tracking-tight block leading-none text-white">
              Personal
            </span>
            <span className="text-[9px] text-white/80 font-medium leading-none block mt-0.5">
              Menu
            </span>
          </div>
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 id="header-greeting" className="text-xl sm:text-2xl font-bold text-[#1F2937] tracking-tight flex items-center gap-1.5 sm:gap-2">
              Welcome back, {currentUser.name.split(' ')[0]}! <span className="inline-block animate-wave text-xl sm:text-2xl">👋</span>
            </h2>
            <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Cloud DB Live</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Here's what's happening with your expenses.
          </p>
        </div>
      </div>

      {/* Right: Quick actions, notifications, user switcher & profile */}
      <div className="flex items-center gap-3">
        {/* Quick Add Expense Action */}
        <button
          id="header-btn-quick-add"
          onClick={() => openAddExpenseModal()}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E88E5] hover:bg-[#145DA0] text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>

        {/* Currency Switcher */}
        <div className="relative" ref={currencyRef}>
          <button
            id="header-btn-currency"
            onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
            className="h-11 px-3 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
            title="Change Currency"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{currency}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isCurrencyOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Currency
              </div>
              {currencies.map(c => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setIsCurrencyOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-blue-50 ${
                    currency === c.code ? 'text-[#1E88E5] bg-blue-50/60 font-bold' : 'text-slate-700'
                  }`}
                >
                  <span>{c.label}</span>
                  {currency === c.code && <span className="w-1.5 h-1.5 rounded-full bg-[#1E88E5]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            id="header-btn-notifications"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm flex items-center justify-center text-slate-600 hover:text-[#1E88E5] transition-all relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[11px] font-extrabold flex items-center justify-center border-2 border-white shadow-sm">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                  {unreadNotificationCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                      {unreadNotificationCount} new
                    </span>
                  )}
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-[#1E88E5] font-semibold hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 py-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs font-medium">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`py-3 px-2 rounded-xl transition-colors cursor-pointer flex items-start gap-3 ${
                        !n.read ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                          !n.read ? 'bg-[#1E88E5]' : 'bg-slate-300'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Perspective Switcher */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="header-user-menu"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow transition-all"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-[#1E88E5]/30 shadow-inner"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
              {isDemoMode ? (
                <span className="text-[9px] text-amber-700 font-extrabold bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                  Demo Sandbox
                </span>
              ) : (
                <span className="text-[9px] text-emerald-700 font-extrabold bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  Cloud Synced
                </span>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 bg-slate-50 rounded-xl mb-2 flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#1E88E5]"
                />
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-xs text-slate-800 truncate">{currentUser.name}</p>
                    {isDemoMode && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-black px-1.5 py-0.2 rounded">
                        DEMO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                </div>
              </div>

              {isDemoMode ? (
                <div className="mx-2 mb-2 p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-[10px] text-amber-800 font-medium">
                  ⚡ <strong>Demo Mode active:</strong> Changes remain in local browser sandbox. Log out to sign up for cloud sync.
                </div>
              ) : (
                <div className="mx-2 mb-2 p-2 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[10px] text-emerald-800 font-medium">
                  ✓ <strong>Firebase Authenticated:</strong> Your personal expenses & groups are secured in Firestore.
                </div>
              )}

              {/* Perspective Switcher Section */}
              <div className="px-2 py-1.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#1E88E5]" />
                    Switch Perspective
                  </span>
                  <span className="text-[10px] text-[#1E88E5] font-semibold">Test view</span>
                </div>
                <div className="space-y-1">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        currentUser.id === u.id
                          ? 'bg-blue-50 text-[#145DA0] font-bold ring-1 ring-blue-200'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                      <span className="truncate flex-1 text-left">{u.name}</span>
                      {currentUser.id === u.id && (
                        <span className="text-[10px] bg-[#1E88E5] text-white px-1.5 py-0.2 rounded-full">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 mt-2 pt-1.5 space-y-0.5">
                <button
                  onClick={() => {
                    setCurrentView('profile');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentView('settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings & Currency</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
