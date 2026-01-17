-- FIX RLS POLICIES - Allow users to read their own profile
-- This is critical for login to work

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Managers can view all users" ON public.users;
DROP POLICY IF EXISTS "Managers can update all users" ON public.users;
DROP POLICY IF EXISTS "Managers can delete users" ON public.users;

-- Recreate policies with correct logic

-- 1. Users can view their own profile (CRITICAL for login)
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. Managers can view all users
CREATE POLICY "Managers can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'MANAGER'
    )
  );

-- 3. Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 4. Managers can update all users
CREATE POLICY "Managers can update all users"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'MANAGER'
    )
  );

-- 5. Managers can delete users
CREATE POLICY "Managers can delete users"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'MANAGER'
    )
  );

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users';

-- Test query (should return the logged-in user)
SELECT id, email, username, role, status FROM public.users WHERE id = auth.uid();
