# START HERE - Complete Setup Guide
**Last Updated:** January 14, 2026
**Status:** 🚀 READY TO USE

---

## ⚠️ CRITICAL: You MUST Create Users First

The app is working correctly, but **you need to create users in Supabase** before TempIcons will work.

---

## STEP 1: Create Users in Supabase (5 minutes)

### Option A: Via Supabase Dashboard (EASIEST)

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project

2. **Create Manager User**
   - Click "Authentication" in left sidebar
   - Click "Users" tab
   - Click "Add User" or "Invite User" button
   - Fill in:
     - Email: `manager@idyll.com`
     - Password: `password123`
     - Auto Confirm User: ✅ YES
   - Click "Create User"

3. **Create Editor User**
   - Click "Add User" again
   - Fill in:
     - Email: `editor@idyll.com`
     - Password: `password123`
     - Auto Confirm User: ✅ YES
   - Click "Create User"

4. **Set Roles and Approve**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"
   - Paste this SQL:
   ```sql
   -- Set manager role and approve
   UPDATE public.users 
   SET status = 'APPROVED', role = 'MANAGER', username = 'Test Manager'
   WHERE email = 'manager@idyll.com';

   -- Set editor role and approve
   UPDATE public.users 
   SET status = 'APPROVED', role = 'EDITOR', username = 'Test Editor'
   WHERE email = 'editor@idyll.com';

   -- Verify
   SELECT id, email, username, role, status FROM public.users;
   ```
   - Click "Run" (or press Ctrl+Enter)
   - You should see 2 users with status='APPROVED'

### Option B: Via SQL Only (ADVANCED)

If you prefer SQL, run `seed-test-users.sql` in SQL Editor.

---

## STEP 2: Verify Setup

1. **Check Users Exist**
   - In Supabase SQL Editor, run:
   ```sql
   SELECT email, username, role, status FROM public.users;
   ```
   - You should see:
     - manager@idyll.com | Test Manager | MANAGER | APPROVED
     - editor@idyll.com | Test Editor | EDITOR | APPROVED

2. **Check Environment Variables**
   - Open `.env.local`
   - Verify you have:
     ```
     VITE_SUPABASE_URL=your_url_here
     VITE_SUPABASE_ANON_KEY=your_key_here
     ```

---

## STEP 3: Start the App

```bash
npm run dev
```

The app will start at http://localhost:3000

---

## STEP 4: Test TempIcons

You should see a draggable panel in the top-left corner that says "🎮 TEMP NAV v2.0 (DRAG)".

**Debug Info Line:**
```
Users loaded: 2 | Editors: 1 | Managers: 1
```

If you see `Users loaded: 0`, the users aren't being fetched. Check:
1. Supabase connection (.env.local)
2. Users exist in database
3. Browser console for errors

**Click Each Button:**

1. **🏠 Welcome**
   - Should go to landing page
   - Should clear current user

2. **🔑 Login**
   - Should go to login page
   - Should clear current user

3. **📝 Signup**
   - Should go to signup page
   - Should clear current user

4. **⏳ Approval**
   - Should go to pending page
   - Should set a pending user

5. **📊 Editor Home**
   - Should switch to editor user
   - Should go to home view (Editor Dashboard)
   - Should show "Good Morning, Test Editor"
   - Should show 5 summary cards

6. **👔 Manager Tasks**
   - Should switch to manager user
   - Should go to tasks view (Manager Dashboard)
   - Should show task management interface
   - Should show "Create Task" button

---

## STEP 5: Test Login

1. **Login as Manager**
   - Click "🔑 Login" in TempIcons
   - Enter:
     - Email: `manager@idyll.com`
     - Password: `password123`
   - Click "Sign In"
   - Should redirect to tasks view (Manager Dashboard)

2. **Login as Editor**
   - Click "🔑 Login" in TempIcons
   - Enter:
     - Email: `editor@idyll.com`
     - Password: `password123`
   - Click "Sign In"
   - Should redirect to home view (Editor Dashboard)

---

## STEP 6: Test Data Operations

### As Manager:

1. **Create a Task**
   - Click "👔 Manager Tasks" in TempIcons
   - Click "Create Task" button
   - Fill in:
     - Task Name: "Test Task 1"
     - Assign User: Select "Test Editor"
     - Deadline: Pick a date
     - Status: "Not Started"
   - Click "Save Task"
   - Task should appear in table immediately

2. **Create a Meeting**
   - Click "Meetings Management" in sidebar
   - Click "New Meeting" button
   - Fill in:
     - Meeting Name: "Weekly Sync"
     - Date: Pick a date
     - Time: "10:00"
     - Link: "https://zoom.us/j/123"
     - Select User: "Test Editor"
   - Click "Create"
   - Meeting should appear in list

