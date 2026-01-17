-- Seed Test Users for Idyll Productions Workspace
-- Run this in Supabase SQL Editor to create test users

-- IMPORTANT: This creates users directly in the database
-- In production, users should sign up through the app

-- Create a test manager user
DO $$
DECLARE
  manager_id UUID;
BEGIN
  -- Generate a UUID for the manager
  manager_id := gen_random_uuid();
  
  -- Insert into auth.users (Supabase auth table)
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
    manager_id,
    '00000000-0000-0000-0000-000000000000',
    'manager@idyll.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"Test Manager","role":"MANAGER"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (email) DO NOTHING;
  
  -- Insert into public.users (our app table)
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
    'manager@idyll.com',
    'Test Manager',
    'MANAGER',
    'APPROVED',
    'dark',
    TRUE,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    status = 'APPROVED',
    role = 'MANAGER';
    
  RAISE NOTICE 'Manager user created: manager@idyll.com / password123';
END $$;

-- Create a test editor user
DO $$
DECLARE
  editor_id UUID;
BEGIN
  -- Generate a UUID for the editor
  editor_id := gen_random_uuid();
  
  -- Insert into auth.users (Supabase auth table)
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
  ) ON CONFLICT (email) DO NOTHING;
  
  -- Insert into public.users (our app table)
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
    role = 'EDITOR';
    
  RAISE NOTICE 'Editor user created: editor@idyll.com / password123';
END $$;

-- Create a second editor for testing
DO $$
DECLARE
  editor2_id UUID;
BEGIN
  editor2_id := gen_random_uuid();
  
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
    editor2_id,
    '00000000-0000-0000-0000-000000000000',
    'editor2@idyll.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"Sarah Editor","role":"EDITOR"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (email) DO NOTHING;
  
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
    editor2_id,
    'editor2@idyll.com',
    'Sarah Editor',
    'EDITOR',
    'APPROVED',
    'dark',
    TRUE,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    status = 'APPROVED',
    role = 'EDITOR';
    
  RAISE NOTICE 'Second editor user created: editor2@idyll.com / password123';
END $$;

-- Verify users were created
SELECT 
  id,
  email,
  username,
  role,
  status,
  created_at
FROM public.users
WHERE email IN ('manager@idyll.com', 'editor@idyll.com', 'editor2@idyll.com')
ORDER BY role DESC, username;

-- Summary
SELECT 
  role,
  status,
  COUNT(*) as count
FROM public.users
GROUP BY role, status
ORDER BY role, status;
