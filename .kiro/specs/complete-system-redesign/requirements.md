# Requirements Document

## Introduction

This specification defines the complete redesign of the Idyll Productions Workspace to establish clear user flows, strict role-based access control, and professional UI/UX patterns. The system must enforce a gatekeeper approval process and maintain strict separation between Editor and Manager capabilities.

## Glossary

- **System**: The Idyll Productions Workspace web application
- **Editor**: A user role with read-only access to assigned work items
- **Manager**: A user role with full administrative control
- **Approval_Page**: A gatekeeper page that prevents unapproved users from accessing dashboards
- **Custom_Dialog**: An in-app styled notification system replacing browser alerts
- **TempIcons**: Navigation icons for testing/development that must actually switch pages
- **Supabase**: The backend database and authentication service

## Requirements

### Requirement 1: Welcome Page (Public Entry Point)

**User Story:** As a visitor, I want to see a clean welcome page with clear navigation options, so that I can understand what actions are available.

#### Acceptance Criteria

1. THE System SHALL display a welcome page as the first page of the website
2. WHEN the welcome page loads, THE System SHALL display main CTAs in the center area: "Login to Workspace", "Create New Workspace" (placeholder), and "Apply to be an Editor"
3. WHEN the welcome page loads, THE System SHALL display text-only buttons in the top-right: "Portfolio" and "About Us"
4. THE System SHALL NOT display cards or icons in the top-right navigation
5. THE System SHALL use clean, minimal styling for all welcome page elements

### Requirement 2: Login Page

**User Story:** As a user, I want to login with my credentials and be redirected to the appropriate dashboard based on my role, so that I can access my workspace.

#### Acceptance Criteria

1. WHEN a user navigates to the login page, THE System SHALL display email and password input fields
2. WHEN the login page loads, THE System SHALL display text "Don't have an account? Create one" (not "Sign up")
3. WHEN the login page loads, THE System SHALL provide a show/hide password toggle
4. WHEN a user successfully logs in with role=EDITOR and status=APPROVED, THE System SHALL redirect to Editor Dashboard
5. WHEN a user successfully logs in with role=MANAGER and status=APPROVED, THE System SHALL redirect to Manager Dashboard
6. WHEN a user successfully logs in with status=PENDING, THE System SHALL redirect to Approval Page
7. WHEN login fails, THE System SHALL display a custom themed dialog (not browser alert)
8. THE System SHALL NOT use window.alert() for any login messages

### Requirement 3: Create New Account Page (Signup)

**User Story:** As a new user, I want to create an account that defaults to Editor role and requires approval, so that I can apply to join the workspace.

#### Acceptance Criteria

1. WHEN a user navigates to the signup page, THE System SHALL display page title "Create New Account"
2. WHEN the signup page loads, THE System SHALL provide input fields for: email, username, and password
3. THE System SHALL NOT provide role selection during signup
4. WHEN a user creates an account, THE System SHALL set role to EDITOR by default
5. WHEN a user creates an account, THE System SHALL set status to PENDING by default
6. WHEN the signup page loads, THE System SHALL display text "Already have an account? Login" (not "Sign in")
7. WHEN account creation succeeds, THE System SHALL redirect user to Login page
8. WHEN a user with existing email tries to sign up, THE System SHALL display custom themed dialog: "You already have an account. Go to Login."
9. THE System SHALL NOT use window.alert() for any signup messages
10. WHEN a newly created user logs in, THE System SHALL redirect to Approval Page (not dashboard)

### Requirement 4: Custom Dialog System

**User Story:** As a user, I want to see styled, non-blocking notifications that match the app theme, so that I have a consistent and professional experience.

#### Acceptance Criteria

1. THE System SHALL NOT use JavaScript alert() dialogs anywhere in the application
2. WHEN the system needs to show a message, THE System SHALL display a custom in-app dialog matching the dark theme
3. THE System SHALL support custom dialogs for: success messages, error messages, and warnings
4. WHEN a custom dialog is displayed, THE System SHALL make it non-blocking
5. WHEN a custom dialog is displayed, THE System SHALL style it consistently across the entire site
6. THE System SHALL display custom dialogs for messages including: "Account created successfully", "Login successful", "Account pending approval", "Invalid credentials"

### Requirement 5: Approval Page (Gatekeeper)

**User Story:** As a new editor, I want to see a clear approval status page while waiting for manager approval, so that I understand why I cannot access the dashboard yet.

#### Acceptance Criteria

1. WHEN a user with status=PENDING logs in, THE System SHALL redirect to Approval Page
2. WHEN the Approval Page loads, THE System SHALL display: user email, username, and status "Pending Approval"
3. WHEN a user with status=PENDING attempts to access dashboard URLs directly, THE System SHALL redirect back to Approval Page
4. WHEN a user with status=PENDING attempts URL hacking, THE System SHALL redirect back to Approval Page
5. WHEN a manager approves a user (status changes to APPROVED), THE System SHALL allow that user to access Editor Dashboard on next login
6. THE System SHALL NOT allow unapproved users to access any dashboard
7. WHEN an approved user logs in, THE System SHALL NOT show Approval Page

### Requirement 6: Dashboard Routing

