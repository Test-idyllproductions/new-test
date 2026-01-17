import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { 
  User, UserRole, UserStatus, TaskStatus, PayoutStatus, 
  TaskManagementRecord, PayoutRecord, Meeting, AuditLog, AppView 
} from '../types';

interface DatabaseTable {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'task' | 'meeting' | 'payout';
  read: boolean;
  created_at: string;
}

interface SupabaseAppState {
  // Auth
  session: Session | null;
  currentUser: User | null;
  loading: boolean;
  
  // Data
  users: User[];
  taskTables: DatabaseTable[];
  taskRecords: TaskManagementRecord[];
  payoutTables: DatabaseTable[];
  payoutRecords: PayoutRecord[];
  meetings: Meeting[];
  logs: AuditLog[];
  notifications: Notification[];
  
  // UI
  currentView: AppView;
}

interface SupabaseAppContextType extends SupabaseAppState {
  // Auth functions
  signUp: (email: string, password: string, username: string, role: UserRole) => Promise<{ error?: any }>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  
  // UI functions
  setView: (view: AppView) => void;
  
  // User functions
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Task Management functions
  createTaskTable: (name: string) => Promise<string>;
  deleteTaskTable: (id: string) => Promise<void>;
  addTaskRecord: (tableId: string, record: Omit<TaskManagementRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updateTaskRecord: (id: string, updates: Partial<TaskManagementRecord>) => Promise<void>;
  deleteTaskRecord: (id: string) => Promise<void>;
  
  // Payout functions
  createPayoutTable: (name: string) => Promise<string>;
  deletePayoutTable: (id: string) => Promise<void>;
  addPayoutRecord: (tableId: string, record: Omit<PayoutRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updatePayoutRecord: (id: string, updates: Partial<PayoutRecord>) => Promise<void>;
  deletePayoutRecord: (id: string) => Promise<void>;
  
  // Meeting functions
  addMeeting: (meeting: Omit<Meeting, 'id'>) => Promise<void>;
  updateMeeting: (id: string, updates: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  
  // Notification functions
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  
  // Audit functions
  logAction: (action: string, objectType: string, oldValue?: string, newValue?: string) => Promise<void>;
  clearLogs: () => Promise<void>;
}

const SupabaseAppContext = createContext<SupabaseAppContextType | undefined>(undefined);

export const SupabaseAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [taskTables, setTaskTables] = useState<DatabaseTable[]>([]);
  const [taskRecords, setTaskRecords] = useState<TaskManagementRecord[]>([]);
  const [payoutTables, setPayoutTables] = useState<DatabaseTable[]>([]);
  const [payoutRecords, setPayoutRecords] = useState<PayoutRecord[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Notification sound
  const [notificationSound, setNotificationSound] = useState<HTMLAudioElement | null>(null);
  
  // UI state
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const hash = window.location.hash.replace('#', '') as AppView;
    const path = window.location.pathname.replace('/', '') as AppView;
    const validViews = ['landing', 'login', 'signup', 'pending', 'home', 'tasks', 'meetings', 'payouts', 'approvals', 'user-management', 'settings'];
    
    if (hash && validViews.includes(hash)) return hash;
    if (path && validViews.includes(path)) return path;
    return 'landing';
  });

  // Initialize notification sound
  useEffect(() => {
    const audio = new Audio('/sounds/editornotification.mp3');
    audio.preload = 'auto';
    setNotificationSound(audio);
    
    // Set a timeout to stop loading if it takes too long
    const loadingTimeout = setTimeout(() => {
      console.warn('Loading timeout - forcing loading to false');
      setLoading(false);
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(loadingTimeout);
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    const soundEnabled = currentUser?.soundEnabled !== false;
    if (soundEnabled && notificationSound) {
      notificationSound.currentTime = 0;
      notificationSound.play().catch(console.error);
    }
  }, [currentUser?.soundEnabled, notificationSound]);

  // Initialize auth
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      
      // If there's a session, fetch the user profile
      if (session?.user) {
        fetchCurrentUser(session.user.id);
      }
    }).catch((error) => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔵 Auth state changed:', { 
        event, 
        hasSession: !!session,
        userId: session?.user?.id || 'none',
        email: session?.user?.email || 'none'
      });
      setSession(session);
      setLoading(false);
      
