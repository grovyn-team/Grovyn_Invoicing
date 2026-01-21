import React, { useState } from 'react';
import { LayoutDashboard, FileText, Settings, BarChart3, Users, ChevronRight, LogOut, Search, Bell, ShieldCheck, Menu, X, FileCheck, FileSignature, Gem } from 'lucide-react';
import { AppTab, UserRole } from '../types/refTypes';
import UserProfile from './UserProfile';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  userRole: UserRole;
  onSearch: (term: string) => void;
  onLogout: () => void;
  userName: string;
  userAvatar: string;
  userId: string;
  userEmail: string;
  onUserUpdate?: (user: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, userRole, onSearch, onLogout, userName, userAvatar, userId, userEmail, onUserUpdate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const isAdmin = userRole === UserRole.ADMIN;

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, adminOnly: false },
    { id: 'invoices', label: 'Invoices', icon: <FileText size={18} />, adminOnly: false },
    { id: 'quotations', label: 'Quotations', icon: <FileCheck size={18} />, adminOnly: false },
    { id: 'proposals', label: 'Proposals', icon: <Gem size={18} />, adminOnly: false },
    { id: 'offer-letters', label: 'Offer Letters', icon: <FileSignature size={18} />, adminOnly: false },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} />, adminOnly: true },
    { id: 'clients', label: 'Clients', icon: <Users size={18} />, adminOnly: false },
    { id: 'audit', label: 'Audit Logs', icon: <ShieldCheck size={18} />, adminOnly: true },
  ];

  // Helper to handle breadcrumb navigation
  const handleBreadcrumbClick = (target: string) => {
    if (target === 'core') setActiveTab('dashboard');
    else if (target === 'clients' && activeTab === 'client-details') setActiveTab('clients');
    else if (target === 'quotations' && activeTab === 'quotations') setActiveTab('quotations');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 relative">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 lg:w-64 border-r border-slate-200 bg-white flex flex-col no-print transition-transform duration-300 ease-in-out transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded flex items-center justify-center overflow-hidden shrink-0">
                <img src="/grovyn.png" alt="GROVYN" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 block leading-none">GROVYN</span>
                <span className="text-[10px] text-teal-600 font-bold tracking-widest uppercase">Invoice OS</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-lg">
              <X size={20} />
            </button>
          </div>
          
          <nav className="space-y-1">
            {navItems.map(item => (
              (!item.adminOnly || isAdmin) && (
                <NavItem 
                  key={item.id}
                  icon={item.icon} 
                  label={item.label} 
                  active={activeTab === item.id || (item.id === 'clients' && activeTab === 'client-details')} 
                  onClick={() => handleTabChange(item.id as AppTab)}
                />
              )
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 space-y-4">
          <NavItem 
            icon={<Settings size={18} />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => handleTabChange('settings')}
          />
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Authenticated As</p>
            <p className="text-xs font-bold text-slate-700 truncate">{userName}</p>
            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tight">{userRole}</p>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-600 transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col min-w-0 fixed inset-y-0 left-0 lg:left-64 right-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 no-print z-30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2.5 text-slate-500 hover:text-teal-600 bg-slate-50 rounded-xl border border-slate-100">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-400 overflow-hidden">
              <button 
                onClick={() => handleBreadcrumbClick('core')}
                className="hover:text-teal-600 transition-colors shrink-0 uppercase tracking-widest text-[10px] md:text-xs"
              >
                Core
              </button>
              <ChevronRight size={14} className="shrink-0 opacity-50" />
              <button 
                onClick={() => handleBreadcrumbClick('clients')}
                className={`truncate uppercase tracking-widest text-[10px] md:text-xs transition-colors ${activeTab === 'client-details' ? 'hover:text-teal-600 cursor-pointer' : 'text-slate-900 pointer-events-none'}`}
              >
                {activeTab === 'client-details' ? 'Clients' : activeTab === 'quotations' ? 'Quotations' : activeTab.replace('-', ' ')}
              </button>
              {activeTab === 'client-details' && (
                <>
                  <ChevronRight size={14} className="shrink-0 opacity-50" />
                  <span className="text-slate-900 truncate uppercase tracking-widest text-[10px] md:text-xs">Details</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Find resources..." 
                onChange={(e) => onSearch(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 focus:outline-none focus:border-teal-500 w-32 lg:w-64 transition-all"
              />
            </div>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`p-3 transition-all relative rounded-xl border ${activeTab === 'notifications' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'text-slate-400 hover:text-teal-600 border-slate-100 hover:bg-slate-50'}`}
            >
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button 
              onClick={() => setShowProfile(true)}
              className="w-10 h-10 rounded-xl bg-teal-50 overflow-hidden border border-teal-100 shadow-sm shrink-0 hover:border-teal-300 transition-all cursor-pointer"
            >
              <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
            </button>
            
            {showProfile && (
              <UserProfile
                user={{
                  id: userId,
                  name: userName,
                  email: userEmail,
                  role: userRole,
                  avatar: userAvatar,
                }}
                onClose={() => setShowProfile(false)}
                onUpdate={(updatedUser) => {
                  if (onUserUpdate) {
                    onUserUpdate(updatedUser);
                  }
                  setShowProfile(false);
                }}
              />
            )}
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
      active 
        ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-teal-600'
    }`}
  >
    <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-teal-500 transition-colors'}`}>{icon}</span>
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </button>
);

export default Layout;
