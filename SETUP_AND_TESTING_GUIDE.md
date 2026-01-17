# Setup and Testing Guide - Idyll Productions Workspace
**Version:** 2.0 - Post System Audit Fixes
**Date:** January 14, 2026

## CRITICAL FIXES APPLIED

### What Was Fixed:
1. ✅ **Removed fake users from TempIcons** - Now uses real database users only
2. ✅ **Deleted duplicate dashboard views** - Removed EditorDashboardView and ManagerDashboardView
3. ✅ **Deleted old store.tsx** - Removed dead localStorage code
4. ✅ **Added role validation** - All manager-only functions now check permissions
5. ✅ **Added error handling** - Permission errors now show user-friendly messages
6. ✅ **Fixed routing logic** - Consistent navigation for both roles

---

## SETUP INSTRUCTIONS

### 1. Database Setup (Supabase)

**Prerequisites:**
- Supabase account created
- Project created in Supabase dashboard

**Steps:**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `supabase-schema.sql`
4. Paste and run in SQL Editor
5. Verify all tables created successfully

**Expected Tables:**
- users
- task_tables
- task_records
- payout_tables
- payout_records
- meetings
- audit_logs
- notifications

### 2. Environment Configuration

**File:** `.env.local`

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Get your credentials:**
1. Go to Supabase Dashboard → Settings → API
2. Copy Project URL → paste as VITE_SUPABASE_URL
3. Copy anon/public key → paste as VITE_SUPABASE_ANON_KEY

### 3. Create Initial Users

**IMPORTANT:** You MUST create at least one manager and one editor in the database before using TempIcons.

**Option A: Via Signup Flow**
1. Run the app: `npm run dev`
2. Go to Signup page
3. Create a manager account
4. Create an editor account
5. As manager, approve the editor in Approvals page

**Option B: Via SQL (Quick Setup)**
```sql
-- Create a manager user (replace with your email)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'manager@idyll.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"username": "Test Manager", "role": "MANAGER"}'::jsonb
);

-- Create an editor user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'editor@idyll.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"username": "Test Editor", "role": "EDITOR"}'::jsonb
);

-- Approve both users
UPDATE public.users SET status = 'APPROVED' WHERE email IN ('manager@idyll.com', 'editor@idyll.com');
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

App will be available at: `http://localhost:3000`

---

## TESTING GUIDE

### Phase 1: Authentication Testing

#### Test 1.1: Signup Flow
- [ ] Click "Signup" from landing page
- [ ] Fill in username, email, password
- [ ] Select role (Editor or Manager)
- [ ] Submit form
- [ ] Verify redirect to Pending page
- [ ] Check database: user exists with status='PENDING'

#### Test 1.2: Login Flow
- [ ] Click "Login" from landing page
- [ ] Enter approved user credentials
- [ ] Submit form
- [ ] Verify redirect to appropriate dashboard
- [ ] Check currentUser state is set correctly

#### Test 1.3: Pending Approval
- [ ] Login as pending user
- [ ] Verify stuck on Pending page
- [ ] Cannot access any other views
- [ ] Logout works correctly

---

### Phase 2: Editor Role Testing

**Login as Editor first**

#### Test 2.1: Navigation
- [ ] Sidebar shows: Home, Tasks, Meetings, Payouts, Settings
- [ ] Sidebar does NOT show: Approvals, User Management
- [ ] Click each menu item - correct view loads
- [ ] URL updates correctly
- [ ] Refresh page - stays on same view

#### Test 2.2: Home View
- [ ] Shows greeting with username
- [ ] Shows 5 summary cards: Total Tasks, Editing Tasks, Completed Tasks, Meetings, Payouts
- [ ] Card counts are accurate
- [ ] Cards have proper styling and icons

#### Test 2.3: Tasks View
- [ ] Shows only tasks assigned to current editor
- [ ] Does NOT show tasks assigned to other editors
- [ ] Can update task status (dropdown works)
- [ ] Can update raw file link
- [ ] Can update edited file link
- [ ] Cannot create new tasks (no "Create Task" button)
- [ ] Cannot delete tasks (no delete button)
- [ ] Cannot change assignee
- [ ] Cannot toggle approval checkbox
- [ ] Click "Save Changes" - updates persist
- [ ] Refresh page - changes still there

