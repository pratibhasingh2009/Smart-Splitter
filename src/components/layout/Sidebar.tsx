import React from 'react';
import {
  LayoutDashboard,
  Users,
  ReceiptText,
  Scale,
  BarChart3,
  CalendarClock,
  User,
  Settings,
  LogOut,
  GitBranch,
  ChevronLeft,
  X,
  MessageSquare,
  FileText,
  Presentation,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageView } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    logout,
    openFlowModal,
    openReportModal,
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar,
    groupMessages,
    currentUser,
  } = useApp();

  const navItems: { id: PageView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'chat', label: 'Group Chat', icon: MessageSquare },
    { id: 'expenses', label: 'Expenses', icon: ReceiptText },
    { id: 'settlement', label: 'Settlement', icon: Scale },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'recurring', label: 'Recurring', icon: CalendarClock },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (viewId: PageView) => {
    setCurrentView(viewId);
    // Smoothly slide the blue sidebar to the side so only that page is shown in full focus
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop when sidebar is open */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Blue Sidebar Drawer */}
      <aside
        id="app-sidebar"
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#145DA0] text-white flex flex-col h-screen max-h-screen shrink-0 shadow-2xl lg:shadow-xl select-none transition-all duration-300 ease-in-out ${
          isSidebarOpen
            ? 'translate-x-0 opacity-100'
            : '-translate-x-full lg:-ml-64 opacity-0 pointer-events-none'
        }`}
      >
        {/* Brand Header - Pinned at top */}
        <div className="shrink-0 p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-[#145DA0]">
          <div
            id="sidebar-brand"
            onClick={() => {
              setCurrentView('dashboard');
              setIsSidebarOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer hover:opacity-95 transition-opacity"
            title="Go to Dashboard & Close Sidebar"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <div className="w-7 h-7 rounded-xl bg-white text-[#145DA0] flex items-center justify-center font-bold shadow-md">
                <Users className="w-4 h-4 text-[#145DA0]" />
              </div>
            </div>
            <div className="leading-tight">
              <h1 className="font-extrabold text-[17px] tracking-tight text-white flex items-center gap-1.5">
                Personal
              </h1>
              <p className="text-white/80 text-[11px] font-semibold tracking-wide">
                Budget Splitter
              </p>
            </div>
          </div>

          {/* Collapse / Close Button */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Slide sidebar away"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Links (Middle section that scrolls smoothly) */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar px-3 py-2.5">
          <nav className="space-y-1" aria-label="Main Navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive =
                currentView === item.id ||
                (item.id === 'groups' && currentView === 'group-details');

              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-[#F5B942] text-[#1F2937] font-bold shadow-md shadow-black/10 translate-x-1'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#1F2937]' : 'text-white/80'}`} />
                  <span className="flex-1">{item.label}</span>
                  {item.id === 'settlement' && (
                    <span className={`ml-auto text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-amber-800/20 text-amber-900' : 'bg-[#1E88E5] text-white'
                    }`}>
                      Smart
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section - Pinned at bottom, always fully visible */}
        <div className="shrink-0 p-3 sm:p-4 space-y-2 border-t border-white/10 bg-[#0f4b82]/40 backdrop-blur-xs">
          {/* Project Presentation (.pptx) */}
          <a
            id="sidebar-btn-presentation"
            href="/SmartSplit_Mini_Project_Presentation_Group7.pptx"
            download="SmartSplit_Mini_Project_Presentation_Group7.pptx"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#F5B942] hover:bg-[#e5aa33] text-[#1F2937] text-xs font-bold transition-all shadow-sm active:scale-98"
            title="Download College Presentation (.pptx)"
          >
            <Presentation className="w-4 h-4 text-[#1F2937]" />
            <span>Project Presentation (.pptx)</span>
          </a>

          {/* User Flow & Architecture Button */}
          <button
            id="btn-view-user-flow"
            onClick={() => {
              openFlowModal();
              setIsSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-all shadow-sm active:scale-98"
          >
            <GitBranch className="w-4 h-4 text-white/80" />
            <span>Architecture & Flow</span>
          </button>

          {/* Logout Action */}
          <div className="pt-1.5 border-t border-white/10">
            <button
              id="sidebar-btn-logout"
              onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-red-500/20 hover:border-red-400/30 transition-all text-left active:scale-98"
            >
              <LogOut className="w-4.5 h-4.5 text-white/80" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

