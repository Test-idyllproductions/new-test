# Fix Login - 3 Simple Steps

## The Problem
`idyllproductionsofficial@gmail.com` cannot login.

**Possible reasons:**
1. User doesn't exist in Supabase
2. Password is wrong
3. User exists in auth.users but not in public.users

---

## STEP 1: Check if Manager Exists (1 minute)

Go to Supabase Dashboard → SQL Editor → New Query

Copy and paste this, then click **"Run"**:

```sql
SELECT 
  'AUTH.USERS' as table_name,
  email,
  email_confirmed_at IS NOT NULL as confirmed
FROM auth.users 
WHERE email = 'idyllproductionsofficial@gmail.com';

SELECT 
  'PUBLIC.USERS' as table_name,
  email,
  role,
  status
FROM public.users 
WHERE email = 'idyllproductionsofficial@gmail.com';
```

**What you'll see:**

### Scenario A: Both queries return results
```
AUTH.USERS: idyllproductionsofficial@gmail.com | confirmed: true
PUBLIC.USERS: idyllproductionsofficial@gmail.com | MANAGER | APPROVED
```
→ **Manager exists!** Password is wrong. Go to STEP 3.

### Scenario B: Only AUTH.USERS returns results
```
AUTH.USERS: idyllproductionsofficial@gmail.com | confirmed: true
PUBLIC.USERS: (empty)
```
→ **Manager exists but not configured.** Go to STEP 2.

### Scenario C: Both queries return nothing
```
AUTH.USERS: (empty)
PUBLIC.USERS: (empty)
```
→ **Manager doesn't exist.** Go to STEP 2.

---

## STEP 2: Create Manager Account (2 minutes)

**Only do this if STEP 1 showed empty results OR only AUTH.USERS had results.**

In Supabase SQL Editor, click **"New Query"**

Copy the ENTIRE content from file: **`CREATE_MANAGER_NOW.sql`**

Paste it and click **"Run"**

**Expected output:**
```
✅ Created manager in auth.users
✅ Created manager in public.users
✅ Created default task table
✅ Created default payout table

VERIFICATION:
AUTH.USERS: idyllproductionsofficial@gmail.com | email_confirmed: true | ✅ Can Login
PUBLIC.USERS: idyllproductionsofficial@gmail.com | Idyll Manager | MANAGER | APPROVED | ✅ Configured
```

**Now go to STEP 4 to test login.**

---

## STEP 3: Reset Password (1 minute)

**Only do this if STEP 1 showed manager exists in both tables.**

### Option A: Reset in Supabase Dashboard (Easy)
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find: `idyllproductionsofficial@gmail.com`
3. Click the three dots (•••) → **"Reset Password"**
4. Set new password: `pass-101010`
5. Click "Update User"

### Option B: Delete and Recreate (Clean Slate)
1. Go to STEP 2
2. Run `CREATE_MANAGER_NOW.sql`
3. This will delete old account and create fresh one with password: `pass-101010`

**Now go to STEP 4 to test login.**

---

## STEP 4: Test Login (30 seconds)

1. Go to: **http://localhost:3000**
2. Click **"Login"**
3. Enter:
   - **Email:** `idyllproductionsofficial@gmail.com`
   - **Password:** `pass-101010`
4. Click **"Sign In"**

**✅ Success = You should see:**
- Tasks view (Manager Dashboard)
- "Create Task" button
- Sidebar with: Tasks, Meetings, Payouts, Approvals, User Management

---

## Still Can't Login?

### Error: "Invalid login credentials"

**Cause:** Password is still wrong

**Fix:**
1. Run `CREATE_MANAGER_NOW.sql` again (this deletes and recreates with known password)
2. Or reset password in Supabase Dashboard to: `pass-101010`

### Error: "User not found"

**Cause:** Manager doesn't exist

**Fix:** Run `CREATE_MANAGER_NOW.sql`

### Login works but goes to blank page

**Cause:** User status is PENDING or role is wrong

**Fix:** Run this SQL:
```sql
UPDATE public.users 
SET role = 'MANAGER', status = 'APPROVED' 
WHERE email = 'idyllproductionsofficial@gmail.com';
```

### Login works but can't create tasks

**Cause:** User is EDITOR, not MANAGER

**Fix:** Run this SQL:
```sql
UPDATE public.users 
SET role = 'MANAGER' 
WHERE email = 'idyllproductionsofficial@gmail.com';
```

---

## Quick Summary

**If manager doesn't exist:**
→ Run `CREATE_MANAGER_NOW.sql`

**If manager exists but password wrong:**
→ Reset password in Supabase Dashboard OR run `CREATE_MANAGER_NOW.sql`

**If manager exists and configured:**
→ Password should be `pass-101010`

**After fixing:**
→ Login at http://localhost:3000 with `idyllproductionsofficial@gmail.com` / `pass-101010`

---

## What to Do Right Now

1. ✅ Open Supabase Dashboard → SQL Editor
2. ✅ Run the check query from STEP 1
3. ✅ Based on results, go to STEP 2 or STEP 3
4. ✅ Test login at http://localhost:3000

**Start with STEP 1!**