3. **Create a Payout**
   - Click "Payout Management" in sidebar
   - Click "Create Payout" button
   - Fill in:
     - Project Name: "Project Alpha"
     - Assign User: "Test Editor"
     - Amount: 1000
     - Status: "Pending"
   - Click "Save Payout"
   - Payout should appear in table

### As Editor:

1. **View Assigned Task**
   - Click "📊 Editor Home" in TempIcons
   - Click "Tasks" in sidebar
   - You should see "Test Task 1"
   - You should NOT see tasks assigned to other editors

2. **Update Task Status**
   - Change status dropdown to "Editing"
   - Click "Save Changes"
   - Status should persist after refresh

3. **View Meeting**
   - Click "Meetings" in sidebar
   - You should see "Weekly Sync"
   - Click "Join Call" to open link

4. **View Payout**
   - Click "Payouts" in sidebar
   - You should see "Project Alpha" with $1000

---

## TROUBLESHOOTING

### Issue: "No approved editor/manager users found"

**Cause:** No users in database or users not approved.

**Fix:**
1. Go to Supabase Dashboard → SQL Editor
2. Run:
   ```sql
   SELECT * FROM public.users;
   ```
3. If no users, create them (see Step 1)
4. If users exist but status != 'APPROVED', run:
   ```sql
   UPDATE public.users SET status = 'APPROVED';
   ```

### Issue: TempIcons shows "Users loaded: 0"

**Cause:** Supabase connection issue or RLS blocking queries.

**Fix:**
1. Check `.env.local` has correct credentials
2. Check browser console for errors
3. Run in SQL Editor:
   ```sql
   -- Check RLS policies
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```
4. If RLS is blocking, temporarily disable for testing:
   ```sql
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   ```

### Issue: Data not persisting after refresh

**Cause:** Data not saving to Supabase.

**Fix:**
1. Check browser console for errors
2. Check Supabase logs in Dashboard
3. Verify RLS policies allow INSERT/UPDATE
4. Check user has correct role

### Issue: Editor sees all tasks (not just assigned)

**Cause:** Role filtering not working.

**Fix:**
1. Check `currentUser.role` in browser console
2. Verify user has role='EDITOR' in database
3. Check SupabaseTasksView filtering logic

---

## VERIFICATION CHECKLIST

After completing all steps:

- [ ] Users exist in Supabase (manager + editor)
- [ ] Users are approved (status='APPROVED')
- [ ] TempIcons shows "Users loaded: 2"
- [ ] Can click all TempIcons buttons
- [ ] Can login as manager → goes to tasks view
- [ ] Can login as editor → goes to home view
- [ ] Manager can create tasks
- [ ] Editor can see assigned tasks only
- [ ] Editor can update task status
- [ ] Changes persist after refresh
- [ ] Real-time updates work (test in 2 browsers)

---

## WHAT'S WORKING

### Architecture:
```
✅ App.tsx - Main app with routing
✅ TempIcons - Navigation panel (with debug info)
✅ Sidebar - Role-based menu
✅ Header - Top bar with notifications

✅ HomeView - EDITOR DASHBOARD
✅ SupabaseTasksView - MANAGER DASHBOARD
✅ MeetingsView - Meetings management
✅ PayoutsView - Payouts management
✅ ApprovalsView - User approvals
✅ UserManagementView - User management
✅ SettingsView - Settings
```

### Routes:
```
✅ 'landing' → Landing page
✅ 'login'/'signup' → Auth
✅ 'pending' → Approval waiting
✅ 'home' → Editor Dashboard
✅ 'tasks' → Manager Dashboard
✅ 'meetings' → Meetings
✅ 'payouts' → Payouts
✅ 'approvals' → User approvals
✅ 'user-management' → User management
✅ 'settings' → Settings
```

### Dashboards:
```
✅ Editor Dashboard = HomeView
   - Summary cards
   - Read-only view
   - Shows only assigned items

✅ Manager Dashboard = SupabaseTasksView
   - Task management
   - Full CRUD operations
   - Sees all data
```

---

## NEXT STEPS

1. ✅ Create users in Supabase (Step 1)
2. ✅ Verify setup (Step 2)
3. ✅ Start app (Step 3)
4. ✅ Test TempIcons (Step 4)
5. ✅ Test login (Step 5)
6. ✅ Test data operations (Step 6)

---

**Status:** 🚀 READY TO USE
**Blocker:** Need to create users in Supabase first
**Time Required:** 5-10 minutes total
