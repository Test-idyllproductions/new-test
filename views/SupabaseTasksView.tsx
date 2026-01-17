import React, { useState, useEffect } from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { useDialog } from '../lib/dialog-context';
import { useTheme, COLOR_THEMES } from '../lib/theme-context';
import { UserRole, TaskStatus, TaskManagementRecord, UserStatus } from '../types';
import { Plus, Trash2, Save, X, ExternalLink, Edit2 } from 'lucide-react';

const SupabaseTasksView: React.FC = () => {
  // VERSION: 2025-01-14-16:05 - FORCE RELOAD
  const { 
    currentUser, users, taskTables, taskRecords,
    createTaskTable, deleteTaskTable, addTaskRecord, updateTaskRecord, deleteTaskRecord
  } = useSupabaseStore();
  const { showDialog } = useDialog();
  const { theme, colorTheme } = useTheme();
  const currentTheme = COLOR_THEMES[colorTheme];
  
  const isManager = currentUser?.role === UserRole.MANAGER;
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [editingRecords, setEditingRecords] = useState<Record<string, Partial<TaskManagementRecord>>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Create Task Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    taskName: '',
    deadline: '',
    status: TaskStatus.NOT_STARTED,
    assignedTo: '',
    rawFileLink: '',
    editedFileLink: ''
  });

  // Use default table (first available or all records)
  const defaultTable = taskTables.length > 0 ? taskTables[0] : null;
  const tableRecords = taskRecords; // Show all records instead of filtering by table

  // Filter records based on user selection and role
  const visibleRecords = (() => {
    let filtered = tableRecords;
    
    if (!isManager) {
      // Editors only see their own tasks
      filtered = filtered.filter(record => record.assignedTo === currentUser?.id);
    } else if (selectedUserId !== 'all') {
      // Manager viewing specific user's tasks
      filtered = filtered.filter(record => record.assignedTo === selectedUserId);
    }
    
    return filtered;
  })();

  const handleCreateTable = async (tableData: {
    name: string;
    description?: string;
    budget?: number;
    assignedUsers?: string[];
    priority?: 'low' | 'medium' | 'high';
    deadline?: string;
  }) => {
    try {
      await createTaskTable(tableData);
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.taskName || !newTask.assignedTo) {
      showDialog({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please fill in Task Name and Assign User'
      });
      return;
    }

    // Use default table or create one
    let tableId = defaultTable?.id;
    if (!tableId && isManager) {
      // Create default table if none exists
      try {
        tableId = await createTaskTable({
          name: 'Main Tasks',
          description: 'Default task management table',
          priority: 'medium'
        });
      } catch (error) {
        console.error('Error creating default table:', error);
      }
    }

    if (!tableId) {
      showDialog({
        type: 'error',
        title: 'Error',
        message: 'No table available for task creation'
      });
      return;
    }
    
    const taskNumber = `T${String(tableRecords.length + 1).padStart(3, '0')}`;
    
    const taskData: Omit<TaskManagementRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
      tableId: tableId,
      taskNumber,
      taskName: newTask.taskName,
      deadline: newTask.deadline || new Date().toISOString().split('T')[0],
      status: newTask.status,
      rawFileLink: newTask.rawFileLink,
      editedFileLink: newTask.editedFileLink,
      approvalFromIdyll: false,
      assignedTo: newTask.assignedTo
    };
    
    try {
      await addTaskRecord(tableId, taskData);
      setShowCreateModal(false);
      setNewTask({
        taskName: '',
        deadline: '',
        status: TaskStatus.NOT_STARTED,
        assignedTo: '',
        rawFileLink: '',
        editedFileLink: ''
      });
    } catch (error: any) {
      console.error('Error creating task:', error);
      showDialog({
        type: 'error',
        title: 'Failed to Create Task',
        message: error.message || 'Failed to create task. Please try again.'
      });
    }
  };

  const handleFieldChange = (recordId: string, field: keyof TaskManagementRecord, value: any) => {
    setEditingRecords(prev => ({
      ...prev,
      [recordId]: {
        ...(prev[recordId] || {}),
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      for (const [recordId, updates] of Object.entries(editingRecords)) {
        await updateTaskRecord(recordId, updates);
      }
      setEditingRecords({});
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTaskRecord(recordId);
      } catch (error: any) {
        console.error('Error deleting task record:', error);
        showDialog({
          type: 'error',
          title: 'Failed to Delete Task',
          message: error.message || 'Failed to delete task. Please try again.'
        });
      }
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.NOT_STARTED: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
      case TaskStatus.CANT_DO: return 'text-red-400 bg-red-500/10 border-red-500/30';
      case TaskStatus.EDITING: return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case TaskStatus.DONE: return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getValue = (record: TaskManagementRecord, field: keyof TaskManagementRecord) => {
    return editingRecords[record.id]?.[field] ?? record[field];
  };

  const canEdit = (record: TaskManagementRecord) => {
    return isManager || record.assignedTo === currentUser?.id;
  };

  const approvedEditors = users.filter(u => u.role === UserRole.EDITOR && u.status === UserStatus.APPROVED);

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-2xl font-bold text-primary">Tasks Management</h2>

          {/* User Selector (Manager only) */}
          {isManager && (
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="bg-input border border-border px-4 py-2 rounded-lg text-sm font-medium text-primary hover:border-cyan-500 transition-colors"
            >
              <option value="all">All Users</option>
              {approvedEditors.map(user => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>
          )}
        </div>

        {isManager && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg transition-all text-sm font-bold shadow-lg"
            style={{
              backgroundColor: currentTheme.primary,
              color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            <Plus className="w-5 h-5" style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }} />
            <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>Create Task</span>
          </button>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-primary">Create New Task</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-hover rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Task Name *</label>
                <input
                  type="text"
                  value={newTask.taskName}
                  onChange={(e) => setNewTask({...newTask, taskName: e.target.value})}
                  className="w-full bg-input border border-border px-4 py-2 rounded-lg text-primary outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter task name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Assign User *</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                  className="w-full bg-input border border-border px-4 py-2 rounded-lg text-primary outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="">Select User</option>
                  {approvedEditors.map(user => (
                    <option key={user.id} value={user.id}>{user.username}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Deadline</label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                  className="w-full bg-input border border-border px-4 py-2 rounded-lg text-primary outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Status</label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({...newTask, status: e.target.value as TaskStatus})}
                  className="w-full bg-input border border-border px-4 py-2 rounded-lg text-primary outline-none focus:border-cyan-500 transition-colors"
                >
                  {Object.values(TaskStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Raw File Link</label>
                <input
                  type="url"
                  value={newTask.rawFileLink}
                  onChange={(e) => setNewTask({...newTask, rawFileLink: e.target.value})}
                  className="w-full bg-input border border-border px-4 py-2 rounded-lg text-primary outline-none focus:border-cyan-500 transition-colors"
                  placeholder="https://"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Edited File Link</label>
                <input
                  type="url"
                  value={newTask.editedFileLink}
                  onChange={(e) => setNewTask({...newTask, editedFileLink: e.target.value})}
                  className="w-full bg-input border border-border px-4 py-2 rounded-lg text-primary outline-none focus:border-cyan-500 transition-colors"
                  placeholder="https://"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-secondary hover:text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="px-6 py-2 font-bold rounded-lg transition-colors"
                style={{
                  backgroundColor: currentTheme.primary,
                  color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>Save Task</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      {taskTables.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center animate-fade-in">
          <div className="text-muted text-lg mb-4">No task tables yet</div>
          {isManager && (
            <div className="text-secondary text-sm">Click "New Table" to create your first task management table</div>
          )}
        </div>
      ) : selectedTable ? (
        <div className="w-full bg-card border border-border rounded-2xl overflow-hidden shadow-xl animate-slide-in">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-input text-muted text-xs font-bold uppercase tracking-wider border-b border-border">
                  <th className="px-4 py-4 w-24">Task #</th>
                  <th className="px-4 py-4 w-64">Task Name</th>
                  <th className="px-4 py-4 w-32">Deadline</th>
                  <th className="px-4 py-4 w-32">Status</th>
                  <th className="px-4 py-4 w-40">Raw File</th>
                  <th className="px-4 py-4 w-40">Edited File</th>
                  <th className="px-4 py-4 w-24 text-center">Approval</th>
                  <th className="px-4 py-4 w-32">Assignee</th>
                  {isManager && <th className="px-4 py-4 w-20 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleRecords.length === 0 ? (
                  <tr>
                    <td colSpan={isManager ? 9 : 8} className="px-4 py-12 text-center">
                      <div className="text-muted text-sm">
                        No tasks yet. {isManager && 'Click "Create Task" to add one.'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleRecords.map(record => (
                    <tr key={record.id} className="group hover:bg-hover transition-colors">
                      {/* Task Number */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-primary">{record.taskNumber}</span>
                      </td>

                      {/* Task Name */}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={getValue(record, 'taskName') as string}
                          onChange={(e) => handleFieldChange(record.id, 'taskName', e.target.value)}
                          className="w-full bg-transparent text-sm font-medium text-primary outline-none px-2 py-1 rounded hover:bg-input focus:bg-input border border-transparent focus:border-cyan-500"
                          disabled={!canEdit(record)}
                        />
                      </td>

                      {/* Deadline */}
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={getValue(record, 'deadline') as string}
                          onChange={(e) => handleFieldChange(record.id, 'deadline', e.target.value)}
                          className="w-full bg-input border border-border px-2 py-1 rounded text-sm text-primary outline-none hover:border-cyan-500 focus:border-cyan-500"
                          disabled={!canEdit(record)}
                        />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <select
                          value={getValue(record, 'status') as TaskStatus}
                          onChange={(e) => handleFieldChange(record.id, 'status', e.target.value)}
                          className={`w-full px-2 py-1 rounded text-xs font-medium border outline-none transition-all ${getStatusColor(getValue(record, 'status') as TaskStatus)}`}
                          disabled={!canEdit(record)}
                        >
                          {Object.values(TaskStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>

                      {/* Raw File Link */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="url"
                            value={getValue(record, 'rawFileLink') as string}
                            onChange={(e) => handleFieldChange(record.id, 'rawFileLink', e.target.value)}
                            className="flex-1 bg-transparent text-sm text-primary outline-none px-2 py-1 rounded hover:bg-input focus:bg-input border border-transparent focus:border-cyan-500"
                            placeholder="https://..."
                            disabled={!canEdit(record)}
                          />
                          {getValue(record, 'rawFileLink') && (
                            <a 
                              href={getValue(record, 'rawFileLink') as string} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="p-1 text-cyan-400 hover:text-cyan-300 flex-shrink-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Edited File Link */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="url"
                            value={getValue(record, 'editedFileLink') as string}
                            onChange={(e) => handleFieldChange(record.id, 'editedFileLink', e.target.value)}
                            className="flex-1 bg-transparent text-sm text-primary outline-none px-2 py-1 rounded hover:bg-input focus:bg-input border border-transparent focus:border-cyan-500"
                            placeholder="https://..."
                            disabled={!canEdit(record)}
                          />
                          {getValue(record, 'editedFileLink') && (
                            <a 
                              href={getValue(record, 'editedFileLink') as string} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="p-1 text-cyan-400 hover:text-cyan-300 flex-shrink-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Approval */}
                      <td className="px-4 py-3 text-center">
                        <label className="flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={getValue(record, 'approvalFromIdyll') as boolean}
                            onChange={(e) => handleFieldChange(record.id, 'approvalFromIdyll', e.target.checked)}
                            className="w-4 h-4 text-cyan-600 bg-input border-border rounded focus:ring-cyan-500"
                            disabled={!isManager}
                          />
                        </label>
                      </td>

                      {/* Assignee */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-cyan-500/10 rounded-full flex items-center justify-center text-xs font-bold text-cyan-400">
                            {users.find(u => u.id === record.assignedTo)?.username.charAt(0) || '?'}
                          </div>
                          <span className="text-xs text-secondary truncate">
                            {users.find(u => u.id === record.assignedTo)?.username || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      {isManager && (
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Save Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-8 right-8 z-50 animate-bounce-in">
          <button
            onClick={handleSaveChanges}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl shadow-2xl transition-all font-bold"
            style={{
              backgroundColor: currentTheme.primary,
              color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            <Save className="w-5 h-5" style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }} />
            <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>Save Changes</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SupabaseTasksView;


