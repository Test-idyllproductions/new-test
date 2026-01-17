import React, { useEffect, useState } from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { useDialog } from '../lib/dialog-context';
import { UserStatus } from '../types';
import { Clock, LogOut } from 'lucide-react';
import Logo from '../components/Logo';

const PendingView: React.FC = () => {
  const { currentUser, setView, users, setCurrentUser, signOut } = useSupabaseStore();
  const { showDialog } = useDialog();
  const [hasShownApprovalDialog, setHasShownApprovalDialog] = useState(false);
  const [hasShownRejectionDialog, setHasShownRejectionDialog] = useState(false);

  // Check approval status every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentUser) return;
      const me = users.find(u => u.id === currentUser.id);
      
      if (me && me.status === UserStatus.APPROVED && !hasShownApprovalDialog) {
        // Show approval dialog
        setHasShownApprovalDialog(true);
        showDialog({
          type: 'success',
          title: 'You are approved!',
          message: 'Thanks for joining Idyll Productions. Please refresh the page to access your dashboard.',
          actions: [
            { 
              label: 'Refresh Page', 
              onClick: () => window.location.reload(), 
              variant: 'primary' 
            }
          ]
        });
      } else if (me && me.status === UserStatus.REJECTED && !hasShownRejectionDialog) {
        // Show rejection dialog and sign out
        setHasShownRejectionDialog(true);
        showDialog({
          type: 'error',
          title: 'Application Not Approved',
          message: 'You are not approved. Please contact management for further information.',
          actions: [
            { 
              label: 'Back to Welcome', 
              onClick: async () => { 
                await signOut();
                setView('landing'); 
              }, 
              variant: 'primary' 
            }
          ]
        });
      }
    }, 3000); // Check every 3 seconds
    
    return () => clearInterval(interval);
  }, [currentUser, users, hasShownApprovalDialog, hasShownRejectionDialog, showDialog, setView, setCurrentUser, signOut]);

  const handleSignOut = async () => {
    await signOut();
    setView('landing');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center relative z-10 gradient-bg">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo */}
        <Logo size="lg" className="mx-auto mb-6" />
        
        <div className="w-20 h-20 bg-input border border-border rounded-3xl flex items-center justify-center mx-auto shadow-xl glow-border">
          <Clock className="w-10 h-10 text-cyan-500 animate-pulse" />
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-primary tracking-tight">
            Waiting for Approval
          </h2>
          <p className="text-secondary leading-relaxed max-w-md mx-auto">
            Your account is waiting for manager approval. You will be notified once your account has been reviewed.
          </p>
          <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl inline-block mt-4">
            <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest">Awaiting Management Approval</p>
          </div>
        </div>

        <div className="pt-8 space-y-4">
          <button 
            onClick={handleSignOut}
            className="inline-flex items-center space-x-2 text-slate-500 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold">Sign out and return to welcome</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingView;
