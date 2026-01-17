# Complete Setup Guide - Auto User Creation

**Date**: 2025-01-14  
**Status**: READY FOR TESTING ✅

---

## 🎯 WHAT'S FIXED

### 1. Manager Bootstrap ✅
- **Email**: `idyllproductionsofficial@gmail.com`
- **Auto-created** on signup or first login
- **Role**: MANAGER
- **Status**: APPROVED
- **Never** goes to Approval Page
- **Always** lands on Manager Dashboard

### 2. Auto User Creation ✅
- **Trigger**: Creates users automatically on signup
- **Fallback**: Client-side creation if trigger fails
- **Default**: role=EDITOR, status=PENDING
- **No manual steps** required

### 3. Complete Flow ✅
```
Signup → Login → Auto-create user → Check role/status → Redirect
```

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Update Supabase Trigger (REQUIRED)

**Run this in Supabase SQL Editor**:

```sql
-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- NEW: Function with Manager bootstrap
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_status TEXT;
BEGIN
  -- MANAGER BOOTSTRAP: Auto-approve idyllproductionsofficial@gmail.com
  IF NEW.email = 'idyllproductionsofficial@gmail.com' THEN
    user_role := 'MANAGER';
    user_status := 'APPROVED';
  ELSE
    -- All other users default to EDITOR/PENDING
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'EDITOR');
    user_status := 'PENDING';
  END IF;

  -- Insert into public.users
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

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing manager if they exist
UPDATE public.users 
SET role = 'MANAGER', status = 'APPROVED', updated_at = NOW()
WHERE email = 'idyllproductionsofficial@gmail.com';
```

### Step 2: Test the Flow

**No manual user creation needed!**

---

## 🧪 TESTING FLOW

### Test 1: Manager Bootstrap (CRITICAL)

1. **Clear all data** (optional - fresh start):
   ```sql
   -- In Supabase SQL Editor
   DELETE FROM auth.users WHERE email = 'idyllproductionsofficial@gmail.com';
   DELETE FROM public.users WHERE email = 'idyllproductionsofficial@gmail.com';
   ```

2. **Go to app**: http://localhost:3000

3. **Click**: "Create New Account"

4. **Fill in**:
   - Email: `idyllproductionsofficial@gmail.com`
   - Username: `Idyll Manager`
   - Password: `pass-101010`

5. **Click**: "Create Account"

6. **Expected**: Custom dialog "Account Created Successfully"

7. **Click**: "Go to Login"

8. **Login** with same credentials

9. **Expected**: 
   - ✅ Redirected to Manager Dashboard (/tasks)
   - ✅ NOT Approval Page
   - ✅ Can see "Task Management" sidebar

10. **Verify in Supabase**:
    ```sql
    SELECT email, role, status FROM public.users 
    WHERE email = 'idyllproductionsofficial@gmail.com';
    ```
    **Expected**: role=MANAGER, status=APPROVED

### Test 2: Editor Signup & Approval

1. **Logout** (if logged in)

2. **Click**: "Create New Account"

3. **Fill in**:
   - Email: `editor@test.com`
   - Username: `Test Editor`
   - Password: `test123`

4. **Click**: "Create Account"

5. **Expected**: Custom dialog "Account Created Successfully"

6. **Click**: "Go to Login"

7. **Login** with editor credentials

8. **Expected**:
   - ✅ Redirected to Approval Page (/pending)
   - ✅ Shows "Approval Pending"
   - ✅ Shows email and username
   - ✅ Cannot access dashboard

9. **Try URL hacking**: Type `/home` in URL

10. **Expected**: Immediately redirected back to `/pending`

11. **Verify in Supabase**:
    ```sql
    SELECT email, role, status FROM public.users 
    WHERE email = 'editor@test.com';
    ```
    **Expected**: role=EDITOR, status=PENDING

### Test 3: Manager Approves Editor

1. **Open new tab** (keep editor tab open)

2. **Login as manager**: `idyllproductionsofficial@gmail.com`

3. **Go to**: User Approvals (sidebar)

4. **Expected**: See `editor@test.com` in PENDING list

5. **Click**: Approve button

