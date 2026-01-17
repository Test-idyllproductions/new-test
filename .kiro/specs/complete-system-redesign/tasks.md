# Implementation Tasks

## Overview

This document breaks down the complete system redesign into actionable tasks. Tasks are organized by phase and priority, with clear acceptance criteria for each.

---

## Phase 1: Custom Dialog System (Foundation)

### Task 1.1: Create CustomDialog Component
**Priority**: HIGH  
**Estimated Time**: 2 hours  
**Files**: `components/CustomDialog.tsx`

**Description**: Create a reusable custom dialog component to replace all browser alerts.

**Acceptance Criteria**:
- [ ] Component accepts props: type, title, message, onClose, actions
- [ ] Supports 4 types: success, error, warning, info
- [ ] Matches dark theme styling
- [ ] Non-blocking overlay with backdrop blur
- [ ] Fade in/out animations
- [ ] ESC key closes dialog
- [ ] Click outside closes dialog
- [ ] Responsive design (mobile-friendly)

**Implementation Notes**:
```typescript
interface CustomDialogProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant: 'primary' | 'secondary' | 'danger';
  }>;
}
```

---

### Task 1.2: Create useDialog Hook
**Priority**: HIGH  
**Estimated Time**: 1 hour  
**Files**: `lib/dialog-context.tsx`

**Description**: Create a context and hook for managing dialog state globally.

**Acceptance Criteria**:
- [ ] Context provider wraps entire app
- [ ] Hook provides `showDialog()` function
- [ ] Hook provides `hideDialog()` function
- [ ] Supports dialog queue (multiple dialogs)
- [ ] Auto-dismiss after timeout (optional)

**Implementation Notes**:
```typescript
const { showDialog, hideDialog } = useDialog();

showDialog({
  type: 'success',
  title: 'Success',
  message: 'Operation completed',
  actions: [
    { label: 'OK', onClick: hideDialog, variant: 'primary' }
  ]
});
```

---

### Task 1.3: Replace All alert() Calls
**Priority**: HIGH  
**Estimated Time**: 2 hours  
**Files**: `views/SupabaseAuthView.tsx`, `views/SupabaseTasksView.tsx`, `components/TempIcons.tsx`

**Description**: Find and replace all `window.alert()` and `alert()` calls with custom dialogs.

**Acceptance Criteria**:
- [ ] No `alert()` in SupabaseAuthView.tsx
- [ ] No `alert()` in SupabaseTasksView.tsx
- [ ] No `alert()` in TempIcons.tsx
- [ ] All error messages use custom dialogs
- [ ] All success messages use custom dialogs
- [ ] All confirmation dialogs use custom dialogs

**Search Pattern**: `alert\(` (regex)

---

## Phase 2: Route Guards & Security

### Task 2.1: Create Route Guard Utilities
**Priority**: HIGH  
**Estimated Time**: 2 hours  
**Files**: `lib/route-guards.tsx`

**Description**: Create utility functions and hooks for route protection.

**Acceptance Criteria**:
- [ ] `useRouteGuard()` hook created
- [ ] Checks authentication status
- [ ] Checks user approval status
- [ ] Checks role-based permissions
- [ ] Redirects unauthorized users
- [ ] Runs on every route change

**Implementation Notes**:
```typescript
const useRouteGuard = () => {
  const { currentUser, currentView, setView } = useSupabaseStore();
  
  useEffect(() => {
    // Auth check
    if (requiresAuth(currentView) && !currentUser) {
      setView('landing');
    }
    
    // Pending check
    if (currentUser?.status === 'PENDING' && 
        !['pending', 'landing', 'login', 'signup'].includes(currentView)) {
      setView('pending');
    }
    
    // Role check
    if (currentUser?.role === 'EDITOR' && 
        ['approvals', 'user-management'].includes(currentView)) {
      setView('home');
    }
  }, [currentUser, currentView]);
};
```

---

### Task 2.2: Implement Route Guards in App.tsx
**Priority**: HIGH  
**Estimated Time**: 1 hour  
**Files**: `App.tsx`

**Description**: Integrate route guards into the main navigation handler.

**Acceptance Criteria**:
- [ ] `useRouteGuard()` called in NavigationHandler
- [ ] Pending users redirected to approval page
- [ ] Unauthenticated users redirected to landing
- [ ] Editors cannot access manager routes
- [ ] Guards run before rendering views

---

### Task 2.3: Add URL Manipulation Prevention
**Priority**: HIGH  
**Estimated Time**: 1 hour  
**Files**: `App.tsx`

