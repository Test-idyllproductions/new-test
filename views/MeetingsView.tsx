
import React, { useState } from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { useDialog } from '../lib/dialog-context';
import { useTheme, COLOR_THEMES } from '../lib/theme-context';
import { UserRole, UserStatus } from '../types';
import { Plus, Calendar as CalendarIcon, Clock, Users, Link as LinkIcon, Trash2 } from 'lucide-react';

const MeetingsView: React.FC = () => {
  const { meetings, currentUser, users, addMeeting, deleteMeeting } = useSupabaseStore();
  const { showDialog } = useDialog();
  const { theme, colorTheme } = useTheme();
  const currentTheme = COLOR_THEMES[colorTheme];
  const isManager = currentUser?.role === UserRole.MANAGER;
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLink, setNewLink] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Editors only see their own meetings, managers see all or filtered by user
  const myMeetings = isManager ? meetings : meetings.filter(m => m.attendees.includes(currentUser?.id || ''));

  const handleAddMeeting = () => {
    if (!newName || !newDate) return;
    
    const attendees = selectedUserId ? [selectedUserId] : [currentUser?.id || ''];
    
    try {
      addMeeting({
        name: newName,
        date: newDate,
        time: newTime,
        link: newLink,
        attendees
      });
      
      setNewName('');
      setNewDate('');
      setNewTime('');
      setNewLink('');
      setSelectedUserId('');
      setIsAdding(false);
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      showDialog({
        type: 'error',
        title: 'Failed to Create Meeting',
        message: error.message || 'Failed to create meeting. Please try again.'
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary tracking-tight">Schedule & Calendar</h2>
        {isManager && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-lg"
            style={{
              backgroundColor: currentTheme.primary,
              color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            <Plus className="w-4 h-4" style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }} />
            <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>New Meeting</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
             <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="text-xs font-bold text-muted uppercase tracking-widest">Upcoming Agenda</span>
             </div>
             <div className="divide-y divide-border">
                {isAdding && (
                  <div className="p-6 bg-cyan-500/5 space-y-4 animate-fade-in">
                    <input 
                      className="w-full bg-input border border-border rounded-xl p-3 text-sm text-primary outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Meeting Name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                       <input 
                        type="date" 
                        className="bg-input border border-border rounded-xl p-3 text-sm text-primary outline-none focus:border-cyan-500 transition-colors"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                      />
                      <input 
                        type="time" 
                        className="bg-input border border-border rounded-xl p-3 text-sm text-primary outline-none focus:border-cyan-500 transition-colors"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                      />
                    </div>
                    <input 
                      className="w-full bg-input border border-border rounded-xl p-3 text-sm text-primary outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Video Link (Zoom/Meet)"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                    />
                    {isManager && (
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full bg-input border border-border rounded-xl p-3 text-sm text-primary outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value="">Select User</option>
                        {users.filter(u => u.role === UserRole.EDITOR && u.status === UserStatus.APPROVED).map(user => (
                          <option key={user.id} value={user.id}>{user.username}</option>
                        ))}
                      </select>
                    )}
                    <div className="flex justify-end space-x-2">
                       <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-muted hover:text-secondary font-bold uppercase text-xs transition-colors">Cancel</button>
                       <button 
                         onClick={handleAddMeeting} 
                         className="px-4 py-2 rounded-lg font-bold uppercase text-xs transition-colors"
                         style={{
                           backgroundColor: currentTheme.primary,
                           color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important`
                         }}
                         onMouseEnter={(e) => {
                           e.currentTarget.style.filter = 'brightness(1.1)';
                         }}
                         onMouseLeave={(e) => {
                           e.currentTarget.style.filter = 'brightness(1)';
                         }}
                       >
                         <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>Create</span>
                       </button>
                    </div>
                  </div>
                )}
                {myMeetings.length === 0 && !isAdding && (
                  <div className="p-12 text-center text-muted italic">No meetings scheduled.</div>
                )}
                {myMeetings.map(m => (
                  <div key={m.id} className="p-5 flex items-center justify-between hover:bg-hover transition-colors group">
                    <div className="flex items-center space-x-6">
                      <div className="text-center bg-input border border-border rounded-xl p-3 min-w-[70px]">
                        <p className="text-[10px] uppercase text-cyan-500 font-bold tracking-widest">{new Date(m.date).toLocaleString('en-US', { month: 'short' })}</p>
                        <p className="text-xl font-bold text-primary">{new Date(m.date).getDate()}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-primary">{m.name}</h4>
                        <div className="flex items-center space-x-4 text-xs text-secondary">
                           <div className="flex items-center">
                             <Clock className="w-3.5 h-3.5 mr-1.5" />
                             {m.time}
                           </div>
                           <div className="flex items-center">
                             <Users className="w-3.5 h-3.5 mr-1.5" />
                             {m.attendees.length} Attendees
                           </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <a 
                        href={m.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="px-4 py-2 bg-input border border-border text-primary text-xs font-bold rounded-lg flex items-center space-x-2 hover:bg-hover transition-colors"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Join Call</span>
                      </a>
                      {isManager && (
                        <button 
                          onClick={() => deleteMeeting(m.id)}
                          className="p-2 text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Mini Calendar Context */}
        <div className="space-y-6">
          <div className="p-6 bg-card border border-border rounded-3xl space-y-4 shadow-xl">
             <div className="flex items-center justify-between">
                <h3 className="font-bold text-primary">November 2024</h3>
                <div className="flex space-x-1">
                  <div className="w-6 h-6 rounded bg-input border border-border flex items-center justify-center cursor-pointer text-secondary hover:text-primary transition-colors">â€¹</div>
                  <div className="w-6 h-6 rounded bg-input border border-border flex items-center justify-center cursor-pointer text-secondary hover:text-primary transition-colors">â€º</div>
                </div>
             </div>
             <div className="grid grid-cols-7 text-[10px] text-muted text-center font-bold">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="pb-2">{d}</div>)}
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className={`py-2 rounded-lg cursor-pointer transition-colors ${i+1 === 15 ? 'bg-cyan-600 text-white font-bold' : 'hover:bg-hover text-secondary'}`}>
                    {i + 1}
                  </div>
                ))}
             </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-3xl shadow-xl">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Daily Context</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5"></div>
                <p className="text-xs text-secondary leading-relaxed">
                  Focus on finalizing <span className="font-bold text-primary">Project Omega</span> before the 3PM Sync.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5"></div>
                <p className="text-xs text-secondary leading-relaxed">
                  Budget review for <span className="font-bold text-primary">Client Alpha</span> is currently ongoing in the main board.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingsView;
