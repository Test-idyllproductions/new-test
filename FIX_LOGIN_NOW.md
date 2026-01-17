# 🚨 FIX LOGIN ISSUE - STEP BY STEP

**Problem**: Login succeeds but page doesn't redirect. TempIcons shows "Users loaded: 0".

**Root Cause**: The `fetchAllData` function is not loading users from the database, likely due to RLS (Row Level Security) policies blocking the query.

---

## ✅ STEP 1: Fix RLS Policies (REQUIRED)

Open Supabase Dashboard → SQL Editor → New Query

**Copy and paste this entire block:**

```sql
-- Fix RLS policies to allow authenticated users to read users table
DROP POLICY IF EXISTS "Users can view all approved users" ON public.users;
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON public.users;

-- Create new policy that allows all authenticated users to read users
CREATE POLICY "Allow authenticated users to read users" ON public.users
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Verify the policy was created
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';
```

Click **RUN** ▶️

**Expected output**: Should show the new policy "Allow authenticated users to read users"

---

## ✅ STEP 2: Verify Manager Account Exists

In the same SQL Editor, run:

```sql
-- Check if manager exists in public.users
SELECT id, email, username, role, status 
FROM public.users 
WHERE email = 'idyllproductionsofficial@gmail.com';
```

Click **RUN** ▶️

### If you see 1 row with role=MANAGER, status=APPROVED:
✅ **GOOD!** Manager exists. Skip to Step 3.

### If you see 0 rows (empty result):
❌ **Manager doesn't exist in public.users**. Run this:

```sql
-- Create manager in public.users
INSERT INTO public.users (id, email, username, role, status, theme, sound_enabled)
SELECT 
  id,
  'idyllproductionsofficial@gmail.com',
  'Idyll Manager',
  'MANAGER',
  'APPROVED',
  'dark',
  TRUE
FROM auth.users 
WHERE email = 'idyllproductionsofficial@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'MANAGER',
  status = 'APPROVED',
  updated_at = NOW();

-- Verify it worked
SELECT email, role, status FROM public.users WHERE email = 'idyllproductionsofficial@gmail.com';
```

**Expected**: Should now show 1 row with MANAGER/APPROVED

---

## ✅ STEP 3: Update the Trigger (For Future Signups)

This ensures new signups automatically create users in public.users:

```sql
-- Drop old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create new function with manager bootstrap
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_status TEXT;
BEGIN
  -- Manager bootstrap: idyllproductionsofficial@gmail.com auto-approved as MANAGER
  IF NEW.email = 'idyllproductionsofficial@gmail.com' THEN
    user_role := 'MANAGER';
    user_status := 'APPROVED';
  ELSE
    user_role := 'EDITOR';
    user_status := 'PENDING';
  END IF;

  INSERT INTO public.users (id, email, username, role, status, theme, sound_enabled)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    user_role,
    user_status,
    'dark',
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## ✅ STEP 4: Test Login

1. **Clear browser cache** (Ctrl+Shift+Delete → Clear all)
2. **Close all browser tabs** for localhost:3000
3. **Open a new tab** → http://localhost:3000
4. **Open Developer Console** (F12 or right-click → Inspect → Console tab)
5. Click **"Login to Workspace"**
6. Enter credentials:
   - Email: `idyllproductionsofficial@gmail.com`
   - Password: `pass-101010`
7. Click **"Sign In"**

---

## 🔍 STEP 5: Check Console Output

**Look for these messages in the console:**

### ✅ SUCCESS - You should see:
```
🔵 LOGIN START
🔵 signIn function called
🔵 Supabase auth response: { user: "idyllproductionsofficial@gmail.com", session: "exists" }
🔵 Auth state changed: { event: "SIGNED_IN", hasSession: true }
🔵 fetchCurrentUser called: { userId: "..." }
🔵 DB query result: { found: true, role: "MANAGER", status: "APPROVED" }
✅ User fetched successfully: { email: "...", role: "MANAGER", status: "APPROVED" }
🔵 Setting currentUser
🔵 User effect triggered: { hasUser: true, role: "MANAGER", status: "APPROVED" }
🔵 Fetching all data...
✅ User is APPROVED, redirecting based on role: MANAGER
🔵 Redirecting to tasks (Manager Dashboard)
```

**AND** the page should redirect to the Manager Dashboard (Task Management view)

**AND** TempIcons should show: `Users loaded: 1 | Managers: 1`

---

### ❌ FAILURE SCENARIOS

#### If you see: `🔵 DB query result: { found: false, error: "PGRST116" }`
**Problem**: User doesn't exist in public.users  
**Fix**: Go back to Step 2 and run the INSERT query

#### If you see: `🔵 DB query result: { found: false, error: "..." }`
**Problem**: RLS is still blocking  
**Fix**: Go back to Step 1 and verify the policy was created

#### If you see: `Users loaded: 0` in TempIcons
**Problem**: fetchAllData is not loading users  
**Fix**: RLS is blocking. Run this temporary fix:

```sql
-- TEMPORARY: Disable RLS for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

Then test login again. If it works, RLS was the issue. Re-enable with:

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

And make sure the policy from Step 1 exists.

---

## 🎯 SUCCESS CHECKLIST

Login is FIXED when ALL of these are true:

- [ ] Console shows: `🔵 DB query result: { found: true }`
- [ ] Console shows: `✅ User fetched successfully`
- [ ] Console shows: `🔵 Redirecting to tasks`
- [ ] Page actually navigates to Manager Dashboard
- [ ] TempIcons shows: `Users loaded: 1 | Managers: 1`
- [ ] You can see the Task Management interface
- [ ] Sidebar shows manager options (Task Management, Meetings, Payouts, etc.)

---

## 🆘 STILL NOT WORKING?

If you've done all steps and it still doesn't work, run this diagnostic:

```sql
-- Full diagnostic query
SELECT 
  'Auth User' as source,
  email,
  id,
  NULL as role,
  NULL as status
FROM auth.users 
WHERE email = 'idyllproductionsofficial@gmail.com'

UNION ALL

SELECT 
  'Public User' as source,
  email,
  id,
  role,
  status
FROM public.users 
WHERE email = 'idyllproductionsofficial@gmail.com';
```

**Expected**: Should show 2 rows - one from auth.users and one from public.users with matching IDs

**Share the output** and I'll help debug further.

---

**Current Status**: WAITING FOR YOU TO RUN STEP 1 SQL  
**Next Action**: Open Supabase → SQL Editor → Run Step 1 query → Report back
