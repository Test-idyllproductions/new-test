# Complete System Redesign Specification

## Overview

This specification defines a comprehensive redesign of the Idyll Productions Workspace to establish clear user flows, strict role-based access control, and professional UI/UX patterns. The system enforces a gatekeeper approval process and maintains strict separation between Editor and Manager capabilities.

## Specification Documents

### 📋 [Requirements](./requirements.md)
**Purpose**: Defines WHAT we're building  
**Contents**: 11 detailed requirements with user stories and acceptance criteria  
**Status**: ✅ Complete and approved

**Key Requirements**:
1. Welcome Page redesign
2. Login Page updates (show/hide password, custom dialogs)
3. Create Account Page (no role selection, default to EDITOR)
4. Custom Dialog System (replace all browser alerts)
5. Approval Page (gatekeeper for pending users)
6. Dashboard Routing (strict two-dashboard system)
7. Editor Dashboard Structure (read-only work overview)
8. Manager Dashboard Structure (full admin control)
9. Data Persistence and Filtering (role-based data access)
10. Notifications System (DB-stored, deep-linking)
11. System Integrity Rules (no bypassing, strict permissions)

---

### 🏗️ [Design](./design.md)
**Purpose**: Defines HOW we're building it  
**Contents**: Technical architecture, component design, security considerations  
**Status**: ✅ Complete and ready for implementation

**Key Sections**:
- Architecture Principles
- Authentication Flow
- Component Hierarchy
- Custom Dialog System design
- Route Guard System design
- Database Schema
- State Management
- Security Considerations
- Performance Optimizations
- Migration Plan

---

### ✅ [Tasks](./tasks.md)
**Purpose**: Step-by-step implementation guide  
**Contents**: 27 tasks organized into 7 phases with acceptance criteria  
**Status**: ✅ Ready to begin

**Phases**:
1. **Phase 1**: Custom Dialog System (3 tasks, ~5 hours)
2. **Phase 2**: Route Guards & Security (3 tasks, ~4 hours)
3. **Phase 3**: Welcome Page Redesign (1 task, ~2 hours)
4. **Phase 4**: Login/Signup Updates (4 tasks, ~4.25 hours)
5. **Phase 5**: Approval Page Gatekeeper (3 tasks, ~4 hours)
6. **Phase 6**: Dashboard Separation (7 tasks, ~9 hours)
7. **Phase 7**: Testing & Polish (7 tasks, ~4 hours)

**Total Estimated Time**: ~33 hours

---

### 📊 [Status](./status.md)
**Purpose**: Track implementation progress  
**Contents**: Phase progress, task completion, blockers, recent changes  
**Status**: 🔄 Updated as work progresses

**Current Status**: Phase 1 - Not Started (0/27 tasks completed)

---

## Quick Start

### For Developers

1. **Read Requirements First**: Understand what we're building and why
2. **Review Design Document**: Understand the technical approach
3. **Follow Tasks Document**: Implement tasks in order
4. **Update Status Document**: Mark tasks as complete

### For Stakeholders

1. **Review Requirements**: Ensure all needs are captured
2. **Check Design**: Verify technical approach aligns with goals
3. **Monitor Status**: Track implementation progress

---

## Key Principles

### 1. Strict Role Separation
- **Two Dashboards Only**: Editor Dashboard (HomeView) and Manager Dashboard (SupabaseTasksView)
- **No Shared Components**: Each role has distinct UI and permissions
- **Clear Boundaries**: Editors cannot access manager features

### 2. Gatekeeper Pattern
- **Approval Page**: Mandatory checkpoint for pending users
- **No Bypass**: URL manipulation prevented at multiple levels
- **Real-time Check**: Status changes reflected immediately

### 3. Custom UI Components
- **No Browser Alerts**: All dialogs are custom, themed components
- **Consistent Design**: Dark theme throughout
- **Professional UX**: Non-blocking, animated, accessible

### 4. Database-First
- **All State Persists**: No data loss on refresh
- **RLS Enforcement**: Security at database level
- **Real-time Updates**: Changes sync across all users

### 5. Security by Design
- **Frontend Guards**: Route protection at component level
- **Backend Security**: Row-level security policies
- **Permission Checks**: Multiple layers of validation

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        VISITOR                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │  Welcome Page  │
            └────────┬───────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌────────┐            ┌──────────┐
    │ Login  │            │  Signup  │
    └───┬────┘            └────┬─────┘
        │                      │
        │                      ▼
        │              (Create EDITOR/PENDING)
        │                      │
        └──────────┬───────────┘
                   │
                   ▼
          ┌────────────────┐
          │  Auth Check    │
          └────────┬───────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
    ┌─────────┐         ┌──────────┐
    │ PENDING │         │ APPROVED │
    └────┬────┘         └─────┬────┘
         │                    │
         ▼                    │
  ┌──────────────┐            │
  │ Approval Page│            │
  │  (LOCKED)    │            │
  └──────────────┘            │
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
            ┌───────────────┐   ┌──────────────┐
            │    EDITOR     │   │   MANAGER    │
            │   Dashboard   │   │  Dashboard   │
            └───────────────┘   └──────────────┘