**Description**: Prevent users from bypassing guards via URL changes.

**Acceptance Criteria**:
- [ ] Listen to URL changes (popstate event)
- [ ] Re-run guards on URL change
- [ ] Prevent unauthorized route access
- [ ] Test with browser back/forward buttons
- [ ] Test with manual URL typing

---

## Phase 3: Welcome Page Redesign

### Task 3.1: Update LandingView Layout
**Priority**: MEDIUM  
**Estimated Time**: 2 hours  
**Files**: `views/LandingView.tsx`

**Description**: Redesign welcome page per specification.

**Acceptance Criteria**:
- [ ] Center area has 3 main CTAs:
  - "Login to Workspace" (routes to login)
  - "Create New Workspace" (disabled placeholder)
  - "Apply to be an Editor" (routes to signup)
- [ ] Top-right has text-only buttons:
  - "Portfolio" (external link)
  - "About Us" (external link)
- [ ] Remove all cards/icons from top-right
- [ ] Clean, minimal styling
- [ ] Responsive design

---

## Phase 4: Login/Signup Updates

### Task 4.1: Add Password Toggle to Login
**Priority**: MEDIUM  
**Estimated Time**: 1 hour  
**Files**: `views/SupabaseAuthView.tsx`

**Description**: Add show/hide password toggle with eye icon.

**Acceptance Criteria**:
- [ ] Eye icon button next to password field
- [ ] Click toggles between text/password input type
- [ ] Icon changes (eye / eye-off)
- [ ] Works on both login and signup
- [ ] Accessible (aria-label)

---

### Task 4.2: Update Login Page Text
**Priority**: LOW  
**Estimated Time**: 15 minutes  
**Files**: `views/SupabaseAuthView.tsx`

**Description**: Update text labels per specification.

**Acceptance Criteria**:
- [ ] Change "Sign up" to "Create one"
- [ ] Full text: "Don't have an account? Create one"
- [ ] Verify on login page only

---

### Task 4.3: Update Signup Page
**Priority**: HIGH  
**Estimated Time**: 2 hours  
**Files**: `views/SupabaseAuthView.tsx`

**Description**: Update signup page per specification.

**Acceptance Criteria**:
- [ ] Page title: "Create New Account"
- [ ] Remove role selection dropdown
- [ ] Default role to EDITOR
- [ ] Default status to PENDING
- [ ] Change "Sign in" to "Login"
- [ ] Full text: "Already have an account? Login"
- [ ] On success: Show custom dialog
- [ ] On success: Redirect to login page
- [ ] On duplicate email: Show custom dialog "You already have an account. Go to Login."

---

### Task 4.4: Replace Alerts in Auth Flow
**Priority**: HIGH  
**Estimated Time**: 1 hour  
**Files**: `views/SupabaseAuthView.tsx`

**Description**: Replace all alerts with custom dialogs in auth flow.

**Acceptance Criteria**:
- [ ] Login errors use custom dialog
- [ ] Signup success uses custom dialog
- [ ] Signup errors use custom dialog
- [ ] Duplicate email uses custom dialog
- [ ] All dialogs match theme
- [ ] All dialogs have appropriate actions

---

## Phase 5: Approval Page Gatekeeper

### Task 5.1: Enhance PendingView
**Priority**: HIGH  
**Estimated Time**: 2 hours  
**Files**: `views/PendingView.tsx`

**Description**: Enhance approval page with better UI and information.

**Acceptance Criteria**:
- [ ] Display user email
- [ ] Display username
- [ ] Display status badge (Pending/Rejected)
- [ ] Show clock icon for pending
- [ ] Show alert icon for rejected
- [ ] Add explanatory text
- [ ] Add logout button
- [ ] Responsive design

---

### Task 5.2: Add Real-time Status Check
**Priority**: MEDIUM  
**Estimated Time**: 1 hour  
**Files**: `views/PendingView.tsx`

**Description**: Poll user status and auto-redirect on approval.

**Acceptance Criteria**:
- [ ] Poll every 5 seconds
- [ ] Check user status in database
- [ ] On APPROVED: redirect to appropriate dashboard
- [ ] On REJECTED: update UI
- [ ] Clean up interval on unmount

---

### Task 5.3: Implement Approval Route Guard
**Priority**: HIGH  
**Estimated Time**: 1 hour  
**Files**: `App.tsx`

**Description**: Prevent pending users from accessing any dashboard routes.

