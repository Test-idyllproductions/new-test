# Design Document

## Overview

This document outlines the technical architecture and implementation approach for the complete system redesign of the Idyll Productions Workspace. The design enforces strict role-based access control, implements a custom dialog system, and establishes clear user flows with mandatory approval gatekeeper.

## Architecture Principles

1. **Strict Role Separation**: Two distinct dashboards with no shared components
2. **Gatekeeper Pattern**: Approval page acts as mandatory checkpoint for pending users
3. **Custom UI Components**: Replace all browser-native dialogs with themed components
4. **Database-First**: All state persists in Supabase with RLS enforcement
5. **No URL Hacking**: Route guards at multiple levels prevent unauthorized access

## System Architecture

### Authentication Flow

```
Visitor → Welcome Page
  ↓
  ├─→ Login → Auth Check → Role/Status Check
  │                          ↓
  │                          ├─→ PENDING → Approval Page (locked)
  │                          ├─→ APPROVED + EDITOR → Editor Dashboard
  │                          └─→ APPROVED + MANAGER → Manager Dashboard
  │
  └─→ Signup → Create Account (default: EDITOR/PENDING) → Login Page
```

### Component Hierarchy

```
App.tsx
├─── TempIcons (dev navigation)
├─── CustomDialog (global notification system)
└─── NavigationHandler
     ├─── Public Routes (no auth required)
     │    ├─── LandingView (Welcome Page)
     │    └─── SupabaseAuthView (Login/Signup)
     │
     ├─── Gatekeeper Route (auth required, status check)
     │    └─── PendingView (Approval Page)
     │
     └─── Protected Routes (auth + approval required)
          ├─── Editor Dashboard Layout
          │    ├─── Sidebar (Editor nav)
          │    ├─── Header
          │    └─── Views
          │         ├─── HomeView (summary cards)
          │         ├─── SupabaseTasksView (filtered tasks)
          │         ├─── MeetingsView (filtered meetings)
          │         ├─── PayoutsView (filtered payouts)
          │         └─── SettingsView
          │
          └─── Manager Dashboard Layout
               ├─── Sidebar (Manager nav)
               ├─── Header
               └─── Views
                    ├─── SupabaseTasksView (all tasks + create)
                    ├─── MeetingsView (all meetings + create)
                    ├─── PayoutsView (all payouts + create)
                    ├─── ApprovalsView (user approval management)
                    ├─── UserManagementView (user submissions)
                    └─── SettingsView
```

## Key Components Design

### 1. Custom Dialog System

**Component**: `components/CustomDialog.tsx`

**Purpose**: Replace all `window.alert()` and `window.confirm()` with themed, non-blocking dialogs

**API**:
```typescript
interface DialogProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant: 'primary' | 'secondary' | 'danger';
  }>;
}
```

**Features**:
- Dark theme matching app design
- Non-blocking overlay
- Keyboard support (ESC to close)
- Animation (fade in/out)
- Stacking support for multiple dialogs

**Usage**:
```typescript
const { showDialog } = useDialog();

showDialog({
  type: 'success',
  title: 'Account Created',
  message: 'Your account is pending approval from management.',
  actions: [
    { label: 'Go to Login', onClick: () => setView('login'), variant: 'primary' }
  ]
});
```

### 2. Route Guard System

**Component**: `lib/route-guards.tsx`

**Purpose**: Prevent unauthorized access via URL manipulation

**Guards**:
1. **AuthGuard**: Requires authenticated user
2. **ApprovalGuard**: Requires APPROVED status
3. **RoleGuard**: Requires specific role (EDITOR or MANAGER)

**Implementation**:
```typescript
const useRouteGuard = () => {
  const { currentUser, currentView, setView } = useSupabaseStore();
  
  useEffect(() => {
    // Check if current view requires authentication
    if (requiresAuth(currentView) && !currentUser) {
      setView('landing');
      return;
    }
    
    // Check if user is pending and trying to access protected routes
    if (currentUser?.status === UserStatus.PENDING && 
        !['pending', 'landing', 'login', 'signup'].includes(currentView)) {
      setView('pending');
      return;
    }
    
    // Check role-based access
    if (currentUser?.role === UserRole.EDITOR && 
        ['approvals', 'user-management'].includes(currentView)) {
      setView('home');
      return;
    }
  }, [currentUser, currentView]);
};
```