#### Test 2.4: Meetings View
- [ ] Shows only meetings where editor is attendee
- [ ] Shows meeting name, date, time, link
- [ ] Can click "Join Call" link
- [ ] Cannot create meetings (no "New Meeting" button)
- [ ] Cannot delete meetings

#### Test 2.5: Payouts View
- [ ] Shows only payouts assigned to current editor
- [ ] Shows project name, link, amount, status
- [ ] Cannot edit any fields
- [ ] Cannot create payouts (no "Create Payout" button)
- [ ] Cannot delete payouts

#### Test 2.6: Settings View
- [ ] Can update username
- [ ] Can update email
- [ ] Can change password
- [ ] Can toggle theme (dark/light)
- [ ] Can toggle sound
- [ ] Changes persist after refresh

---

### Phase 3: Manager Role Testing

**Login as Manager first**

#### Test 3.1: Navigation
- [ ] Sidebar shows: Tasks Management, Meetings Management, Payout Management, User Approvals, User Submissions, Settings
- [ ] Sidebar does NOT show: Home
- [ ] Click each menu item - correct view loads
- [ ] Default view is Tasks (not Home)

#### Test 3.2: Tasks Management
- [ ] Shows all tasks by default
- [ ] Can filter by user (dropdown)
- [ ] Can create new task table
- [ ] Can delete task table
- [ ] Can switch between tables
- [ ] Click "Create Task" button - modal opens
- [ ] Fill form: task name, assignee, deadline, status, links
- [ ] Submit - task created successfully
- [ ] Task appears in table immediately
- [ ] Can edit any task field
- [ ] Can delete any task
- [ ] Can toggle approval checkbox
- [ ] Changes persist after refresh

#### Test 3.3: Meetings Management
- [ ] Shows all meetings
- [ ] Click "New Meeting" button - form appears
- [ ] Fill form: name, date, time, link, attendees
- [ ] Submit - meeting created
- [ ] Meeting appears in list immediately
- [ ] Can delete meetings
- [ ] Changes persist after refresh

#### Test 3.4: Payout Management
- [ ] Shows all payouts by default
- [ ] Can filter by user
- [ ] Can create new payout table
- [ ] Can delete payout table
- [ ] Click "Create Payout" button - modal opens
- [ ] Fill form: project name, assignee, link, amount, status
- [ ] Submit - payout created
- [ ] Payout appears in table immediately
- [ ] Can edit any payout field
- [ ] Can delete any payout
- [ ] Changes persist after refresh

#### Test 3.5: User Approvals
- [ ] Shows all pending users
- [ ] Shows user count badge
- [ ] Click approve (green checkmark) - user approved
- [ ] Click reject (red X) - user rejected
- [ ] Approved user can now login
- [ ] Rejected user sees rejection message

#### Test 3.6: User Management
- [ ] Shows all users (approved, pending, rejected)
- [ ] Shows user role, status, email
- [ ] Can toggle user role (Editor ↔ Manager)
- [ ] Can delete users (except self)
- [ ] Changes persist after refresh

---

### Phase 4: Cross-Role Testing

#### Test 4.1: Real-time Updates
- [ ] Open app in two browsers
- [ ] Login as Manager in Browser 1
- [ ] Login as Editor in Browser 2
- [ ] Manager creates task for Editor
- [ ] Editor sees task appear immediately (no refresh)
- [ ] Editor updates task status
- [ ] Manager sees status update immediately

#### Test 4.2: Notifications
- [ ] Manager creates task for Editor
- [ ] Editor receives notification (bell icon shows count)
- [ ] Notification sound plays (if enabled)
- [ ] Click notification - navigates to Tasks view
- [ ] Click notification - marks as read
- [ ] Unread count decreases

