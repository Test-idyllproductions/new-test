
import React from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { UserRole, AppView } from '../types';
import { 
  Home, CheckSquare, Calendar, CreditCard, 
  Settings, UserCheck, Users, LogOut, ChevronRight
} from 'lucide-react';
import Logo from './Logo';

const Sidebar: React.FC = () => {
  const { currentView, setView, currentUser, signOut, logAction } = useSupabaseStore();

  const handleLogout = async () => {
    await logAction('LOGOUT', 'USER');
    await signOut();
  };

  // Editor Sidebar: Home, Tasks, Meetings, Payouts ONLY
  const editorNavItems: { label: string; view: AppView; icon: any }[] = [
    { label: 'Home', view: 'home', icon: Home },
    { label: 'Tasks', view: 'tasks', icon: CheckSquare },
    { label: 'Meetings', view: 'meetings', icon: Calendar },
    { label: 'Payouts', view: 'payouts', icon: CreditCard },
  ];

  // Manager Sidebar: Home, Tasks Management, Meetings Management, Payout Management, User Approvals, User Submissions
  const managerNavItems: { label: string; view: AppView; icon: any }[] = [
    { label: 'Home', view: 'home', icon: Home },
    { label: 'Tasks Management', view: 'tasks', icon: CheckSquare },
    { label: 'Meetings Management', view: 'meetings', icon: Calendar },
    { label: 'Payout Management', view: 'payouts', icon: CreditCard },
    { label: 'User Approvals', view: 'approvals', icon: UserCheck },
    { label: 'User Submissions', view: 'user-management', icon: Users },
  ];

  // Bottom section items - ONLY Settings for both roles
  const bottomItems: { label: string; view: AppView; icon: any }[] = [
    { label: 'Settings', view: 'settings', icon: Settings },
  ];

  // Select items based on role
  const navItems = currentUser?.role === UserRole.MANAGER ? managerNavItems : editorNavItems;

  return (
    <aside className="w-64 hidden md:flex flex-col bg-card border-r border-border h-screen sticky top-0">
      <div className="p-6 flex items-center space-x-3">
        <Logo size="sm" />
        <h1 className="text-lg font-semibold text-primary tracking-tight">Idyll Productions</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`sidebar-item w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
              currentView === item.view 
                ? 'bg-cyan-500/10 text-cyan-400 active' 
                : 'text-secondary hover:bg-hover hover:text-primary'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">{item.label}</span>
            <ChevronRight className={`w-4 h-4 ml-auto transition-transform duration-200 ${
              currentView === item.view ? 'rotate-90' : 'group-hover:translate-x-1'
            }`} />
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        {bottomItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
              currentView === item.view 
                ? 'bg-cyan-500/10 text-cyan-400' 
                : 'text-secondary hover:bg-hover hover:text-primary'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-secondary hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
