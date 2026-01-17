import React, { useState, useEffect } from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { useDialog } from '../lib/dialog-context';
import { useTheme, COLOR_THEMES } from '../lib/theme-context';
import { UserRole, PayoutStatus, PayoutRecord, UserStatus } from '../types';
import { Plus, DollarSign, ExternalLink, Save, X, Trash2 } from 'lucide-react';

const PayoutsView: React.FC = () => {
  // VERSION: 2025-01-14-16:05 - FORCE RELOAD
  const { 
    currentUser, users, payoutTables, payoutRecords,
    createPayoutTable, deletePayoutTable, addPayoutRecord, updatePayoutRecord, deletePayoutRecord
  } = useSupabaseStore();
  const { showDialog } = useDialog();
  const { theme, colorTheme } = useTheme();
  const currentTheme = COLOR_THEMES[colorTheme];
  
  const isManager = currentUser?.role === UserRole.MANAGER;
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [editingRecords, setEditingRecords] = useState<Record<string, Partial<PayoutRecord>>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Create Payout Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPayout, setNewPayout] = useState({
    projectName: '',
    projectLink: '',
    amount: 0,
    status: PayoutStatus.PENDING,
    assignedTo: ''
  });

  // Initialize selectedTableId
  useEffect(() => {
    if (payoutTables.length > 0 && !selectedTableId) {
      setSelectedTableId(payoutTables[0].id);
    }
  }, [payoutTables, selectedTableId]);

  const selectedTable = payoutTables.find(t => t.id === selectedTableId);
  const tableRecords = payoutRecords.filter(r => r.tableId === selectedTableId);

  // Filter records based on user selection and role
  const visibleRecords = (() => {
    let filtered = tableRecords;
    
    if (!isManager) {
      // Editors only see their own payouts
      filtered = filtered.filter(record => record.assignedTo === currentUser?.id);
    } else if (selectedUserId !== 'all') {
      // Manager viewing specific user's payouts
      filtered = filtered.filter(record => record.assignedTo === selectedUserId);
    }
    
    return filtered;
  })();

  const handleCreateTable = async () => {
    if (newTableName.trim()) {
      try {
        const newTableId = await createPayoutTable(newTableName.trim());
        setSelectedTableId(newTableId);
        setNewTableName('');
        setIsCreatingTable(false);
      } catch (error) {
        console.error('Error creating table:', error);
      }
    }
  };

  const handleCreatePayout = async () => {
    if (!selectedTable || !newPayout.projectName || !newPayout.assignedTo) {
      showDialog({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please fill in Project Name and Assign User'
      });
      return;
    }
    
    const payoutData: Omit<PayoutRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
      tableId: selectedTableId,
      projectName: newPayout.projectName,
      projectLink: newPayout.projectLink,
      amount: newPayout.amount,
      status: newPayout.status,
      assignedTo: newPayout.assignedTo
    };
    
    try {
      await addPayoutRecord(selectedTableId, payoutData);
      setShowCreateModal(false);
      setNewPayout({
        projectName: '',
        projectLink: '',
        amount: 0,
        status: PayoutStatus.PENDING,
        assignedTo: ''
      });
    } catch (error: any) {
      console.error('Error creating payout:', error);
      showDialog({
        type: 'error',
        title: 'Failed to Create Payout',
        message: error.message || 'Failed to create payout. Please try again.'
      });
    }
  };

  const handleFieldChange = (recordId: string, field: keyof PayoutRecord, value: any) => {
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
        await updatePayoutRecord(recordId, updates);
      }
      setEditingRecords({});
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this payout record?')) {
      try {
        await deletePayoutRecord(recordId);
      } catch (error: any) {
        console.error('Error deleting payout:', error);
        showDialog({
          type: 'error',
          title: 'Failed to Delete Payout',
          message: error.message || 'Failed to delete payout. Please try again.'
        });
      }
    }
  };

  const getStatusColor = (status: PayoutStatus) => {
    switch (status) {
      case PayoutStatus.PENDING: return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case PayoutStatus.DONE: return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getValue = (record: PayoutRecord, field: keyof PayoutRecord) => {
    return editingRecords[record.id]?.[field] ?? record[field];
  };

  const canEdit = (record: PayoutRecord) => {
    return isManager;
  };

  const approvedEditors = users.filter(u => u.role === UserRole.EDITOR && u.status === UserStatus.APPROVED);

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-2xl font-bold text-primary">Payout Management</h2>
          
          {/* Table Selector */}
          {payoutTables.length > 0 && (
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="bg-input border border-border px-4 py-2 rounded-lg text-sm font-medium text-primary hover:border-cyan-500 transition-colors"
            >
              {payoutTables.map(table => (
                <option key={table.id} value={table.id}>{table.name}</option>
              ))}
            </select>
          )}

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

          {isManager && (
            <>
              {isCreatingTable ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTable()}
                    placeholder="Table name..."
                    className="bg-input border border-cyan-500 px-3 py-2 rounded-lg text-sm text-primary outline-none"
                    autoFocus
                  />
                  <button 
                    onClick={handleCreateTable} 
                    className="p-2 rounded-lg transition-colors"
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
                    <Save className="w-4 h-4" style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }} />
                  </button>
                  <button onClick={() => setIsCreatingTable(false)} className="p-2 bg-input hover:bg-hover rounded-lg transition-colors">
                    <X className="w-4 h-4 text-secondary" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreatingTable(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-input hover:bg-hover border border-border text-primary rounded-lg transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Table</span>
                </button>
              )}
            </>
          )}
        </div>

        {isManager && selectedTable && (
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
            <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>Create Payout</span>
          </button>
        )}
      </div>

      {/* Create Payout Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-primary">Create New Payout</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-hover rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Project Name *</label>
                <input
                  type="text"
                  value={newPayout.projectName}
                  onChange={(e) => setNewPayout({...newPayout, projectName: e.target.value})}
                  className="w-full bg-input border border-border px-4 py-2 rounded-lg text-primary outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Assign User *</label>
                <select
                  value={newPayout.assignedTo}
                  onChange={(e) => setNewPayout({...newPayout, assignedTo: e.target.value})}
                  className="w-full bg-input border border-border px-4 py-2 rounded-lg text-primary outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="">Select User</option>
                  {approvedEditors.map(user => (
                    <option key={user.id} value={user.id}>{user.username}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Project Link</label>
                <input
                  type="url"
                  value={newPayout.projectLink}
                  onChange={(e) => setNewPayout({...newPayout, projectLink: e.target.value})}
                  className="w-full bg-input border border-border px-4 py-2 rounded-lg text-primary outline-none focus:border-cyan-500 transition-colors"
                  placeholder="https://"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Amount</label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-muted" />
                  <input
                    type="number"
                    value={newPayout.amount}
                    onChange={(e) => setNewPayout({...newPayout, amount: parseFloat(e.target.value) || 0})}
                    className="flex-1 bg-input border border-border px-4 py-2 rounded-lg text-primary outline-none focus:border-cyan-500 transition-colors"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Status</label>
                <select
                  value={newPayout.status}
                  onChange={(e) => setNewPayout({...newPayout, status: e.target.value as PayoutStatus})}
                  className="w-full bg-input border border-border px-4 py-2 rounded-lg text-primary outline-none focus:border-cyan-500 transition-colors"
                >
                  {Object.values(PayoutStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
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
                onClick={handleCreatePayout}
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
                <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>Save Payout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payouts Table */}
      {payoutTables.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center animate-fade-in">
          <div className="text-muted text-lg mb-4">No payout tables yet</div>
          {isManager && (
            <div className="text-secondary text-sm">Click "New Table" to create your first payout table</div>
          )}
        </div>
      ) : selectedTable ? (
        <div className="w-full bg-card border border-border rounded-2xl overflow-hidden shadow-xl animate-slide-in">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-input text-muted text-xs font-bold uppercase tracking-wider border-b border-border">
                  <th className="px-4 py-4 w-64">Project Name</th>
                  <th className="px-4 py-4 w-48">Project Link</th>
                  <th className="px-4 py-4 w-32">Amount</th>
                  <th className="px-4 py-4 w-32">Status</th>
                  <th className="px-4 py-4 w-32">Assignee</th>
                  {isManager && <th className="px-4 py-4 w-20 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleRecords.length === 0 ? (
                  <tr>
                    <td colSpan={isManager ? 6 : 5} className="px-4 py-12 text-center">
                      <div className="text-muted text-sm">
                        No payout records yet. {isManager && 'Click "Create Payout" to add one.'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleRecords.map(record => (
                    <tr key={record.id} className="group hover:bg-hover transition-colors">
                      {/* Project Name */}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={getValue(record, 'projectName') as string}
                          onChange={(e) => handleFieldChange(record.id, 'projectName', e.target.value)}
                          className="w-full bg-transparent text-sm font-medium text-primary outline-none px-2 py-1 rounded hover:bg-input focus:bg-input border border-transparent focus:border-cyan-500"
                          disabled={!canEdit(record)}
                        />
                      </td>

                      {/* Project Link */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="url"
                            value={getValue(record, 'projectLink') as string}
                            onChange={(e) => handleFieldChange(record.id, 'projectLink', e.target.value)}
                            className="flex-1 bg-transparent text-sm text-primary outline-none px-2 py-1 rounded hover:bg-input focus:bg-input border border-transparent focus:border-cyan-500"
                            placeholder="https://..."
                            disabled={!canEdit(record)}
                          />
                          {getValue(record, 'projectLink') && (
                            <a 
                              href={getValue(record, 'projectLink') as string} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="p-1 text-cyan-400 hover:text-cyan-300 flex-shrink-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <input
                            type="number"
                            value={getValue(record, 'amount') as number}
                            onChange={(e) => handleFieldChange(record.id, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent text-sm font-mono font-bold text-green-400 outline-none px-2 py-1 rounded hover:bg-input focus:bg-input border border-transparent focus:border-cyan-500"
                            disabled={!canEdit(record)}
                            step="0.01"
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <select
                          value={getValue(record, 'status') as PayoutStatus}
                          onChange={(e) => handleFieldChange(record.id, 'status', e.target.value)}
                          className={`w-full px-2 py-1 rounded text-xs font-medium border outline-none transition-all ${getStatusColor(getValue(record, 'status') as PayoutStatus)}`}
                          disabled={!isManager}
                        >
                          {Object.values(PayoutStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>

                      {/* Assignee */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center text-xs font-bold text-green-400">
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
                            title="Delete payout"
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

export default PayoutsView;
