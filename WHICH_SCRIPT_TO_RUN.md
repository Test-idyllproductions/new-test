# Which SQL Script Should I Run?

## 🤔 Choose Your Situation

---

## ✅ Situation 1: I Added a User in Supabase Dashboard

**You said:** "I have add new user in Supabase"

**Run this script:** `FIX_EXISTING_USER.sql`

**What it does:**
- Checks your existing user
- Adds them to `public.users` if missing
- Sets them as MANAGER and APPROVED
- Creates default tables

**When to use:**
- ✅ You manually added a user in Supabase Dashboard
- ✅ You want to keep your existing user
- ✅ You know the password you set

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy content from `FIX_EXISTING_USER.sql`
3. Paste and Run
4. Login with the password you set when creating the user

---

## 🆕 Situation 2: I Want Fresh Users with Known Passwords

**Run this script:** `QUICK_FIX_LOGIN.sql`

**What it does:**
- Deletes ALL existing users
- Creates fresh manager: `idyllproductionsofficial@gmail.com` / `pass-101010`
- Creates fresh editor: `editor@idyll.com` / `password123`
- Creates default tables

**When to use:**
- ✅ You don't remember the password
- ✅ You want to start completely fresh
- ✅ You want known test credentials

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy content from `QUICK_FIX_LOGIN.sql`
3. Paste and Run
4. Login with: `idyllproductionsofficial@gmail.com` / `pass-101010`

---

## 🔍 Not Sure? Check First

Run this in Supabase SQL Editor to see what you have:

```sql
-- Check auth users (login table)
SELECT 'AUTH USERS' as table_name, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Check public users (profile table)
SELECT 'PUBLIC USERS' as table_name, email, role, status 
FROM public.users 
ORDER BY created_at DESC;
```

### If you see users in both tables:
- ✅ Run `FIX_EXISTING_USER.sql` to fix them

### If you see users ONLY in auth.users:
- ✅ Run `FIX_EXISTING_USER.sql` to add them to public.users

### If you see NO users or want to start fresh:
- ✅ Run `QUICK_FIX_LOGIN.sql` to create new users

---

## 📊 Quick Comparison

| Feature | FIX_EXISTING_USER.sql | QUICK_FIX_LOGIN.sql |
|---------|----------------------|---------------------|
| Keeps existing users | ✅ Yes | ❌ No (deletes all) |
| Creates new users | ❌ No | ✅ Yes |
| Known passwords | ❌ Use your password | ✅ Yes (pass-101010) |
| Safe to run multiple times | ✅ Yes | ⚠️ Deletes users first |
| Best for | Existing users | Fresh start |

---

## 🎯 Recommended Approach

### For You (Since You Added a User):

**Step 1:** Run `FIX_EXISTING_USER.sql`
- This will fix your existing user
- Sets them as MANAGER/APPROVED
- Doesn't delete anything

**Step 2:** Try logging in
- Email: `idyllproductionsofficial@gmail.com`
- Password: (the one you set in Supabase)

**Step 3:** If password doesn't work
- Go to Supabase Dashboard → Authentication → Users
- Find your user → Reset Password
- Set to: `pass-101010`
- Try logging in again

**Step 4:** If still not working
- Run `QUICK_FIX_LOGIN.sql` instead
- This creates fresh users with known passwords
- Login with: `idyllproductionsofficial@gmail.com` / `pass-101010`

---

## 🚀 Quick Start (Right Now)

Since you added a user, do this:

1. **Open:** Supabase Dashboard → SQL Editor
2. **Copy:** Content from `FIX_EXISTING_USER.sql`
3. **Paste and Run**
4. **Check output:** Should show your user as MANAGER/APPROVED
5. **Go to:** http://localhost:3000
6. **Login with:** Your email and the password you set
7. **If password wrong:** Reset in Supabase Dashboard → Set to `pass-101010`

---

## 💡 Pro Tip

If you're not sure what password you used when creating the user:

**Option 1:** Reset it now
1. Supabase Dashboard → Authentication → Users
2. Find `idyllproductionsofficial@gmail.com`
3. Click three dots → "Reset Password"
4. Set to: `pass-101010`
5. Then run `FIX_EXISTING_USER.sql`
6. Login with: `idyllproductionsofficial@gmail.com` / `pass-101010`

**Option 2:** Start fresh
1. Run `QUICK_FIX_LOGIN.sql`
2. Login with: `idyllproductionsofficial@gmail.com` / `pass-101010`

---

## ✅ After Running Either Script

You should be able to:
- ✅ Login to the app
- ✅ See Tasks view (Manager Dashboard)
- ✅ Create tasks
- ✅ TempIcons shows user count
- ✅ Data persists after refresh

---

**Your situation:** You added a user in Supabase  
**Recommended script:** `FIX_EXISTING_USER.sql`  
**Backup option:** `QUICK_FIX_LOGIN.sql` (if password unknown)  
**Time:** 1-2 minutes  
**Next:** Run the script in Supabase SQL Editor
