
import React, { useEffect } from 'react';
import { SupabaseAppProvider, useSupabaseStore } from './lib/supabase-store';
import { ThemeProvider } from './lib/theme-context';
import { NotificationManagerProvider } from './lib/notification-manager';
import { DialogProvider } from './lib/dialog-context';
import { UserRole, UserStatus, AppView } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CookieConsent from './components/CookieConsent';
import LandingView from './views/LandingView';
import SupabaseAuthView from './views/SupabaseAuthView';
import ManagerLoginView from './views/ManagerLoginView';
import ApplyView from './views/ApplyView';
import PendingView from './views/PendingView';
import HomeView from './views/HomeView';
import ManagerHomeView from './views/ManagerHomeView';
import SupabaseTasksView from './views/SupabaseTasksView';
import MeetingsView from './views/MeetingsView';
import PayoutsView from './views/PayoutsView';
import UserManagementView from './views/UserManagementView';
import ApprovalsView from './views/ApprovalsView';
import SettingsView from './views/SettingsView';

const NavigationHandler: React.FC = () => {
  const { currentView, currentUser, setView, loading } = useSupabaseStore();

  // ROUTE GUARDS - Prevent unauthorized access
  useEffect(() => {
    if (loading) {
      console.log('ROUTE GUARD: Still loading, skipping checks');
      return;
    }

    console.log('ROUTE GUARD CHECK:', {
      currentView,
      currentUser: currentUser ? {
        email: currentUser.email,
        role: currentUser.role,
        status: currentUser.status
      } : null
    });

    // If user is pending, lock them to pending page
    if (currentUser?.status === UserStatus.PENDING) {
      if (!['pending', 'landing', 'login', 'signup', 'apply', 'manager-login'].includes(currentView)) {
        console.log('ROUTE GUARD: Pending user trying to access', currentView, '→ Redirecting to pending');
        setView('pending');
      }
      return;
    }

    // If user is not authenticated, redirect to landing
    if (!currentUser && !['landing', 'login', 'signup', 'apply', 'manager-login'].includes(currentView)) {
      console.log('ROUTE GUARD: Unauthenticated user trying to access', currentView, '→ Redirecting to landing');
      setView('landing');
      return;
    }

    // If editor tries to access manager-only routes
    if (currentUser?.role === UserRole.EDITOR && ['approvals', 'user-management'].includes(currentView)) {
      console.log('ROUTE GUARD: Editor trying to access', currentView, '→ Redirecting to home');
      setView('home');
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, currentView, loading]); // Don't include setView in deps

  useEffect(() => {
    // Handle URL-based routing ONLY on initial mount
    const path = window.location.pathname.replace('/', '');
    if (path && path !== currentView && ['landing', 'login', 'signup', 'apply', 'pending', 'home', 'tasks', 'meetings', 'payouts', 'approvals', 'user-management', 'settings', 'manager-login'].includes(path as AppView)) {
      setView(path as AppView);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const renderContent = () => {
    console.log('Rendering view:', currentView, 'User role:', currentUser?.role);
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center gradient-bg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      );
    }

    // CRITICAL: Role-based routing
    // Editors: 'home' view = HomeView (their dashboard with summary cards)
    // Managers: 'tasks' view = SupabaseTasksView (their dashboard with task management)
    
    switch (currentView) {
      case 'landing': 
        return <LandingView />;
      
      case 'login':
      case 'signup': 
        return <SupabaseAuthView />;
      
      case 'manager-login':
        return <ManagerLoginView />;
      
      case 'apply':
        return <ApplyView />;
      
      case 'pending': 
        return <PendingView />;
      
      case 'home': 
        // Role-based home view
        // Managers: ManagerHomeView (system overview with user selection)
        // Editors: HomeView (personal dashboard with summary cards)
        if (currentUser?.role === UserRole.MANAGER) {
          return <ManagerHomeView />;
        }
        return <HomeView />;
      
      case 'tasks': 
        return <SupabaseTasksView />;
      
      case 'meetings': 
        return <MeetingsView />;
      
      case 'payouts': 
        return <PayoutsView />;
      
      case 'user-management': 
        return <UserManagementView />;
      
      case 'approvals': 
        return <ApprovalsView />;
      
      case 'settings': 
        return <SettingsView />;
      
      default: 
        console.log('DEFAULT CASE - Fallback routing');
        // Fallback to home view based on role
        if (currentUser?.role === UserRole.MANAGER) {
          return <ManagerHomeView />;
        } else {
          return <HomeView />;
        }
    }
  };

  // Show layout for authenticated users only
  const showLayout = !['landing', 'login', 'signup', 'apply', 'pending', 'manager-login'].includes(currentView);

  // Render content based on authentication state
  if (!showLayout) {
    return (
      <div className="min-h-screen w-full transition-opacity duration-500 ease-in-out relative gradient-bg">
        <div className="relative z-10">
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-primary relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 stable-flex">
        <Header />
        <main className="flex-1 overflow-y-auto custom-scrollbar transition-all duration-300">
          <div className={`w-full relative z-10 ${
            currentView === 'tasks' 
              ? 'p-4 md:p-8 full-width-table' 
              : 'p-4 md:p-8 mx-auto max-w-7xl'
          }`}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // FORCE RELOAD - Version 2025-01-15-01:00
  console.log('App loaded - Version 2025-01-15-01:00');
  
  return (
    <SupabaseAppProvider>
      <ThemeProvider>
        <DialogProvider>
          <NotificationManagerProvider>
            <div className="relative">
              <NavigationHandler />
              <CookieConsent />
            </div>
          </NotificationManagerProvider>
        </DialogProvider>
      </ThemeProvider>
    </SupabaseAppProvider>
  );
};

export default App;
