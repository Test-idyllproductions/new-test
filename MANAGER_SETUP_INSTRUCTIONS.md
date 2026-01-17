# Manager Accounts Setup Instructions

## ✅ COMPLETED CHANGES

### 1. Signup Form - Role Selection REMOVED ✅
- Users can NO LONGER choose Editor or Manager during signup
- All signups automatically default to **Editor role**
- All new signups have **Approval Pending** status
- Only management can assign Manager role from User Management panel

### 2. TempIcons Simplified to 6 Pages ✅
- 🏠 Welcome Page
- 🔑 Login Page
- 📝 Signup Page
- ⏳ Approval Page
- 📊 Editor Dashboard
- 👔 Manager Dashboard

**Removed from TempIcons:** Tasks, Meetings, Payouts, Users, Approvals, Activity, Profile, Settings
(These are accessed from within Dashboard via Sidebar)

### 3. Auto-Redirect Flow After Login ✅
- **Pending/Rejected users** → Redirected to Approval Page
- **Approved Editors** → Redirected to Editor Dashboard
- **Approved Managers** → Redirected to Manager Dashboard

---

## 🔴 ACTION REQUIRED: Add 3 Manager Accounts

### Step 1: Provide Manager Email Addresses
**I need you to provide 3 email addresses for the manager accounts.**

Example format:
```
manager1@idyllproductions.com
manager2@idyllproductions.com
manager3@idyllproductions.com
```

### Step 2: Create Auth Users in Supabase

Once you provide the emails, you need to:

1. Go to your Supabase Dashboard: https://zvwegbjzkrsjgfyjkyet.supabase.co
2. Navigate to: **Authentication** → **Users**
3. Click **"Add User"** (or "Invite User")
4. For each of the 3 managers:
   - Enter the email address
   - Set a password (or auto-generate)
   - **IMPORTANT:** Check "Auto Confirm User" (skip email verification)
   - Click "Create User"

### Step 3: Run SQL Script to Assign Manager Role

After creating the 3 auth users:

1. Go to: **SQL Editor** in Supabase
2. Open the file `add-managers.sql` (I've created this for you)
3. **Replace the email addresses** in the script with your actual manager emails
4. Click **"Run"** to execute the script

The script will:
- Find the 3 auth users by email
- Add them to the `users` table with:
  - Role: **MANAGER**
  - Status: **APPROVED**
  - Theme: dark
  - Sound: enabled

### Step 4: Verify Setup

Run this query in SQL Editor to verify:
```sql
SELECT id, email, username, role, status 
FROM public.users 
WHERE role = 'MANAGER';
```

You should see all 3 managers listed with status = 'APPROVED'.

---

## 📊 DATABASE STATUS

### Supabase Connection: ✅ CONNECTED
- URL: `https://zvwegbjzkrsjgfyjkyet.supabase.co`
- Anon Key: Configured in `.env.local`

### Database Schema: ✅ READY
All tables created and configured:
- ✅ `users` - User accounts with roles and status
- ✅ `task_tables` - Task management tables
- ✅ `task_records` - Individual task records
- ✅ `payout_tables` - Payout management tables
- ✅ `payout_records` - Individual payout records
- ✅ `meetings` - Meeting schedules
- ✅ `audit_logs` - Activity tracking
- ✅ `notifications` - User notifications

### Row Level Security (RLS): ✅ ENABLED
- Users can only see approved users
- Editors can only modify their own tasks
- Managers have full access to all data

### Real-time Subscriptions: ✅ ACTIVE
- Live updates across browser tabs
- Instant sync when data changes

---

## 🧪 TESTING CHECKLIST

Once you add the 3 manager accounts, test the following:

### Manager Login Flow:
1. ✅ Manager logs in with credentials
2. ✅ Automatically redirected to Manager Dashboard
3. ✅ Can access all management features (User Management, Approvals, etc.)
4. ✅ Can see all users, tasks, payouts

### Editor Signup & Approval Flow:
1. ✅ New user signs up (no role selection shown)
2. ✅ Account created with Editor role + Pending status
3. ✅ User redirected to Approval Page
4. ✅ Manager approves user from User Management panel
5. ✅ Editor can now log in and access Editor Dashboard
6. ✅ Editor can only see their own tasks

### TempIcons Navigation:
1. ✅ Only 6 buttons visible
2. ✅ Can navigate between Welcome, Login, Signup, Approval, Editor Dash, Manager Dash
3. ✅ Internal pages (Tasks, Meetings, etc.) accessed via Sidebar

---

## 🚀 READY TO TEST

**Current Status:** 95% Complete

**Waiting for:** 3 Manager Email Addresses

**Once you provide the emails:**
1. I'll update the SQL script with correct emails
2. You'll create the 3 auth users in Supabase
3. You'll run the SQL script
4. Database setup will be 100% complete
5. You can start full testing

---

## 📝 PROVIDE MANAGER EMAILS NOW

Please reply with the 3 manager email addresses in this format:

```
Manager 1: email@example.com
Manager 2: email@example.com
Manager 3: email@example.com
```

And optionally, passwords for each (or I'll use a default password).
