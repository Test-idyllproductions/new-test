-- ============================================
-- PRODUCTION SETUP FOR IDYLL PRODUCTIONS
-- This script sets up the system for real production use
-- ============================================

-- STEP 1: Check if manager exists
DO $$
DECLARE
  manager_exists BOOLEAN;
  manager_id UUID;
BEGIN
  -- Check if manager exists in auth.users
  SELECT EXISTS(
    SELECT 1 FROM auth.users 
    WHERE email = 'idyllproductionsofficial@gmail.com'
  ) INTO manager_exists;
  
  IF manager_exists THEN
    RAISE NOTICE '✅ Manager exists in auth.users';
    
    -- Get manager ID
    SELECT id INTO manager_id 
    FROM auth.users 
    WHERE email = 'idyllproductionsofficial@gmail.com';
    
    -- Ensure manager exists in public.users
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
    VALUES (
      manager_id,
      'idyllproductionsofficial@gmail.com',
      'Idyll Manager',
      'MANAGER',
      'APPROVED',
      'dark',
      TRUE,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'MANAGER',
      status = 'APPROVED',
      username = COALESCE(EXCLUDED.username, public.users.username),
      updated_at = NOW();
    
    RAISE NOTICE '✅ Manager configured in public.users';
  ELSE
    RAISE NOTICE '⚠️ Manager does NOT exist in auth.users';
    RAISE NOTICE '👉 Please add user manually in Supabase Dashboard:';
    RAISE NOTICE '   Email: idyllproductionsofficial@gmail.com';
    RAISE NOTICE '   Password: (your choice)';
    RAISE NOTICE '   Then run this script again';
  END IF;
END $$;

-- STEP 2: Ensure all auth users have corresponding public.users entries
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
  CASE 
    WHEN a.email = 'idyllproductionsofficial@gmail.com' THEN 'MANAGER'
    ELSE COALESCE(a.raw_user_meta_data->>'role', 'EDITOR')
  END::text as role,
  CASE 
    WHEN a.email = 'idyllproductionsofficial@gmail.com' THEN 'APPROVED'
    ELSE 'PENDING'
  END::text as status,
  'dark' as theme,
  TRUE as sound_enabled,
  a.created_at,
  NOW() as updated_at
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- STEP 3: Ensure manager is always APPROVED with MANAGER role
UPDATE public.users 
SET 
  role = 'MANAGER',
  status = 'APPROVED',
  username = COALESCE(username, 'Idyll Manager'),
  updated_at = NOW()
WHERE email = 'idyllproductionsofficial@gmail.com';

-- STEP 4: Create default task table if none exists
DO $$
DECLARE
  manager_id UUID;
  task_table_count INT;
BEGIN
  -- Get manager ID
  SELECT id INTO manager_id 
  FROM public.users 
  WHERE email = 'idyllproductionsofficial@gmail.com';
  
  IF manager_id IS NULL THEN
    RAISE NOTICE '⚠️ Manager not found, skipping table creation';
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
END $$;

-- STEP 5: Create default payout table if none exists
DO $$
DECLARE
  manager_id UUID;
  payout_table_count INT;
BEGIN
  -- Get manager ID
  SELECT id INTO manager_id 
  FROM public.users 
  WHERE email = 'idyllproductionsofficial@gmail.com';
  
  IF manager_id IS NULL THEN
    RAISE NOTICE '⚠️ Manager not found, skipping table creation';
    RETURN;
  END IF;
  
  -- Check if payout tables exist
  SELECT COUNT(*) INTO payout_table_count FROM payout_tables;
  
  IF payout_table_count = 0 THEN
    INSERT INTO payout_tables (id, name, created_by, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Payouts 2026', manager_id, NOW(), NOW());
    RAISE NOTICE '✅ Created default payout table';
  ELSE
    RAISE NOTICE '✅ Payout tables already exist (count: %)', payout_table_count;
  END IF;
END $$;

-- STEP 6: Verify setup
SELECT '=' as separator, '=' as s2, '=' as s3, '=' as s4, '=' as s5;
SELECT '📊 VERIFICATION REPORT' as report;
SELECT '=' as separator, '=' as s2, '=' as s3, '=' as s4, '=' as s5;

-- Check auth users
SELECT 
  '🔐 AUTH USERS' as category,
  email,
  email_confirmed_at IS NOT NULL as confirmed,
  created_at
FROM auth.users 
ORDER BY created_at DESC;

-- Check public users
SELECT 
  '👥 PUBLIC USERS' as category,
  email,
  username,
  role,
  status,
  created_at
FROM public.users 
ORDER BY 
  CASE role WHEN 'MANAGER' THEN 1 ELSE 2 END,
  created_at DESC;

-- Check tables
SELECT 
  '📋 TASK TABLES' as category,
  name,
  created_at
FROM task_tables
ORDER BY created_at DESC;

SELECT 
  '💰 PAYOUT TABLES' as category,
  name,
  created_at
FROM payout_tables
ORDER BY created_at DESC;

-- Summary
SELECT '=' as separator, '=' as s2, '=' as s3, '=' as s4, '=' as s5;
SELECT '📈 SUMMARY' as summary;
SELECT '=' as separator, '=' as s2, '=' as s3, '=' as s4, '=' as s5;

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
  'Editors' as metric,
  COUNT(*)::text as value
FROM public.users WHERE role = 'EDITOR'
UNION ALL
SELECT 
  'Approved Users' as metric,
  COUNT(*)::text as value
FROM public.users WHERE status = 'APPROVED'
UNION ALL
SELECT 
  'Pending Users' as metric,
  COUNT(*)::text as value
FROM public.users WHERE status = 'PENDING'
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

-- STEP 7: Production readiness check
SELECT '=' as separator, '=' as s2, '=' as s3, '=' as s4, '=' as s5;
SELECT '✅ PRODUCTION READINESS CHECK' as check_name;
SELECT '=' as separator, '=' as s2, '=' as s3, '=' as s4, '=' as s5;

SELECT 
  CASE 
    WHEN EXISTS(SELECT 1 FROM public.users WHERE email = 'idyllproductionsofficial@gmail.com' AND role = 'MANAGER' AND status = 'APPROVED')
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  'Manager account exists and is approved' as check_description
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS(SELECT 1 FROM task_tables)
    THEN '✅ PASS'
    ELSE '⚠️ WARN'
  END as status,
  'Task tables exist' as check_description
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS(SELECT 1 FROM payout_tables)
    THEN '✅ PASS'
    ELSE '⚠️ WARN'
  END as status,
  'Payout tables exist' as check_description
UNION ALL
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM public.users WHERE role = 'MANAGER' AND status = 'APPROVED') >= 1
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  'At least one approved manager exists' as check_description;

-- ============================================
-- ✅ SETUP COMPLETE
-- ============================================
-- Next steps:
-- 1. If manager exists: Login with idyllproductionsofficial@gmail.com
-- 2. If manager doesn't exist: Add in Supabase Dashboard → Authentication → Users
-- 3. Test signup flow: Create new account → Should go to pending
-- 4. Test approval: Manager approves new user
-- 5. Test login: New user can access Editor Dashboard
-- ============================================
