-- ============================================
-- FIX EXISTING USER IN SUPABASE
-- Run this to check and fix your manually added user
-- ============================================

-- STEP 1: Check what users exist in auth.users
SELECT 
  '🔍 AUTH USERS (Login Table)' as check_type,
  id,
  email,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at
FROM auth.users 
ORDER BY created_at DESC;

-- STEP 2: Check what users exist in public.users
SELECT 
  '🔍 PUBLIC USERS (Profile Table)' as check_type,
  id,
  email,
  username,
  role,
  status
FROM public.users 
ORDER BY created_at DESC;

-- STEP 3: Find users in auth.users but NOT in public.users
-- These users can login but won't have role/status
SELECT 
  '⚠️ USERS MISSING FROM PUBLIC.USERS' as issue,
  a.id,
  a.email,
  a.created_at
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.id
WHERE p.id IS NULL;

-- STEP 4: Fix missing users - Add them to public.users
-- This will add any auth users that are missing from public.users
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
  a.id,
  a.email,
  COALESCE(
    a.raw_user_meta_data->>'username',
    SPLIT_PART(a.email, '@', 1)
  ) as username,
  COALESCE(
    a.raw_user_meta_data->>'role',
    'EDITOR'
  )::text as role,
  'APPROVED' as status,
  'dark' as theme,
  TRUE as sound_enabled,
  a.created_at,
  NOW() as updated_at
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- STEP 5: Make sure idyllproductionsofficial@gmail.com is a MANAGER
UPDATE public.users 
SET 
  role = 'MANAGER',
  status = 'APPROVED',
  username = COALESCE(username, 'Idyll Manager')
WHERE email = 'idyllproductionsofficial@gmail.com';

-- STEP 6: Verify everything is fixed
SELECT 
  '✅ FINAL CHECK - All Users' as status,
  email,
  username,
  role,
  status,
  created_at
FROM public.users 
ORDER BY role DESC, created_at DESC;

-- STEP 7: Check if we need to create task/payout tables
SELECT 
  '📊 EXISTING TABLES' as info,
  'Task Tables' as table_type,
  COUNT(*)::text as count
FROM task_tables
UNION ALL
SELECT 
  '📊 EXISTING TABLES' as info,
  'Payout Tables' as table_type,
  COUNT(*)::text as count
FROM payout_tables;

-- STEP 8: Create default tables if none exist
DO $$
DECLARE
  manager_id UUID;
  task_table_count INT;
  payout_table_count INT;
BEGIN
  -- Get manager ID
  SELECT id INTO manager_id 
  FROM public.users 
  WHERE role = 'MANAGER' 
  LIMIT 1;
  
  IF manager_id IS NULL THEN
    RAISE NOTICE '⚠️ No manager found. Please set a user as MANAGER first.';
    RETURN;
  END IF;
  
  -- Check if task tables exist
  SELECT COUNT(*) INTO task_table_count FROM task_tables;
  
  IF task_table_count = 0 THEN
    INSERT INTO task_tables (id, name, created_by, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Main Tasks', manager_id, NOW(), NOW());
    RAISE NOTICE '✅ Created default task table';
  ELSE
    RAISE NOTICE '✅ Task tables already exist (count: %)', task_table_count;
  END IF;
  
  -- Check if payout tables exist
  SELECT COUNT(*) INTO payout_table_count FROM payout_tables;
  
  IF payout_table_count = 0 THEN
    INSERT INTO payout_tables (id, name, created_by, created_at, updated_at)
    VALUES (gen_random_uuid(), 'January 2026 Payouts', manager_id, NOW(), NOW());
    RAISE NOTICE '✅ Created default payout table';
  ELSE
    RAISE NOTICE '✅ Payout tables already exist (count: %)', payout_table_count;
  END IF;
END $$;

-- STEP 9: Final summary
SELECT '🎉 SETUP COMPLETE' as status;

SELECT 
  'Summary' as info,
  'Total Users' as metric,
  COUNT(*)::text as value
FROM public.users
UNION ALL
SELECT 
  'Summary' as info,
  'Managers' as metric,
  COUNT(*)::text as value
FROM public.users WHERE role = 'MANAGER'
UNION ALL
SELECT 
  'Summary' as info,
  'Editors' as metric,
  COUNT(*)::text as value
FROM public.users WHERE role = 'EDITOR'
UNION ALL
SELECT 
  'Summary' as info,
  'Approved Users' as metric,
  COUNT(*)::text as value
FROM public.users WHERE status = 'APPROVED';

-- ============================================
-- ✅ DONE!
-- ============================================
-- Now try logging in with your user credentials
-- If you added: idyllproductionsofficial@gmail.com
-- Use the password you set in Supabase Dashboard
-- ============================================
