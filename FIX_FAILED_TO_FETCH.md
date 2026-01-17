# Fix "Failed to Fetch" Error

## What This Error Means

"Failed to fetch" means your app cannot connect to Supabase.

**Common causes:**
1. ✅ Supabase project is **paused** (most common)
2. Network/firewall blocking connection
3. Wrong API keys
4. CORS issue

---

## SOLUTION 1: Check if Supabase Project is Paused (MOST LIKELY)

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Click on your project: `zvwegbjzkrsjgfyjkyet`

### Step 2: Check Project Status
Look at the top of the page. You'll see one of these:

**If you see "Project is paused":**
- Click **"Restore project"** or **"Resume project"**
- Wait 1-2 minutes for it to wake up
- Then try logging in again

**If you see "Active" or green status:**
- Project is running, go to SOLUTION 2

---

## SOLUTION 2: Test Connection

### Step 1: Open Test File
1. Open file: `TEST_SUPABASE_CONNECTION.html` (in your project)
2. Double-click to open in browser
3. Or drag it into your browser

### Step 2: Run Tests
1. Click "Run Ping Test"
2. Click "Run Connection Test"
3. Click "Check Tables"

**What you'll see:**

**✅ All green checkmarks:**
- Supabase is working
- Problem is in the app code
- Go to SOLUTION 3

**❌ Red X on Ping Test:**
- Supabase is not reachable
- Project might be paused
- Check Supabase Dashboard

**❌ Red X on Check Tables:**
- Tables don't exist
- Need to run schema creation script
- Go to SOLUTION 4

---

## SOLUTION 3: Restart Dev Server

Sometimes the dev server needs a restart to pick up changes:

### Step 1: Stop Server
1. Go to your terminal (where dev server is running)
2. Press **Ctrl + C**
3. Wait for it to stop

### Step 2: Start Server
```bash
npm run dev
```

### Step 3: Test
1. Wait for "Local: http://localhost:3000"
2. Go to http://localhost:3000
3. Try logging in

---

## SOLUTION 4: Create Database Tables

If tables don't exist, you need to create them:

### Step 1: Go to Supabase SQL Editor
1. Supabase Dashboard → SQL Editor
2. Click "New Query"

### Step 2: Run Schema Script
1. Open file: `supabase-schema.sql` (in your project)
2. Copy ALL content
3. Paste in SQL Editor
4. Click "Run"

### Step 3: Create Manager
1. Click "New Query" again
2. Open file: `CREATE_MANAGER_NOW.sql`
3. Copy ALL content
4. Paste and Run

### Step 4: Test Login
1. Go to http://localhost:3000
2. Login with: `idyllproductionsofficial@gmail.com` / `pass-101010`

---

## SOLUTION 5: Check Environment Variables

### Step 1: Verify .env.local
Open `.env.local` file and check:

```
VITE_SUPABASE_URL=https://zvwegbjzkrsjgfyjkyet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Both lines should be there and not empty.

### Step 2: Get Fresh Keys (if needed)
1. Go to Supabase Dashboard
2. Click "Settings" → "API"
3. Copy:
   - **Project URL** → Put in VITE_SUPABASE_URL
   - **anon public** key → Put in VITE_SUPABASE_ANON_KEY
4. Save `.env.local`
5. Restart dev server

---

## Quick Checklist

Run through these in order:

- [ ] **Check Supabase Dashboard** - Is project paused?
- [ ] **Resume project** if paused (wait 1-2 minutes)
- [ ] **Open TEST_SUPABASE_CONNECTION.html** in browser
- [ ] **Run all tests** - Are they green?
- [ ] **Check .env.local** - Are keys correct?
- [ ] **Restart dev server** (Ctrl+C, then npm run dev)
- [ ] **Try login** at http://localhost:3000

---

## Most Common Fix (90% of cases)

**Your Supabase project is paused.**

1. Go to: https://supabase.com/dashboard
2. Click your project
3. If you see "Project is paused" → Click "Restore"
4. Wait 1-2 minutes
5. Try login again

**Free tier projects pause after inactivity!**

---

## What to Do Right Now

1. ✅ Go to Supabase Dashboard
2. ✅ Check if project is paused
3. ✅ If paused, click "Restore project"
4. ✅ Wait 1-2 minutes
5. ✅ Try login at http://localhost:3000

**Tell me: Is your Supabase project paused?**