      if (session?.user) {
        console.log('🔵 Session exists, fetching user profile...');
        await fetchCurrentUser(session.user.id);
      } else {
        console.log('🔵 No session, clearing currentUser');
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch current user profile
  const fetchCurrentUser = async (userId: string) => {
    console.log('🔵 fetchCurrentUser called:', { userId });
    
    // Hardcoded manager fallback
    if (userId === '1502cfea-63ca-4278-8280-79ad39fdb207') {
      console.log('🟢 Using hardcoded manager');
      const user: User = {
        id: '1502cfea-63ca-4278-8280-79ad39fdb207',
        username: 'Idyll Manager',
        email: 'idyllproductionsofficial@gmail.com',
        role: UserRole.MANAGER,
        status: UserStatus.APPROVED,
        theme: 'dark',
        soundEnabled: true
      };
      setCurrentUser(user);
      setLoading(false);
      return;
    }
    
    // For all other users, get from auth and create profile if needed
    console.log('🟡 Getting user from auth...');
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        console.error('🔴 No auth user found');
        setCurrentUser(null);
        setLoading(false);
        return;
      }
      
      console.log('🔵 Auth user found:', authUser.email);
      
      // Try to get existing user profile with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 5000)
      );
      
      let userData = null;
      try {
        const queryPromise = supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        const result = await Promise.race([queryPromise, timeoutPromise]) as any;
        userData = result?.data;
        console.log('🔵 Query result:', userData ? 'found' : 'not found');
      } catch (err: any) {
        console.log('🟡 Query timeout or error, will create profile');
      }
      
