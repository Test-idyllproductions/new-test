# Auth Flow Fix - Complete Guide

## THE PROBLEM

**"Invalid login credentials"** means:
1. The email/password combination doesn't exist in Supabase
2. OR the password is wrong
3. OR the user was never created

---

## THE CORRECT FLOW

### For New Users (Signup):
```
1. User clicks "Signup"
2. Enters: email, username, password
3. Clicks "Create Account"
4. Account created with status = PENDING
5. Alert: "Account created! Pending approval..."
6. User is redirected to Login
7. User logs in
8. Redirected to Pending page (waiting for approval)
9. Manager approves user
10. User logs in again
11. Redirected to Dashboard (home for editor, tasks for manager)
```

### For Existing Users (Login):
```
1. User clicks "Login"
2. Enters: email, password
3. Clicks "Sign In"
4. If status = PENDING → Pending page
5. If status = APPROVED → Dashboard
6. If status = REJECTED → Pending page (with rejection message)
```

---

## FIX YOUR MANAGER ACCOUNT

### Option 1: Create Fresh Manager Account via Signup

1. **Go to the app** (http://localhost:3000)
2. **Click "Signup"**
3. **Fill in:**
   - Email: `manager@idyll.com`
   - Username: `Idyll Manager`
   - Password: `password123`
4. **Click "Create Account"**
5. **Go to Supabase SQL Editor and run:**
```sql
-- Approve and set as manager
UPDATE public.users 
SET status = 'APPROVED', role = 'MANAGER'
WHERE email = 'manager@idyll.com';
```
6. **Go back to app, click "Login"**
7. **Login with:**
   - Email: `manager@idyll.com`
   - Password: `password123`
8. **Should redirect to Tasks view (Manager Dashboard)**

### Option 2: Fix Existing Account Password

If you want to keep using `idyllproductionsofficial@gmail.com`:

1. **Go to Supabase Dashboard → Authentication → Users**
2. **Find user:** `idyllproductionsofficial@gmail.com`
3. **Click the three dots → "Reset Password"**
4. **OR delete the user and recreate:**
   - Click three dots → "Delete User"
   - Then create new user:
     - Email: `idyllproductionsofficial@gmail.com`
     - Password: `pass-101010` (or any password you want)
     - Auto Confirm: ✅ YES
5. **Then run in SQL Editor:**
```sql
UPDATE public.users 
SET status = 'APPROVED', role = 'MANAGER', username = 'Idyll Manager'
WHERE email = 'idyllproductionsofficial@gmail.com';
```
6. **Login with the new password**

### Option 3: Use SQL to Create Manager (Advanced)

```sql
-- Delete existing if needed
DELETE FROM public.users WHERE email = 'manager@idyll.com';
DELETE FROM auth.users WHERE email = 'manager@idyll.com';

-- Create new manager
DO $$
DECLARE
  manager_id UUID;
BEGIN
  manager_id := gen_random_uuid();
  
  -- Create in auth.users
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
    '{"username":"Idyll Manager","role":"MANAGER"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );
  
  -- Create in public.users
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
    'Idyll Manager',
    'MANAGER',
    'APPROVED',
    'dark',
    TRUE,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Manager created: manager@idyll.com / password123';
END $$;
```

---

## CREATE EDITOR FOR TESTING

```sql
-- Create editor
DO $$
DECLARE
  editor_id UUID;
BEGIN
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
  
  RAISE NOTICE 'Editor created: editor@idyll.com / password123';
END $$;
```

---

## VERIFY USERS EXIST

```sql
-- Check auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Check public.users
SELECT id, email, username, role, status 
FROM public.users 
ORDER BY created_at DESC;

-- Both should show the same users
```

---

## TEST THE FLOW

### Test 1: Signup Flow
1. Go to app → Click "Signup"
2. Create account: `newuser@test.com` / `password123`
3. Should show alert: "Account created! Pending approval..."
4. Should redirect to Login
5. Login with same credentials
6. Should go to Pending page (status = PENDING)
7. In SQL Editor, approve:
```sql
UPDATE public.users SET status = 'APPROVED' WHERE email = 'newuser@test.com';
```
8. Logout and login again
9. Should go to Home view (Editor Dashboard)

### Test 2: Manager Login
1. Go to app → Click "Login"
2. Login: `manager@idyll.com` / `password123`
3. Should go to Tasks view (Manager Dashboard)
4. Should see "Create Task" button

### Test 3: Editor Login
1. Go to app → Click "Login"
2. Login: `editor@idyll.com` / `password123`
3. Should go to Home view (Editor Dashboard)
4. Should see "Good Morning, Test Editor"

---

## TROUBLESHOOTING

### "Invalid login credentials"

**Cause:** Email/password doesn't exist or is wrong.

**Fix:**
1. Check if user exists:
```sql
SELECT email FROM auth.users WHERE email = 'your-email@here.com';
```
2. If not found, create user (see Option 3 above)
3. If found, reset password in Supabase Dashboard

### Login works but goes to blank page

**Cause:** User not in public.users or not approved.

**Fix:**
```sql
-- Check if user is in public.users
SELECT * FROM public.users WHERE email = 'your-email@here.com';

-- If not found, get ID from auth.users and insert
INSERT INTO public.users (id, email, username, role, status)
SELECT id, email, 'Username', 'EDITOR', 'APPROVED'
FROM auth.users WHERE email = 'your-email@here.com';
```

### Login works but stuck on Pending page

**Cause:** User status is PENDING.

**Fix:**
```sql
UPDATE public.users SET status = 'APPROVED' WHERE email = 'your-email@here.com';
```

### TempIcons shows "Users loaded: 0"

**Cause:** No approved users in database.

**Fix:**
```sql
-- Check approved users
SELECT email, role, status FROM public.users WHERE status = 'APPROVED';

-- If none, approve existing users
UPDATE public.users SET status = 'APPROVED';
```

---

## RECOMMENDED SETUP

**For testing, create these accounts:**

1. **Manager:**
   - Email: `manager@idyll.com`
   - Password: `password123`
   - Role: MANAGER
   - Status: APPROVED

2. **Editor 1:**
   - Email: `editor@idyll.com`
   - Password: `password123`
   - Role: EDITOR
   - Status: APPROVED

3. **Editor 2 (Pending):**
   - Email: `pending@idyll.com`
   - Password: `password123`
   - Role: EDITOR
   - Status: PENDING

This gives you:
- 1 manager to test management features
- 1 approved editor to test editor features
- 1 pending editor to test approval flow

---

## QUICK SETUP SCRIPT

Run this to create all test accounts:

```sql
-- Clean slate
DELETE FROM public.users WHERE email IN ('manager@idyll.com', 'editor@idyll.com', 'pending@idyll.com');
DELETE FROM auth.users WHERE email IN ('manager@idyll.com', 'editor@idyll.com', 'pending@idyll.com');

-- Create manager
DO $$
DECLARE manager_id UUID;
BEGIN
  manager_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
  VALUES (manager_id, '00000000-0000-0000-0000-000000000000', 'manager@idyll.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"Idyll Manager","role":"MANAGER"}'::jsonb, NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, username, role, status, theme, sound_enabled, created_at, updated_at)
  VALUES (manager_id, 'manager@idyll.com', 'Idyll Manager', 'MANAGER', 'APPROVED', 'dark', TRUE, NOW(), NOW());
END $$;

-- Create approved editor
DO $$
DECLARE editor_id UUID;
BEGIN
  editor_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
  VALUES (editor_id, '00000000-0000-0000-0000-000000000000', 'editor@idyll.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"Test Editor","role":"EDITOR"}'::jsonb, NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, username, role, status, theme, sound_enabled, created_at, updated_at)
  VALUES (editor_id, 'editor@idyll.com', 'Test Editor', 'EDITOR', 'APPROVED', 'dark', TRUE, NOW(), NOW());
END $$;

-- Create pending editor
DO $$
DECLARE pending_id UUID;
BEGIN
  pending_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
  VALUES (pending_id, '00000000-0000-0000-0000-000000000000', 'pending@idyll.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"Pending User","role":"EDITOR"}'::jsonb, NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, username, role, status, theme, sound_enabled, created_at, updated_at)
  VALUES (pending_id, 'pending@idyll.com', 'Pending User', 'EDITOR', 'PENDING', 'dark', TRUE, NOW(), NOW());
END $$;

-- Verify
SELECT email, username, role, status FROM public.users ORDER BY role DESC, status;
```

**Expected Result:**
```
email              | username      | role    | status
-------------------|---------------|---------|----------
manager@idyll.com  | Idyll Manager | MANAGER | APPROVED
editor@idyll.com   | Test Editor   | EDITOR  | APPROVED
pending@idyll.com  | Pending User  | EDITOR  | PENDING
```

---

## AFTER SETUP

1. **Refresh app** (http://localhost:3000)
2. **Check TempIcons:** Should show "Users loaded: 3 | Editors: 2 | Managers: 1"
3. **Test login:**
   - manager@idyll.com / password123 → Tasks view
   - editor@idyll.com / password123 → Home view
   - pending@idyll.com / password123 → Pending view
4. **Test approval:**
   - Login as manager
   - Go to "User Approvals"
   - Approve "Pending User"
   - Logout
   - Login as pending@idyll.com → Should now go to Home view

---

**Status:** Ready to test after running setup script
**Time:** 2 minutes
**Next:** Run the Quick Setup Script in Supabase SQL Editor