**User Story:** As a system architect, I want strict role-based dashboard routing with only two dashboards total, so that the system is maintainable and secure.

#### Acceptance Criteria

1. THE System SHALL have exactly TWO dashboards: Editor Dashboard and Manager Dashboard
2. THE System SHALL NOT create duplicate dashboard routes or components
3. WHEN a user with role=EDITOR and status=APPROVED logs in, THE System SHALL route to Editor Dashboard
4. WHEN a user with role=MANAGER and status=APPROVED logs in, THE System SHALL route to Manager Dashboard
5. WHEN TempIcons navigation is used, THE System SHALL actually switch rendered pages (not just highlight)
6. THE System SHALL enforce routing logic at the component render level

### Requirement 7: Editor Dashboard Structure

**User Story:** As an editor, I want a dashboard that shows my assigned work and allows me to update my progress, so that I can manage my tasks efficiently.

#### Acceptance Criteria

1. WHEN Editor Dashboard loads, THE System SHALL display sidebar with sections: Home, Tasks, Meetings, Payouts (top), Settings, Logout (bottom)
2. THE System SHALL NOT display Activity Log, User Management, or Approvals in Editor sidebar
3. WHEN Editor Home view loads, THE System SHALL display welcome message with time-based greeting (Good Morning/Afternoon)
4. WHEN Editor Home view loads, THE System SHALL display read-only summary widgets: Total Tasks, Editing Tasks, Completed Tasks, Upcoming Meetings, Pending Payouts
5. THE System SHALL allow editors to update task status
6. THE System SHALL allow editors to add/edit raw file links
7. THE System SHALL allow editors to add/edit edited file links
8. THE System SHALL allow editors to view meetings assigned to them
9. THE System SHALL allow editors to view payouts assigned to them
10. THE System SHALL NOT allow editors to create tasks
11. THE System SHALL NOT allow editors to create tables
12. THE System SHALL NOT allow editors to approve users
13. THE System SHALL NOT allow editors to delete tasks

### Requirement 8: Manager Dashboard Structure

**User Story:** As a manager, I want full administrative control over tasks, meetings, payouts, and user management, so that I can run the workspace effectively.

#### Acceptance Criteria

1. WHEN Manager Dashboard loads, THE System SHALL display sidebar with sections: Task Management, Meetings Management, Payout Management, User Approvals, User Submissions (top), Activity Log, Settings, Logout (bottom)
2. THE System SHALL allow managers to create tasks
3. THE System SHALL allow managers to edit tasks
4. THE System SHALL allow managers to delete tasks
5. THE System SHALL allow managers to assign tasks to specific users
6. THE System SHALL allow managers to create Notion-style tables
7. THE System SHALL allow managers to filter tasks by user
8. THE System SHALL allow managers to create meetings
9. THE System SHALL allow managers to manage meetings
10. THE System SHALL allow managers to create payouts
11. THE System SHALL allow managers to manage payouts
12. THE System SHALL allow managers to approve users
13. THE System SHALL allow managers to change user roles
14. THE System SHALL allow managers to clear Activity Log

### Requirement 9: Data Persistence and Filtering

**User Story:** As a user, I want all data to persist in the database and be filtered based on my role, so that I see only relevant information and data survives page refreshes.

#### Acceptance Criteria

1. WHEN tasks are created, THE System SHALL save them to Supabase
2. WHEN meetings are created, THE System SHALL save them to Supabase
3. WHEN payouts are created, THE System SHALL save them to Supabase
4. WHEN a page is refreshed, THE System SHALL persist all data from Supabase
5. WHEN an editor views tasks, THE System SHALL show only tasks assigned to that editor
6. WHEN an editor views meetings, THE System SHALL show only meetings assigned to that editor
7. WHEN an editor views payouts, THE System SHALL show only payouts assigned to that editor
8. WHEN a manager views tasks, THE System SHALL show all tasks
9. WHEN a manager views meetings, THE System SHALL show all meetings
10. WHEN a manager views payouts, THE System SHALL show all payouts

### Requirement 10: Notifications System

**User Story:** As a user, I want to receive notifications that are stored in the database and can deep-link to relevant sections, so that I stay informed about important updates.

#### Acceptance Criteria

1. WHEN notifications are created, THE System SHALL store them in the database
2. WHEN a user clicks a notification, THE System SHALL deep-link to the correct section (task, meeting, or payout)
3. WHEN more than 4 notifications exist, THE System SHALL make the notification panel scrollable
4. THE System SHALL persist notifications across page refreshes

### Requirement 11: System Integrity Rules

**User Story:** As a system architect, I want strict enforcement of permissions and routing rules, so that the system maintains security and consistency.

#### Acceptance Criteria

1. THE System SHALL NOT use browser alert() dialogs anywhere
2. THE System SHALL NOT allow role leakage (editors seeing manager features)
3. THE System SHALL NOT create shared dashboards
4. THE System SHALL NOT use fake navigation (highlighting without routing)
5. WHEN TempIcons are clicked, THE System SHALL actually navigate to different pages
6. THE System SHALL NOT allow approval logic to be bypassed via URL manipulation
7. WHEN UI elements are displayed, THE System SHALL reflect user permissions strictly
8. THE System SHALL enforce all permission checks at both frontend and database level (RLS)
