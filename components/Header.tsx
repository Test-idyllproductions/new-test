
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

          {/* Notifications Panel - Rendered as Portal */}
          {showNotifications && createPortal(
            <div 
              className="notifications-dropdown-modal"
              style={{
                position: 'fixed',
                top: '70px',
                right: '20px',
                width: '320px',
                background: theme === 'dark' 
                  ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.3) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                backdropFilter: 'blur(20px) saturate(180%) brightness(110%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%) brightness(110%)',
                border: theme === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.2)' 
                  : '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                boxShadow: theme === 'dark'
                  ? '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                zIndex: 2147483647,
                overflow: 'hidden',
                animation: 'slideInScale 0.3s ease-out'
              }}
            >
              {/* Glass overlay for extra effect */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.02) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 100%)',
                  pointerEvents: 'none',
                  borderRadius: '16px'
                }}
              />
              
              <div 
                className="p-4 border-b flex items-center justify-between relative z-10"
                style={{
                  borderColor: theme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(255, 255, 255, 0.3)',
                  background: theme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <h3 
                  className="font-bold text-sm"
                  style={{ 
                    color: theme === 'dark' ? '#ffffff' : '#1e293b',
                    textShadow: theme === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.5)' : '0 1px 2px rgba(255, 255, 255, 0.8)'
                  }}
                >
                  Notifications
                </h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="p-2 transition-all duration-200 rounded-lg"
                  style={{ 
                    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
                    e.currentTarget.style.background = theme === 'dark' 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div 
                className="max-h-96 overflow-y-auto relative z-10"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: theme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.3) transparent' 
                    : 'rgba(0, 0, 0, 0.3) transparent'
                }}
              >
                {notifications.length === 0 ? (
                  <div 
                    className="p-8 text-center text-sm"
                    style={{ 
                      color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                      textShadow: theme === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.5)' : '0 1px 2px rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(notification => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full p-4 text-left transition-all duration-200 border-b last:border-b-0"
                      style={{
                        background: !notification.read 
                          ? (theme === 'dark' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.1)')
                          : 'transparent',
                        borderColor: theme === 'dark' 
                          ? 'rgba(255, 255, 255, 0.08)' 
                          : 'rgba(255, 255, 255, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme === 'dark' 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(255, 255, 255, 0.3)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = !notification.read 
                          ? (theme === 'dark' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.1)')
                          : 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div 
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{
                            background: !notification.read 
                              ? 'linear-gradient(45deg, #06b6d4, #0891b2)' 
                              : (theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'),
                            boxShadow: !notification.read 
                              ? '0 0 12px rgba(6, 182, 212, 0.8), 0 0 4px rgba(6, 182, 212, 0.4)' 
                              : 'none'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p 
                            className="text-sm font-semibold mb-1"
                            style={{ 
                              color: theme === 'dark' ? '#ffffff' : '#1e293b',
                              textShadow: theme === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.5)' : '0 1px 2px rgba(255, 255, 255, 0.8)'
                            }}
                          >
                            {notification.title}
                          </p>
                          <p 
                            className="text-xs line-clamp-2"
                            style={{ 
                              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                              textShadow: theme === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.3)' : '0 1px 2px rgba(255, 255, 255, 0.6)'
                            }}
                          >
                            {notification.message}
                          </p>
                          <p 
                            className="text-[10px] mt-2"
                            style={{ 
                              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
                              textShadow: theme === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.3)' : '0 1px 2px rgba(255, 255, 255, 0.6)'
                            }}
                          >
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>,
            document.body
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
