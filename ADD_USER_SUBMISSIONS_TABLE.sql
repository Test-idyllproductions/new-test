-- CREATE USER SUBMISSIONS TABLE
-- This table stores applications from people who want to become editors

CREATE TABLE IF NOT EXISTS public.user_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'CONTACTED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.user_submissions ENABLE ROW LEVEL SECURITY;

-- Managers can see all submissions
CREATE POLICY "Managers can view all submissions"
  ON public.user_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'MANAGER'
    )
  );

-- Managers can update submissions
CREATE POLICY "Managers can update submissions"
  ON public.user_submissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'MANAGER'
    )
  );

-- Anyone can insert (no auth required for applications)
CREATE POLICY "Anyone can submit applications"
  ON public.user_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Managers can delete submissions
CREATE POLICY "Managers can delete submissions"
  ON public.user_submissions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'MANAGER'
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_submissions;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_submissions_status ON public.user_submissions(status);
CREATE INDEX IF NOT EXISTS idx_user_submissions_created_at ON public.user_submissions(created_at DESC);

-- Verify table creation
SELECT 
  'user_submissions table created successfully' as status,
  COUNT(*) as submission_count
FROM public.user_submissions;
