# Requirements: Approval Flow Improvements

## Overview
Improve the user approval flow to provide real-time feedback and clear messaging when editors are approved or rejected by managers.

## Glossary
- **Editor**: A user with role=EDITOR who needs manager approval
- **Manager**: A user with role=MANAGER who can approve/reject editors
- **Pending User**: An editor with status=PENDING awaiting approval
- **Approval Page**: The page shown to pending users while waiting for approval

---

## Requirement 1: Login with Email or Username

**User Story:** As a user, I want to log in using either my email or username, so that I have flexibility in how I access my account.

### Acceptance Criteria

1. WHEN a user enters their email in the login field, THE System SHALL authenticate using email
2. WHEN a user enters their username in the login field, THE System SHALL authenticate using username
3. WHEN authentication fails, THE System SHALL display "Invalid credentials" message
4. THE System SHALL accept both email and username in the same input field

---

## Requirement 2: Real-Time Approval Detection

**User Story:** As a pending editor, I want to be notified immediately when I'm approved, so that I don't have to keep refreshing manually.

### Acceptance Criteria

1. WHEN an editor is on the Approval Page, THE System SHALL check approval status every 3 seconds
2. WHEN a manager approves the editor, THE System SHALL detect the status change within 3 seconds
3. WHEN approval is detected, THE System SHALL display an approval message immediately
4. THE System SHALL use Supabase real-time subscriptions for instant updates

---

## Requirement 3: Approval Success Message

**User Story:** As an approved editor, I want to see a clear success message, so that I know I've been approved and what to do next.

### Acceptance Criteria

1. WHEN an editor is approved, THE System SHALL display message: "You are approved. Thanks for joining Idyll Productions."
2. THE System SHALL show a "Refresh Page" button
3. WHEN the editor clicks "Refresh Page", THE System SHALL reload and redirect to Editor Dashboard
4. THE System SHALL use a success-themed dialog (green/positive colors)

---

## Requirement 4: Rejection Message

**User Story:** As a rejected editor, I want to see a clear rejection message, so that I know my application was declined.

### Acceptance Criteria

1. WHEN an editor is rejected, THE System SHALL display message: "You are not approved yet. Please go back to the Welcome page."
2. THE System SHALL show a "Go to Welcome" button
3. WHEN the editor clicks "Go to Welcome", THE System SHALL redirect to landing page
4. THE System SHALL use a warning-themed dialog (red/amber colors)
5. THE System SHALL prevent access to any dashboard pages

---

## Requirement 5: Approval Request Visibility

**User Story:** As a manager, I want to see pending approval requests immediately, so that I can approve users quickly.

### Acceptance Criteria

1. WHEN a new user signs up, THE System SHALL add them to the pending approvals list immediately
2. WHEN a manager opens User Approvals page, THE System SHALL display all pending users
3. WHEN a manager approves/rejects a user, THE System SHALL update the list immediately
4. THE System SHALL show a count badge of pending requests

---

## Requirement 6: No Bypass Protection

**User Story:** As a system administrator, I want to ensure pending users cannot bypass approval, so that security is maintained.

### Acceptance Criteria

1. WHEN a pending user tries to access any dashboard route, THE System SHALL redirect to Approval Page
2. WHEN a pending user tries URL hacking, THE System SHALL block access
3. WHEN a pending user is on Approval Page, THE System SHALL prevent navigation to other pages
4. THE System SHALL enforce approval checks on every route change
