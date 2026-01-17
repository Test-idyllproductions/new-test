# Quick Start - After Root Cause Fix

## 1. Seed Test Users (REQUIRED)

Copy and run `seed-test-users.sql` in Supabase SQL Editor.

This creates:
- `manager@idyll.com` / `password123`
- `editor@idyll.com` / `password123`
- `editor2@idyll.com` / `password123`

## 2. Start App

```bash
npm run dev
```

## 3. Test TempIcons

- **📊 Editor Home** → Switches to editor, shows HomeView
- **👔 Manager Tasks** → Switches to manager, shows SupabaseTasksView

## 4. Test Login

- Login as `manager@idyll.com` → Goes to tasks view
- Login as `editor@idyll.com` → Goes to home view

## 5. Test Data

As Manager:
1. Create task
2. Assign to editor
3. Verify it saves

As Editor:
1. See assigned task
2. Update status
3. Verify it persists

---

## The Foundation

```
Editor Dashboard = HomeView (route: 'home')
Manager Dashboard = SupabaseTasksView (route: 'tasks')
```

That's it. Clean. Simple. Works.

---

## If Something Breaks

1. Check browser console
2. Check Supabase logs
3. Verify users exist: `SELECT * FROM public.users;`
4. Verify .env.local is correct

---

**Status:** ✅ READY TO TEST
