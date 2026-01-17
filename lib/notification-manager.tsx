import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useSupabaseStore } from './supabase-store';

interface NotificationManagerContextType {
  playNotificationSound: () => void;
}

const NotificationManagerContext = createContext<NotificationManagerContextType | undefined>(undefined);

export const NotificationManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, taskRecords, payoutRecords, meetings, notifications } = useSupabaseStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousCounts = useRef({
    tasks: 0,
    payouts: 0,
    meetings: 0,
    notifications: 0
  });

  // Initialize audio
  useEffect(() => {
    const audio = new Audio('/sounds/editornotification.mp3');
    audio.preload = 'auto';
    audio.volume = 0.7;
    audioRef.current = audio;
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    const soundEnabled = currentUser?.soundEnabled !== false;
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  };

  // Monitor for new items and play sound
  useEffect(() => {
    if (!currentUser) return;

    const currentCounts = {
      tasks: taskRecords.filter(t => t.assignedTo === currentUser.id).length,
      payouts: payoutRecords.filter(p => p.assignedTo === currentUser.id).length,
      meetings: meetings.filter(m => m.attendees.includes(currentUser.id)).length,
      notifications: notifications.filter(n => n.user_id === currentUser.id && !n.read).length
    };

    // Check if any count increased (new item added)
    const hasNewTask = currentCounts.tasks > previousCounts.current.tasks;
    const hasNewPayout = currentCounts.payouts > previousCounts.current.payouts;
    const hasNewMeeting = currentCounts.meetings > previousCounts.current.meetings;
    const hasNewNotification = currentCounts.notifications > previousCounts.current.notifications;

    if (hasNewTask || hasNewPayout || hasNewMeeting || hasNewNotification) {
      // Only play sound if we have previous counts (not on initial load)
      if (previousCounts.current.tasks > 0 || previousCounts.current.payouts > 0 || 
          previousCounts.current.meetings > 0 || previousCounts.current.notifications > 0) {
        playNotificationSound();
      }
    }

    previousCounts.current = currentCounts;
  }, [taskRecords, payoutRecords, meetings, notifications, currentUser]);

  return (
    <NotificationManagerContext.Provider value={{ playNotificationSound }}>
      {children}
    </NotificationManagerContext.Provider>
  );
};

export const useNotificationManager = () => {
  const context = useContext(NotificationManagerContext);
  if (!context) throw new Error('useNotificationManager must be used within NotificationManagerProvider');
  return context;
};