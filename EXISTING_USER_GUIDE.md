# Fix Your Existing Supabase User

## You Added a User in Supabase Dashboard ✅

Good! Now we need to make sure that user is properly configured in both tables.

---

## The Issue

When you add a user in Supabase Dashboard (Authentication → Users), it creates the user in `auth.users` (for login), but it might NOT create the user in `public.users` (for role and status).

**Result:** User can login, but the app doesn't know their role (EDITOR or MANAGER) or status (APPROVED/PENDING).

---

## Quick Fix (1 Minute)

### Step 1: Run the Fix Script
1. **Open Supabase Dashboard** → SQL Editor
2. **Copy content from:** `FIX_EXISTING_USER.sql`
3. **Paste and Run** in SQL Editor

### Step 2: What It Does
The script will:
- ✅ Check which users exist in `auth.users`
- ✅ Check which users exist in `public.users`
- ✅ Find users missing from `public.users`
- ✅ Add missing users to `public.users`
- ✅ Set `idyllproductionsofficial@gmail.com` as MANAGER
- ✅ Set all users as APPROVED
- ✅ Create default task and payout tables

### Step 3: Check the Output
You should see:
```
🔍 AUTH USERS (Login Table):
- Shows all users you added in Supabase Dashboard

🔍 PUBLIC USERS (Profile Table):
- Shows users with role and status

⚠️ USERS MISSING FROM PUBLIC.USERS:
- Shows users that need to be added (if any)

✅ FINAL CHECK - All Users:
- idyllproductionsofficial@gmail.com | Idyll Manager | MANAGER | APPROVED
- (any other users you added)

🎉 SETUP COMPLETE
Summary:
- Total Users: X
- Managers: 1
- Editors: X
- Approved Users: X
```

### Step 4: Test Login
1. **Go to:** http://localhost:3000
2. **Click "Login"**
3. **Enter the credentials you set in Supabase:**
   - Email: `idyllproductionsofficial@gmail.com`
   - Password: (the password you set when creating the user)
4. **Click "Sign In"**
5. **Should redirect to Tasks view** (Manager Dashboard)

---

## What Password Did You Use?

When you added the user in Supabase Dashboard, you set a password. Common options:

### Option 1: You Set a Password
- Use the password you entered when creating the user
- Try: `pass-101010` (if that's what you used)

### Option 2: You Used "Auto Generate"
- Supabase generated a random password
- You need to reset it:
  1. Go to Supabase Dashboard → Authentication → Users
  2. Find `idyllproductionsofficial@gmail.com`
  3. Click three dots → "Reset Password"
  4. Set new password: `pass-101010`
  5. Try logging in with new password

### Option 3: You Don't Remember
- Reset the password:
  1. Supabase Dashboard → Authentication → Users
  2. Find your user
  3. Click three dots → "Reset Password"
  4. Set password: `pass-101010`
  5. Login with: `idyllproductionsofficial@gmail.com` / `pass-101010`

---

## Alternative: Create Fresh Users

If you want to start fresh with known passwords, run `QUICK_FIX_LOGIN.sql` instead:

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy content from:** `QUICK_FIX_LOGIN.sql`
3. **Paste and Run**
4. **This will create:**
   - Manager: `idyllproductionsofficial@gmail.com` / `pass-101010`
   - Editor: `editor@idyll.com` / `password123`

---

## Verify User Setup

### Check 1: User Exists in Auth
```sql
SELECT email, email_confirmed_at 
FROM auth.users 
WHERE email = 'idyllproductionsofficial@gmail.com';
```
Should return 1 row with confirmed email.

### Check 2: User Exists in Public
```sql
SELECT email, username, role, status 
FROM public.users 
WHERE email = 'idyllproductionsofficial@gmail.com';
```
Should return:
- email: `idyllproductionsofficial@gmail.com`
- username: `Idyll Manager`
- role: `MANAGER`
- status: `APPROVED`

### Check 3: User Can Login
- Go to app
- Try logging in
- Should work if both checks pass

---

## Common Issues

### "Invalid login credentials"

**Cause 1:** Wrong password
- **Fix:** Reset password in Supabase Dashboard

**Cause 2:** Email not confirmed
- **Fix:** Run this SQL:
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'idyllproductionsofficial@gmail.com';
```

**Cause 3:** User doesn't exist
- **Fix:** Check Supabase Dashboard → Authentication → Users
- If not there, create user or run `QUICK_FIX_LOGIN.sql`

### Login works but goes to blank page

**Cause:** User not in `public.users` or status is PENDING

**Fix:** Run `FIX_EXISTING_USER.sql` to add user to public.users

### Login works but can't create tasks

**Cause:** User role is EDITOR, not MANAGER

**Fix:** Run this SQL:
```sql
UPDATE public.users 
SET role = 'MANAGER' 
WHERE email = 'idyllproductionsofficial@gmail.com';
```

### TempIcons shows "Users loaded: 0"

**Cause:** No APPROVED users in public.users

**Fix:** Run `FIX_EXISTING_USER.sql` to approve users

---

## What Each Table Does

### auth.users (Supabase Auth)
- **Purpose:** Login authentication
- **Created by:** Supabase Dashboard or signup
- **Contains:** Email, encrypted password, confirmation status
- **Used for:** Checking if login credentials are valid

### public.users (Your App)
- **Purpose:** User profile and permissions
- **Created by:** Your app's signup flow or SQL script
- **Contains:** Username, role (EDITOR/MANAGER), status (PENDING/APPROVED)
- **Used for:** Determining what user can see and do

**Both tables must have the same user ID for login to work properly!**

---

## Recommended Setup

For testing, you should have:

### 1 Manager (You)
```
Email:    idyllproductionsofficial@gmail.com
Password: pass-101010 (or whatever you set)
Role:     MANAGER
Status:   APPROVED
```

### 1 Test Editor
```
Email:    editor@idyll.com
Password: password123
Role:     EDITOR
Status:   APPROVED
```

This lets you test both roles.

---

## Quick Commands

### Reset Password for Manager
```sql
-- In Supabase Dashboard → Authentication → Users
-- Click user → Reset Password → Set to: pass-101010
```

### Make User a Manager
```sql
UPDATE public.users 
SET role = 'MANAGER', status = 'APPROVED' 
WHERE email = 'idyllproductionsofficial@gmail.com';
```

### Approve All Users
```sql
UPDATE public.users SET status = 'APPROVED';
```

### Check All Users
```sql
SELECT 
  p.email,
  p.username,
  p.role,
  p.status,
  a.email_confirmed_at IS NOT NULL as can_login
FROM public.users p
LEFT JOIN auth.users a ON p.id = a.id
ORDER BY p.role DESC;
```

---

## Next Steps

1. ✅ Run `FIX_EXISTING_USER.sql`
2. ✅ Check output shows your user as MANAGER/APPROVED
3. ✅ Go to http://localhost:3000
4. ✅ Login with your credentials
5. ✅ Should see Tasks view (Manager Dashboard)
6. ✅ Create a test task
7. ✅ Verify it saves and persists after refresh

---

**Status:** Ready to fix existing user  
**Time:** 1 minute  
**File to run:** `FIX_EXISTING_USER.sql`  
**Next:** Run the SQL script in Supabase SQL Editor
