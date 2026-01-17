-- Test if RLS is blocking user fetch
-- Run this in Supabase SQL Editor

-- 1. Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- 2. Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users';

-- 3. TEMPORARY FIX: Allow all authenticated users to read users table
DROP POLICY IF EXISTS "Users can view all approved users" ON public.users;
DROP POLICY IF EXISTS "Users can view all users" ON public.users;

CREATE POLICY "Allow authenticated users to read users" ON public.users
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- 4. Verify the policy was created
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';

-- 5. Test query (this simulates what the app does)
SELECT email, role, status FROM public.users;
