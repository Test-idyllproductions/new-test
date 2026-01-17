# Requirements: Complete System - Final Specification

## Overview
Complete production-ready workspace management system for Idyll Productions with separate Manager and Editor dashboards, user-based task/meeting/payout management, and comprehensive approval workflow.

## Glossary
- **Manager**: User with role=MANAGER, full system access, can manage all users and data
- **Editor**: User with role=EDITOR, limited access, can only see/edit assigned data
- **User Selection**: Mandatory control in Manager Dashboard to filter data by specific user
- **Approval Page**: Gate page for new editors awaiting manager approval
- **Task Management**: System for creating, assigning, and tracking tasks per user
- **Meeting Management**: System for scheduling meetings per user
- **Payout Management**: System for managing payouts per user

---

## Requirement 1: Manager Login and Dashboard Access

**User Story:** As a manager, I want to log in and access the Manager Dashboard directly, so that I can manage the system immediately.

### Acceptance Criteria

1. WHEN a manager logs in from Welcome page, THE System SHALL redirect to Manager Dashboard (not Approval page)
2. THE System SHALL accept both email and username for login
3. WHEN login succeeds, THE System SHALL verify role=MANAGER and route accordingly
4. THE Manager Dashboard SHALL display immediately after successful authentication

---

## Requirement 2: Manager Home Section with System Overview

**User Story:** As a manager, I want to see a complete system overview in the Home section, so that I can monitor overall activity and drill down to specific users.

### Acceptance Criteria

1. THE Manager Home SHALL display in sidebar as first option
2. WHEN no user is selected, THE System SHALL show global summary:
   - Total users count
   - Total tasks (overall, pending, editing, completed)
   - Total meetings scheduled
   - Total payouts (pending, completed)
