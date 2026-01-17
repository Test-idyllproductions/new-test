import React, { useState } from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { useTheme, COLOR_THEMES, getDarkShade } from '../lib/theme-context';
import { TaskStatus, UserRole, UserStatus } from '../types';
import { CheckSquare, Calendar, DollarSign, Users, TrendingUp, Clock, XCircle } from 'lucide-react';
import MagicBento from '../components/MagicBento';

const ManagerHomeView: React.FC = () => {
  const { currentUser, users, taskRecords, meetings, payoutRecords } = useSupabaseStore();
  const { theme, colorTheme } = useTheme();
  const currentTheme = COLOR_THEMES[colorTheme];
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Filter approved editors for user selection
  const approvedEditors = users.filter(u => u.role === UserRole.EDITOR && u.status === UserStatus.APPROVED);

  // Calculate stats based on selection
  const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null;

  let stats;
  if (selectedUser) {
    // User-specific stats
    const userTasks = taskRecords.filter(t => t.assignedTo === selectedUserId);
    const userMeetings = meetings.filter(m => m.attendees.includes(selectedUserId));
    const userPayouts = payoutRecords.filter(p => p.assignedTo === selectedUserId);

    stats = {
      totalTasks: userTasks.length,
      notStarted: userTasks.filter(t => t.status === TaskStatus.NOT_STARTED).length,
      editing: userTasks.filter(t => t.status === TaskStatus.EDITING).length,
      cantDo: userTasks.filter(t => t.status === TaskStatus.CANT_DO).length,
      done: userTasks.filter(t => t.status === TaskStatus.DONE).length,
      meetings: userMeetings.length,
      pendingPayouts: userPayouts.filter(p => p.status === 'Pending').length,
      completedPayouts: userPayouts.filter(p => p.status === 'Done').length,
    };
  } else {
    // System-wide stats
    stats = {
      totalUsers: users.filter(u => u.status === UserStatus.APPROVED).length,
      totalTasks: taskRecords.length,
      notStarted: taskRecords.filter(t => t.status === TaskStatus.NOT_STARTED).length,
      editing: taskRecords.filter(t => t.status === TaskStatus.EDITING).length,
      cantDo: taskRecords.filter(t => t.status === TaskStatus.CANT_DO).length,
      done: taskRecords.filter(t => t.status === TaskStatus.DONE).length,
      meetings: meetings.length,
      pendingPayouts: payoutRecords.filter(p => p.status === 'Pending').length,
      completedPayouts: payoutRecords.filter(p => p.status === 'Done').length,
    };
  }

  // Helper function to create themed cards
  const createThemedCard = (icon: React.ReactNode, value: number, label: string) => {
    const darkBase = getDarkShade(currentTheme.primary);
    
    return (
      <MagicBento
        enableStars={true}
        enableSpotlight={true}
        enableBorderGlow={true}
        enableTilt={true}
        spotlightRadius={200}
        particleCount={8}
        glowColor={currentTheme.primary.replace('#', '')}
        className="p-6 rounded-2xl text-center transition-colors"
        style={{
          backgroundColor: theme === 'dark' 
            ? `${darkBase}CC` // Very dark shade with some transparency
            : 'rgba(255, 255, 255, 0.9)',
          border: `1px solid ${currentTheme.primary}30`
        }}
      >
        <div 
          className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${currentTheme.primary}20` }}
        >
          {React.cloneElement(icon as React.ReactElement, { 
            className: "w-8 h-8", 
            style: { color: currentTheme.primary } 
          })}
        </div>
        <p 
          className="text-3xl font-bold"
          style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
        >
          {value}
        </p>
        <p 
          className="text-xs mt-1 font-medium"
          style={{ color: theme === 'dark' ? '#94a3b8' : '#475569' }}
        >
          {label}
        </p>
      </MagicBento>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 
          className="text-4xl font-bold mb-2"
          style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
        >
          {getGreeting()}, {currentUser?.username}
        </h1>
        <p 
          className="text-lg"
          style={{ color: theme === 'dark' ? '#94a3b8' : '#475569' }}
        >
          {selectedUser ? `Viewing ${selectedUser.username}'s overview` : 'System-wide overview'}
        </p>
      </div>

      {/* User Selection */}
      <div 
        className="rounded-2xl p-6 mb-6"
        style={{
          backgroundColor: theme === 'dark' 
            ? `${getDarkShade(currentTheme.primary)}CC`
            : 'rgba(255, 255, 255, 0.9)',
          border: `1px solid ${currentTheme.primary}30`
        }}
      >
        <label 
          className="block text-sm font-medium mb-3"
          style={{ color: theme === 'dark' ? '#94a3b8' : '#475569' }}
        >
          Select User to View Details
        </label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full md:w-96 px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:border-transparent"
          style={{
            backgroundColor: theme === 'dark' ? `${currentTheme.primary}10` : `${currentTheme.primary}05`,
            border: `2px solid ${currentTheme.primary}30`,
            color: theme === 'dark' ? '#ffffff' : '#000000',
            '--tw-ring-color': currentTheme.primary
          } as React.CSSProperties}
        >
          <option value="">All Users (System Overview)</option>
          {approvedEditors.map(user => (
            <option key={user.id} value={user.id}>
              {user.username} ({user.email})
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      {!selectedUser ? (
        // System-wide view
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {createThemedCard(<Users />, stats.totalUsers, "Total Users")}
          {createThemedCard(<CheckSquare />, stats.totalTasks, "Total Tasks")}
          {createThemedCard(<Calendar />, stats.meetings, "Total Meetings")}
          {createThemedCard(<DollarSign />, stats.pendingPayouts, "Pending Payouts")}
          {createThemedCard(<Clock />, stats.notStarted, "Not Started")}
          {createThemedCard(<TrendingUp />, stats.editing, "Editing")}
          {createThemedCard(<XCircle />, stats.cantDo, "Can't Do")}
          {createThemedCard(<CheckSquare />, stats.done, "Completed")}
        </div>
      ) : (
        // User-specific view
        <div>
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
          >
            {selectedUser.username}'s Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {createThemedCard(<CheckSquare />, stats.totalTasks, "Total Tasks")}
            {createThemedCard(<Clock />, stats.notStarted, "Not Started")}
            {createThemedCard(<TrendingUp />, stats.editing, "Editing")}
            {createThemedCard(<XCircle />, stats.cantDo, "Can't Do")}
            {createThemedCard(<CheckSquare />, stats.done, "Completed")}
            {createThemedCard(<Calendar />, stats.meetings, "Meetings")}
            {createThemedCard(<DollarSign />, stats.pendingPayouts, "Pending Payouts")}
            {createThemedCard(<DollarSign />, stats.completedPayouts, "Completed Payouts")}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerHomeView;
