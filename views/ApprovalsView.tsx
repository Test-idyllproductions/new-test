import React, { useState } from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { useDialog } from '../lib/dialog-context';
import { UserStatus } from '../types';
import { Check, X, User as UserIcon } from 'lucide-react';

const ApprovalsView: React.FC = () => {
  const { users, updateUser } = useSupabaseStore();
  const { showDialog } = useDialog();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const pendingUsers = users.filter(u => u.status === UserStatus.PENDING);

  const handleApproval = async (id: string, status: UserStatus) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    setProcessingId(id);
    
    try {
      await updateUser(id, { status });
      
      if (status === UserStatus.APPROVED) {
        showDialog({
          type: 'success',
          title: 'User Approved',
          message: `${user.username} has been approved and can now access the Editor Dashboard.`,
          actions: [{ label: 'OK', onClick: () => {}, variant: 'primary' }]
        });
      } else {
        showDialog({
          type: 'error',
          title: 'User Rejected',
          message: `${user.username} has been rejected and will be redirected to the Welcome page.`,
          actions: [{ label: 'OK', onClick: () => {}, variant: 'primary' }]
        });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      showDialog({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update user status. Please try again.',
        actions: [{ label: 'OK', onClick: () => {}, variant: 'primary' }]
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Pending Approvals</h2>
        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold border border-amber-500/20">
          {pendingUsers.length} Requests
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingUsers.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-500 italic">No pending applications at this time.</p>
          </div>
        ) : (
          pendingUsers.map(user => (
            <div key={user.id} className="bg-slate-900/60 border border-slate-800/50 p-6 rounded-2xl flex items-center justify-between shadow-xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
                  <UserIcon className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{user.username}</h4>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => handleApproval(user.id, UserStatus.APPROVED)}
                  disabled={processingId === user.id}
                  className="p-3 bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId === user.id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                </button>
                <button 
                  onClick={() => handleApproval(user.id, UserStatus.REJECTED)}
                  disabled={processingId === user.id}
                  className="p-3 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId === user.id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApprovalsView;
