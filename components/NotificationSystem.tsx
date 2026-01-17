import React, { useState, useEffect } from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { UserRole } from '../types';
import { Bell, X, CheckCircle, Calendar, DollarSign } from 'lucide-react';

interface Notification {
  id: string;
  type: 'task' | 'meeting' | 'payout';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const NotificationSystem: React.FC = () => {
  const { currentUser, taskRecords, meetings, payoutRecords } = useSupabaseStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastCheck, setLastCheck] = useState<string>(() => {
    return localStorage.getItem('lastNotificationCheck') || new Date().toISOString();
  });

  useEffect(() => {
    if (!currentUser || currentUser.role !== UserRole.EDITOR) return;

    const checkForNewItems = () => {
      const newNotifications: Notification[] = [];
      const checkTime = new Date(lastCheck);

      // Check for new tasks assigned to this user
      const newTasks = taskRecords.filter(task => 
        task.assignedTo === currentUser.id && 
        new Date(task.createdAt) > checkTime
      );

      newTasks.forEach(task => {
        newNotifications.push({
          id: `task-${task.id}`,
          type: 'task',
          title: 'New Task Assigned',
          message: `You have been assigned: ${task.taskName}`,
          timestamp: task.createdAt,
          read: false
        });
      });

      // Check for new meetings
      const newMeetings = meetings.filter(meeting => 
        meeting.attendees.includes(currentUser.id) && 
        new Date(meeting.date) > checkTime
      );

      newMeetings.forEach(meeting => {
        newNotifications.push({
          id: `meeting-${meeting.id}`,
          type: 'meeting',
          title: 'New Meeting Scheduled',
          message: `Meeting: ${meeting.name} on ${new Date(meeting.date).toLocaleDateString()}`,
          timestamp: new Date().toISOString(),
          read: false
        });
      });

      // Check for new payouts
      const newPayouts = payoutRecords.filter(payout => 
        payout.assignedTo === currentUser.id && 
        new Date(payout.createdAt) > checkTime
      );

      newPayouts.forEach(payout => {
        newNotifications.push({
          id: `payout-${payout.id}`,
          type: 'payout',
          title: 'New Payout Available',
          message: `Payout for ${payout.projectName}: $${payout.amount}`,
          timestamp: payout.createdAt,
          read: false
        });
      });

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev].slice(0, 10)); // Keep only 10 most recent
      }
    };

    checkForNewItems();
    const interval = setInterval(checkForNewItems, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [currentUser, taskManagementRecords, meetings, payoutRecords, lastCheck]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
    setLastCheck(new Date().toISOString());
    localStorage.setItem('lastNotificationCheck', new Date().toISOString());
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckCircle className="w-4 h-4 text-cyan-400" />;
      case 'meeting': return <Calendar className="w-4 h-4 text-indigo-400" />;
      case 'payout': return <DollarSign className="w-4 h-4 text-green-400" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  if (currentUser?.role !== UserRole.EDITOR) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors glow-border rounded-lg"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl z-50 glow-border animate-fade-in">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No new notifications
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-cyan-500/5' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white truncate">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 ml-2"></div>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(notification.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;