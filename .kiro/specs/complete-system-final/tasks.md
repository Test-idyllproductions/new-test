# Implementation Plan: Complete System - Final Specification

## Overview

This is a phased implementation plan for the complete Idyll Productions Workspace system. Each phase builds on the previous one, ensuring stability before moving forward.

---

## PHASE 1: Core Manager Features (Foundation)

### 1. Manager Home Section with System Overview

- [ ] 1.1 Create ManagerHomeView component
  - Display system-wide statistics (total users, tasks, meetings, payouts)
  - Add user selection dropdown
  - Show global summary when no user selected
  - _Requirements: 2.2, 2.3_

- [ ] 1.2 Implement user-specific summary
  - Filter data by selected user
  - Show user's tasks breakdown (not started, editing, can't do, done)
  - Show user's meetings count
  - Show user's payout status
  - _Requirements: 2.3_

- [ ] 1.3 Add user selection state management
  - Create selectedUser state in store
  - Persist selected user across navigation
  - Provide setSelectedUser function
  - _Requirements: 2.4, 2.5_

- [ ] 1.4 Update Manager Sidebar
  - Add "Home" as first option
  - Ensure proper navigation to Home view
  - _Requirements: 2.1_

---

### 2. Task Management with User Selection

- [ ] 2.1 Add user selection control to Task Management
  - Place user dropdown prominently at top
  - Show "Select a user to manage tasks" placeholder
  - _Requirements: 3.1_

- [ ] 2.2 Implement task creation disable/enable logic
  - Disable "Create New Task" button when no user selected
  - Enable button when user is selected
  - Show tooltip explaining why disabled
  - _Requirements: 3.2_

- [ ] 2.3 Filter tasks by selected user
  - Query only tasks where assigned_to = selected user
  - Refresh task list when user selection changes
  - Clear task list when no user selected
  - _Requirements: 3.3_

- [ ] 2.4 Update task creation to assign to selected user
  - Auto-fill assigned_to field with selected user
  - Prevent changing assigned user during creation
  - Save task with correct user assignment
  - _Requirements: 3.6_

- [ ] 2.5 Implement table management per user
  - Allow creating multiple tables per user
  - Show table switcher dropdown
  - Filter tables by selected user
  - _Requirements: 3.4, 3.5_

- [ ] 2.6 Update task fields and editing
  - Ensure all fields are editable: task number, name, deadline, status
  - Add status dropdown with exactly 4 options: Not Started, Can't Do, Editing, Done
  - Add Raw File Link and Edited File Link fields
  - Add Idyll Approval toggle (Not Approved / Approved)
  - _Requirements: 4.1_

- [ ] 2.7 Implement link preview display
  - Show short preview of links (first 30 chars + "...")
  - Make preview clickable to open full URL in new tab
  - _Requirements: 4.2, 4.3_

- [ ] 2.8 Add explicit Save button for tasks
  - Add Save button to each task row
  - Persist changes to database on click
  - Show success feedback
  - _Requirements: 4.4, 4.5_

- [ ] 2.9 Implement task deletion
  - Add Delete button for managers
  - Show confirmation dialog
  - Remove from database
  - _Requirements: 4.6_

- [ ] 2.10 Ensure real-time updates to Editor Dashboard
  - When task is updated, trigger real-time sync
  - Editor sees changes immediately
  - _Requirements: 4.7_

---

### 3. Meeting Management with User Assignment

- [ ] 3.1 Add user selection to Meeting Management
  - Place user dropdown near "New Meeting" button
  - Disable meeting creation when no user selected
  - _Requirements: 5.1, 5.2_

- [ ] 3.2 Update meeting creation form
  - Add fields: Meeting Name, Date, Time, Video Link
  - Auto-assign to selected user
  - _Requirements: 5.3_

- [ ] 3.3 Save meeting with user assignment
  - Store assigned user in attendees array
  - Persist to database
  - _Requirements: 5.4_

- [ ] 3.4 Filter meetings by selected user
  - Show only meetings where user is in attendees
  - Refresh when user selection changes
  - _Requirements: 5.5_

- [ ] 3.5 Implement meeting editing
  - Allow managers to edit all meeting fields
  - Save changes to database
  - _Requirements: 5.6_

- [ ] 3.6 Implement meeting deletion
  - Add Delete button
  - Show confirmation
  - Remove from database
  - _Requirements: 5.7_

- [ ] 3.7 Ensure real-time updates to Editor Dashboard
  - Editor sees new/updated meetings immediately
  - _Requirements: 5.8_

---

### 4. Payout Management with User-Based Access

- [ ] 4.1 Add user selection to Payout Management
  - Place user dropdown at top
  - Require user selection before showing payouts
  - _Requirements: 6.1_

- [ ] 4.2 Filter payouts by selected user
  - Query payouts where assigned_to = selected user
  - Refresh when user changes
  - _Requirements: 6.2_

