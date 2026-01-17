import React, { useState } from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { useDialog } from '../lib/dialog-context';
import { UserRole, UserStatus } from '../types';
import { Shield, ShieldCheck, Mail, Trash2, Edit2 } from 'lucide-react';

const UserManagementView: React.FC = () => {
  const { users, currentUser, updateUser, deleteUser } = useSupabaseStore();
  const { showDialog } = useDialog();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>(UserRole.EDITOR);
  const [editStatus, setEditStatus] = useState<UserStatus>(UserStatus.PENDING);

  const handleEditClick = (userId: string, currentRole: UserRole, currentStatus: UserStatus) => {
    setEditingUser(userId);
    setEditRole(currentRole);
    setEditStatus(currentStatus);
  };

  const handleSaveEdit = async (userId: string) => {
    try {
      await updateUser(userId, { role: editRole, status: editStatus });
      setEditingUser(null);
      showDialog({
        type: 'success',
        title: 'User Updated',
        message: 'User role and status have been updated successfully.',
        actions: [{ label: 'OK', onClick: () => {}, variant: 'primary' }]
      });
    } catch (error) {
      showDialog({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update user. Please try again.',
        actions: [{ label: 'OK', onClick: () => {}, variant: 'primary' }]
      });
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    showDialog({
      type: 'warning',
      title: 'Delete User',
      message: `Are you sure you want to delete ${username}? This will remove all their data.`,
      actions: [
        { 
          label: 'Delete', 
          onClick: async () => {
            await deleteUser(userId);
            showDialog({
              type: 'success',
              title: 'User Deleted',
              message: `${username} has been deleted.`,
              actions: [{ label: 'OK', onClick: () => {}, variant: 'primary' }]
            });
          }, 
          variant: 'danger' 
        },
        { label: 'Cancel', onClick: () => {}, variant: 'secondary' }
      ]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Internal Directory</h2>
        <div className="text-xs text-muted font-medium">Total Users: {users.length}</div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl glow-border">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-input text-muted text-[10px] font-bold uppercase tracking-widest border-b border-border">
              <th className="px-6 py-4">Identity</th>
              <th className="px-4 py-4">Role</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-input border border-border flex items-center justify-center text-cyan-400 font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">{user.username}</p>
                      <div className="flex items-center text-xs text-muted">
                        <Mail className="w-3 h-3 mr-1" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {editingUser === user.id ? (
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as UserRole)}
                      className="px-2 py-1 bg-input border border-border rounded text-sm text-primary"
                    >
                      <option value={UserRole.EDITOR}>EDITOR</option>
                      <option value={UserRole.MANAGER}>MANAGER</option>
                    </select>
                  ) : (
                    <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border ${
                      user.role === UserRole.MANAGER 
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                      : 'bg-input text-secondary border-border'
                    }`}>
                      {user.role === UserRole.MANAGER ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest">{user.role}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  {editingUser === user.id ? (
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as UserStatus)}
                      className="px-2 py-1 bg-input border border-border rounded text-sm text-primary"
                    >
                      <option value={UserStatus.PENDING}>PENDING</option>
                      <option value={UserStatus.APPROVED}>APPROVED</option>
                      <option value={UserStatus.REJECTED}>REJECTED</option>
                    </select>
                  ) : (
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                      user.status === UserStatus.APPROVED 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : user.status === UserStatus.REJECTED
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {user.status}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  {user.id !== currentUser?.id && (
                    <div className="flex items-center justify-end space-x-2">
                      {editingUser === user.id ? (
                        <>
                          <button 
                            onClick={() => handleSaveEdit(user.id)}
                            className="px-3 py-1 text-xs font-bold rounded transition-all"
                            style={{
                              backgroundColor: '#10b981', // emerald-600
                              color: '#ffffff !important'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#059669'; // emerald-700
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#10b981';
                            }}
                          >
                            <span style={{ color: '#ffffff !important' }}>Save</span>
                          </button>
                          <button 
                            onClick={() => setEditingUser(null)}
                            className="px-3 py-1 text-xs font-bold rounded transition-all"
                            style={{
                              backgroundColor: '#475569', // slate-600
                              color: '#ffffff !important'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#334155'; // slate-700
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#475569';
                            }}
                          >
                            <span style={{ color: '#ffffff !important' }}>Cancel</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEditClick(user.id, user.role, user.status)}
                            className="p-2 text-muted hover:text-cyan-500 hover:bg-hover rounded-lg transition-all"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementView;