### 3. Welcome Page Redesign

**Component**: `views/LandingView.tsx`

**Changes**:
- Center area: 3 main CTAs
  - "Login to Workspace" (primary button)
  - "Create New Workspace" (placeholder, disabled)
  - "Apply to be an Editor" (routes to signup)
- Top-right: Text-only buttons
  - "Portfolio" (external link)
  - "About Us" (external link)
- Remove all cards/icons from top-right
- Clean, minimal styling

### 4. Login/Signup Page Updates

**Component**: `views/SupabaseAuthView.tsx`

**Login Changes**:
- Add show/hide password toggle (eye icon)
- Change text: "Don't have an account? Create one" (not "Sign up")
- Replace all `alert()` with custom dialogs
- Add loading states with spinners

**Signup Changes**:
- Page title: "Create New Account" (not "Sign Up")
- Remove role selection dropdown
- Default all signups to: `role=EDITOR`, `status=PENDING`
- Change text: "Already have an account? Login" (not "Sign in")
- On success: Show custom dialog → redirect to login
- On duplicate email: Show custom dialog "You already have an account. Go to Login."

### 5. Approval Page Enhancement

**Component**: `views/PendingView.tsx`

**Current State**: Basic pending message

**Required Changes**:
- Display user info: email, username, status
- Add visual indicator (clock icon, pending badge)
- Implement URL guard: redirect any dashboard access back to pending
- Add real-time status check (poll every 5s)
- On approval: auto-redirect to appropriate dashboard

**Route Protection**:
```typescript
// In App.tsx NavigationHandler
if (currentUser?.status === UserStatus.PENDING && 
    !['pending', 'landing', 'login', 'signup'].includes(currentView)) {
  setView('pending');
  return <PendingView />;
}
```

### 6. Dashboard Separation

**Editor Dashboard** (`views/HomeView.tsx`):
- **Sidebar Items**: Home, Tasks, Meetings, Payouts, Settings, Logout
- **Home View**: Read-only summary cards (5 widgets)
- **Permissions**: 
  - ✅ View assigned tasks/meetings/payouts
  - ✅ Update task status
  - ✅ Add/edit file links
  - ❌ Create tasks
  - ❌ Delete tasks
  - ❌ Approve users
  - ❌ Create tables

**Manager Dashboard** (`views/SupabaseTasksView.tsx`):
- **Sidebar Items**: Task Management, Meetings Management, Payout Management, User Approvals, User Submissions, Settings, Logout
- **Default View**: Tasks Management (full table view)
- **Permissions**:
  - ✅ All editor permissions
  - ✅ Create/delete tasks
  - ✅ Create/delete tables
  - ✅ Assign tasks to users
  - ✅ Approve/reject users
  - ✅ Change user roles
  - ✅ View all data (not filtered)

### 7. Data Filtering Logic

**Location**: `lib/supabase-store.tsx`

**Editor Filtering**:
```typescript
// Tasks
const editorTasks = taskRecords.filter(t => t.assignedTo === currentUser.id);

// Meetings
const editorMeetings = meetings.filter(m => m.attendees.includes(currentUser.id));

// Payouts
const editorPayouts = payoutRecords.filter(p => p.assignedTo === currentUser.id);
```

**Manager Filtering**:
```typescript
// Managers see ALL data (no filtering)
const managerTasks = taskRecords; // All tasks
const managerMeetings = meetings; // All meetings
const managerPayouts = payoutRecords; // All payouts
```

**Implementation in Views**:
```typescript
// In each view component
const visibleData = useMemo(() => {
  if (currentUser?.role === UserRole.MANAGER) {
    return allData; // No filter
  }
  return allData.filter(item => item.assignedTo === currentUser?.id);
}, [allData, currentUser]);
```

## Database Schema

