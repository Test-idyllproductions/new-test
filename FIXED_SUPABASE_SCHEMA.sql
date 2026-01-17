-- FIXED: Auto-create users with Manager bootstrap
-- Run this in Supabase SQL Editor to replace the existing trigger

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- NEW: Function to create user profile after signup with Manager bootstrap
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_status TEXT;
BEGIN
  -- MANAGER BOOTSTRAP: Auto-approve idyllproductionsofficial@gmail.com as MANAGER
  IF NEW.email = 'idyllproductionsofficial@gmail.com' THEN
    user_role := 'MANAGER';
    user_status := 'APPROVED';
  ELSE
    -- All other users default to EDITOR/PENDING
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'EDITOR');
    user_status := 'PENDING';
  END IF;

  -- Insert into public.users
  INSERT INTO public.users (id, email, username, role, status, theme, sound_enabled)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    user_role,
    user_status,
    'dark',
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ALSO: Update existing manager if they exist
UPDATE public.users 
SET role = 'MANAGER', status = 'APPROVED', updated_at = NOW()
WHERE email = 'idyllproductionsofficial@gmail.com';
