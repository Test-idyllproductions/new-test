-- Add 3 Manager Accounts to Supabase
-- Idyll Productions Manager Accounts Setup
-- Run this script in your Supabase SQL Editor AFTER creating the auth users

-- Step 1: First, create these 3 users in Supabase Auth Dashboard
-- Go to: https://zvwegbjzkrsjgfyjkyet.supabase.co
-- Navigate to: Authentication > Users > Add User

-- Create these 3 manager accounts:
-- Manager 1: rohitidyllproductions@gmail.com
-- Manager 2: harshpawar7711@gmail.com
-- Manager 3: idyllproductionsofficial@gmail.com

-- IMPORTANT: When creating each user:
-- 1. Enter the email address
-- 2. Set a password (choose a secure password)
-- 3. CHECK "Auto Confirm User" (to skip email verification)
-- 4. Click "Create User"

-- Step 2: After creating all 3 auth users, run this SQL script below:

DO $$
DECLARE
  manager1_id UUID;
  manager2_id UUID;
  manager3_id UUID;
BEGIN
  -- Get the auth user IDs for the manager emails
  SELECT id INTO manager1_id FROM auth.users WHERE email = 'rohitidyllproductions@gmail.com';
  SELECT id INTO manager2_id FROM auth.users WHERE email = 'harshpawar7711@gmail.com';
  SELECT id INTO manager3_id FROM auth.users WHERE email = 'idyllproductionsofficial@gmail.com';

  -- Insert Manager 1: Rohit
  IF manager1_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, username, role, status, theme, sound_enabled)
    VALUES (
      manager1_id,
      'rohitidyllproductions@gmail.com',
      'Rohit',
      'MANAGER',
      'APPROVED',
      'dark',
      TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'MANAGER',
      status = 'APPROVED';
    RAISE NOTICE 'Manager 1 (Rohit) added successfully!';
  ELSE
    RAISE NOTICE 'Manager 1 (rohitidyllproductions@gmail.com) not found in auth.users - please create the auth user first!';
  END IF;

  -- Insert Manager 2: Harsh
  IF manager2_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, username, role, status, theme, sound_enabled)
    VALUES (
      manager2_id,
      'harshpawar7711@gmail.com',
      'Harsh',
      'MANAGER',
      'APPROVED',
      'dark',
      TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'MANAGER',
      status = 'APPROVED';
    RAISE NOTICE 'Manager 2 (Harsh) added successfully!';
  ELSE
    RAISE NOTICE 'Manager 2 (harshpawar7711@gmail.com) not found in auth.users - please create the auth user first!';
  END IF;

  -- Insert Manager 3: Idyll Productions Official
  IF manager3_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, username, role, status, theme, sound_enabled)
    VALUES (
      manager3_id,
      'idyllproductionsofficial@gmail.com',
      'Idyll Official',
      'MANAGER',
      'APPROVED',
      'dark',
      TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'MANAGER',
      status = 'APPROVED';
    RAISE NOTICE 'Manager 3 (Idyll Official) added successfully!';
  ELSE
    RAISE NOTICE 'Manager 3 (idyllproductionsofficial@gmail.com) not found in auth.users - please create the auth user first!';
  END IF;

  RAISE NOTICE '=== Manager accounts setup complete! ===';
END $$;

-- Step 3: Verify the managers were added correctly
SELECT id, email, username, role, status, created_at 
FROM public.users 
WHERE role = 'MANAGER'
ORDER BY created_at;

-- You should see all 3 managers with status = 'APPROVED'