6. **Expected**: User status changes to APPROVED

7. **Switch to editor tab**

8. **Refresh page** (F5)

9. **Expected**:
   - ✅ Redirected to Editor Dashboard (/home)
   - ✅ Shows summary cards
   - ✅ Can navigate to Tasks, Meetings, Payouts

### Test 4: Auto User Creation Fallback

1. **Manually delete user from public.users**:
   ```sql
   DELETE FROM public.users WHERE email = 'test@fallback.com';
   ```

2. **Create auth user** (Supabase Dashboard → Authentication → Add User):
   - Email: `test@fallback.com`
   - Password: `test123`

3. **Login** with these credentials in app

4. **Expected**:
   - ✅ User auto-created in public.users
   - ✅ role=EDITOR, status=PENDING
   - ✅ Redirected to Approval Page
   - ✅ Console shows: "User not found in public.users, creating automatically..."

---

## 📊 EXPECTED BEHAVIOR

### Manager (idyllproductionsofficial@gmail.com)

| Action | Result |
|--------|--------|
| Signup | Auto-created as MANAGER/APPROVED |
| Login | → Manager Dashboard (/tasks) |
| Can access | All views, all data |
| Can approve | Other users |

### Editor (any other email)

| Action | Result |
|--------|--------|
| Signup | Auto-created as EDITOR/PENDING |
| Login (pending) | → Approval Page (/pending) |
| Login (approved) | → Editor Dashboard (/home) |
| Can access | Only assigned tasks/meetings/payouts |
| Cannot access | Approvals, User Management |

---

## 🔍 VERIFICATION CHECKLIST

After setup, verify:

- [ ] Manager email auto-creates as MANAGER/APPROVED
- [ ] Manager can login and access Manager Dashboard
- [ ] Editor signup creates EDITOR/PENDING
- [ ] Editor login redirects to Approval Page
- [ ] Manager can see pending users in Approvals
- [ ] Manager can approve users
- [ ] Approved editor can access Editor Dashboard
- [ ] URL hacking is prevented (pending users stay on /pending)
- [ ] No browser alerts anywhere
- [ ] All custom dialogs work
- [ ] TempIcons navigate correctly

---

## 🐛 TROUBLESHOOTING

### Issue: Manager still goes to Approval Page

**Check**:
```sql
SELECT email, role, status FROM public.users 
WHERE email = 'idyllproductionsofficial@gmail.com';
```

**Fix**:
```sql
UPDATE public.users 
SET role = 'MANAGER', status = 'APPROVED' 
WHERE email = 'idyllproductionsofficial@gmail.com';
```

### Issue: Users not auto-created

**Check**: Supabase SQL Editor → Run:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

**Expected**: Should show the trigger exists

**Fix**: Re-run the trigger creation SQL from Step 1

### Issue: Trigger exists but not working

**Check**: Supabase logs for errors

**Fallback**: Client-side creation will handle it automatically

### Issue: Login succeeds but no redirect

**Check browser console** for:
- "User is APPROVED, redirecting based on role: X"
- "ROUTE GUARD CHECK" messages

**Verify**:
```sql
SELECT id, email, role, status FROM public.users;
```

---

## ✅ SUCCESS CRITERIA

The setup is complete when:

1. ✅ Manager can signup and login without manual DB steps
2. ✅ Manager lands on Manager Dashboard immediately
3. ✅ Editor can signup and login
4. ✅ Editor sees Approval Page (not dashboard)
5. ✅ Manager can approve editors
6. ✅ Approved editors can access Editor Dashboard
7. ✅ No manual Supabase steps required
8. ✅ No browser alerts
9. ✅ All navigation works

---

## 📝 FILES MODIFIED

1. `lib/supabase-store.tsx` - Added auto user creation fallback
2. `FIXED_SUPABASE_SCHEMA.sql` - Updated trigger with manager bootstrap
3. `App.tsx` - Fixed setView during render bug
4. `views/LandingView.tsx` - Fixed button routing
5. All views - Replaced alerts with custom dialogs

---

**Status**: READY FOR TESTING ✅  
**Next Step**: Run the SQL in Step 1, then test the flow ✅
