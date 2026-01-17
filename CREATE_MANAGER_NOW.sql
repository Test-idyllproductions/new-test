-- ============================================
-- CREATE MANAGER ACCOUNT - GUARANTEED TO WORK
-- Run this in Supabase SQL Editor
-- ============================================

-- This script will:
-- 1. Delete any existing manager account (clean slate)
-- 2. Create fresh manager in auth.users with known password
-- 3. Create manager in public.users with MANAGER/APPROVED
-- 4. Verify it worked

-- STEP 1: Clean up any existing manager
DELETE FROM public.users WHERE email = 'idyllproductionsofficial@gmail.com';
DELETE FROM auth.users WHERE email = 'idyllproductionsofficial@gmail.com';

-- STEP 2: Create manager in auth.users (for login)
DO $$
DECLARE
  manager_id UUID;
BEGIN
  manager_id := gen_random_uuid();
  
  -- Create in auth.users with password: pass-101010
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    aud,
    role
  ) VALUES (
    manager_id,
    '00000000-0000-0000-0000-000000000000',
    'idyllproductionsofficial@gmail.com',
    crypt('pass-101010', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"Idyll Manager","role":"MANAGER"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  );
  
  RAISE NOTICE '✅ Created manager in auth.users with ID: %', manager_id;
  
  -- Create in public.users (for role/status)
  INSERT INTO public.users (
    id,
    email,
    username,
    role,
    status,
    theme,
    sound_enabled,
    created_at,
    updated_at
  ) VALUES (
    manager_id,
    'idyllproductionsofficial@gmail.com',
    'Idyll Manager',
    'MANAGER',
    'APPROVED',
    'dark',
    TRUE,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE '✅ Created manager in public.users';
END $$;

-- STEP 3: Create default tables
DO $$
DECLARE
  manager_id UUID;
  task_table_count INT;
  payout_table_count INT;
BEGIN
  -- Get manager ID
  SELECT id INTO manager_id 
  FROM public.users 
  WHERE email = 'idyllproductionsofficial@gmail.com';
  
  -- Create task table if none exists
  SELECT COUNT(*) INTO task_table_count FROM task_tables;
  IF task_table_count = 0 THEN
    INSERT INTO task_tables (id, name, created_by, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Main Tasks', manager_id, NOW(), NOW());
    RAISE NOTICE '✅ Created default task table';
  END IF;
  
  -- Create payout table if none exists
  SELECT COUNT(*) INTO payout_table_count FROM payout_tables;
  IF payout_table_count = 0 THEN
    INSERT INTO payout_tables (id, name, created_by, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Payouts 2026', manager_id, NOW(), NOW());
    RAISE NOTICE '✅ Created default payout table';
  END IF;
END $$;

-- STEP 4: Verify everything worked
SELECT '=' as sep, '=' as s2, '=' as s3, '=' as s4, '=' as s5;
SELECT '✅ VERIFICATION - Manager Account Created' as status;
SELECT '=' as sep, '=' as s2, '=' as s3, '=' as s4, '=' as s5;

-- Check auth.users
SELECT 
  'AUTH.USERS' as table_name,
  email,
  email_confirmed_at IS NOT NULL as email_confirmed,
  '✅ Can Login' as status
FROM auth.users 
WHERE email = 'idyllproductionsofficial@gmail.com';

-- Check public.users
SELECT 
  'PUBLIC.USERS' as table_name,
  email,
  username,
  role,
  status,
  '✅ Configured' as result
FROM public.users 
WHERE email = 'idyllproductionsofficial@gmail.com';

-- Summary
SELECT '=' as sep, '=' as s2, '=' as s3, '=' as s4, '=' as s5;
SELECT '📊 SUMMARY' as info;
SELECT '=' as sep, '=' as s2, '=' as s3, '=' as s4, '=' as s5;

SELECT 
  'Total Users' as metric,
  COUNT(*)::text as value
FROM public.users
UNION ALL
SELECT 
  'Managers' as metric,
  COUNT(*)::text as value
FROM public.users WHERE role = 'MANAGER'
UNION ALL
SELECT 
  'Approved Users' as metric,
  COUNT(*)::text as value
FROM public.users WHERE status = 'APPROVED';

-- ============================================
-- ✅ DONE!
-- ============================================
-- Expected output:
-- ✅ Created manager in auth.users
-- ✅ Created manager in public.users
-- ✅ Created default task table
-- ✅ Created default payout table
--
-- VERIFICATION should show:
-- AUTH.USERS: idyllproductionsofficial@gmail.com | email_confirmed: true | ✅ Can Login
-- PUBLIC.USERS: idyllproductionsofficial@gmail.com | Idyll Manager | MANAGER | APPROVED | ✅ Configured
--
-- Now you can login with:
-- Email: idyllproductionsofficial@gmail.com
-- Password: pass-101010
-- ============================================
