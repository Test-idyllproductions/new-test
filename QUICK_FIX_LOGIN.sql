-- ============================================
-- QUICK FIX FOR LOGIN ISSUE
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Clean up existing manager account (if any)
-- This ensures we start fresh
DELETE FROM public.users WHERE email = 'idyllproductionsofficial@gmail.com';
DELETE FROM auth.users WHERE email = 'idyllproductionsofficial@gmail.com';

-- STEP 2: Create manager account with correct password
-- Email: idyllproductionsofficial@gmail.com
-- Password: pass-101010
DO $$
DECLARE
  manager_id UUID;
BEGIN
  manager_id := gen_random_uuid();
  
  -- Create in auth.users (this is where login happens)
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
  
  -- Create in public.users (this is where role/status is stored)
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
  
  RAISE NOTICE '✅ Manager created: idyllproductionsofficial@gmail.com / pass-101010';
END $$;

-- STEP 3: Create test editor account
-- Email: editor@idyll.com
-- Password: password123
DO $$
DECLARE
  editor_id UUID;
BEGIN
  -- Clean up if exists
  DELETE FROM public.users WHERE email = 'editor@idyll.com';
  DELETE FROM auth.users WHERE email = 'editor@idyll.com';
  
  editor_id := gen_random_uuid();
  
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
    editor_id,
    '00000000-0000-0000-0000-000000000000',
    'editor@idyll.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"Test Editor","role":"EDITOR"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  );
  
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
    editor_id,
    'editor@idyll.com',
    'Test Editor',
    'EDITOR',
    'APPROVED',
    'dark',
    TRUE,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE '✅ Editor created: editor@idyll.com / password123';
END $$;

-- STEP 4: Verify users are created correctly
SELECT 
  '✅ VERIFICATION - Auth Users' as check_type,
  email,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at
FROM auth.users 
WHERE email IN ('idyllproductionsofficial@gmail.com', 'editor@idyll.com')
ORDER BY email;

SELECT 
  '✅ VERIFICATION - Public Users' as check_type,
  email,
  username,
  role,
  status
FROM public.users 
WHERE email IN ('idyllproductionsofficial@gmail.com', 'editor@idyll.com')
ORDER BY role DESC;

-- STEP 5: Create default task table
INSERT INTO task_tables (id, name, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Main Tasks',
  id,
  NOW(),
  NOW()
FROM public.users 
WHERE email = 'idyllproductionsofficial@gmail.com'
ON CONFLICT DO NOTHING;

-- STEP 6: Create default payout table
INSERT INTO payout_tables (id, name, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'January 2026 Payouts',
  id,
  NOW(),
  NOW()
FROM public.users 
WHERE email = 'idyllproductionsofficial@gmail.com'
ON CONFLICT DO NOTHING;

-- STEP 7: Final summary
SELECT '📊 FINAL SUMMARY' as summary;

SELECT 
  'Total Approved Users' as metric,
  COUNT(*)::text as value
FROM public.users 
WHERE status = 'APPROVED'
UNION ALL
SELECT 
  'Managers' as metric,
  COUNT(*)::text as value
FROM public.users 
WHERE role = 'MANAGER' AND status = 'APPROVED'
UNION ALL
SELECT 
  'Editors' as metric,
  COUNT(*)::text as value
FROM public.users 
WHERE role = 'EDITOR' AND status = 'APPROVED'
UNION ALL
SELECT 
  'Task Tables' as metric,
  COUNT(*)::text as value
FROM task_tables
UNION ALL
SELECT 
  'Payout Tables' as metric,
  COUNT(*)::text as value
FROM payout_tables;

-- ============================================
-- ✅ DONE! Now you can:
-- ============================================
-- 1. Go to your app: http://localhost:3000
-- 2. Click "Login"
-- 3. Login as manager:
--    Email: idyllproductionsofficial@gmail.com
--    Password: pass-101010
-- 4. Should redirect to Tasks view (Manager Dashboard)
-- 
-- OR login as editor:
--    Email: editor@idyll.com
--    Password: password123
-- 5. Should redirect to Home view (Editor Dashboard)
-- ============================================
