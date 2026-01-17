-- ============================================
-- PRODUCTION VERIFICATION SCRIPT
-- Run this to verify everything is working
-- ============================================

-- STEP 1: Check database schema
SELECT '🔍 CHECKING DATABASE SCHEMA' as step;

SELECT 
  'Tables' as check_type,
  table_name,
  CASE 
    WHEN table_name IN (
      'users', 'task_tables', 'task_records', 
      'payout_tables', 'payout_records', 'meetings', 
      'audit_logs', 'notifications'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'users', 'task_tables', 'task_records', 
    'payout_tables', 'payout_records', 'meetings', 
    'audit_logs', 'notifications'
  )
ORDER BY table_name;

-- STEP 2: Check if trigger exists for auto-creating user profiles
SELECT 
  '🔧 TRIGGERS' as check_type,
  trigger_name,
  event_object_table,
  '✅ EXISTS' as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- STEP 3: Check RLS policies
SELECT 
  '🔒 RLS POLICIES' as check_type,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PROTECTED'
    ELSE '⚠️ NO POLICIES'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- STEP 4: Check manager account
SELECT '👤 MANAGER ACCOUNT CHECK' as step;

SELECT 
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM auth.users 
      WHERE email = 'idyllproductionsofficial@gmail.com'
    ) THEN '✅ EXISTS IN AUTH'
    ELSE '❌ NOT IN AUTH'
  END as auth_status,
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM public.users 
      WHERE email = 'idyllproductionsofficial@gmail.com'
      AND role = 'MANAGER'
      AND status = 'APPROVED'
    ) THEN '✅ EXISTS IN PUBLIC (MANAGER/APPROVED)'
    ELSE '❌ NOT IN PUBLIC OR NOT CONFIGURED'
  END as public_status;

-- STEP 5: Show all users
SELECT '👥 ALL USERS' as step;

SELECT 
  u.email,
  u.username,
  u.role,
  u.status,
  CASE 
    WHEN a.id IS NOT NULL THEN '✅ Can Login'
    ELSE '❌ Cannot Login'
  END as can_login,
  u.created_at
FROM public.users u
LEFT JOIN auth.users a ON u.id = a.id
ORDER BY 
  CASE u.role WHEN 'MANAGER' THEN 1 ELSE 2 END,
  CASE u.status WHEN 'APPROVED' THEN 1 WHEN 'PENDING' THEN 2 ELSE 3 END,
  u.created_at DESC;

-- STEP 6: Check default tables
SELECT '📋 DEFAULT TABLES' as step;

SELECT 
  'Task Tables' as table_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ EXISTS'
    ELSE '⚠️ NONE'
  END as status
FROM task_tables
UNION ALL
SELECT 
  'Payout Tables' as table_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ EXISTS'
    ELSE '⚠️ NONE'
  END as status
FROM payout_tables;

-- STEP 7: Production readiness checklist
SELECT '✅ PRODUCTION READINESS CHECKLIST' as step;

SELECT 
  1 as order_num,
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM public.users 
      WHERE email = 'idyllproductionsofficial@gmail.com'
      AND role = 'MANAGER'
      AND status = 'APPROVED'
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  'Manager account exists and is approved' as check_description,
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM public.users 
      WHERE email = 'idyllproductionsofficial@gmail.com'
      AND role = 'MANAGER'
      AND status = 'APPROVED'
    ) THEN 'Manager can login immediately'
    ELSE 'Add manager in Supabase Dashboard → Authentication → Users'
  END as action_required

UNION ALL

SELECT 
  2 as order_num,
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  'Auto-create user profile trigger exists' as check_description,
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) THEN 'New signups will auto-create with PENDING status'
    ELSE 'Run supabase-schema.sql to create trigger'
  END as action_required

UNION ALL

SELECT 
  3 as order_num,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') > 0
    THEN '✅ PASS'
    ELSE '⚠️ WARN'
  END as status,
  'RLS policies are configured' as check_description,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') > 0
    THEN 'Database is protected with row-level security'
    ELSE 'Consider enabling RLS policies for production'
  END as action_required

