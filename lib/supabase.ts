import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          role: 'EDITOR' | 'MANAGER'
          status: 'PENDING' | 'APPROVED' | 'REJECTED'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          role: 'EDITOR' | 'MANAGER'
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          role?: 'EDITOR' | 'MANAGER'
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          avatar_url?: string | null
          updated_at?: string
        }
      }
      task_tables: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          updated_at?: string
        }
      }
      task_records: {
        Row: {
          id: string
          table_id: string
          task_number: string
          task_name: string
          deadline: string
          status: 'Not Started' | "Can't Do" | 'Editing' | 'Done'
          raw_file_link: string
          edited_file_link: string
          approval_from_idyll: boolean
          assigned_to: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          table_id: string
          task_number: string
          task_name: string
          deadline: string
          status?: 'Not Started' | "Can't Do" | 'Editing' | 'Done'
          raw_file_link?: string
          edited_file_link?: string
          approval_from_idyll?: boolean
          assigned_to: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_name?: string
          deadline?: string
          status?: 'Not Started' | "Can't Do" | 'Editing' | 'Done'
          raw_file_link?: string
          edited_file_link?: string
          approval_from_idyll?: boolean
          assigned_to?: string
          updated_at?: string
        }
      }
      payout_tables: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          updated_at?: string
        }
      }
      payout_records: {
        Row: {
          id: string
          table_id: string
          project_name: string
          project_link: string
          amount: number
          status: 'Pending' | 'Done'
          assigned_to: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          table_id: string
          project_name: string
          project_link: string
          amount: number
          status?: 'Pending' | 'Done'
          assigned_to: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_name?: string
          project_link?: string
          amount?: number
          status?: 'Pending' | 'Done'
          assigned_to?: string
          updated_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          name: string
          date: string
          time: string
          link: string
          attendees: string[]
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          date: string
          time: string
          link: string
          attendees: string[]
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          date?: string
          time?: string
          link?: string
          attendees?: string[]
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          username: string
          action: string
          object_type: string
          old_value: string | null
          new_value: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          action: string
          object_type: string
          old_value?: string | null
          new_value?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          action?: string
          object_type?: string
          old_value?: string | null
          new_value?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'task' | 'meeting' | 'payout'
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: 'task' | 'meeting' | 'payout'
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          read?: boolean
        }
      }
    }
  }
}