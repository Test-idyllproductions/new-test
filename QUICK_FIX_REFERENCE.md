# Quick Fix Reference Card

## 🎯 The Problem
Login works but doesn't redirect. "Users loaded: 0" in TempIcons.

## 🔧 The Solution
Run 3 SQL commands in Supabase to fix RLS policies.

---

## SQL Command 1: Fix RLS Policy
```sql
DROP POLICY IF EXISTS "Users can view all approved users" ON public.users;
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON public.users;

CREATE POLICY "Allow authenticated users to read users" ON public.users
  FOR SELECT USING (auth.uid() IS NOT NULL);
```

## SQL Command 2: Verify Manager Exists
```sql
SELECT id, email, username, role, status 
FROM public.users 
WHERE email = 'idyllproductionsofficial@gmail.com';
```

**If empty, run this:**
```sql
INSERT INTO public.users (id, email, username, role, status, theme, sound_enabled)
SELECT id, 'idyllproductionsofficial@gmail.com', 'Idyll Manager', 'MANAGER', 'APPROVED', 'dark', TRUE
FROM auth.users WHERE email = 'idyllproductionsofficial@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'MANAGER', status = 'APPROVED', updated_at = NOW();
```

## SQL Command 3: Update Trigger
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_status TEXT;
BEGIN
  IF NEW.email = 'idyllproductionsofficial@gmail.com' THEN
    user_role := 'MANAGER';
    user_status := 'APPROVED';
  ELSE
    user_role := 'EDITOR';
    user_status := 'PENDING';
  END IF;

  INSERT INTO public.users (id, email, username, role, status, theme, sound_enabled)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), user_role, user_status, 'dark', TRUE)
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status, updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## ✅ Test Login
1. Clear browser cache (Ctrl+Shift+Delete)
2. Open http://localhost:3000
3. Open console (F12)
4. Click "Login to Workspace"
5. Enter: `idyllproductionsofficial@gmail.com` / `pass-101010`
6. Click "Sign In"

## ✅ Success Indicators
- Console: `✅ User fetched successfully`
- Console: `🔵 Redirecting to tasks`
- Page redirects to Manager Dashboard
- TempIcons: `Users loaded: 1 | Managers: 1`

---

## 🆘 Emergency Fix
If nothing works, run this:
```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```
Then test login. If it works, RLS was blocking. Re-enable with proper policy.

---

**For detailed explanations, see: `FIX_LOGIN_NOW.md`**