- [ ] 4.3 Implement payout creation form
  - Add fields: Project Name, Project Link, Amount, Status
  - Auto-assign to selected user
  - _Requirements: 6.3_

- [ ] 4.4 Save payout with user assignment
  - Persist to database with assigned_to field
  - _Requirements: 6.4, 6.5_

- [ ] 4.5 Ensure payout visibility rules
  - Show payout only to assigned user and managers
  - Editors never see other users' payouts
  - _Requirements: 6.6_

- [ ] 4.6 Implement payout editing
  - Allow managers to edit status
  - Save changes to database
  - _Requirements: 6.7_

- [ ] 4.7 Implement payout deletion
  - Add Delete button
  - Show confirmation
  - Remove from database
  - _Requirements: 6.8_

---

## PHASE 2: User Management Features

### 5. User Approvals Enhancement

- [ ] 5.1 Verify approval list updates instantly
  - New signups appear immediately
  - Real-time subscription working
  - _Requirements: 7.1_

- [ ] 5.2 Ensure approval message displays correctly
  - "You are approved. Thanks for joining Idyll Productions."
  - Refresh instruction shown
  - _Requirements: 7.3, 7.4_

- [ ] 5.3 Implement rejection flow
  - Update status to REJECTED
  - Redirect to Welcome page
  - Show message: "You are rejected from our management. Please contact management for further information."
  - _Requirements: 7.5_

- [ ] 5.4 Verify 3-second update time
  - Test approval detection speed
  - Ensure real-time + polling works
  - _Requirements: 7.6_

---

### 6. User Submissions Log

- [ ] 6.1 Create UserSubmissionsView component
  - Display all editor applications
  - Show email, name, submission date
  - _Requirements: 8.1, 8.2_

- [ ] 6.2 Implement real-time updates
  - New submissions appear instantly
  - Use Supabase real-time subscription
  - _Requirements: 8.3_

- [ ] 6.3 Persist submissions to database
  - Create submissions table if needed
  - Store all application data
  - _Requirements: 8.4_

---

### 7. User Management with Role Changes

- [ ] 7.1 Update UserManagementView to show all approved users
  - Display email, username, role, status
  - Filter to show only APPROVED users
  - _Requirements: 9.1, 9.2_

- [ ] 7.2 Implement role change functionality
  - Add role dropdown for each user
  - Save role change to database
  - _Requirements: 9.3_

- [ ] 7.3 Ensure role changes apply on next login
  - User gets new permissions after logout/login
  - Dashboard changes based on new role
  - _Requirements: 9.4_

- [ ] 7.4 Implement user deletion
  - Add Delete button for each user
  - Show confirmation dialog
  - _Requirements: 9.5_

- [ ] 7.5 Cascade delete user data
  - Delete all tasks assigned to user
  - Delete all meetings for user
  - Delete all payouts for user
  - Delete user profile
  - _Requirements: 9.6_

---

### 8. Activity Log Audit Trail

- [ ] 8.1 Create ActivityLogView component
  - Display all system actions
  - Show in reverse chronological order
  - _Requirements: 10.2, 10.3_

- [ ] 8.2 Implement comprehensive logging
  - Log user login
  - Log user logout
  - Log task creation/updates/deletion
  - Log status changes
  - Log approvals/rejections
  - Log meetings created
  - Log payouts requested/updated
  - _Requirements: 10.1_

- [ ] 8.3 Display log entry details
  - Show timestamp
  - Show user who performed action
  - Show action description
  - _Requirements: 10.4_

- [ ] 8.4 Persist logs to database
  - Save all log entries to audit_logs table
  - Ensure logs are never deleted (audit trail)
  - _Requirements: 10.2_

---

## PHASE 3: Editor Features

### 9. Editor Home Section

- [ ] 9.1 Create EditorHomeView component
  - Display welcome message: "Welcome to Idyll Productions"
  - Add time-based greeting (Good Morning/Evening)
  - Show username
  - _Requirements: 13.1_

- [ ] 9.2 Add daily motivational quotes
  - Create quotes array
  - Display random quote daily
  - _Requirements: 13.1_

- [ ] 9.3 Implement personal summary
  - Show tasks assigned to editor
  - Show tasks completed
  - Show tasks in editing
  - Show meetings scheduled
  - Show payout status
  - _Requirements: 13.2_

- [ ] 9.4 Ensure data isolation
  - Editor sees only their own data
  - No user selection available
  - _Requirements: 13.3, 13.4_

---

### 10. Editor Tasks Section

- [ ] 10.1 Update EditorTasksView to show task database
  - Display: Task Number, Task Name, Deadline, Status, Raw File Link, Edited File Link, Idyll Approval
  - _Requirements: 14.1_

- [ ] 10.2 Implement limited editing for editors
  - Allow changing Task Status (dropdown)
  - Allow changing Edited File Link
  - _Requirements: 14.2_

