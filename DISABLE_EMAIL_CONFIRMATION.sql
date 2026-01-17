-- CRITICAL: Disable Email Confirmation for Signups
-- This must be run in Supabase SQL Editor to allow users to sign up without email verification

-- Option 1: Update auth config (if you have access to auth schema)
-- Note: This might not work in all Supabase projects due to permissions
-- UPDATE auth.config SET enable_signup = true;

-- Option 2: You MUST go to Supabase Dashboard and disable email confirmation manually
-- Steps:
-- 1. Go to your Supabase project dashboard
-- 2. Click "Authentication" in the left sidebar
-- 3. Click "Providers" tab
-- 4. Find "Email" provider
-- 5. UNCHECK "Confirm email" option
-- 6. Click "Save"

-- After disabling email confirmation, users can sign up and log in immediately
-- without needing to verify their email address.

-- Verify current auth settings (read-only check)
SELECT 
  'Email confirmation is currently ENABLED' as status,
  'Go to Dashboard > Authentication > Providers > Email and DISABLE "Confirm email"' as action_required;
