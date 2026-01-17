# Test Supabase Connection

## The Issue

The app is stuck on "Loading..." which means:
1. The Supabase connection might be failing
2. The auth session check is hanging
3. The environment variables might be wrong

---

## Quick Test

### Step 1: Check Browser Console (30 seconds)

1. Open your browser to: http://localhost:3000
2. Press **F12** to open Developer Tools
3. Click **"Console"** tab
4. Look for errors (red text)

**Common errors:**
- "Missing Supabase environment variables" → .env.local is wrong
- "Failed to fetch" → Supabase URL is wrong
- "Invalid API key" → Supabase anon key is wrong
- "relation does not exist" → Tables not created

**What to look for:**
- If you see "Error fetching user" → User exists in auth but not in public.users
- If you see "Error getting session" → Supabase connection issue
- If you see nothing → App is working, just slow

---

### Step 2: Verify Environment Variables (1 minute)

Check your `.env.local` file has:

```
VITE_SUPABASE_URL=https://zvwegbjzkrsjgfyjkyet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2d2VnYmp6a3JzamdmeWpreWV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMzY2OTksImV4cCI6MjA4MzkxMjY5OX0._SoBTr4sUoU2ju3e-gDUx14DvcGXF0ZU6SUJ67i0T-8
```

If these are correct, the connection should work.

---

### Step 3: Test Supabase Connection Directly (1 minute)

Run this in Supabase SQL Editor:

```sql
-- Test if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'users';
```

**Expected:** Should return "users"

**If empty:** Tables don't exist, run the schema creation script again

---

### Step 4: Force Refresh (30 seconds)

Sometimes the browser caches old code:

1. Go to http://localhost:3000
2. Press **Ctrl + Shift + R** (hard refresh)
3. Or press **Ctrl + F5**
4. Or clear browser cache

---

### Step 5: Check if Manager Exists (1 minute)

Run this in Supabase SQL Editor:

```sql
-- Check if manager exists
SELECT 
  a.email as auth_email,
  p.email as public_email,
  p.role,
  p.status
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.id
WHERE a.email = 'idyllproductionsofficial@gmail.com';
```

**Expected:**
```
auth_email                          | public_email                        | role    | status
------------------------------------|-------------------------------------|---------|----------
idyllproductionsofficial@gmail.com  | idyllproductionsofficial@gmail.com  | MANAGER | APPROVED
```

**If public_email is NULL:**
Manager exists in auth but not in public.users. Run the configuration script again.

---

## Quick Fix: Restart Dev Server

Sometimes the dev server needs a restart:

1. In your terminal, press **Ctrl + C** to stop the server
2. Run: `npm run dev`
3. Wait for "Local: http://localhost:3000"
4. Go to http://localhost:3000
5. Should see landing page now

---

## What I Just Fixed in Code

I updated `lib/supabase-store.tsx` to:
1. Better handle the case when there's no session (show landing page immediately)
2. Add error handling for session fetch
3. Add better logging for debugging

The changes should auto-reload in your browser (hot module replacement).

---

## Expected Behavior

**When NOT logged in:**
- Should see landing page immediately (no loading spinner)
- Can click "Login" or "Signup"

**When logged in:**
- Brief loading spinner (1-2 seconds)
- Then redirects to appropriate dashboard

**If stuck on loading:**
- Check browser console for errors
- Check .env.local file
- Verify tables exist in Supabase
- Try hard refresh (Ctrl + Shift + R)

---

## Next Steps

1. Check browser console (F12)
2. Look for error messages
3. Tell me what errors you see
4. I'll help fix them

Or if you see the landing page now, try logging in!
