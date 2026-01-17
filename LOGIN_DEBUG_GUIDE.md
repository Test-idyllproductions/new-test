# Login Debug Guide - Comprehensive Logging

**Date**: 2025-01-14  
**Status**: FULL LOGGING ENABLED ✅

---

## 🔍 WHAT'S BEEN ADDED

Comprehensive console logging at every step of the login flow:

1. ✅ Login button click
2. ✅ signIn function call
3. ✅ Supabase auth response
4. ✅ Auth state change event
5. ✅ User fetch from database
6. ✅ User creation (if needed)
7. ✅ currentUser state update
8. ✅ Auto-redirect logic
9. ✅ Route guard checks

---

## 🧪 HOW TO DEBUG

### Step 1: Open Browser Console

1. Press **F12** (or Cmd+Option+I on Mac)
2. Go to **Console** tab
3. Clear console (trash icon)

### Step 2: Attempt Login

1. Navigate to login page
2. Enter credentials
3. Click "Sign In"
4. **Watch the console**

### Step 3: Read the Console Output

You should see messages in this order:

```
🔵 LOGIN START: { email: "...", isLogin: true }
🔵 Calling signIn...
🔵 signIn function called: { email: "..." }
🔵 Supabase auth response: { user: "...", session: "exists", error: "none" }
🔵 signIn response: { error: "none" }
✅ Login successful, waiting for redirect...
🔵 LOGIN END
🔵 Setting isSubmitting to false
🔵 Auth state changed: { event: "SIGNED_IN", hasSession: true, userId: "...", email: "..." }
🔵 Session exists, fetching user profile...
🔵 fetchCurrentUser called: { userId: "..." }
🔵 Auth user email: "..."
🔵 DB query result: { found: true, error: "none", email: "...", role: "...", status: "..." }
✅ User fetched successfully: { email: "...", role: "...", status: "..." }
🔵 Setting currentUser: { email: "...", role: "...", status: "..." }
🔵 User effect triggered: { hasUser: true, email: "...", role: "...", status: "..." }
🔵 Fetching all data...
✅ User is APPROVED, redirecting based on role: MANAGER
🔵 Redirecting to tasks (Manager Dashboard)
setView called with: tasks
View changed to: tasks
ROUTE GUARD CHECK: { currentView: 'tasks', currentUser: {...} }
```

---

## 🐛 TROUBLESHOOTING BY CONSOLE OUTPUT

### Scenario 1: Login Never Finishes

**Console shows**:
```
🔵 LOGIN START
🔵 Calling signIn...
🔵 signIn function called
[NOTHING ELSE]
```

**Problem**: Supabase auth call is hanging

**Check**:
1. Network tab - is request pending?
2. Supabase project status - is it active?
3. Internet connection

**Fix**: Check Supabase dashboard, verify project is running

---

### Scenario 2: Auth Succeeds But No User Fetch

**Console shows**:
```
🔵 Supabase auth response: { user: "...", session: "exists", error: "none" }
✅ Login successful
🔵 LOGIN END
[NO AUTH STATE CHANGE]
```

**Problem**: Auth state change listener not firing

**Check**:
1. Is `onAuthStateChange` set up correctly?
2. Are there multiple auth listeners?

**Fix**: Check `lib/supabase-store.tsx` line ~160

---

### Scenario 3: User Not Found in Database

**Console shows**:
```
🔵 DB query result: { found: false, error: "PGRST116", ... }
⚠️ User not found in public.users, creating automatically...
🔵 Creating user: { email: "...", role: "...", status: "..." }
```

**Expected**: User should be created automatically

**If creation fails**:
```
🔴 Error creating user: [error message]
```

**Check**:
1. RLS policies on `public.users` table
2. User has permission to insert
3. Database connection

**Fix**: Run `FIXED_SUPABASE_SCHEMA.sql` to update trigger

---

### Scenario 4: User Fetched But No Redirect

**Console shows**:
```
✅ User fetched successfully: { email: "...", role: "MANAGER", status: "APPROVED" }
🔵 Setting currentUser: { ... }
🔵 User effect triggered: { hasUser: true, ... }
🔵 User approved but not on auth page, staying on: tasks
```

**Problem**: User is already on a page, so no redirect happens

**This is NORMAL** if:
- User refreshes page while logged in
- User navigates directly to a page

**This is WRONG** if:
- User just logged in from login page
- Should redirect but doesn't

**Check**: What is `currentView` when effect runs?

---

### Scenario 5: Role/Status Mismatch

**Console shows**:
```
✅ User fetched successfully: { email: "...", role: "editor", status: "approved" }
```

**Problem**: Lowercase values instead of uppercase

**Check database**:
```sql
SELECT email, role, status FROM public.users;
```

**Expected**: `MANAGER` or `EDITOR`, `APPROVED` or `PENDING`

**Fix**:
```sql
UPDATE public.users 
SET role = UPPER(role), status = UPPER(status);
```

---

### Scenario 6: Infinite Loading

**Console shows**:
```
🔵 User effect triggered
🔵 Fetching all data...
[REPEATS FOREVER]
```

**Problem**: Effect dependency causing infinite loop

**Check**: `useEffect` dependency array in `lib/supabase-store.tsx`

**Should be**: `[currentUser]` only

---

### Scenario 7: Manager Goes to Approval Page

**Console shows**:
```
✅ User fetched: { role: "MANAGER", status: "APPROVED" }
🟡 User is PENDING/REJECTED, redirecting to pending page
```

**Problem**: Status check is wrong

**Check**:
1. Is status actually "APPROVED" in database?
2. Is there a string comparison issue?