      if (userData) {
        // User exists in database
        const user: User = {
          id: userData.id,
          username: userData.username || 'user',
          email: userData.email || '',
          role: (userData.role as UserRole) || UserRole.EDITOR,
          status: (userData.status as UserStatus) || UserStatus.PENDING,
          avatar: userData.avatar_url,
          theme: userData.theme || 'dark',
          soundEnabled: userData.sound_enabled !== false
        };
        console.log('✅ User loaded:', user.email, user.role, user.status);
        setCurrentUser(user);
      } else {
        // Create user from auth data
        console.log('🟡 Creating user profile...');
        const username = authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user';
        
        // Try to insert (ignore if already exists)
        await supabase.from('users').insert({
          id: authUser.id,
          email: authUser.email || '',
          username: username,
          role: 'EDITOR',
          status: 'PENDING',
          theme: 'dark',
          sound_enabled: true
        }).then(() => {}).catch(() => {});
        
        // Create user object
        const user: User = {
          id: authUser.id,
          username: username,
          email: authUser.email || '',
          role: UserRole.EDITOR,
          status: UserStatus.PENDING,
          theme: 'dark',
          soundEnabled: true
        };
        console.log('✅ User profile created:', user.email);
        setCurrentUser(user);
      }
    } catch (error: any) {
      console.error('🔴 fetchCurrentUser error:', error?.message || error);
      setCurrentUser(null);
    }
    setLoading(false);
  };

  // Helper function removed - integrated above

  // Fetch all data when user is authenticated
  useEffect(() => {
    console.log('🔵 User effect triggered:', { 
      hasUser: !!currentUser,
      email: currentUser?.email || 'none',
      role: currentUser?.role || 'none',
      status: currentUser?.status || 'none',
      currentView: currentView
    });
    
    if (currentUser) {
      console.log('🔵 Fetching all data...');
      fetchAllData();
      setupRealtimeSubscriptions();
      
      // Auto-redirect based on user role and status after login
      if (currentUser.status === UserStatus.PENDING || currentUser.status === UserStatus.REJECTED) {
        console.log('🟡 User is PENDING/REJECTED, redirecting to pending page');
        setView('pending');
      } else if (currentUser.status === UserStatus.APPROVED) {
        // Only redirect to appropriate view if we're on login/signup/landing pages
        if (currentView === 'login' || currentView === 'signup' || currentView === 'landing') {
          console.log('✅ User is APPROVED, redirecting to home');
          // Both managers and editors redirect to home (role-based rendering in App.tsx)
          setView('home');
        } else {
          console.log('🔵 User approved but not on auth page, staying on:', currentView);
        }
      }
    }
  }, [currentUser, currentView]); // Include currentView so redirect logic works

  const fetchAllData = async () => {
    try {
      // Fetch users - managers see all users (including pending), editors see only approved
      const usersQuery = supabase.from('users').select('*');
      
      // If current user is not a manager, only show approved users
      if (currentUser?.role !== UserRole.MANAGER) {
        usersQuery.eq('status', 'APPROVED');
      }
      
      const { data: usersData } = await usersQuery;
      
      if (usersData) {
        const mappedUsers: User[] = usersData.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role as UserRole,
          status: u.status as UserStatus,
          avatar: u.avatar_url
        }));
        setUsers(mappedUsers);
      }

      // Fetch task tables
      const { data: taskTablesData } = await supabase
        .from('task_tables')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (taskTablesData) {
        setTaskTables(taskTablesData.map(t => ({
          id: t.id,
          name: t.name,
          created_at: t.created_at,
          updated_at: t.updated_at,
          created_by: t.created_by
        })));
      }

      // Fetch task records - Editors see only assigned, Managers see all
      let taskRecordsQuery = supabase
        .from('task_records')
        .select('*')
        .order('created_at', { ascending: true });
      
      // Filter for editors
      if (currentUser?.role === UserRole.EDITOR) {
        taskRecordsQuery = taskRecordsQuery.eq('assigned_to', currentUser.id);
      }
      
      const { data: taskRecordsData } = await taskRecordsQuery;
      
      if (taskRecordsData) {
        const mappedTaskRecords: TaskManagementRecord[] = taskRecordsData.map(r => ({
          id: r.id,
          tableId: r.table_id,
          taskNumber: r.task_number,
          taskName: r.task_name,
          deadline: r.deadline,
          status: r.status as TaskStatus,
          rawFileLink: r.raw_file_link,
          editedFileLink: r.edited_file_link,
          approvalFromIdyll: r.approval_from_idyll,
          assignedTo: r.assigned_to,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          createdBy: r.created_by
        }));
        setTaskRecords(mappedTaskRecords);
      }

      // Fetch payout tables
      const { data: payoutTablesData } = await supabase
        .from('payout_tables')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (payoutTablesData) {
        setPayoutTables(payoutTablesData.map(t => ({
          id: t.id,
          name: t.name,
          created_at: t.created_at,
          updated_at: t.updated_at,
          created_by: t.created_by
        })));
      }

      // Fetch payout records - Editors see only assigned, Managers see all
      let payoutRecordsQuery = supabase
        .from('payout_records')
        .select('*')
        .order('created_at', { ascending: true });
      
      // Filter for editors
      if (currentUser?.role === UserRole.EDITOR) {
        payoutRecordsQuery = payoutRecordsQuery.eq('assigned_to', currentUser.id);
      }
      
      const { data: payoutRecordsData } = await payoutRecordsQuery;
      
      if (payoutRecordsData) {
        const mappedPayoutRecords: PayoutRecord[] = payoutRecordsData.map(r => ({
          id: r.id,
          tableId: r.table_id,
          projectName: r.project_name,
          projectLink: r.project_link,
          amount: r.amount,
          status: r.status as PayoutStatus,
          assignedTo: r.assigned_to,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          createdBy: r.created_by
        }));
        setPayoutRecords(mappedPayoutRecords);
      }

      // Fetch meetings - Editors see only assigned (attendees), Managers see all
      let meetingsQuery = supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: true });
      
      // Filter for editors - meetings where they are attendees
      if (currentUser?.role === UserRole.EDITOR) {
        meetingsQuery = meetingsQuery.contains('attendees', [currentUser.id]);
      }
      
      const { data: meetingsData } = await meetingsQuery;
      
      if (meetingsData) {
        const mappedMeetings: Meeting[] = meetingsData.map(m => ({
          id: m.id,
          name: m.name,
          date: m.date,
          time: m.time,
          link: m.link,
          attendees: m.attendees
        }));
        setMeetings(mappedMeetings);
      }

      // Fetch audit logs
      const { data: logsData } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      
      if (logsData) {
        const mappedLogs: AuditLog[] = logsData.map(l => ({
          id: l.id,
          userId: l.user_id,
          username: l.username,
          action: l.action,
          objectType: l.object_type,
          timestamp: l.timestamp,
          oldValue: l.old_value,
          newValue: l.new_value
        }));
        setLogs(mappedLogs);
      }

      // Fetch notifications for current user
      if (currentUser) {
        const { data: notificationsData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });
        
        if (notificationsData) {
          setNotifications(notificationsData);
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to all table changes for real-time updates
    const channels = [
      supabase.channel('users').on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        console.log('🔵 Real-time user change detected:', payload);
        fetchAllData();
      }),
      supabase.channel('task_tables').on('postgres_changes', { event: '*', schema: 'public', table: 'task_tables' }, () => fetchAllData()),
      supabase.channel('task_records').on('postgres_changes', { event: '*', schema: 'public', table: 'task_records' }, () => fetchAllData()),
      supabase.channel('payout_tables').on('postgres_changes', { event: '*', schema: 'public', table: 'payout_tables' }, () => fetchAllData()),
      supabase.channel('payout_records').on('postgres_changes', { event: '*', schema: 'public', table: 'payout_records' }, () => fetchAllData()),
      supabase.channel('meetings').on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, () => fetchAllData()),
      supabase.channel('audit_logs').on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => fetchAllData()),
      supabase.channel('notifications').on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetchAllData())
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  };

  // Auth functions
  const signUp = async (email: string, password: string, username: string, role: UserRole) => {
    try {
      // Sign up with email confirmation disabled
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            username,
            role
          }
        }
      });

      if (error) return { error };

      // The database trigger (handle_new_user) will automatically create the user profile
      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error };
    }
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    console.log('🔵 signIn function called:', { input: emailOrUsername });
    try {
      // Check if input is email or username
      const isEmail = emailOrUsername.includes('@');
      
      if (isEmail) {
        // Login with email directly
        console.log('🔵 Logging in with email');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailOrUsername,
          password
        });
        console.log('🔵 Supabase auth response:', { 
          user: data?.user?.email || 'none', 
          session: data?.session ? 'exists' : 'none',
          error: error?.message || 'none' 
        });
        return { error };
      } else {
        // Login with username - need to find email first
        console.log('🔵 Logging in with username, looking up email...');
        const { data: userData, error: lookupError } = await supabase
          .from('users')
          .select('email')
          .eq('username', emailOrUsername)
          .single();
        
        if (lookupError || !userData) {
          console.log('🔴 Username not found');
          return { error: { message: 'Invalid credentials' } };
        }
        
        console.log('🔵 Found email for username, attempting login');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password
        });
        console.log('🔵 Supabase auth response:', { 
          user: data?.user?.email || 'none', 
          session: data?.session ? 'exists' : 'none',
          error: error?.message || 'none' 
        });
        return { error };
      }
    } catch (error) {
      console.log('🔴 signIn catch error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setView('landing');
  };

  // UI functions
  const setView = useCallback((view: AppView) => {
    console.log('setView called with:', view);
    setCurrentView(view);
    window.location.hash = view;
    if (window.history.pushState) {
      window.history.pushState(null, '', `/${view}`);
    }
    // Force re-render by triggering a state change
    console.log('View changed to:', view);
  }, []);

  // User functions
  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const updateData: any = {};
      if (updates.username !== undefined) updateData.username = updates.username;
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.avatar !== undefined) updateData.avatar_url = updates.avatar;
      if (updates.theme !== undefined) updateData.theme = updates.theme;
      if (updates.soundEnabled !== undefined) updateData.sound_enabled = updates.soundEnabled;

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      await logAction('UPDATE', 'USER', id, JSON.stringify(updates));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await logAction('DELETE', 'USER', id);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Task Management functions
  const createTaskTable = async (name: string): Promise<string> => {
    if (currentUser?.role !== UserRole.MANAGER) {
      throw new Error('Only managers can create task tables');
    }
    
    try {
      const { data, error } = await supabase
        .from('task_tables')
        .insert({
          name,
          created_by: currentUser!.id
        })
        .select()
        .single();

      if (error) throw error;
      
      await logAction('CREATE', 'TASK_TABLE', undefined, name);
      return data.id;
    } catch (error) {
      console.error('Error creating task table:', error);
      throw error;
    }
  };

  const deleteTaskTable = async (id: string) => {
    if (currentUser?.role !== UserRole.MANAGER) {
      throw new Error('Only managers can delete task tables');
    }
    
    try {
      const { error } = await supabase
        .from('task_tables')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await logAction('DELETE', 'TASK_TABLE', id);
    } catch (error) {
      console.error('Error deleting task table:', error);
    }
  };

  const addTaskRecord = async (tableId: string, record: Omit<TaskManagementRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    if (currentUser?.role !== UserRole.MANAGER) {
      throw new Error('Only managers can create tasks');
    }
    
    try {
      const { error } = await supabase
        .from('task_records')
        .insert({
          table_id: tableId,
          task_number: record.taskNumber,
          task_name: record.taskName,
          deadline: record.deadline,
          status: record.status,
          raw_file_link: record.rawFileLink,
          edited_file_link: record.editedFileLink,
          approval_from_idyll: record.approvalFromIdyll,
          assigned_to: record.assignedTo,
          created_by: currentUser!.id
        });

      if (error) throw error;
      
      await logAction('CREATE', 'TASK_RECORD', undefined, record.taskName);
      
      // Create notification for assigned user
      if (record.assignedTo !== currentUser!.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: record.assignedTo,
            title: 'New Task Assigned',
            message: `You have been assigned a new task: ${record.taskName}`,
            type: 'task'
          });
        
        // Play notification sound for the current user (manager assigning task)
        playNotificationSound();
      }
    } catch (error) {
      console.error('Error adding task record:', error);
      throw error;
    }
  };

  const updateTaskRecord = async (id: string, updates: Partial<TaskManagementRecord>) => {
    try {
      const updateData: any = {};
      if (updates.taskName !== undefined) updateData.task_name = updates.taskName;
      if (updates.deadline !== undefined) updateData.deadline = updates.deadline;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.rawFileLink !== undefined) updateData.raw_file_link = updates.rawFileLink;
      if (updates.editedFileLink !== undefined) updateData.edited_file_link = updates.editedFileLink;
      if (updates.approvalFromIdyll !== undefined) updateData.approval_from_idyll = updates.approvalFromIdyll;
      if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo;

      const { error } = await supabase
        .from('task_records')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      await logAction('UPDATE', 'TASK_RECORD', id, JSON.stringify(updates));
    } catch (error) {
      console.error('Error updating task record:', error);
    }
  };

  const deleteTaskRecord = async (id: string) => {
    if (currentUser?.role !== UserRole.MANAGER) {
      throw new Error('Only managers can delete tasks');
    }
    
    try {
      const { error } = await supabase
        .from('task_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await logAction('DELETE', 'TASK_RECORD', id);
    } catch (error) {
      console.error('Error deleting task record:', error);
      throw error;
    }
  };

  // Payout functions
  const createPayoutTable = async (name: string): Promise<string> => {
    if (currentUser?.role !== UserRole.MANAGER) {
      throw new Error('Only managers can create payout tables');
    }
    
    try {
      const { data, error } = await supabase
        .from('payout_tables')
        .insert({
          name,
          created_by: currentUser!.id
        })
        .select()
        .single();

      if (error) throw error;
      
      await logAction('CREATE', 'PAYOUT_TABLE', undefined, name);
      return data.id;
    } catch (error) {
      console.error('Error creating payout table:', error);
      throw error;
    }
  };

  const deletePayoutTable = async (id: string) => {
    if (currentUser?.role !== UserRole.MANAGER) {
      throw new Error('Only managers can delete payout tables');
    }
    
    try {
      const { error } = await supabase
        .from('payout_tables')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await logAction('DELETE', 'PAYOUT_TABLE', id);
    } catch (error) {
      console.error('Error deleting payout table:', error);
    }
  };

  const addPayoutRecord = async (tableId: string, record: Omit<PayoutRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    if (currentUser?.role !== UserRole.MANAGER) {
      throw new Error('Only managers can create payouts');
    }
    
    try {
      const { error } = await supabase
        .from('payout_records')
        .insert({
          table_id: tableId,
          project_name: record.projectName,
          project_link: record.projectLink,
          amount: record.amount,
          status: record.status,
          assigned_to: record.assignedTo,
          created_by: currentUser!.id
        });

      if (error) throw error;
      
      await logAction('CREATE', 'PAYOUT_RECORD', undefined, record.projectName);
      
      // Create notification for assigned user
      if (record.assignedTo !== currentUser!.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: record.assignedTo,
            title: 'New Payout Added',
            message: `A new payout has been added for project: ${record.projectName}`,
            type: 'payout'
          });
        
        // Play notification sound
        playNotificationSound();
      }
    } catch (error) {
      console.error('Error adding payout record:', error);
      throw error;
    }
  };

  const updatePayoutRecord = async (id: string, updates: Partial<PayoutRecord>) => {
    try {
      const updateData: any = {};
      if (updates.projectName !== undefined) updateData.project_name = updates.projectName;
      if (updates.projectLink !== undefined) updateData.project_link = updates.projectLink;
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo;

      const { error } = await supabase
        .from('payout_records')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      await logAction('UPDATE', 'PAYOUT_RECORD', id, JSON.stringify(updates));
    } catch (error) {
      console.error('Error updating payout record:', error);
    }
  };

  const deletePayoutRecord = async (id: string) => {
    if (currentUser?.role !== UserRole.MANAGER) {
      throw new Error('Only managers can delete payouts');
    }
    
    try {
      const { error } = await supabase
        .from('payout_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await logAction('DELETE', 'PAYOUT_RECORD', id);
    } catch (error) {
      console.error('Error deleting payout record:', error);
      throw error;
    }
  };

  // Meeting functions
  const addMeeting = async (meeting: Omit<Meeting, 'id'>) => {
    if (currentUser?.role !== UserRole.MANAGER) {
      throw new Error('Only managers can create meetings');
    }
    
    try {
      const { error } = await supabase
        .from('meetings')
        .insert({
          name: meeting.name,
          date: meeting.date,
          time: meeting.time,
          link: meeting.link,
          attendees: meeting.attendees,
          created_by: currentUser!.id
        });

      if (error) throw error;
      
      await logAction('CREATE', 'MEETING', undefined, meeting.name);
      
      // Create notifications for attendees
      for (const attendeeId of meeting.attendees) {
        if (attendeeId !== currentUser!.id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: attendeeId,
              title: 'New Meeting Scheduled',
              message: `You have been invited to: ${meeting.name} on ${meeting.date} at ${meeting.time}`,
              type: 'meeting'
            });
        }
      }
      
      // Play notification sound
      if (meeting.attendees.length > 1) {
        playNotificationSound();
      }
    } catch (error) {
      console.error('Error adding meeting:', error);
      throw error;
    }
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
    if (currentUser?.role !== UserRole.MANAGER) {
      throw new Error('Only managers can update meetings');
    }
    
    try {
      const { error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await logAction('UPDATE', 'MEETING', id, JSON.stringify(updates));
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  };

  const deleteMeeting = async (id: string) => {
    if (currentUser?.role !== UserRole.MANAGER) {
      throw new Error('Only managers can delete meetings');
    }
    
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await logAction('DELETE', 'MEETING', id);
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  };

  // Notification functions
  const markNotificationAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', currentUser!.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Audit functions
  const logAction = async (action: string, objectType: string, oldValue?: string, newValue?: string) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: currentUser.id,
          username: currentUser.username,
          action,
          object_type: objectType,
          old_value: oldValue,
          new_value: newValue
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  const clearLogs = async () => {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;
      
      await logAction('CLEAR', 'AUDIT_LOG');
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };

  const value = {
    // Auth
    session,
    currentUser,
    loading,
    
    // Data
    users,
    taskTables,
    taskRecords,
    payoutTables,
    payoutRecords,
    meetings,
    logs,
    notifications,
    
    // UI
    currentView,
    
    // Auth functions
    signUp,
    signIn,
    signOut,
    setCurrentUser,
    
    // UI functions
    setView,
    
    // User functions
    updateUser,
    deleteUser,
    
    // Task Management functions
    createTaskTable,
    deleteTaskTable,
    addTaskRecord,
    updateTaskRecord,
    deleteTaskRecord,
    
    // Payout functions
    createPayoutTable,
    deletePayoutTable,
    addPayoutRecord,
    updatePayoutRecord,
    deletePayoutRecord,
    
    // Meeting functions
    addMeeting,
    updateMeeting,
    deleteMeeting,
    
    // Notification functions
    markNotificationAsRead,
    markAllNotificationsAsRead,
    
    // Audit functions
    logAction,
    clearLogs
  };

  return <SupabaseAppContext.Provider value={value}>{children}</SupabaseAppContext.Provider>;
};

export const useSupabaseStore = () => {
  const context = useContext(SupabaseAppContext);
  if (!context) throw new Error('useSupabaseStore must be used within SupabaseAppProvider');
  return context;
};