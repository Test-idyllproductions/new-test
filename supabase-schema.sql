-- Idyll Productions Workspace Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('EDITOR', 'MANAGER')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  avatar_url TEXT,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  sound_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Tables
CREATE TABLE IF NOT EXISTS public.task_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Records
CREATE TABLE IF NOT EXISTS public.task_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES public.task_tables(id) ON DELETE CASCADE,
  task_number TEXT NOT NULL,
  task_name TEXT NOT NULL,
  deadline DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'Can''t Do', 'Editing', 'Done')),
  raw_file_link TEXT DEFAULT '',
  edited_file_link TEXT DEFAULT '',
  approval_from_idyll BOOLEAN DEFAULT FALSE,
  assigned_to UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payout Tables
CREATE TABLE IF NOT EXISTS public.payout_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payout Records
CREATE TABLE IF NOT EXISTS public.payout_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES public.payout_tables(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_link TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Done')),
  assigned_to UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  link TEXT NOT NULL,
  attendees UUID[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  object_type TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('task', 'meeting', 'payout')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_records_table_id ON public.task_records(table_id);
CREATE INDEX IF NOT EXISTS idx_task_records_assigned_to ON public.task_records(assigned_to);
CREATE INDEX IF NOT EXISTS idx_payout_records_table_id ON public.payout_records(table_id);
CREATE INDEX IF NOT EXISTS idx_payout_records_assigned_to ON public.payout_records(assigned_to);
CREATE INDEX IF NOT EXISTS idx_meetings_attendees ON public.meetings USING GIN(attendees);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all approved users" ON public.users
  FOR SELECT USING (status = 'APPROVED' OR auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Managers can update any user" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'MANAGER'
    )
  );

-- RLS Policies for task_tables
CREATE POLICY "Anyone can view task tables" ON public.task_tables
  FOR SELECT USING (true);

CREATE POLICY "Managers can create task tables" ON public.task_tables
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'MANAGER'
    )
  );

CREATE POLICY "Managers can update task tables" ON public.task_tables
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'MANAGER'
    )
  );

CREATE POLICY "Managers can delete task tables" ON public.task_tables
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'MANAGER'
    )
  );

-- RLS Policies for task_records
CREATE POLICY "Users can view their assigned tasks" ON public.task_records
  FOR SELECT USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'MANAGER'
    )
  );

CREATE POLICY "Managers can create task records" ON public.task_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'MANAGER'
    )
  );

CREATE POLICY "Users can update their assigned tasks" ON public.task_records
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'MANAGER'
    )
  );

CREATE POLICY "Managers can delete task records" ON public.task_records
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'MANAGER'
    )
  );

-- RLS Policies for payout_tables (similar to task_tables)
CREATE POLICY "Anyone can view payout tables" ON public.payout_tables
  FOR SELECT USING (true);

CREATE POLICY "Managers can manage payout tables" ON public.payout_tables
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'MANAGER'
    )
  );

-- RLS Policies for payout_records
CREATE POLICY "Users can view their payouts" ON public.payout_records
  FOR SELECT USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'MANAGER'
    )
  );

CREATE POLICY "Managers can manage payout records" ON public.payout_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'MANAGER'
    )
  );

-- RLS Policies for meetings
CREATE POLICY "Users can view meetings they attend" ON public.meetings
  FOR SELECT USING (
    auth.uid() = ANY(attendees) OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'MANAGER'
    )
  );

CREATE POLICY "Managers can manage meetings" ON public.meetings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'MANAGER'
    )
  );

-- RLS Policies for audit_logs
CREATE POLICY "Anyone can view audit logs" ON public.audit_logs
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Anyone can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_tables_updated_at BEFORE UPDATE ON public.task_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_records_updated_at BEFORE UPDATE ON public.task_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payout_tables_updated_at BEFORE UPDATE ON public.payout_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payout_records_updated_at BEFORE UPDATE ON public.payout_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, role, status, theme, sound_enabled)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'EDITOR'),
    'PENDING',
    'dark',
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payout_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payout_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