**Verify**:
```sql
SELECT email, role, status, 
       status = 'APPROVED' as is_approved,
       status = 'PENDING' as is_pending
FROM public.users 
WHERE email = 'idyllproductionsofficial@gmail.com';
```

---

### Scenario 8: Editor Can't Access Dashboard

**Console shows**:
```
✅ User is APPROVED, redirecting based on role: EDITOR
🔵 Redirecting to home (Editor Dashboard)
setView called with: home
ROUTE GUARD: Editor trying to access home → Redirecting to home
```

**Problem**: Route guard might be blocking

**Check**: Route guard logic in `App.tsx`

**Should allow**: Editors to access 'home'

---

## 📊 EXPECTED CONSOLE OUTPUT

### Successful Manager Login:

```
🔵 LOGIN START: { email: "idyllproductionsofficial@gmail.com", isLogin: true }
🔵 Calling signIn...
🔵 signIn function called: { email: "idyllproductionsofficial@gmail.com" }
🔵 Supabase auth response: { user: "idyllproductionsofficial@gmail.com", session: "exists", error: "none" }
🔵 signIn response: { error: "none" }
✅ Login successful, waiting for redirect...
🔵 LOGIN END
🔵 Setting isSubmitting to false
🔵 Auth state changed: { event: "SIGNED_IN", hasSession: true, userId: "...", email: "idyllproductionsofficial@gmail.com" }
🔵 Session exists, fetching user profile...
🔵 fetchCurrentUser called: { userId: "..." }
🔵 Auth user email: "idyllproductionsofficial@gmail.com"
🔵 DB query result: { found: true, error: "none", email: "idyllproductionsofficial@gmail.com", role: "MANAGER", status: "APPROVED" }
✅ User fetched successfully: { email: "idyllproductionsofficial@gmail.com", role: "MANAGER", status: "APPROVED" }
🔵 Setting currentUser: { email: "idyllproductionsofficial@gmail.com", role: "MANAGER", status: "APPROVED" }
🔵 User effect triggered: { hasUser: true, email: "idyllproductionsofficial@gmail.com", role: "MANAGER", status: "APPROVED" }
🔵 Fetching all data...
✅ User is APPROVED, redirecting based on role: MANAGER
🔵 Redirecting to tasks (Manager Dashboard)
setView called with: tasks
View changed to: tasks
ROUTE GUARD CHECK: { currentView: 'tasks', currentUser: { email: "idyllproductionsofficial@gmail.com", role: "MANAGER", status: "APPROVED" } }
```

### Successful Editor Login (Pending):

```
🔵 LOGIN START: { email: "editor@test.com", isLogin: true }
🔵 Calling signIn...
🔵 signIn function called: { email: "editor@test.com" }
🔵 Supabase auth response: { user: "editor@test.com", session: "exists", error: "none" }
🔵 signIn response: { error: "none" }
✅ Login successful, waiting for redirect...
🔵 LOGIN END
🔵 Auth state changed: { event: "SIGNED_IN", hasSession: true, userId: "...", email: "editor@test.com" }
🔵 Session exists, fetching user profile...
🔵 fetchCurrentUser called: { userId: "..." }
🔵 Auth user email: "editor@test.com"
🔵 DB query result: { found: true, error: "none", email: "editor@test.com", role: "EDITOR", status: "PENDING" }
✅ User fetched successfully: { email: "editor@test.com", role: "EDITOR", status: "PENDING" }
🔵 Setting currentUser: { email: "editor@test.com", role: "EDITOR", status: "PENDING" }
🔵 User effect triggered: { hasUser: true, email: "editor@test.com", role: "EDITOR", status: "PENDING" }
🔵 Fetching all data...
🟡 User is PENDING/REJECTED, redirecting to pending page
setView called with: pending
View changed to: pending
ROUTE GUARD CHECK: { currentView: 'pending', currentUser: { email: "editor@test.com", role: "EDITOR", status: "PENDING" } }
```

---

## ✅ VERIFICATION CHECKLIST

After login attempt, verify console shows:

- [ ] 🔵 LOGIN START
- [ ] 🔵 signIn function called
- [ ] 🔵 Supabase auth response (with user email)
- [ ] ✅ Login successful
- [ ] 🔵 LOGIN END
- [ ] 🔵 Auth state changed (SIGNED_IN)
- [ ] 🔵 fetchCurrentUser called
- [ ] 🔵 DB query result (found: true)
- [ ] ✅ User fetched successfully
- [ ] 🔵 Setting currentUser
- [ ] 🔵 User effect triggered
- [ ] ✅ User is APPROVED (or 🟡 PENDING)
- [ ] 🔵 Redirecting to [dashboard]
- [ ] setView called with: [view]
- [ ] ROUTE GUARD CHECK

**If ANY step is missing**, that's where the problem is!

---

## 🎯 QUICK DIAGNOSIS

| Console Output | Problem | Solution |
|----------------|---------|----------|
| Stops at "Calling signIn" | Supabase hanging | Check network tab, Supabase status |
| "error: Invalid login credentials" | Wrong password | Check credentials |
| "DB query result: found: false" | User not in database | Auto-creation should trigger |
| "Error creating user" | RLS policy blocking | Run FIXED_SUPABASE_SCHEMA.sql |
| "User fetched" but no redirect | currentView not login/signup/landing | Check what page user is on |
| "role: editor" (lowercase) | Database has wrong case | UPDATE to uppercase |
| Infinite "User effect triggered" | Dependency loop | Check useEffect deps |

---

**Status**: FULL LOGGING ENABLED ✅  
**Next Step**: Login and copy console output ✅
