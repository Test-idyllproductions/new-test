# ✅ Fix Login - Step-by-Step Checklist

## 🎯 Goal
Fix "Invalid login credentials" error and get manager account working.

---

## 📋 Steps to Complete

### ☐ Step 1: Open Supabase Dashboard
- [ ] Go to https://supabase.com/dashboard
- [ ] Find project: `zvwegbjzkrsjgfyjkyet`
- [ ] Click on the project to open it

### ☐ Step 2: Open SQL Editor
- [ ] Click "SQL Editor" in left sidebar
- [ ] Click "New Query" button
- [ ] You should see an empty SQL editor

### ☐ Step 3: Copy SQL Script
- [ ] Open file: `QUICK_FIX_LOGIN.sql` in your project
- [ ] Select all content (Ctrl+A)
- [ ] Copy (Ctrl+C)

### ☐ Step 4: Run SQL Script
- [ ] Paste into Supabase SQL Editor (Ctrl+V)
- [ ] Click "Run" button (or Ctrl+Enter)
- [ ] Wait for execution to complete

### ☐ Step 5: Verify Success
Look for these messages:
- [ ] "✅ Manager created: idyllproductionsofficial@gmail.com / pass-101010"
- [ ] "✅ Editor created: editor@idyll.com / password123"
- [ ] "VERIFICATION - Auth Users" shows 2 users
- [ ] "VERIFICATION - Public Users" shows 2 users
- [ ] "FINAL SUMMARY" shows: Managers: 1, Editors: 1

### ☐ Step 6: Test Manager Login
- [ ] Go to http://localhost:3000
- [ ] Click "Login" button
- [ ] Enter email: `idyllproductionsofficial@gmail.com`
- [ ] Enter password: `pass-101010`
- [ ] Click "Sign In"
- [ ] Should redirect to Tasks view (Manager Dashboard)
- [ ] Should see "Create Task" button

### ☐ Step 7: Test TempIcons
- [ ] Look at top-right corner
- [ ] Should see navigation icons
- [ ] Should show: "Users loaded: 2 | Editors: 1 | Managers: 1"
- [ ] Click icons to navigate between pages

### ☐ Step 8: Create First Task
- [ ] Click "Create Task" button
- [ ] Fill in task details:
  - [ ] Task Number: "001"
  - [ ] Task Name: "Test Task"
  - [ ] Deadline: Pick any date
  - [ ] Assign to: "Test Editor"
- [ ] Click "Save" or "Create"
- [ ] Should see task in table

### ☐ Step 9: Test Editor Login
- [ ] Click user icon → Logout
- [ ] Click "Login"
- [ ] Enter email: `editor@idyll.com`
- [ ] Enter password: `password123`
- [ ] Click "Sign In"
- [ ] Should redirect to Home view (Editor Dashboard)
- [ ] Should see "Good Morning, Test Editor"
- [ ] Should see the task you created

### ☐ Step 10: Test Task Update
- [ ] Click on the task
- [ ] Change status to "Editing"
- [ ] Add a link in "Edited File Link"
- [ ] Save changes
- [ ] Refresh page (Ctrl+R)
- [ ] Should still see updated task

---

## ✅ Success Criteria

You're done when:
- ✅ Manager can login
- ✅ Manager can create tasks
- ✅ Editor can login
- ✅ Editor can see assigned tasks
- ✅ Editor can update task status
- ✅ TempIcons shows user count
- ✅ Data persists after refresh

---

## 🐛 If Something Goes Wrong

### SQL Script Fails
- **Error:** "relation does not exist"
  - **Fix:** Run `supabase-schema.sql` first to create tables
  
- **Error:** "duplicate key value"
  - **Fix:** Users already exist, delete them first:
    ```sql
    DELETE FROM public.users WHERE email IN ('idyllproductionsofficial@gmail.com', 'editor@idyll.com');
    DELETE FROM auth.users WHERE email IN ('idyllproductionsofficial@gmail.com', 'editor@idyll.com');
    ```
    Then re-run `QUICK_FIX_LOGIN.sql`

### Login Still Fails
- **Check 1:** Verify users exist
  ```sql
  SELECT email FROM auth.users;
  ```
  Should show both emails.

- **Check 2:** Try editor account first
  - Email: `editor@idyll.com`
  - Password: `password123`
  
  If editor works, manager password is wrong.

- **Check 3:** Reset password in Supabase Dashboard
  - Go to Authentication → Users
  - Find manager user
  - Click three dots → Reset Password

### Blank Page After Login
- **Check:** User status
  ```sql
  SELECT email, status FROM public.users;
  ```
  
- **Fix:** Approve user
  ```sql
  UPDATE public.users SET status = 'APPROVED';
  ```

### TempIcons Shows 0 Users
- **Fix:** Refresh page (Ctrl+R)

### Can't Create Task
- **Check:** Are you logged in as manager?
  - Editors cannot create tasks
  - Only managers can create

---

## 📞 Quick Reference

### Manager Credentials
```
Email:    idyllproductionsofficial@gmail.com
Password: pass-101010
```

### Editor Credentials
```
Email:    editor@idyll.com
Password: password123
```

### Dev Server
```
URL: http://localhost:3000
Status: Running
```

### Supabase Project
```
URL: https://zvwegbjzkrsjgfyjkyet.supabase.co
Dashboard: https://supabase.com/dashboard
```

---

## 📁 Files to Reference

- **START_HERE_NOW.md** - Complete guide
- **QUICK_FIX_LOGIN.sql** - SQL script to run
- **FIX_LOGIN_NOW.md** - Detailed troubleshooting
- **LOGIN_CREDENTIALS.md** - Credential reference
- **CURRENT_STATUS.md** - System status

---

**Estimated Time:** 2-5 minutes  
**Difficulty:** Easy (just copy/paste SQL)  
**Status:** Ready to start  

## 🚀 START WITH STEP 1 NOW!