### Users Table
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'EDITOR', -- 'EDITOR' | 'MANAGER'
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'APPROVED' | 'REJECTED'
  avatar_url TEXT,
  theme TEXT DEFAULT 'dark',
  sound_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies

**Users Table**:
- Editors can read only APPROVED users
- Managers can read ALL users (including PENDING)
- Users can update their own profile
- Only managers can update user status/role

**Tasks/Meetings/Payouts**:
- Editors can read only assigned items
- Managers can read ALL items
- Only managers can create/delete
- Editors can update status/links on assigned items

## State Management

### Global State (Supabase Store)

**Auth State**:
- `session`: Supabase session
- `currentUser`: User profile with role/status
- `loading`: Initial load state

**Data State**:
- `users`: All users (filtered by role)
- `taskRecords`: All task records (filtered by role)
- `meetings`: All meetings (filtered by role)
- `payoutRecords`: All payout records (filtered by role)
- `notifications`: User notifications

**UI State**:
- `currentView`: Current route/page
- `dialogQueue`: Custom dialog stack

### Local State (Component Level)

**Form State**: Login/signup forms
**Edit State**: Inline editing in tables
**Modal State**: Create task/meeting/payout modals

## Security Considerations

### Frontend Guards
1. Route guards in `App.tsx`
2. Component-level permission checks
3. Conditional rendering based on role
4. URL manipulation prevention

### Backend Security (RLS)
1. Row-level security on all tables
2. Role-based read policies
3. Status-based access control
4. Audit logging for all mutations

### Authentication Flow
1. Supabase Auth handles password security
2. JWT tokens for session management
3. Automatic token refresh
4. Secure logout (clear all state)

## Performance Optimizations

### Data Fetching
- Real-time subscriptions for live updates
- Filtered queries at database level
- Memoized computed values
- Lazy loading for large tables

### UI Rendering
- React.memo for expensive components
- useMemo for filtered data
- useCallback for event handlers
- Virtual scrolling for long lists

### Bundle Size
- Code splitting by route
- Lazy load heavy components
- Tree-shaking unused code
- Optimize icon imports

## Testing Strategy

### Manual Testing Checklist
1. **Auth Flow**: Signup → Pending → Approval → Dashboard
2. **Role Switching**: Editor ↔ Manager via TempIcons
3. **URL Hacking**: Try accessing unauthorized routes
4. **Data Filtering**: Verify editors see only assigned items
5. **Permissions**: Verify editors cannot create/delete
6. **Custom Dialogs**: All alerts replaced
7. **Real-time Updates**: Changes reflect immediately

### Edge Cases
- Pending user tries URL hacking
- Editor tries to access manager routes
- Manager approves user while they're logged in
- Multiple tabs open with different roles
- Network failures during mutations

## Migration Plan

### Phase 1: Foundation (Custom Dialogs)
1. Create `CustomDialog` component
2. Create `useDialog` hook
3. Replace all `alert()` calls
4. Test dialog system

### Phase 2: Route Guards
1. Create route guard utilities
2. Implement in `App.tsx`
3. Test URL manipulation prevention
4. Add redirect logic

### Phase 3: UI Updates
1. Update Welcome page
2. Update Login/Signup pages
3. Add password toggle
4. Update text labels

### Phase 4: Approval Gatekeeper
1. Enhance PendingView
2. Add route protection
3. Add real-time status check
4. Test approval flow

### Phase 5: Dashboard Separation
1. Update Sidebar for each role
2. Implement data filtering
3. Update permissions in views
4. Remove unauthorized actions

### Phase 6: Testing & Polish
1. Manual testing all flows
2. Fix bugs
3. Performance optimization
4. Documentation updates

## Success Criteria

✅ No `window.alert()` or `window.confirm()` anywhere
✅ Pending users cannot access dashboards via URL
✅ Editors see only assigned data
✅ Editors cannot create/delete
✅ Managers see all data
✅ Managers can perform all actions
✅ TempIcons actually switch pages
✅ All text labels match spec
✅ Password toggle works
✅ Custom dialogs match theme
✅ Real-time updates work
✅ Data persists across refreshes
