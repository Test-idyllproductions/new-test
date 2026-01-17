
import React, { useState, useRef, useEffect } from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { useTheme } from '../lib/theme-context';
import { Bell, X } from 'lucide-react';
import SoundToggle from './SoundToggle';
import ThemeSelector from './ThemeSelector';

const Header: React.FC = () => {
  const { currentView, currentUser, notifications, markNotificationAsRead, setView } = useSupabaseStore();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close notifications panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    await markNotificationAsRead(notification.id);
    
    // Deep link based on notification type
    switch (notification.type) {
      case 'task':
        setView('tasks');
        break;
      case 'meeting':
        setView('meetings');
        break;
      case 'payout':
        setView('payouts');
        break;
    }
    
    setShowNotifications(false);
  };

  const getTitle = () => {
    switch (currentView) {
      case 'home': return 'Home';
      case 'tasks': return 'Tasks Management';
      case 'meetings': return 'Meetings & Calendar';
      case 'payouts': return 'Payouts';
      case 'approvals': return 'User Approvals';
      case 'user-management': return 'User Submissions';
      case 'settings': return 'Settings';
      default: return 'Idyll Workspace';
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-primary">{getTitle()}</h2>
      </div>

      <div className="flex items-center space-x-6">
        <SoundToggle />
        <ThemeSelector />
        
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-muted hover:text-primary transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-cyan-500 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
              <div className="p-4 border-b border-border flex items-center justify-between bg-input">
                <h3 className="font-bold text-primary text-sm">Notifications</h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="p-1 text-muted hover:text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(notification => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full p-4 text-left hover:bg-hover transition-colors border-b border-border last:border-b-0 ${
                        !notification.read ? 'bg-cyan-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          !notification.read ? 'bg-cyan-500' : 'bg-muted'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-primary mb-1">
                            {notification.title}
                          </p>
                          <p className="text-xs text-secondary line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-muted mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 border-l border-border pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-primary">{currentUser?.username || 'Guest'}</p>
            <p className="text-[10px] text-muted font-medium uppercase tracking-wider">{currentUser?.role || 'TESTING'}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-input border border-border flex items-center justify-center text-xs font-bold text-cyan-400">
            {currentUser?.username?.charAt(0) || 'T'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
