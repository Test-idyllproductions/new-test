# 🎯 FINAL SETUP STEPS - ADD 3 MANAGER ACCOUNTS

## ✅ DATABASE IS READY!

Your Supabase database is **fully configured and connected**. Now you just need to add the 3 manager accounts.

---

## 📧 YOUR 3 MANAGER EMAILS:
1. **rohitidyllproductions@gmail.com** (Rohit)
2. **harshpawar7711@gmail.com** (Harsh)
3. **idyllproductionsofficial@gmail.com** (Idyll Official)

---

## 🚀 STEP-BY-STEP INSTRUCTIONS

### STEP 1: Go to Supabase Dashboard
Open this URL in your browser:
```
https://zvwegbjzkrsjgfyjkyet.supabase.co
```

### STEP 2: Navigate to Authentication
1. Click on **"Authentication"** in the left sidebar
2. Click on **"Users"** tab
3. Click the **"Add User"** button (top right)

### STEP 3: Create Manager 1 - Rohit
1. **Email:** `rohitidyllproductions@gmail.com`
2. **Password:** Choose a secure password (e.g., `Idyll@2025!`)
3. **✅ IMPORTANT:** Check the box **"Auto Confirm User"**
4. Click **"Create User"**

### STEP 4: Create Manager 2 - Harsh
1. **Email:** `harshpawar7711@gmail.com`
2. **Password:** Choose a secure password (e.g., `Idyll@2025!`)
3. **✅ IMPORTANT:** Check the box **"Auto Confirm User"**
4. Click **"Create User"**

### STEP 5: Create Manager 3 - Idyll Official
1. **Email:** `idyllproductionsofficial@gmail.com`
2. **Password:** Choose a secure password (e.g., `Idyll@2025!`)
3. **✅ IMPORTANT:** Check the box **"Auto Confirm User"**
4. Click **"Create User"**

### STEP 6: Run SQL Script
1. In Supabase Dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Open the file `add-managers.sql` from your project folder
4. **Copy the entire SQL script** from that file
5. **Paste it** into the SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)

You should see success messages:
```
Manager 1 (Rohit) added successfully!
Manager 2 (Harsh) added successfully!
Manager 3 (Idyll Official) added successfully!
=== Manager accounts setup complete! ===
```

### STEP 7: Verify Managers Were Added
The script will automatically show you the 3 managers. You should see:

| Email | Username | Role | Status |
|-------|----------|------|--------|
| rohitidyllproductions@gmail.com | Rohit | MANAGER | APPROVED |
| harshpawar7711@gmail.com | Harsh | MANAGER | APPROVED |
| idyllproductionsofficial@gmail.com | Idyll Official | MANAGER | APPROVED |

---

## ✅ AFTER SETUP - TEST THE SYSTEM

### Test Manager Login:
1. Go to: http://localhost:3000/
2. Click **"Login to Workspace"**
3. Enter one of the manager emails and password
4. You should be **automatically redirected to Manager Dashboard**
5. You should see all management features (User Management, Approvals, etc.)

### Test Editor Signup:
1. Go to: http://localhost:3000/
2. Click **"Create Editor Account"**
3. Enter a test email (e.g., `editor1@test.com`)
4. Enter username and password
5. **Notice:** No role selection shown!
6. Click **"Create Account"**
7. You should see: "Account created! Your account is pending approval..."
8. You'll be redirected to **Approval Page**

### Test Editor Approval:
1. Log in as a Manager
2. Go to **User Management** (from sidebar)
3. Find the pending editor
4. Click **"Approve"**
5. Log out and log in as the editor
6. Editor should now access **Editor Dashboard**

---

## 🎉 DATABASE SETUP COMPLETE!

Once you complete the steps above:

✅ **Database:** Fully configured and connected  
✅ **Schema:** All tables created with RLS  
✅ **Managers:** 3 accounts with full access  
✅ **Signup Flow:** Editor-only with approval  
✅ **Login Flow:** Auto-redirect based on role  
✅ **TempIcons:** Simplified to 6 pages  
✅ **Real-time:** Live updates enabled  

**YOU CAN START TESTING NOW!**

---

## 📝 PASSWORDS REMINDER

Make sure to save the passwords you set for the 3 manager accounts:

- **rohitidyllproductions@gmail.com:** _______________
- **harshpawar7711@gmail.com:** _______________
- **idyllproductionsofficial@gmail.com:** _______________

---

## ❓ TROUBLESHOOTING

**If managers can't log in:**
- Make sure you checked "Auto Confirm User" when creating them
- Verify the SQL script ran successfully
- Check that all 3 managers show status = 'APPROVED' in the database

**If editors can't sign up:**
- Check browser console for errors
- Verify Supabase connection in .env.local
- Make sure the users table exists

**Need help?**
- Check the browser console (F12) for error messages
- Check Supabase logs in the Dashboard
- Verify all tables exist in Database > Tables

---

## 🚀 READY TO GO!

**Your database is 100% ready.** Just follow the steps above to add the 3 manager accounts, and you can start testing immediately!
