import React from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { TaskStatus } from '../types';
import { CheckSquare, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import MagicBento from '../components/MagicBento';

const HomeView: React.FC = () => {
  const { currentUser, taskRecords, meetings, payoutRecords } = useSupabaseStore();

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Filter data for current editor only
  const myTasks = taskRecords.filter(t => t.assignedTo === currentUser?.id);
  const myMeetings = meetings.filter(m => m.attendees.includes(currentUser?.id || ''));
  const myPayouts = payoutRecords.filter(p => p.assignedTo === currentUser?.id);

  // Calculate stats
  const totalTasks = myTasks.length;
  const editingTasks = myTasks.filter(t => t.status === TaskStatus.EDITING).length;
  const completedTasks = myTasks.filter(t => t.status === TaskStatus.DONE).length;
  const upcomingMeetings = myMeetings.length;
  const pendingPayouts = myPayouts.filter(p => p.status === 'Pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">
          {getGreeting()}, {currentUser?.username}
        </h1>
        <p className="text-secondary text-lg">Here's your work overview for today.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MagicBento
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          spotlightRadius={200}
          particleCount={8}
          glowColor="59, 130, 246"
          className="p-6 bg-card border border-border rounded-2xl text-center transition-colors"
        >
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center">
            <CheckSquare className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-primary">{totalTasks}</p>
          <p className="text-xs text-secondary mt-1 font-medium">Total Tasks</p>
        </MagicBento>

        <MagicBento
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          spotlightRadius={200}
          particleCount={8}
          glowColor="6, 182, 212"
          className="p-6 bg-card border border-border rounded-2xl text-center transition-colors"
        >
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-primary">{editingTasks}</p>
          <p className="text-xs text-secondary mt-1 font-medium">Editing Tasks</p>
        </MagicBento>

        <MagicBento
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          spotlightRadius={200}
          particleCount={8}
          glowColor="16, 185, 129"
          className="p-6 bg-card border border-border rounded-2xl text-center transition-colors"
        >
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckSquare className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-primary">{completedTasks}</p>
          <p className="text-xs text-secondary mt-1 font-medium">Completed Tasks</p>
        </MagicBento>

        <MagicBento
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          spotlightRadius={200}
          particleCount={8}
          glowColor="99, 102, 241"
          className="p-6 bg-card border border-border rounded-2xl text-center transition-colors"
        >
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-primary">{upcomingMeetings}</p>
          <p className="text-xs text-secondary mt-1 font-medium">Upcoming Meetings</p>
        </MagicBento>

        <MagicBento
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          spotlightRadius={200}
          particleCount={8}
          glowColor="234, 179, 8"
          className="p-6 bg-card border border-border rounded-2xl text-center transition-colors"
        >
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-primary">{pendingPayouts}</p>
          <p className="text-xs text-secondary mt-1 font-medium">Pending Payouts</p>
        </MagicBento>
      </div>
    </div>
  );
};

export default HomeView;