**Acceptance Criteria**:
- [ ] Pending users redirected to approval page
- [ ] Works for all dashboard routes
- [ ] Works for URL manipulation
- [ ] Works for browser navigation
- [ ] Test with TempIcons navigation

---

## Phase 6: Dashboard Separation

### Task 6.1: Update Editor Sidebar
**Priority**: MEDIUM  
**Estimated Time**: 1 hour  
**Files**: `components/Sidebar.tsx`

**Description**: Update editor sidebar to show only allowed items.

**Acceptance Criteria**:
- [ ] Top section: Home, Tasks, Meetings, Payouts
- [ ] Bottom section: Settings, Logout
- [ ] Remove: Activity Log, User Management, Approvals
- [ ] Verify role check works
- [ ] Test navigation

---

### Task 6.2: Update Manager Sidebar
**Priority**: MEDIUM  
**Estimated Time**: 1 hour  
**Files**: `components/Sidebar.tsx`

**Description**: Update manager sidebar per specification.

**Acceptance Criteria**:
- [ ] Top section: Task Management, Meetings Management, Payout Management, User Approvals, User Submissions
- [ ] Bottom section: Settings, Logout
- [ ] Add Activity Log if needed
- [ ] Verify role check works
- [ ] Test navigation

---

### Task 6.3: Implement Data Filtering in Store
**Priority**: HIGH  
**Estimated Time**: 2 hours  
**Files**: `lib/supabase-store.tsx`

**Description**: Add role-based data filtering in the store.

**Acceptance Criteria**:
- [ ] Editors see only assigned tasks
- [ ] Editors see only assigned meetings
- [ ] Editors see only assigned payouts
- [ ] Managers see all data
- [ ] Filtering happens at query level
- [ ] Update fetchAllData() function

---

### Task 6.4: Update HomeView (Editor Dashboard)
**Priority**: MEDIUM  
**Estimated Time**: 1 hour  
**Files**: `views/HomeView.tsx`

**Description**: Ensure HomeView shows only editor's data.

**Acceptance Criteria**:
- [ ] Summary cards show filtered data
- [ ] Total Tasks = assigned tasks only
- [ ] Editing Tasks = assigned editing tasks only
- [ ] Completed Tasks = assigned completed tasks only
- [ ] Upcoming Meetings = assigned meetings only
- [ ] Pending Payouts = assigned payouts only

---

### Task 6.5: Update SupabaseTasksView Permissions
**Priority**: HIGH  
**Estimated Time**: 2 hours  
**Files**: `views/SupabaseTasksView.tsx`

**Description**: Implement role-based permissions in tasks view.

**Acceptance Criteria**:
- [ ] Editors see only assigned tasks
- [ ] Editors can update status
- [ ] Editors can update file links
- [ ] Editors CANNOT create tasks
- [ ] Editors CANNOT delete tasks
- [ ] Editors CANNOT create tables
- [ ] Managers see all tasks
- [ ] Managers can do everything
- [ ] Hide "Create Task" button for editors
- [ ] Hide "Delete" button for editors

---

### Task 6.6: Update MeetingsView Permissions
**Priority**: MEDIUM  
**Estimated Time**: 1 hour  
**Files**: `views/MeetingsView.tsx`

**Description**: Implement role-based permissions in meetings view.

**Acceptance Criteria**:
- [ ] Editors see only assigned meetings
- [ ] Editors CANNOT create meetings
- [ ] Editors CANNOT delete meetings
- [ ] Managers see all meetings
- [ ] Managers can create/delete meetings
- [ ] Hide create button for editors

---

### Task 6.7: Update PayoutsView Permissions
**Priority**: MEDIUM  
**Estimated Time**: 1 hour  
**Files**: `views/PayoutsView.tsx`

**Description**: Implement role-based permissions in payouts view.

**Acceptance Criteria**:
- [ ] Editors see only assigned payouts
- [ ] Editors CANNOT create payouts
- [ ] Editors CANNOT delete payouts
- [ ] Managers see all payouts
- [ ] Managers can create/delete payouts
- [ ] Hide create button for editors

---

## Phase 7: Testing & Polish

### Task 7.1: Manual Testing - Auth Flow
**Priority**: HIGH  
**Estimated Time**: 1 hour  

**Test Cases**:
- [ ] Signup creates EDITOR/PENDING user
- [ ] Pending user redirected to approval page
- [ ] Pending user cannot access dashboards via URL
- [ ] Manager approves user
- [ ] Approved user can login and access dashboard
- [ ] Rejected user sees rejection message

---

### Task 7.2: Manual Testing - Role Permissions
**Priority**: HIGH  
**Estimated Time**: 1 hour  

