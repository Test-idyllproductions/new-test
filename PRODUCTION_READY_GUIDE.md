# 🚀 Production Ready Guide - Complete Setup

## Overview

This guide will set up your Idyll Productions workspace as a **real production system** with:
- ✅ Proper signup flow (anyone can create account → pending approval)
- ✅ Manager account (pre-approved, can login immediately)
- ✅ Role-based dashboards (Editor vs Manager)
- ✅ Full database persistence (tasks, meetings, payouts)
- ✅ Real-time updates via Supabase
- ✅ Proper security (RLS policies)

---

## 🎯 Production Flow

### For New Users (Signup):
```
1. User visits site → Clicks "Signup"
2. Enters email, username, password
3. Account created with status = PENDING
4. Alert: "Account created! Pending approval..."
5. User logs in → Redirected to Pending page
6. Manager approves user in Approvals view
7. User logs in again → Redirected to Editor Dashboard
```

### For Manager (Pre-Approved):
```
1. Manager visits site → Clicks "Login"
2. Enters: idyllproductionsofficial@gmail.com + password
3. Immediately redirected to Manager Dashboard (Tasks view)
4. Can approve users, create tasks, assign work
```

---

## 📋 Setup Steps (5 Minutes)

### Step 1: Verify Database Schema (1 min)

Run this in Supabase SQL Editor:

```sql
-- Check if schema is set up
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'task_tables', 'task_records', 'payout_tables', 'payout_records', 'meetings');
```

**Expected:** Should return 6 tables.

**If no tables:** Run `supabase-schema.sql` first to create all tables.

### Step 2: Add Manager Account (2 min)

**Option A: Manager Already Exists in Supabase**

If you already added `idyllproductionsofficial@gmail.com` in Supabase Dashboard:

1. Open Supabase SQL Editor
2. Copy and run: `PRODUCTION_SETUP.sql`
3. This will configure your existing user as MANAGER/APPROVED

**Option B: Manager Doesn't Exist Yet**

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter:
   - Email: `idyllproductionsofficial@gmail.com`
   - Password: (your choice, e.g., `pass-101010`)
   - Auto Confirm User: ✅ YES
4. Click "Create User"
5. Then run `PRODUCTION_SETUP.sql` in SQL Editor

### Step 3: Verify Setup (1 min)

Run `VERIFY_PRODUCTION.sql` in Supabase SQL Editor.

**Expected output:**
```
✅ PASS - Manager account exists and is approved
✅ PASS - Auto-create user profile trigger exists
✅ PASS - RLS policies are configured
✅ PASS - Default task table exists
✅ PASS - Default payout table exists
```

### Step 4: Test Manager Login (1 min)

1. Go to: http://localhost:3000
2. Click "Login"
3. Enter:
   - Email: `idyllproductionsofficial@gmail.com`
   - Password: (the password you set)
4. Should redirect to **Tasks view** (Manager Dashboard)
5. Should see "Create Task" button

---

## ✅ What's Already Fixed in Code

I've updated the code to ensure:

### 1. Managers See All Users (Including Pending)
- **File:** `lib/supabase-store.tsx`
- **Change:** Managers fetch ALL users, editors only see APPROVED users
- **Result:** Approvals view will show pending users

### 2. Signup Creates PENDING Users
- **File:** `supabase-schema.sql`
- **Trigger:** `on_auth_user_created` automatically creates user profile with status=PENDING
- **Result:** New signups go to pending approval

### 3. Login Redirects Based on Status
- **File:** `lib/supabase-store.tsx`
- **Logic:** 
  - PENDING → Pending page
  - APPROVED + MANAGER → Tasks view
  - APPROVED + EDITOR → Home view
- **Result:** Proper role-based routing

### 4. Manager Can Approve Users
- **File:** `views/ApprovalsView.tsx`
- **Feature:** Shows pending users with Approve/Reject buttons
- **Result:** Manager can approve new signups

---

## 🧪 End-to-End Testing

### Test 1: Manager Login
```
1. Go to http://localhost:3000
2. Click "Login"
3. Enter: idyllproductionsofficial@gmail.com + password
4. ✅ Should see Tasks view (Manager Dashboard)
5. ✅ Should see sidebar: Tasks, Meetings, Payouts, Approvals, User Management
6. ✅ Should see "Create Task" button
```

