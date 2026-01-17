# Login Credentials - Quick Reference

## After Running QUICK_FIX_LOGIN.sql

### Manager Account
```
Email:    idyllproductionsofficial@gmail.com
Password: pass-101010
Role:     MANAGER
Access:   Tasks view (full control)
```

### Editor Account
```
Email:    editor@idyll.com
Password: password123
Role:     EDITOR
Access:   Home view (read-only)
```

---

## How to Fix Login

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy content from:** `QUICK_FIX_LOGIN.sql`
3. **Paste and Run** in SQL Editor
4. **Wait for success message**
5. **Go to app:** http://localhost:3000
6. **Login with manager credentials above**

---

## Expected Flow

### Manager Login:
```
Login → Enter credentials → Sign In → Tasks View (Manager Dashboard)
```

### Editor Login:
```
Login → Enter credentials → Sign In → Home View (Editor Dashboard)
```

### New User Signup:
```
Signup → Create account → Login → Pending page → 
Manager approves → Login again → Home View
```

---

## Quick Test

After running the SQL script:

1. ✅ Login as manager
2. ✅ Create a task
3. ✅ Assign to "Test Editor"
4. ✅ Logout
5. ✅ Login as editor
6. ✅ See the assigned task

---

**Dev Server:** Running on http://localhost:3000  
**Status:** Ready to test after SQL script  
**Time:** 2 minutes to fix
