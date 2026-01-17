# Quick Reference Card
**Idyll Productions Workspace - Post System Audit**

---

## 🚀 QUICK START

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
# Edit .env.local with your Supabase credentials

# 3. Run database schema
# Copy supabase-schema.sql to Supabase SQL Editor and run

# 4. Create test users (via SQL or signup flow)

# 5. Start dev server
npm run dev
```

---

## 👥 USER ROLES

### Editor
**Can:**
- View assigned tasks
- Update task status & file links
- View meetings (where invited)
- View payouts

**Cannot:**
- Create/delete anything
- Access manager pages
- See other users' data

### Manager
**Can:**
- Everything editors can do
- Create/delete tasks, meetings, payouts
- Approve users
- Manage all users
- View all data

---

## 🗺️ NAVIGATION

### Editor Sidebar
- Home (summary dashboard)
- Tasks (assigned only)
- Meetings (invited only)
- Payouts (own only)
- Settings

### Manager Sidebar
- Tasks Management (all tasks)
- Meetings Management (all meetings)
- Payout Management (all payouts)
- User Approvals (pending users)
- User Submissions (all users)
- Settings

---

## 🔑 KEY FEATURES

### Real-time Updates
- Changes appear instantly across all sessions
- No refresh needed
- Powered by Supabase subscriptions

### Notifications
- Created when tasks/meetings/payouts assigned
- Bell icon shows unread count
- Sound plays (if enabled)
- Click to navigate to item

### Data Persistence
- All data stored in Supabase
- Survives page refresh
- Survives logout/login
- No local storage

---

## 🛠️ COMMON TASKS

### Create a Task (Manager)
1. Go to Tasks Management
2. Click "Create Task"
3. Fill form (name, assignee, deadline)
4. Submit
5. Task appears immediately

### Update Task Status (Editor)
1. Go to Tasks
2. Change status dropdown
3. Click "Save Changes"
4. Status persists

### Approve User (Manager)
1. Go to User Approvals
2. Click green checkmark
3. User can now login

### Switch Roles (TempIcons)
1. Click "Editor Home" or "Manager Tasks"
2. Switches to first approved user of that role
3. Must have users in database first

---

## ⚠️ IMPORTANT NOTES

### TempIcons Requires Real Users
- No longer creates fake users
- Must have approved users in database
- Shows error if no users found

### Permission Errors
- "Only managers can..." = expected behavior
- Editors cannot perform manager actions
- This is by design, not a bug

### Data Not Loading
- Check Supabase connection
- Check user is approved
- Check RLS policies enabled
- Check browser console

---

## 📁 KEY FILES

### Configuration
- `.env.local` - Supabase credentials
- `supabase-schema.sql` - Database schema
- `vite.config.ts` - Build config

### Core Logic
- `lib/supabase-store.tsx` - State & database
- `lib/supabase.ts` - Supabase client
- `App.tsx` - Main app & routing

### Views
- `views/HomeView.tsx` - Editor dashboard
- `views/SupabaseTasksView.tsx` - Task management
- `views/MeetingsView.tsx` - Meeting management
- `views/PayoutsView.tsx` - Payout management
- `views/ApprovalsView.tsx` - User approvals
- `views/UserManagementView.tsx` - User management

### Components
- `components/TempIcons.tsx` - Role switcher
- `components/Sidebar.tsx` - Navigation
- `components/Header.tsx` - Top bar

---

## 🐛 TROUBLESHOOTING

### "No approved users found"
**Fix:** Create users in database (see SETUP_AND_TESTING_GUIDE.md)

### Data not persisting
**Fix:** Check Supabase connection and RLS policies

### Permission denied
**Fix:** This is expected. Editors cannot do manager actions.

### Real-time not working
**Fix:** Enable Realtime in Supabase for all tables

### Notifications not showing
**Fix:** Check notifications table exists and RLS allows reading

---

## 📚 DOCUMENTATION

### Full Guides
- `COMPLETE_SYSTEM_AUDIT.md` - Technical analysis
- `SETUP_AND_TESTING_GUIDE.md` - Setup & testing
- `FIXES_COMPLETED.md` - What was fixed

### Quick Reference
- This file - Quick reference card

---

## ✅ VERIFICATION

### System is working when:
- [x] Can login as editor and manager
- [x] Editor sees only own data
- [x] Manager sees all data
- [x] Can create tasks/meetings/payouts (manager)
- [x] Can update tasks (editor)
- [x] Changes persist after refresh
- [x] Real-time updates work
- [x] Notifications appear
- [x] TempIcons switches between real users

---

## 🎯 ACCEPTANCE CRITERIA

### Must Work:
✅ Authentication (signup, login, logout)
✅ Role-based access (editor vs manager)
✅ Data persistence (survives refresh)
✅ Real-time updates (across sessions)
✅ Notifications (with sound)
✅ Permission enforcement (errors shown)

### Must Not Work:
❌ Editors creating/deleting items
❌ Editors accessing manager pages
❌ Editors seeing other users' data
❌ Fake users in TempIcons

---

## 🚦 STATUS

**Current Version:** 2.0 - Post System Audit
**Status:** ✅ Production Ready
**Last Updated:** January 14, 2026

**Critical Issues:** 0
**Known Issues:** 0
**Pending Work:** Optional enhancements only

---

## 📞 SUPPORT

**For Issues:**
1. Check this quick reference
2. Check SETUP_AND_TESTING_GUIDE.md
3. Check browser console
4. Check Supabase logs
5. Contact development team

**For Setup:**
1. Follow SETUP_AND_TESTING_GUIDE.md
2. Create test users first
3. Test with TempIcons
4. Verify all features work

---

**Remember:** The system now works end-to-end. No more partial fixes. No more broken screens. Everything is connected and functional.