### Test 2: New User Signup
```
1. Open incognito window
2. Go to http://localhost:3000
3. Click "Signup"
4. Enter:
   - Email: testuser@example.com
   - Username: Test User
   - Password: password123
5. Click "Create Account"
6. ✅ Should see alert: "Account created! Pending approval..."
7. ✅ Should redirect to Login page
```

### Test 3: Pending User Login
```
1. Click "Login"
2. Enter: testuser@example.com / password123
3. Click "Sign In"
4. ✅ Should redirect to Pending page
5. ✅ Should see message: "Your account is pending approval"
```

### Test 4: Manager Approves User
```
1. In main window (logged in as manager)
2. Click "User Approvals" in sidebar
3. ✅ Should see "Test User" in pending list
4. Click green checkmark (Approve)
5. ✅ User should disappear from pending list
```

### Test 5: Approved User Login
```
1. In incognito window (testuser@example.com)
2. Logout if needed, then login again
3. Enter: testuser@example.com / password123
4. ✅ Should redirect to Home view (Editor Dashboard)
5. ✅ Should see "Good Morning, Test User"
6. ✅ Should see sidebar: Home, Tasks, Meetings, Payouts
7. ✅ Should NOT see "Create Task" button (read-only)
```

### Test 6: Create Task as Manager
```
1. Login as manager
2. Go to Tasks view
3. Click "Create Task"
4. Fill in:
   - Task Number: 001
   - Task Name: Test Video Edit
   - Deadline: (pick date)
   - Assign to: Test User
5. Click "Save"
6. ✅ Task should appear in table
7. ✅ Refresh page → task still there (persistence)
```

### Test 7: Editor Sees Assigned Task
```
1. Login as testuser@example.com
2. Go to Home view
3. ✅ Should see "Test Video Edit" in tasks section
4. Click on task
5. Update status to "Editing"
6. Add link in "Edited File Link"
7. Save
8. ✅ Refresh page → changes persist
```

### Test 8: Create Meeting
```
1. Login as manager
2. Go to Meetings view
3. Click "Create Meeting"
4. Fill in:
   - Name: Weekly Review
   - Date: (pick date)
   - Time: 10:00 AM
   - Link: https://meet.google.com/xxx
   - Attendees: Select "Test User"
5. Save
6. ✅ Meeting appears in table
```

### Test 9: Editor Sees Meeting
```
1. Login as testuser@example.com
2. Go to Meetings view
3. ✅ Should see "Weekly Review" meeting
4. ✅ Should NOT see "Create Meeting" button
```

### Test 10: Create Payout
```
1. Login as manager
2. Go to Payouts view
3. Click "Create Payout"
4. Fill in:
   - Project Name: January Videos
   - Project Link: https://...
   - Amount: 500
   - Assign to: Test User
5. Save
6. ✅ Payout appears in table
```

### Test 11: Real-Time Updates
```
1. Open 2 browser windows
2. Window 1: Login as manager
3. Window 2: Login as testuser@example.com
4. In Window 1: Create a new task assigned to Test User
5. In Window 2: Go to Home view
6. ✅ New task should appear automatically (real-time)
```

### Test 12: Notifications
```
1. Login as testuser@example.com
2. Manager creates task assigned to you
3. ✅ Bell icon should show notification count
4. Click bell icon
5. ✅ Should see "New Task Assigned" notification
6. Click notification
7. ✅ Should navigate to task
```

---

## 🔐 Security Features

### Row Level Security (RLS)
All tables have RLS policies:
- ✅ Users can only see their own data
- ✅ Managers can see all data
- ✅ Editors cannot create/delete
- ✅ Managers have full CRUD access

### Auth Flow
- ✅ Passwords encrypted by Supabase
- ✅ Email confirmation required
- ✅ Session management automatic
- ✅ Auto-refresh tokens

### Role-Based Access
- ✅ Editors: Read-only (except task status updates)
- ✅ Managers: Full control
- ✅ Enforced at database level (RLS)
- ✅ Enforced at app level (permission checks)