```

---

## File Structure

```
.kiro/specs/complete-system-redesign/
├── README.md           # This file - overview and navigation
├── requirements.md     # What we're building (11 requirements)
├── design.md          # How we're building it (architecture)
├── tasks.md           # Step-by-step implementation (27 tasks)
└── status.md          # Current progress tracking
```

---

## Implementation Workflow

### 1. Planning Phase ✅
- [x] Define requirements
- [x] Create design document
- [x] Break down into tasks
- [x] Set up tracking

### 2. Implementation Phase 🔄
- [ ] Phase 1: Custom Dialog System
- [ ] Phase 2: Route Guards & Security
- [ ] Phase 3: Welcome Page Redesign
- [ ] Phase 4: Login/Signup Updates
- [ ] Phase 5: Approval Page Gatekeeper
- [ ] Phase 6: Dashboard Separation
- [ ] Phase 7: Testing & Polish

### 3. Testing Phase ⏳
- [ ] Manual testing all flows
- [ ] Edge case testing
- [ ] Performance testing
- [ ] Security testing

### 4. Deployment Phase ⏳
- [ ] Code review
- [ ] Final testing
- [ ] Documentation updates
- [ ] Production deployment

---

## Success Criteria

The implementation is complete when ALL of the following are true:

### Functional Requirements
- ✅ No `window.alert()` or `window.confirm()` anywhere in codebase
- ✅ Pending users cannot access dashboards via URL manipulation
- ✅ Editors see only their assigned data (tasks, meetings, payouts)
- ✅ Editors cannot create or delete any resources
- ✅ Managers see all data without filtering
- ✅ Managers can perform all administrative actions
- ✅ TempIcons actually switch pages (not just highlight)
- ✅ All text labels match specification exactly
- ✅ Password toggle works on login and signup
- ✅ Custom dialogs match dark theme consistently

### Technical Requirements
- ✅ Real-time updates work across all views
- ✅ Data persists across page refreshes
- ✅ Route guards prevent unauthorized access
- ✅ RLS policies enforce permissions at database level
- ✅ No console errors or warnings
- ✅ TypeScript types are correct
- ✅ Code is clean and well-documented

### User Experience
- ✅ Smooth animations and transitions
- ✅ Responsive design works on all screen sizes
- ✅ Loading states are clear and informative
- ✅ Error messages are helpful and actionable
- ✅ Navigation is intuitive and consistent

---

## Testing Checklist

### Auth Flow Testing
- [ ] Signup creates EDITOR/PENDING user
- [ ] Pending user sees approval page
- [ ] Pending user cannot access dashboards
- [ ] Manager approves user
- [ ] Approved user can access dashboard
- [ ] Rejected user sees rejection message

### Permission Testing
- [ ] Editor sees only assigned tasks
- [ ] Editor cannot create tasks
- [ ] Editor cannot delete tasks
- [ ] Editor can update task status
- [ ] Manager sees all tasks
- [ ] Manager can create/delete tasks

### Security Testing
- [ ] URL hacking prevented
- [ ] Browser back/forward buttons work correctly
- [ ] Multiple tabs maintain correct state
- [ ] Session expiry handled gracefully

### UI Testing
- [ ] All custom dialogs work
- [ ] Password toggle works
- [ ] TempIcons navigation works
- [ ] Responsive design works
- [ ] Dark theme consistent

---

## Maintenance

### Updating This Spec

1. **Requirements Changes**: Update requirements.md and notify team
2. **Design Changes**: Update design.md and affected tasks
3. **New Tasks**: Add to tasks.md with proper phase and priority
4. **Progress Updates**: Update status.md as tasks complete

### Version History

- **v1.0** (2025-01-14): Initial specification created
  - 11 requirements defined
  - Architecture designed
  - 27 tasks planned
  - Ready for implementation

---

## Contact & Support

For questions or clarifications about this specification:

1. Review the relevant document (requirements, design, or tasks)
2. Check the status document for current progress
3. Consult with the development team
4. Update documentation as needed

---

## Next Steps

**Immediate Actions**:
1. Begin Phase 1: Create CustomDialog component
2. Set up dialog context and hook
3. Replace all alert() calls

**This Week**:
- Complete Phase 1 (Custom Dialogs)
- Complete Phase 2 (Route Guards)
- Begin Phase 4 (Login/Signup Updates)

**This Sprint**:
- Complete Phases 1-5
- Begin Phase 6 (Dashboard Separation)
- Start testing

---

**Last Updated**: 2025-01-14  
**Status**: Ready for Implementation  
**Next Review**: After Phase 1 completion