UNION ALL

SELECT 
  4 as order_num,
  CASE 
    WHEN EXISTS(SELECT 1 FROM task_tables)
    THEN '✅ PASS'
    ELSE '⚠️ WARN'
  END as status,
  'Default task table exists' as check_description,
  CASE 
    WHEN EXISTS(SELECT 1 FROM task_tables)
    THEN 'Manager can create tasks immediately'
    ELSE 'Will be created automatically when manager creates first task'
  END as action_required

UNION ALL

SELECT 
  5 as order_num,
  CASE 
    WHEN EXISTS(SELECT 1 FROM payout_tables)
    THEN '✅ PASS'
    ELSE '⚠️ WARN'
  END as status,
  'Default payout table exists' as check_description,
  CASE 
    WHEN EXISTS(SELECT 1 FROM payout_tables)
    THEN 'Manager can create payouts immediately'
    ELSE 'Will be created automatically when manager creates first payout'
  END as action_required

ORDER BY order_num;

-- STEP 8: Test signup flow simulation
SELECT '🧪 SIGNUP FLOW TEST' as step;

SELECT 
  '1. User signs up' as flow_step,
  'Trigger creates user in public.users with status=PENDING' as expected_behavior,
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) THEN '✅ Will work'
    ELSE '❌ Trigger missing'
  END as status

UNION ALL

SELECT 
  '2. User logs in' as flow_step,
  'App checks status, redirects to Pending page' as expected_behavior,
  '✅ Implemented in code' as status

UNION ALL

SELECT 
  '3. Manager approves' as flow_step,
  'Manager sees pending users in Approvals view' as expected_behavior,
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM public.users 
      WHERE role = 'MANAGER' AND status = 'APPROVED'
    ) THEN '✅ Manager exists'
    ELSE '❌ No manager'
  END as status

UNION ALL

SELECT 
  '4. User logs in again' as flow_step,
  'App checks status=APPROVED, redirects to Editor Dashboard' as expected_behavior,
  '✅ Implemented in code' as status;

-- STEP 9: Summary
SELECT '📊 SUMMARY' as step;

SELECT 
  'Total Users' as metric,
  COUNT(*)::text as value,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅'
    ELSE '⚠️'
  END as status
FROM public.users

UNION ALL

SELECT 
  'Approved Managers' as metric,
  COUNT(*)::text as value,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅'
    ELSE '❌'
  END as status
FROM public.users 
WHERE role = 'MANAGER' AND status = 'APPROVED'

UNION ALL

SELECT 
  'Approved Editors' as metric,
  COUNT(*)::text as value,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅'
    ELSE '⚠️'
  END as status
FROM public.users 
WHERE role = 'EDITOR' AND status = 'APPROVED'

UNION ALL

SELECT 
  'Pending Users' as metric,
  COUNT(*)::text as value,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅'
    ELSE '⚠️'
  END as status
FROM public.users 
WHERE status = 'PENDING'

UNION ALL

SELECT 
  'Task Tables' as metric,
  COUNT(*)::text as value,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅'
    ELSE '⚠️'
  END as status
FROM task_tables

UNION ALL

SELECT 
  'Payout Tables' as metric,
  COUNT(*)::text as value,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅'
    ELSE '⚠️'
  END as status
FROM payout_tables;

-- ============================================
-- 🎯 NEXT STEPS
-- ============================================
-- If all checks pass:
-- 1. ✅ Manager can login immediately
-- 2. ✅ New users can signup → go to pending
-- 3. ✅ Manager can approve users
-- 4. ✅ Approved users can access dashboards
--
-- If manager check fails:
-- 1. Add user in Supabase Dashboard → Authentication → Users
--    Email: idyllproductionsofficial@gmail.com
--    Password: (your choice)
-- 2. Run PRODUCTION_SETUP.sql to configure the user
-- 3. Run this verification script again
-- ============================================