#### Test 4.3: Permissions Enforcement
- [ ] As Editor, try to access manager functions via console
- [ ] Verify error message: "Only managers can..."
- [ ] Verify operation fails
- [ ] Verify no data corruption

#### Test 4.4: Data Persistence
- [ ] Manager creates task, meeting, payout
- [ ] Editor updates task status
- [ ] Both users logout
- [ ] Both users login again
- [ ] All data still present
- [ ] All changes persisted

---

### Phase 5: TempIcons Testing

**IMPORTANT:** TempIcons now requires real database users

#### Test 5.1: Role Switching
- [ ] Click "Editor Home" in TempIcons
- [ ] Verify switches to first approved editor in database
- [ ] Verify shows editor's data
- [ ] Click "Manager Tasks" in TempIcons
- [ ] Verify switches to first approved manager in database
- [ ] Verify shows all data

#### Test 5.2: No Users Error
- [ ] Delete all editors from database
- [ ] Click "Editor Home" in TempIcons
- [ ] Verify shows error: "No approved editor users found"
- [ ] Delete all managers from database
- [ ] Click "Manager Tasks" in TempIcons
- [ ] Verify shows error: "No approved manager users found"

---

## COMMON ISSUES & SOLUTIONS

### Issue 1: "No approved users found" in TempIcons
**Solution:** Create at least one manager and one editor in the database (see Setup step 3)

### Issue 2: Data not loading
**Solution:** 
1. Check Supabase connection (verify .env.local)
2. Check RLS policies are enabled
3. Check user is approved (status='APPROVED')
4. Check browser console for errors

### Issue 3: Permission errors
**Solution:** This is expected behavior. Editors cannot perform manager actions. Verify you're logged in as the correct role.

### Issue 4: Real-time not working
**Solution:**
1. Check Supabase Realtime is enabled for all tables
2. Run this SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payout_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

### Issue 5: Notifications not appearing
**Solution:**
1. Check notifications table exists
2. Check RLS policies allow reading notifications
3. Check sound is enabled in settings
4. Check browser allows audio playback

---

## ACCEPTANCE CRITERIA

### ✅ System is working correctly when:

1. **Authentication**
   - Users can signup and login
   - Pending users cannot access dashboard
   - Approved users can access appropriate views

2. **Role Separation**
   - Editors see only their data
   - Managers see all data
   - Editors cannot perform manager actions
   - Permission errors show user-friendly messages

3. **Data Operations**
   - Managers can create tasks, meetings, payouts
   - Editors can update their own tasks
   - All changes persist after refresh
   - Real-time updates work across sessions

4. **Notifications**
   - Created when tasks/meetings/payouts assigned
   - Show in header bell icon
   - Sound plays (if enabled)
   - Click navigates to correct view
   - Mark as read works

5. **Navigation**
   - Sidebar shows correct items per role
   - All views load correctly
   - URL routing works
   - Refresh maintains current view
   - TempIcons switches between real users

---

## PERFORMANCE BENCHMARKS

### Expected Load Times:
- Initial page load: < 2 seconds
- Login/Signup: < 1 second
- Data fetch: < 500ms
- Real-time update: < 100ms
- Navigation: < 200ms

### Expected Data Limits:
- Tasks per table: 1000+
- Payouts per table: 1000+
- Meetings: 500+
- Users: 100+
- Notifications: 1000+

---

## NEXT STEPS

After completing all tests:

1. **Production Deployment**
   - Update .env with production Supabase credentials
   - Build: `npm run build`
   - Deploy to hosting platform
   - Test in production environment

2. **User Onboarding**
   - Create manager accounts for admins
   - Invite editors to signup
   - Approve editor accounts
   - Train users on features

3. **Monitoring**
   - Set up error tracking (Sentry, etc.)
   - Monitor Supabase usage
   - Track performance metrics
   - Collect user feedback

---

## SUPPORT

For issues or questions:
1. Check this guide first
2. Check COMPLETE_SYSTEM_AUDIT.md for technical details
3. Check browser console for errors
4. Check Supabase logs
5. Contact development team

**Last Updated:** January 14, 2026
**Version:** 2.0 - Post System Audit
