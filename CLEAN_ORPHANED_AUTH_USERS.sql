-- CLEAN UP ORPHANED AUTH USERS
-- This removes auth.users records that don't have a corresponding profile in public.users

-- First, see which auth users are orphaned (no profile)
SELECT 
  au.id,
  au.email,
  au.created_at,
  'ORPHANED - No profile in public.users' as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Delete orphaned auth users (except the manager)
DELETE FROM auth.users
WHERE id IN (
  SELECT au.id
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL
  AND au.email != 'idyllproductionsofficial@gmail.com'
);

-- Verify cleanup - should only show users with profiles
SELECT 
  au.id,
  au.email,
  pu.username,
  pu.role,
  pu.status
FROM auth.users au
INNER JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC;
