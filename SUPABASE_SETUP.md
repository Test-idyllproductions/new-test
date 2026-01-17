# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project name: "idyll-productions-workspace"
5. Enter a strong database password
6. Choose a region close to you
7. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-ref.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 3. Update Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-anon-key
```

## 4. Run Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Copy the entire contents of `supabase-schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

This will create:
- All necessary tables (users, task_tables, task_records, etc.)
- Row Level Security (RLS) policies
- Real-time subscriptions
- Triggers for automatic timestamps
- User profile creation on signup

## 5. Enable Realtime (Optional but Recommended)

1. In Supabase dashboard, go to Database > Replication
2. Make sure all tables are enabled for realtime:
   - users
   - task_tables
   - task_records
   - payout_tables
   - payout_records
   - meetings
   - audit_logs
   - notifications

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to the signup page
3. Create a new account (it will be in PENDING status)
4. In Supabase dashboard, go to Authentication > Users
5. You should see your new user
6. Go to Database > Table Editor > users
7. Change the user's status from 'PENDING' to 'APPROVED' and role to 'MANAGER'
8. Refresh your app and login

## 7. Create Test Users

For testing, you can create multiple users:

1. **Manager Account:**
   - Email: manager@idyll.com
   - Password: password123
   - Role: MANAGER
   - Status: APPROVED

2. **Editor Account:**
   - Email: editor@idyll.com
   - Password: password123
   - Role: EDITOR
   - Status: APPROVED

Create these through the signup form, then manually approve them in the Supabase dashboard.

## 8. Real-time Testing

Once setup is complete, you can:

1. Open two browser tabs
2. Login as Manager in one tab
3. Login as Editor in another tab
4. Create tasks, meetings, or payouts in the Manager tab
5. Watch them appear in real-time in the Editor tab
6. Update task status in Editor tab
7. See changes reflected immediately in Manager tab

## Troubleshooting

### Environment Variables Not Loading
- Make sure `.env.local` is in the project root
- Restart your development server after changing env vars
- Check that variable names start with `VITE_`

### Database Connection Issues
- Verify your Supabase URL and key are correct
- Check that your project is not paused (free tier pauses after inactivity)
- Ensure you're using the anon key, not the service role key

### RLS Policy Issues
- If you can't see data, check the RLS policies in the schema
- Make sure users have the correct roles and status
- Check browser console for authentication errors

### Real-time Not Working
- Verify realtime is enabled for all tables
- Check that you're subscribed to the correct channels
- Look for WebSocket connection errors in browser dev tools

## Security Notes

- The anon key is safe to use in client-side code
- RLS policies ensure users can only access their own data
- Managers have elevated permissions through policy checks
- All sensitive operations require authentication

## Next Steps

After setup, you can:
- Customize the database schema for your needs
- Add more user roles or permissions
- Implement additional real-time features
- Deploy to production with proper environment variables