- [ ] 10.3 Add Save button for each task
  - Persist changes to database
  - Show success feedback
  - _Requirements: 14.3, 14.4_

- [ ] 10.4 Disable editing for restricted fields
  - Prevent editing: Task Name, Deadline, Task Number
  - Prevent deleting tasks
  - _Requirements: 14.5_

- [ ] 10.5 Ensure real-time sync to Manager Dashboard
  - Manager sees editor's changes immediately
  - _Requirements: 14.6_

---

### 11. Editor Meetings Section

- [ ] 11.1 Update EditorMeetingsView to card layout
  - Display meetings in card format
  - Show: Meeting Title, Link, Date, Time
  - _Requirements: 15.1, 15.2, 15.3_

- [ ] 11.2 Filter meetings to show only assigned
  - Query meetings where editor is in attendees
  - _Requirements: 15.1_

- [ ] 11.3 Disable meeting management for editors
  - No Create button
  - No Edit button
  - No Delete button
  - _Requirements: 15.4_

---

### 12. Editor Payout Section

- [ ] 12.1 Add "Request Payout" button to EditorPayoutsView
  - Place prominently at top
  - _Requirements: 16.1_

- [ ] 12.2 Create payout request form
  - Add fields: Project Name, Project Link, Amount
  - _Requirements: 16.2_

- [ ] 12.3 Submit payout request
  - Save to database with assigned_to = current editor
  - Set status to Pending
  - _Requirements: 16.3_

- [ ] 12.4 Display payout requests in Manager Dashboard
  - Show in Payout Management for selected user
  - _Requirements: 16.3_

- [ ] 12.5 Ensure payout visibility
  - Editor sees only their payouts
  - Managers see all payouts
  - _Requirements: 16.4_

- [ ] 12.6 Display payout status
  - Show Pending or Done
  - _Requirements: 16.6_

---

## PHASE 4: Settings & Polish

### 13. Settings for All Users

- [ ] 13.1 Update SettingsView with profile editing
  - Add fields: Username, Email, Password
  - Password field only requires new password (no current password)
  - _Requirements: 11.1_

- [ ] 13.2 Save profile changes to database
  - Update users table
  - Show success feedback
  - _Requirements: 11.2_

- [ ] 13.3 Implement theme switching
  - Add Appearance/Theme section
  - Provide Dark and Light mode options
  - _Requirements: 11.3_

- [ ] 13.4 Apply theme changes globally
  - Update entire website when theme changes
  - Persist theme preference to database
  - _Requirements: 11.4_

- [ ] 13.5 Implement account deletion
  - Add "Delete Account" button in Account Management
  - Show confirmation dialog
  - _Requirements: 11.5_

- [ ] 13.6 Cascade delete on account deletion
  - Remove all user data from database
  - Log out user
  - Redirect to Welcome page
  - _Requirements: 11.6_

- [ ] 13.7 Display account information
  - Show Role, Status, Member Since date
  - _Requirements: 11.7_

- [ ] 13.8 Implement Logout functionality
  - Add Logout button
  - Clear session
  - Redirect to Welcome page
  - _Requirements: 11.8, 11.9_

---

### 14. Final Testing and Bug Fixes

- [ ] 14.1 Test all buttons and actions
  - Verify every button has working logic
  - Test all create/edit/delete operations
  - _Requirements: 17.1_

- [ ] 14.2 Verify database persistence
  - All actions save to database
  - Data persists after refresh
  - _Requirements: 17.2_

- [ ] 14.3 Test user selection enforcement
  - Task Management requires user selection
  - Meeting Management requires user selection
  - Payout Management requires user selection
  - _Requirements: 17.3, 17.4_

- [ ] 14.4 Test layout and scrolling
  - Long lists have scrolling
  - No broken layouts
  - Responsive design works
  - _Requirements: 17.5_

- [ ] 14.5 End-to-end testing
  - Test complete manager workflow
  - Test complete editor workflow
  - Test approval flow
  - Test role changes
  - _Requirements: 17.6, 17.7_

---

## Implementation Notes

### Execution Order
1. Complete Phase 1 entirely before moving to Phase 2
2. Test each phase thoroughly before proceeding
3. Fix all bugs in current phase before starting next phase

### Testing Strategy
- Test each task immediately after implementation
- Use both manager and editor accounts for testing
- Verify database changes in Supabase dashboard
- Check real-time updates work correctly

### Database Schema Requirements
- Ensure `users` table has all required fields
- Ensure `task_records` has `assigned_to` field
- Ensure `meetings` has `attendees` array field
- Ensure `payout_records` has `assigned_to` field
- Ensure `audit_logs` table exists

### Key Success Criteria
- User selection controls data visibility
- All CRUD operations persist to database
- Real-time updates work for all entities
- Editors see only their data
- Managers see all data with user filtering
- No broken buttons or non-functional features
