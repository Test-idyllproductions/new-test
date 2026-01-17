-- DELETE ALL USERS EXCEPT MANAGER
-- This will remove all test users and keep only idyllproductionsofficial@gmail.com

-- Step 1: Delete all user data (tasks, meetings, payouts, logs, notifications)
-- for users who are NOT the manager

-- Delete task records for non-manager users
DELETE FROM public.task_records
WHERE created_by IN (
  SELECT id FROM public.users 
  WHERE email != 'idyllproductionsofficial@gmail.com'
);

-- Delete payout records for non-manager users
DELETE FROM public.payout_records
WHERE created_by IN (
  SELECT id FROM public.users 
  WHERE email != 'idyllproductionsofficial@gmail.com'
);

-- Delete meetings created by non-manager users
DELETE FROM public.meetings
WHERE created_by IN (
  SELECT id FROM public.users 
  WHERE email != 'idyllproductionsofficial@gmail.com'
);

-- Delete notifications for non-manager users
DELETE FROM public.notifications
WHERE user_id IN (
  SELECT id FROM public.users 
  WHERE email != 'idyllproductionsofficial@gmail.com'
);

-- Delete audit logs for non-manager users
DELETE FROM public.audit_logs
WHERE user_id IN (
  SELECT id FROM public.users 
  WHERE email != 'idyllproductionsofficial@gmail.com'
);

-- Step 2: Delete from auth.users (this will cascade to public.users if FK is set)
DELETE FROM auth.users
WHERE email != 'idyllproductionsofficial@gmail.com';

-- Step 3: Delete from public.users (in case cascade didn't work)
DELETE FROM public.users
WHERE email != 'idyllproductionsofficial@gmail.com';

-- Step 4: Verify only manager remains
SELECT 
  id,
  email,
  username,
  role,
  status,
  created_at
FROM public.users
WHERE email = 'idyllproductionsofficial@gmail.com';

-- Expected result: Only 1 row with idyllproductionsofficial@gmail.com, role=MANAGER, status=APPROVED

-- DONE! All users deleted except the manager.
-- New editors can now create accounts from the Welcome page.
