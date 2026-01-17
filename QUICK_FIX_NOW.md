# Quick Fix - Use Your Existing Manager Account

**Your Manager:** `idyllproductionsofficial@gmail.com` / `pass-101010`

---

## 🚀 DO THIS NOW (2 minutes)

### 1. Run This SQL Script

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- Copy and paste the entire verify-and-fix.sql file
-- OR just run this quick version:

-- Fix manager user
INSERT INTO public.users (id, email, username, role, status, theme, sound_enabled, created_at, updated_at)
SELECT id, email, 'Idyll Manager', 'MANAGER', 'APPROVED', 'dark', TRUE, NOW(), NOW()
FROM auth.users 
WHERE email = 'idyllproductionsofficial@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  status = 'APPROVED',
  role = 'MANAGER',
  username = 'Idyll Manager';

-- Create test editor
DO $$
DECLARE editor_id UUID;
BEGIN
  SELECT id INTO editor_id FROM auth.users WHERE email = 'editor@idyll.com';
  IF editor_id IS NULL THEN
    editor_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (editor_id, '00000000-0000-0000-0000-000000000000', 'editor@idyll.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"Test Editor","role":"EDITOR"}'::jsonb, NOW(), NOW(), '', '', '', '');
  END IF;
  INSERT INTO public.users (id, email, username, role, status, theme, sound_enabled, created_at, updated_at)
  VALUES (editor_id, 'editor@idyll.com', 'Test Editor', 'EDITOR', 'APPROVED', 'dark', TRUE, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET status = 'APPROVED', role = 'EDITOR';
END $$;

-- Verify
SELECT email, username, role, status FROM public.users WHERE status = 'APPROVED';
```

**Expected Result:**
```
email                                | username      | role    | status
-------------------------------------|---------------|---------|----------
idyllproductionsofficial@gmail.com   | Idyll Manager | MANAGER | APPROVED
editor@idyll.com                     | Test Editor   | EDITOR  | APPROVED
```

---

### 2. Refresh the App

The dev server is already running. Just refresh your browser at:
```
http://localhost:3000
```

---

### 3. Test TempIcons

Look at the TempIcons panel (top-left corner).

**Debug line should show:**
```
Users loaded: 2 | Editors: 1 | Managers: 1
```

**If it shows "Users loaded: 0":**
- Check browser console (F12) for errors
- Check `.env.local` has correct Supabase credentials
- Try disabling RLS temporarily: `ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;`

---

### 4. Test Navigation

Click each TempIcons button:

1. **🏠 Welcome** → Landing page ✅
2. **🔑 Login** → Login page ✅
3. **📝 Signup** → Signup page ✅
4. **⏳ Approval** → Pending page ✅
5. **📊 Editor Home** → Editor Dashboard (HomeView) ✅
6. **👔 Manager Tasks** → Manager Dashboard (SupabaseTasksView) ✅

---

### 5. Test Login

**Login as Manager:**
- Email: `idyllproductionsofficial@gmail.com`
- Password: `pass-101010`
- Should redirect to: **Tasks view** (Manager Dashboard)
- Should see: "Create Task" button, task table

**Login as Editor:**
- Email: `editor@idyll.com`
- Password: `password123`
- Should redirect to: **Home view** (Editor Dashboard)
- Should see: "Good Morning, Test Editor" and summary cards

---

### 6. Test Creating a Task

**As Manager:**
1. Click "👔 Manager Tasks" in TempIcons
2. Click "Create Task" button
3. Fill in:
   - Task Name: "Test Video Edit"
   - Assign User: Select "Test Editor"
   - Deadline: Pick tomorrow's date
   - Status: "Not Started"
4. Click "Save Task"
5. Task should appear in table immediately

**As Editor:**
1. Click "📊 Editor Home" in TempIcons
2. Click "Tasks" in sidebar
3. You should see "Test Video Edit"
4. Change status to "Editing"
5. Click "Save Changes"
6. Refresh page → status should still be "Editing"

---

## ✅ SUCCESS CRITERIA

The system is working when:

1. ✅ TempIcons shows "Users loaded: 2"
2. ✅ Can click all 6 TempIcons buttons
3. ✅ Manager login → goes to tasks view
4. ✅ Editor login → goes to home view
5. ✅ Manager can create tasks
6. ✅ Editor sees assigned tasks only
7. ✅ Editor can update task status
8. ✅ Changes persist after refresh

---

## 🐛 IF SOMETHING DOESN'T WORK

### TempIcons shows "Users loaded: 0"

**Fix:**
```sql
-- Check if users exist
SELECT * FROM public.users;

-- If empty, run verify-and-fix.sql again

-- If still empty, check auth.users
SELECT id, email FROM auth.users WHERE email = 'idyllproductionsofficial@gmail.com';

-- If auth.users is empty, your manager account isn't in Supabase yet
-- Create it via Supabase Dashboard → Authentication → Users
```

### Can't login

**Fix:**
- Check email is exactly: `idyllproductionsofficial@gmail.com`
- Check password is exactly: `pass-101010`
- Check browser console for errors
- Check Supabase logs in Dashboard

### Dashboard not showing

**Fix:**
- Open browser console (F12)
- Look for errors
- Check console logs: "Rendering view: tasks User role: MANAGER"
- If no logs, hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Data not persisting

**Fix:**
```sql
-- Check RLS policies
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Temporarily disable RLS for testing
ALTER TABLE public.task_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings DISABLE ROW LEVEL SECURITY;
```

---

## 📞 NEED HELP?

1. Check browser console (F12) for errors
2. Check Supabase logs in Dashboard
3. Run `verify-and-fix.sql` again
4. Check all documentation files in the project

---

**Status:** Ready to test with your existing manager account
**Time Required:** 2-5 minutes
**Next Action:** Run the SQL script above in Supabase SQL Editor
