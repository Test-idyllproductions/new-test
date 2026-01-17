
export enum UserRole {
  EDITOR = 'EDITOR',
  MANAGER = 'MANAGER'
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  theme?: 'dark' | 'light';
  colorTheme?: 'orange' | 'blue' | 'red' | 'yellow' | 'green';
  soundEnabled?: boolean;
}

// Enhanced Task Management Types
export enum TaskStatus {
  NOT_STARTED = 'Not Started',
  CANT_DO = "Can't Do",
  EDITING = 'Editing',
  DONE = 'Done'
}

export enum PayoutStatus {
  PENDING = 'Pending',
  DONE = 'Done'
}

export interface TaskManagementRecord {
  id: string;
  tableId: string;
  taskNumber: string;
  taskName: string;
  deadline: string;
  status: TaskStatus;
  rawFileLink: string;
  editedFileLink: string;
  approvalFromIdyll: boolean;
  assignedTo: string; // User ID
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PayoutRecord {
  id: string;
  tableId: string;
  projectName: string;
  projectLink: string;
  amount: number;
  status: PayoutStatus;
  assignedTo: string; // User ID
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Enhanced Database System Types
export enum PropertyType {
  TEXT = 'Text',
  NUMBER = 'Number',
  SELECT = 'Select',
  MULTI_SELECT = 'Multi-select',
  STATUS = 'Status',
  PERSON = 'Person',
  LINK = 'Link',
  EMAIL = 'Email'
}

export interface SelectOption {
  id: string;
  name: string;
  color: string;
}

export interface DatabaseProperty {
  id: string;
  name: string;
  type: PropertyType;
  options?: SelectOption[]; // For Select and Multi-select
}

export interface DatabaseTable {
  id: string;
  name: string;
  properties: DatabaseProperty[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskRecord {
  id: string;
  tableId: string;
  properties: Record<string, any>; // Dynamic properties based on table schema
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Legacy Task interface for backward compatibility
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string; // User ID
  dueDate: string;
  link?: string;
  comments: string[];
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface Meeting {
  id: string;
  name: string;
  date: string;
  time: string;
  link: string;
  attendees: string[]; // User IDs
}

export interface Payout {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Paid' | 'Processing';
  date: string;
  description: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  objectType: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
}

export interface UserSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'PENDING' | 'REVIEWED' | 'CONTACTED' | 'REJECTED';
  created_at: string;
  updated_at: string;
}

export type AppView = 
  | 'landing' 
  | 'login' 
  | 'signup'
  | 'apply'
  | 'pending' 
  | 'home'
  | 'tasks' 
  | 'meetings' 
  | 'payouts' 
  | 'approvals' 
  | 'user-management'
  | 'settings'
  | 'manager-login';