**Test Cases**:
- [ ] Editor sees only assigned tasks
- [ ] Editor sees only assigned meetings
- [ ] Editor sees only assigned payouts
- [ ] Editor cannot create tasks
- [ ] Editor cannot delete tasks
- [ ] Editor can update task status
- [ ] Editor can update file links
- [ ] Manager sees all data
- [ ] Manager can create/delete everything

---

### Task 7.3: Manual Testing - URL Hacking
**Priority**: HIGH  
**Estimated Time**: 30 minutes  

**Test Cases**:
- [ ] Pending user types `/home` in URL → redirected to `/pending`
- [ ] Pending user types `/tasks` in URL → redirected to `/pending`
- [ ] Editor types `/approvals` in URL → redirected to `/home`
- [ ] Editor types `/user-management` in URL → redirected to `/home`
- [ ] Unauthenticated user types `/home` → redirected to `/landing`

---

### Task 7.4: Manual Testing - Custom Dialogs
**Priority**: MEDIUM  
**Estimated Time**: 30 minutes  

**Test Cases**:
- [ ] No `alert()` calls anywhere in app
- [ ] Login errors show custom dialog
- [ ] Signup success shows custom dialog
- [ ] Signup errors show custom dialog
- [ ] Task creation errors show custom dialog
- [ ] All dialogs match theme
- [ ] All dialogs are dismissible

---

### Task 7.5: Manual Testing - TempIcons Navigation
**Priority**: MEDIUM  
**Estimated Time**: 15 minutes  

**Test Cases**:
- [ ] Click "Welcome" → goes to landing page
- [ ] Click "Login" → goes to login page
- [ ] Click "Signup" → goes to signup page
- [ ] Click "Approval" → goes to pending page
- [ ] Click "Editor Home" → switches to editor + home view
- [ ] Click "Manager Tasks" → switches to manager + tasks view
- [ ] All navigation actually changes pages (not just highlights)

---

### Task 7.6: Code Cleanup
**Priority**: LOW  
**Estimated Time**: 1 hour  

**Checklist**:
- [ ] Remove unused imports
- [ ] Remove console.log statements
- [ ] Remove commented code
- [ ] Fix TypeScript warnings
- [ ] Format code consistently
- [ ] Update comments

---

### Task 7.7: Documentation Updates
**Priority**: LOW  
**Estimated Time**: 1 hour  

**Checklist**:
- [ ] Update README.md with new features
- [ ] Document custom dialog usage
- [ ] Document route guard system
- [ ] Update setup instructions
- [ ] Add troubleshooting section

---

## Task Summary

### By Priority
- **HIGH**: 15 tasks (critical functionality)
- **MEDIUM**: 9 tasks (important features)
- **LOW**: 3 tasks (polish and docs)

### By Phase
- **Phase 1**: 3 tasks (Custom Dialogs)
- **Phase 2**: 3 tasks (Route Guards)
- **Phase 3**: 1 task (Welcome Page)
- **Phase 4**: 4 tasks (Login/Signup)
- **Phase 5**: 3 tasks (Approval Page)
- **Phase 6**: 7 tasks (Dashboard Separation)
- **Phase 7**: 7 tasks (Testing & Polish)

### Estimated Total Time
- **HIGH Priority**: ~20 hours
- **MEDIUM Priority**: ~11 hours
- **LOW Priority**: ~2.25 hours
- **TOTAL**: ~33.25 hours

---

## Implementation Order

**Recommended sequence for maximum efficiency:**

1. **Start with Foundation** (Phase 1)
   - Custom dialogs are used everywhere
   - Must be done first

2. **Add Security** (Phase 2)
   - Route guards protect all routes
   - Critical for security

3. **Update Auth Flow** (Phase 4 + Phase 5)
   - Login/signup changes
   - Approval page gatekeeper
   - Complete user journey

4. **Separate Dashboards** (Phase 6)
   - Role-based permissions
   - Data filtering
   - UI updates

5. **Polish UI** (Phase 3)
   - Welcome page redesign
   - Can be done anytime

6. **Test Everything** (Phase 7)
   - Comprehensive testing
   - Bug fixes
   - Documentation

---

## Next Steps

1. Review this task breakdown with stakeholders
2. Prioritize any additional requirements
3. Begin implementation with Phase 1
4. Test each phase before moving to next
5. Update this document as tasks are completed

---

## Task Tracking

Mark tasks as completed by changing `[ ]` to `[x]` in the checkboxes above.

**Current Status**: Ready to begin Phase 1
