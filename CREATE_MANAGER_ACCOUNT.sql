-- CREATE OR UPDATE MANAGER ACCOUNT
-- Run this in Supabase SQL Editor

-- First, check if the manager exists in auth.users
DO $$
DECLARE
  manager_id UUID;
BEGIN
  -- Try to find existing manager in auth.users
  SELECT id INTO manager_id FROM auth.users WHERE email = 'idyllproductionsofficial@gmail.com';
  
  IF manager_id IS NULL THEN
    -- Manager doesn't exist in auth, need to create via Supabase Dashboard
    RAISE NOTICE 'Manager account does not exist in auth.users';
    RAISE NOTICE 'You need to create it manually:';
    RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Click "Add User"';
    RAISE NOTICE '3. Email: idyllproductionsofficial@gmail.com';
    RAISE NOTICE '4. Password: 101010';
    RAISE NOTICE '5. Auto Confirm User: YES';
    RAISE NOTICE '6. Click "Create User"';
  ELSE
    -- Manager exists in auth, make sure profile exists in public.users
    RAISE NOTICE 'Manager found in auth.users with ID: %', manager_id;
    
    -- Insert or update in public.users
    INSERT INTO public.users (id, email, username, role, status, theme, sound_enabled)
    VALUES (
      manager_id,
      'idyllproductionsofficial@gmail.com',
      'idyllmanager',
      'MANAGER',
      'APPROVED',
      'dark',
      TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'MANAGER',
      status = 'APPROVED',
      email = 'idyllproductionsofficial@gmail.com',
      updated_at = NOW();
    
    RAISE NOTICE 'Manager profile updated in public.users';
  END IF;
END $$;

-- Verify the manager account
SELECT 
  u.id,
  u.email,
  u.username,
  u.role,
  u.status,
  au.email_confirmed_at,
  au.created_at
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'idyllproductionsofficial@gmail.com';

-- If you see a result above, the manager is ready!
-- If you see nothing, follow the instructions in the NOTICE messages above.
