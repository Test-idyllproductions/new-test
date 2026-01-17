-- Verify and Fix Script for Idyll Productions Workspace
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Check if manager user exists
-- ============================================
SELECT 
  'Manager User Check' as step,
  email, 
  username, 
  role, 
  status
FROM public.users 
WHERE email = 'idyllproductionsofficial@gmail.com';

-- If no results, the user is not in public.users
-- Continue to STEP 2

-- ============================================
-- STEP 2: Find manager user ID from auth.users
-- ============================================
SELECT 
  'Manager Auth User' as step,
  id, 
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'idyllproductionsofficial@gmail.com';

-- Copy the ID from the result above

-- ============================================
-- STEP 3: Insert/Update manager in public.users
-- ============================================
-- Replace 'PASTE_USER_ID_HERE' with the actual ID from STEP 2

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
)
SELECT 
  id,
  email,
  'Idyll Manager',
  'MANAGER',
  'APPROVED',
  'dark',
  TRUE,
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'idyllproductionsofficial@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  status = 'APPROVED',
  role = 'MANAGER',
  username = 'Idyll Manager',
  updated_at = NOW();

-- ============================================
-- STEP 4: Create editor user for testing
-- ============================================
DO $$
DECLARE
  editor_id UUID;
  existing_id UUID;
BEGIN
  -- Check if editor already exists in auth.users
  SELECT id INTO existing_id 
  FROM auth.users 
  WHERE email = 'editor@idyll.com';
  
  IF existing_id IS NULL THEN
    -- Create new editor
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
      email_change
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
      ''
    );
    
    RAISE NOTICE 'Created new editor user with ID: %', editor_id;
  ELSE
    editor_id := existing_id;
    RAISE NOTICE 'Editor user already exists with ID: %', editor_id;
  END IF;
  
  -- Insert/Update in public.users
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
  ) ON CONFLICT (id) DO UPDATE SET
    status = 'APPROVED',
    role = 'EDITOR',
    username = 'Test Editor',
    updated_at = NOW();
    
  RAISE NOTICE 'Editor user ready in public.users';
END $$;

-- ============================================
-- STEP 5: Verify both users are ready
-- ============================================
SELECT 
  '✅ FINAL VERIFICATION' as step,
  email, 
  username, 
  role, 
  status,
  created_at
FROM public.users 
WHERE status = 'APPROVED'
ORDER BY role DESC, username;

-- Expected result:
-- idyllproductionsofficial@gmail.com | Idyll Manager | MANAGER | APPROVED
-- editor@idyll.com                   | Test Editor   | EDITOR  | APPROVED

-- ============================================
-- STEP 6: Check RLS policies
-- ============================================
SELECT 
  '🔒 RLS STATUS' as step,
  tablename, 
  CASE 
    WHEN rowsecurity = true THEN '✅ Enabled'
    ELSE '⚠️ Disabled (OK for testing)'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'task_records', 'payout_records', 'meetings', 'notifications')
ORDER BY tablename;

-- ============================================
-- STEP 7: Create sample task table (optional)
-- ============================================
-- This creates a default task table if none exists

INSERT INTO task_tables (id, name, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Main Tasks',
  id,
  NOW(),
  NOW()
FROM public.users 
WHERE role = 'MANAGER' 
  AND email = 'idyllproductionsofficial@gmail.com'
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 8: Create sample payout table (optional)
-- ============================================
INSERT INTO payout_tables (id, name, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'January 2026 Payouts',
  id,
  NOW(),
  NOW()
FROM public.users 
WHERE role = 'MANAGER' 
  AND email = 'idyllproductionsofficial@gmail.com'
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 9: Summary
-- ============================================
SELECT '📊 SUMMARY' as step;

SELECT 
  'Users' as category,
  role,
  COUNT(*) as count
FROM public.users
WHERE status = 'APPROVED'
GROUP BY role
UNION ALL
SELECT 
  'Task Tables' as category,
  'N/A' as role,
  COUNT(*) as count
FROM task_tables
UNION ALL
SELECT 
  'Task Records' as category,
  'N/A' as role,
  COUNT(*) as count
FROM task_records
UNION ALL
SELECT 
  'Payout Tables' as category,
  'N/A' as role,
  COUNT(*) as count
FROM payout_tables
UNION ALL
SELECT 
  'Payout Records' as category,
  'N/A' as role,
  COUNT(*) as count
FROM payout_records
UNION ALL
SELECT 
  'Meetings' as category,
  'N/A' as role,
  COUNT(*) as count
FROM meetings;

-- ============================================
-- DONE!
-- ============================================
-- Now you can:
-- 1. Refresh the app
-- 2. Login as: idyllproductionsofficial@gmail.com / pass-101010
-- 3. Or login as: editor@idyll.com / password123
-- 4. Test TempIcons - should show "Users loaded: 2"
-- 5. Create tasks, meetings, payouts
-- ============================================