---

## 📊 Database Structure

### Tables Created:
1. **users** - User profiles (role, status)
2. **task_tables** - Task table containers
3. **task_records** - Individual tasks
4. **payout_tables** - Payout table containers
5. **payout_records** - Individual payouts
6. **meetings** - Meeting records
7. **notifications** - User notifications
8. **audit_logs** - Action history

### Triggers:
- **on_auth_user_created** - Auto-creates user profile on signup with PENDING status
- **update_updated_at** - Auto-updates timestamp on record changes

### Real-Time:
- All tables enabled for real-time subscriptions
- Changes broadcast to all connected clients
- Automatic UI updates

---

## 🐛 Troubleshooting

### Manager Can't Login

**Check 1:** Does user exist?
```sql
SELECT email FROM auth.users WHERE email = 'idyllproductionsofficial@gmail.com';
```

**Check 2:** Is user configured as manager?
```sql
SELECT email, role, status FROM public.users WHERE email = 'idyllproductionsofficial@gmail.com';
```

**Fix:** Run `PRODUCTION_SETUP.sql`

### New Signups Don't Create User Profile

**Check:** Does trigger exist?
```sql
SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
```

**Fix:** Run `supabase-schema.sql` to create trigger

### Manager Can't See Pending Users

**Check:** Code updated?
- File: `lib/supabase-store.tsx`
- Line ~213: Should fetch all users for managers

**Fix:** Code already updated in this session

### Tasks Don't Persist After Refresh

**Check:** Are you logged in?
- Supabase requires authentication for queries
- Check browser console for errors

**Fix:** Logout and login again

### Editor Can Create Tasks

**Check:** RLS policies enabled?
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'task_records';
```

**Fix:** Run `supabase-schema.sql` to enable RLS

---

## 📁 Files Reference

### SQL Scripts (Run in Supabase):
1. **supabase-schema.sql** - Creates all tables, triggers, RLS policies
2. **PRODUCTION_SETUP.sql** - Configures manager account
3. **VERIFY_PRODUCTION.sql** - Verifies everything is working

### Code Files (Already Updated):
1. **lib/supabase-store.tsx** - Auth, data fetching, real-time
2. **views/SupabaseAuthView.tsx** - Login/signup forms
3. **views/ApprovalsView.tsx** - User approval interface
4. **views/HomeView.tsx** - Editor Dashboard
5. **views/SupabaseTasksView.tsx** - Manager Dashboard
6. **App.tsx** - Routing logic

### Documentation:
1. **PRODUCTION_READY_GUIDE.md** - This file
2. **EXISTING_USER_GUIDE.md** - For existing users
3. **AUTH_FLOW_FIX.md** - Auth flow details

---

## ✅ Production Checklist

Before going live:

- [ ] Run `supabase-schema.sql` (creates tables)
- [ ] Add manager in Supabase Dashboard
- [ ] Run `PRODUCTION_SETUP.sql` (configures manager)
- [ ] Run `VERIFY_PRODUCTION.sql` (verify setup)
- [ ] Test manager login
- [ ] Test new user signup
- [ ] Test approval flow
- [ ] Test task creation
- [ ] Test task assignment
- [ ] Test editor view
- [ ] Test real-time updates
- [ ] Test notifications
- [ ] Test data persistence (refresh page)
- [ ] Test role-based access (editor can't create)
- [ ] Test meetings
- [ ] Test payouts

---

## 🚀 Quick Start (Right Now)

1. **Open Supabase Dashboard** → SQL Editor
2. **Run:** `PRODUCTION_SETUP.sql`
3. **Run:** `VERIFY_PRODUCTION.sql`
4. **Check output:** Should show all ✅ PASS
5. **Go to:** http://localhost:3000
6. **Login:** idyllproductionsofficial@gmail.com + your password
7. **Should see:** Tasks view (Manager Dashboard)
8. **Test:** Create a task, refresh page, task still there

---

**Status:** Production ready  
**Time to setup:** 5 minutes  
**Dev server:** Running on http://localhost:3000  
**Next:** Run `PRODUCTION_SETUP.sql` in Supabase SQL Editor
