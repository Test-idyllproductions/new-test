-- ============================================
-- CHECK IF MANAGER EXISTS
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Check if manager exists in auth.users (login table)
SELECT 
  '1. AUTH.USERS CHECK' as step,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'idyllproductionsofficial@gmail.com';

-- Step 2: Check if manager exists in public.users (profile table)
SELECT 
  '2. PUBLIC.USERS CHECK' as step,
  id,
  email,
  username,
  role,
  status,
  created_at
FROM public.users 
WHERE email = 'idyllproductionsofficial@gmail.com';

-- Step 3: Check all users in auth.users
SELECT 
  '3. ALL AUTH USERS' as step,
  email,
  email_confirmed_at IS NOT NULL as confirmed,
  created_at
FROM auth.users 
ORDER BY created_at DESC;

-- Step 4: Check all users in public.users
SELECT 
  '4. ALL PUBLIC USERS' as step,
  email,
  username,
  role,
  status
FROM public.users 
ORDER BY created_at DESC;

-- ============================================
-- WHAT TO LOOK FOR:
-- ============================================
-- If Step 1 is EMPTY: Manager doesn't exist in auth.users
--   → Need to add user in Supabase Dashboard → Authentication → Users
--
-- If Step 1 has data but Step 2 is EMPTY: Manager exists but not configured
--   → Run CREATE_MANAGER.sql to configure
--
-- If both have data: Manager exists and is configured
--   → Password might be wrong, reset it in Supabase Dashboard
-- ============================================