3. WHEN a manager selects a specific user, THE System SHALL update summary to show only that user's data:
   - Tasks assigned to user (not started, editing, can't do, done)
   - Meetings assigned to user
   - Payout status for user
4. THE System SHALL provide user selection dropdown in Home section
5. THE System SHALL persist selected user across navigation

---

## Requirement 3: Task Management with Mandatory User Selection

**User Story:** As a manager, I want to select a user first before creating tasks, so that all tasks are properly assigned to the correct user.

### Acceptance Criteria

1. WHEN Task Management loads, THE System SHALL display user selection control prominently
2. WHEN no user is selected, THE System SHALL disable "Create New Task" button
3. WHEN a user is selected, THE System SHALL:
   - Enable task creation
   - Show only that user's tasks
   - Assign all new tasks to selected user
4. THE System SHALL allow creating unlimited tables per user
5. THE System SHALL allow switching between tables
6. WHEN a task is created, THE System SHALL save it to database with assigned_to = selected user
7. THE System SHALL show tasks only in selected user's Editor Dashboard

---

## Requirement 4: Task Fields and Editing

**User Story:** As a manager, I want to fully edit all task fields, so that I can manage task details completely.

### Acceptance Criteria

1. THE System SHALL provide editable fields:
   - Task Number
   - Task Name
   - Deadline
   - Status (dropdown: Not Started, Can't Do, Editing, Done)
   - Raw File Link
   - Edited File Link
   - Idyll Approval (toggle: Not Approved, Approved)
2. WHEN displaying links, THE System SHALL show short preview (not full URL)
3. WHEN user clicks link preview, THE System SHALL open full URL in new tab
4. THE System SHALL provide explicit Save button for each task
5. WHEN Save is clicked, THE System SHALL persist changes to database
6. THE System SHALL allow managers to delete tasks
7. WHEN task is updated, THE System SHALL reflect changes immediately in Editor Dashboard

---

## Requirement 5: Meeting Management with User Assignment

**User Story:** As a manager, I want to create meetings for specific users, so that only assigned users see their meetings.

### Acceptance Criteria

1. THE Meeting Management SHALL display user selection control near "New Meeting" button
2. WHEN no user is selected, THE System SHALL disable meeting creation
3. WHEN creating meeting, THE System SHALL require:
   - Meeting Name
   - Date
   - Time
   - Video Link
   - Assigned User (from selection)
4. WHEN meeting is created, THE System SHALL save to database with assigned user
5. THE System SHALL show meeting only in assigned user's Editor Dashboard
6. THE System SHALL allow managers to edit meetings
7. THE System SHALL allow managers to delete meetings
8. WHEN meeting is updated, THE System SHALL persist to database immediately

---

## Requirement 6: Payout Management with User-Based Access

**User Story:** As a manager, I want to manage payouts per user, so that each user only sees their own payouts.

### Acceptance Criteria

1. THE Payout Management SHALL require user selection
2. WHEN user is selected, THE System SHALL show only that user's payouts
3. THE System SHALL allow managers to create payouts with:
   - Project Name
   - Project Link
   - Amount
   - Status (Pending, Done)
4. WHEN payout is created, THE System SHALL assign to selected user
5. THE System SHALL persist payout to database
6. THE System SHALL show payout only to assigned user and managers
7. THE System SHALL allow managers to edit payout status
8. THE System SHALL allow managers to delete payouts

---

## Requirement 7: User Approvals with Real-Time Feedback

**User Story:** As a manager, I want to approve or reject pending users quickly, so that new users can access the system immediately.

### Acceptance Criteria

1. WHEN new user signs up and logs in, THE System SHALL add them to User Approvals list
2. THE User Approvals SHALL display all users with status=PENDING
3. WHEN manager clicks Approve, THE System SHALL:
   - Update user status to APPROVED
   - Show message to user: "You are approved. Thanks for joining Idyll Productions."
   - Instruct user to refresh page
4. WHEN user refreshes after approval, THE System SHALL redirect to Editor Dashboard
5. WHEN manager clicks Reject, THE System SHALL:
   - Update user status to REJECTED
   - Redirect user to Welcome page
   - Show message: "You are rejected from our management. Please contact management for further information."
6. THE System SHALL update approval status within 3 seconds

---

## Requirement 8: User Submissions Log

**User Story:** As a manager, I want to see all editor applications, so that I can review and contact applicants.

### Acceptance Criteria

1. THE User Submissions SHALL display all users who applied from Welcome page
2. THE System SHALL show:
   - Email
   - Name
   - Submission date
   - Any other submitted details
3. THE System SHALL update list almost instantly when new application arrives
4. THE System SHALL persist submissions to database

---

## Requirement 9: User Management with Role Changes

**User Story:** As a manager, I want to manage user roles and accounts, so that I can promote users or remove access.

### Acceptance Criteria

1. THE User Management SHALL display all approved users
2. THE System SHALL show for each user:
   - Email
   - Username
   - Role
   - Status
3. THE System SHALL allow managers to change user roles
4. WHEN role is changed (e.g., EDITOR → MANAGER), THE System SHALL:
   - Update database
   - Apply new permissions on next login
   - Show appropriate dashboard based on new role
5. THE System SHALL allow managers to delete users
6. WHEN user is deleted, THE System SHALL remove:
   - User profile
   - All tasks assigned to user
   - All meetings assigned to user
   - All payouts for user
   - All related data

---

## Requirement 10: Activity Log Audit Trail

**User Story:** As a manager, I want to see all system actions, so that I can audit activity and track changes.

### Acceptance Criteria

1. THE Activity Log SHALL record:
   - User login
   - User logout
   - Task creation
   - Task updates
   - Task deletion
   - Status changes
   - Approvals
   - Rejections
   - Meetings created
   - Payouts requested
   - Payouts updated
2. THE System SHALL persist all log entries to database
3. THE System SHALL display logs in reverse chronological order
4. THE System SHALL show timestamp, user, and action for each entry

---

## Requirement 11: Settings for All Users

**User Story:** As a user (manager or editor), I want to manage my account settings, so that I can update my profile and preferences.

### Acceptance Criteria

1. THE Settings SHALL allow updating:
   - Username
   - Email address
   - Password (new password only, no current password required)
2. WHEN settings are changed, THE System SHALL save to database
3. THE Settings SHALL provide Appearance/Theme option:
   - Dark mode
   - Light mode
4. WHEN theme is changed, THE System SHALL update entire website immediately
5. THE Settings SHALL provide Account Management:
   - Delete Account button
   - Confirmation dialog before deletion
6. WHEN account is deleted, THE System SHALL remove all user data
7. THE Settings SHALL show Account Information:
   - Role
   - Status
   - Member since date
8. THE Settings SHALL provide Logout button
9. WHEN Logout is clicked, THE System SHALL redirect to Welcome page

---

## Requirement 12: Editor Account Creation and Approval

**User Story:** As a new editor, I want to create an account and get approved, so that I can access the Editor Dashboard.

### Acceptance Criteria

1. WHEN user clicks "Create New Account" from Welcome page, THE System SHALL show signup form
2. WHEN user submits signup, THE System SHALL:
   - Save to database with role=EDITOR, status=PENDING
   - Redirect to Login page
3. WHEN user logs in first time, THE System SHALL redirect to Approval page
4. THE Approval page SHALL block access until manager approves
5. WHEN manager approves, THE System SHALL allow login without repeating approval
6. WHEN user logs in after approval, THE System SHALL redirect to Editor Dashboard

---

## Requirement 13: Editor Home Section

**User Story:** As an editor, I want to see my personal dashboard overview, so that I can track my work.

### Acceptance Criteria

1. THE Editor Home SHALL display:
   - Welcome message: "Welcome to Idyll Productions"
   - Time-based greeting: "Good Morning" or "Good Evening"
   - Username
   - Daily motivational quote
2. THE Editor Home SHALL show personal summary:
   - Tasks assigned to me
   - Tasks completed
   - Tasks in editing
   - Meetings scheduled for me
   - My payout status
3. THE System SHALL show only editor's own data (no other users)
4. THE System SHALL never allow editors to select other users

---

## Requirement 14: Editor Tasks Section

**User Story:** As an editor, I want to view and update my assigned tasks, so that I can track my work progress.

### Acceptance Criteria

1. THE Editor Tasks SHALL display task database with:
   - Task Number
   - Task Name
   - Deadline
   - Status
   - Raw File Link
   - Edited File Link
   - Idyll Approval status
2. THE System SHALL allow editors to change:
   - Task Status (dropdown: Not Started, Can't Do, Editing, Done)
   - Edited File Link
3. THE System SHALL provide Save button for each task
4. WHEN Save is clicked, THE System SHALL persist changes to database
5. THE System SHALL prevent editors from:
   - Deleting tasks
   - Editing task name
   - Editing deadline
   - Editing task number
6. WHEN editor updates task, THE System SHALL reflect changes in Manager Dashboard immediately

---

## Requirement 15: Editor Meetings Section

**User Story:** As an editor, I want to see my assigned meetings, so that I know my schedule.

### Acceptance Criteria

1. THE Editor Meetings SHALL display only meetings assigned to editor
2. THE System SHALL use card-based layout
3. THE System SHALL show for each meeting:
   - Meeting Title
   - Link
   - Date
   - Time
4. THE System SHALL prevent editors from:
   - Creating meetings
   - Editing meetings
   - Deleting meetings

---

## Requirement 16: Editor Payout Section

**User Story:** As an editor, I want to request payouts, so that I can get paid for my work.

### Acceptance Criteria

1. THE Editor Payout SHALL provide "Request Payout" button
2. WHEN clicked, THE System SHALL show form with:
   - Project Name
   - Project Link
   - Amount
3. WHEN form is submitted, THE System SHALL:
   - Save to database
   - Assign to current editor
   - Show in Manager Dashboard under Payout Management for this user
4. THE System SHALL show payout only to editor and managers
5. THE System SHALL allow editors to view their payout requests
6. THE System SHALL show payout status (Pending, Done)

---

## Requirement 17: Global System Rules

**User Story:** As a system administrator, I want all functionality to work correctly, so that the system is production-ready.

### Acceptance Criteria

1. THE System SHALL ensure every button has working logic
2. THE System SHALL save all create/edit/delete/approve/reject actions to database
3. THE System SHALL enforce user selection in Task/Meeting/Payout Management
4. THE System SHALL control data visibility based on selected user
5. THE System SHALL add scrolling for long lists (no broken layouts)
6. THE System SHALL use common sense and logic everywhere
7. THE System SHALL behave as production system (not demo)
