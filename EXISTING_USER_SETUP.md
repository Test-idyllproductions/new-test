# Existing User Setup
**Manager User Found:** `idyllproductionsofficial@gmail.com`
**Password:** `pass-101010`

---

## IMMEDIATE STEPS

### 1. Verify User in Supabase

Run this in Supabase SQL Editor:

```sql
-- Check if user exists and is approved
SELECT id, email, username, role, status 
FROM public.users 
WHERE email = 'idyllproductionsofficial@gmail.com';
```

**Expected Result:**
- Email: idyllproductionsofficial@gmail.com
- Role: MANAGER
- Status: APPROVED

**If user doesn't exist in public.users:**
```sql
-- Find the user ID from auth.users
SELECT id, email FROM auth.users WHERE email = 'idyllproductionsofficial@gmail.com';

-- Then insert into public.users (replace USER_ID_HERE with actual ID)
INSERT INTO public.users (id, email, username, role, status, theme, sound_enabled)
VALUES (
  'USER_ID_HERE',
  'idyllproductionsofficial@gmail.com',
  'Idyll Manager',
  'MANAGER',
  'APPROVED',
  'dark',
  TRUE
);
```

**If user exists but not approved:**
```sql
UPDATE public.users 
SET status = 'APPROVED', role = 'MANAGER', username = 'Idyll Manager'
WHERE email = 'idyllproductionsofficial@gmail.com';
```

---

### 2. Create an Editor User for Testing

You need at least one editor to test the full system.

**Option A: Via Supabase Dashboard**
1. Go to Authentication → Users
2. Click "Add User"
3. Email: `editor@idyll.com`
4. Password: `password123`
5. Auto Confirm: ✅ YES
6. Click "Create User"

**Then run in SQL Editor:**
```sql
UPDATE public.users 
SET status = 'APPROVED', role = 'EDITOR', username = 'Test Editor'
WHERE email = 'editor@idyll.com';
```

**Option B: Via SQL**
```sql
-- This will create the user if it doesn't exist
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
    updated_at
  ) VALUES (
    editor_id,
    '00000000-0000-0000-0000-000000000000',
    'editor@idyll.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"Test Editor","role":"EDITOR"}'::jsonb,
    NOW(),
    NOW()
  ) ON CONFLICT (email) DO NOTHING;
  
  INSERT INTO public.users (
    id,
    email,
    username,
    role,
    status,
    theme,
    sound_enabled
  ) VALUES (
    editor_id,
    'editor@idyll.com',
    'Test Editor',
    'EDITOR',
    'APPROVED',
    'dark',
    TRUE
  ) ON CONFLICT (id) DO UPDATE SET
    status = 'APPROVED',
    role = 'EDITOR';
END $$;
```

---

### 3. Verify Both Users Exist

```sql
SELECT email, username, role, status 
FROM public.users 
WHERE status = 'APPROVED'
ORDER BY role DESC;
```

**Expected Result:**
```
email                                | username      | role    | status
-------------------------------------|---------------|---------|----------
idyllproductionsofficial@gmail.com   | Idyll Manager | MANAGER | APPROVED
editor@idyll.com                     | Test Editor   | EDITOR  | APPROVED
```

---

### 4. Test Login

**Manager Login:**
- Email: `idyllproductionsofficial@gmail.com`
- Password: `pass-101010`
- Should redirect to: Tasks view (Manager Dashboard)

**Editor Login:**
- Email: `editor@idyll.com`
- Password: `password123`
- Should redirect to: Home view (Editor Dashboard)

---

### 5. Test TempIcons

After logging in, TempIcons should show:
```
Users loaded: 2 | Editors: 1 | Managers: 1
```

Click buttons:
- **📊 Editor Home** → Switches to Test Editor, shows HomeView
- **👔 Manager Tasks** → Switches to Idyll Manager, shows SupabaseTasksView

---

## TROUBLESHOOTING

### Issue: Manager can login but TempIcons shows "No approved manager users found"

**Cause:** User exists in `auth.users` but not in `public.users`, or not approved.

**Fix:**
```sql
-- Check if user is in public.users
SELECT * FROM public.users WHERE email = 'idyllproductionsofficial@gmail.com';

-- If not found, get ID from auth.users and insert
SELECT id FROM auth.users WHERE email = 'idyllproductionsofficial@gmail.com';

-- Then insert (replace ID)
INSERT INTO public.users (id, email, username, role, status)
VALUES ('USER_ID_HERE', 'idyllproductionsofficial@gmail.com', 'Idyll Manager', 'MANAGER', 'APPROVED');
```

### Issue: TempIcons still shows "Users loaded: 0"

**Cause:** RLS policies blocking the query or Supabase connection issue.

**Fix:**
1. Check `.env.local` has correct credentials
2. Check browser console for errors
3. Temporarily disable RLS for testing:
```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

### Issue: Can login but dashboard doesn't show

**Cause:** View not rendering or routing issue.

**Fix:**
1. Open browser console (F12)
2. Look for errors
3. Check console logs: "Rendering view: tasks User role: MANAGER"
4. If no logs, check App.tsx is loading

---

## QUICK TEST SCRIPT

Run this to verify everything:

```sql
-- 1. Check users exist
SELECT 
  email, 
  username, 
  role, 
  status,
  CASE 
    WHEN status = 'APPROVED' AND role IN ('MANAGER', 'EDITOR') THEN '✅ OK'
    ELSE '❌ FIX NEEDED'
  END as check_status
FROM public.users
ORDER BY role DESC;

-- 2. Check RLS is enabled
SELECT 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity = true THEN '✅ Enabled'
    ELSE '⚠️ Disabled'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'task_records', 'payout_records', 'meetings');

-- 3. Check if any data exists
SELECT 
  'task_tables' as table_name, 
  COUNT(*) as count 
FROM task_tables
UNION ALL
SELECT 'task_records', COUNT(*) FROM task_records
UNION ALL
SELECT 'payout_tables', COUNT(*) FROM payout_tables
UNION ALL
SELECT 'payout_records', COUNT(*) FROM payout_records
UNION ALL
SELECT 'meetings', COUNT(*) FROM meetings;
```

---

## NEXT STEPS

1. ✅ Verify manager user is in `public.users` and approved
2. ✅ Create editor user for testing
3. ✅ Login as manager → should go to tasks view
4. ✅ Test TempIcons → should show 2 users
5. ✅ Create a task as manager
6. ✅ Assign task to editor
7. ✅ Login as editor → should see assigned task
8. ✅ Update task status → should persist

---

**Status:** Manager user exists, just needs verification in public.users table
**Next Action:** Run SQL queries above to verify and create editor user
