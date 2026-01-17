import React, { useState, useEffect } from 'react';
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
  const [chartData, setChartData] = useState([65, 45, 78, 52, 89, 34, 67]);
  const [expenseData, setExpenseData] = useState({ freelance: 700, utilities: 400 });

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update chart data with realistic variations
      setChartData(prev => prev.map(value => {
        const variation = (Math.random() - 0.5) * 20; // ±10 variation
        const newValue = Math.max(20, Math.min(95, value + variation));
        return Math.round(newValue);
      }));

      // Update expense data
      setExpenseData(prev => ({
        freelance: Math.max(500, Math.min(900, prev.freelance + (Math.random() - 0.5) * 100)),
        utilities: Math.max(300, Math.min(600, prev.utilities + (Math.random() - 0.5) * 50))
      }));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

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
        <div className="relative">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full md:w-96 px-4 py-3 pr-12 rounded-lg transition-all focus:outline-none focus:ring-2 focus:border-transparent appearance-none cursor-pointer"
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
          {/* Enhanced Custom Arrow */}
          <div 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none transition-all duration-200"
            style={{ 
              color: currentTheme.primary,
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
            }}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="transition-transform duration-200"
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
        </div>
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

      {/* Performance Flow and Expense Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Performance Flow Chart */}
        <div 
          className="p-6 rounded-xl transition-all duration-300 chart-container"
          style={{
            backgroundColor: theme === 'dark' 
              ? 'rgba(15, 23, 42, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${currentTheme.primary}30`,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 
                className="text-lg font-bold"
                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
              >
                Performance Flow
              </h3>
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: '#10b981' }}
                />
                <span 
                  className="text-xs font-medium"
                  style={{ color: '#10b981' }}
                >
                  Live
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                className="px-3 py-1 text-xs rounded-lg transition-all"
                style={{
                  backgroundColor: currentTheme.primary,
                  color: theme === 'dark' ? '#ffffff' : '#000000'
                }}
              >
                Daily
              </button>
              <button 
                className="px-3 py-1 text-xs rounded-lg transition-all"
                style={{
                  backgroundColor: 'transparent',
                  color: theme === 'dark' ? '#94a3b8' : '#64748b',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#d1d5db'}`
                }}
              >
                Monthly
              </button>
            </div>
          </div>
          
          {/* Real-time Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-2 px-4">
            {chartData.map((height, index) => (
              <div key={index} className="flex flex-col items-center gap-2 chart-interactive">
                <div 
                  className="w-8 rounded-t-lg transition-all duration-1000 ease-out chart-bar data-update"
                  style={{
                    height: `${height}%`,
                    backgroundColor: currentTheme.primary,
                    boxShadow: `0 0 20px ${currentTheme.primary}40`,
                    animation: `growUp 1.5s ease-out ${index * 0.1}s both, pulse 3s ease-in-out infinite ${index * 0.2}s`
                  }}
                  title={`${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]}: ${height}%`}
                />
                <span 
                  className="text-xs font-medium"
                  style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}
                >
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown Donut Chart */}
        <div 
          className="p-6 rounded-xl transition-all duration-300 chart-container"
          style={{
            backgroundColor: theme === 'dark' 
              ? 'rgba(15, 23, 42, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${currentTheme.primary}30`,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 
                className="text-lg font-bold"
                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
              >
                Expense Breakdown
              </h3>
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: '#10b981' }}
                />
                <span 
                  className="text-xs font-medium"
                  style={{ color: '#10b981' }}
                >
                  Live
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            {/* Animated Donut Chart */}
            <div className="relative w-40 h-40 chart-interactive">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                  strokeWidth="8"
                />
                
                {/* Freelance Talent - Dynamic percentage */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={currentTheme.primary}
                  strokeWidth="8"
                  strokeDasharray={`${(expenseData.freelance / (expenseData.freelance + expenseData.utilities)) * 251.2} 251.2`}
                  strokeDashoffset="0"
                  className="transition-all duration-2000 ease-out donut-segment"
                  style={{
                    animation: 'drawCircle 2s ease-out forwards, pulse 4s ease-in-out infinite',
                    filter: `drop-shadow(0 0 8px ${currentTheme.primary}60)`
                  }}
                />
                
                {/* Utilities - Dynamic percentage */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="8"
                  strokeDasharray={`${(expenseData.utilities / (expenseData.freelance + expenseData.utilities)) * 251.2} 251.2`}
                  strokeDashoffset={`-${(expenseData.freelance / (expenseData.freelance + expenseData.utilities)) * 251.2}`}
                  className="transition-all duration-2000 ease-out donut-segment"
                  style={{
                    animation: 'drawCircle 2s ease-out 0.5s forwards, pulse 4s ease-in-out infinite 1s',
                    filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))'
                  }}
                />
              </svg>
              
              {/* Center Text - Dynamic total */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div 
                    className="text-2xl font-bold transition-all duration-500"
                    style={{ color: currentTheme.primary }}
                  >
                    ₹{Math.round(expenseData.freelance + expenseData.utilities)}
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}
                  >
                    Total
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend - Dynamic values */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between chart-legend-item" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full transition-all duration-500"
                  style={{ backgroundColor: currentTheme.primary }}
                />
                <span 
                  className="text-sm"
                  style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
                >
                  Freelance Talent ({Math.round((expenseData.freelance / (expenseData.freelance + expenseData.utilities)) * 100)}%)
                </span>
              </div>
              <span 
                className="text-sm font-semibold transition-all duration-500"
                style={{ color: currentTheme.primary }}
              >
                ₹{Math.round(expenseData.freelance)}
              </span>
            </div>
            
            <div className="flex items-center justify-between chart-legend-item" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cyan-500 transition-all duration-500" />
                <span 
                  className="text-sm"
                  style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
                >
                  Utilities ({Math.round((expenseData.utilities / (expenseData.freelance + expenseData.utilities)) * 100)}%)
                </span>
              </div>
              <span className="text-sm font-semibold text-cyan-500 transition-all duration-500">
                ₹{Math.round(expenseData.utilities)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerHomeView;
