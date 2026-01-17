import React, { useState, useRef, useEffect } from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { useDialog } from '../lib/dialog-context';
import { UserRole, UserStatus } from '../types';

const TempIcons: React.FC = () => {
  const { setView, signOut, currentView, currentUser, users, setCurrentUser } = useSupabaseStore();
  const { showDialog } = useDialog();
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('drag-handle')) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        setIsDragging(true);
        e.preventDefault();
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Direct navigation handlers - NO DELAYS, NO TIMEOUTS
  const goToLanding = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('GO TO LANDING');
    // Clear current user and go to landing
    setCurrentUser(null);
    setView('landing');
  };

  const goToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('GO TO LOGIN');
    // Clear current user and go to login
    setCurrentUser(null);
    setView('login');
  };

  const goToSignup = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('GO TO SIGNUP');
    // Clear current user and go to signup
    setCurrentUser(null);
    setView('signup');
  };

  const goToPending = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('GO TO PENDING');
    // Find a pending user or use first editor as pending
    const pendingUser = users.find(u => u.status === UserStatus.PENDING);
    if (pendingUser) {
      setCurrentUser(pendingUser);
    } else {
      // Create a temporary pending user for demo
      const editorUser = users.find(u => u.role === UserRole.EDITOR && u.status === UserStatus.APPROVED);
      if (editorUser) {
        setCurrentUser({ ...editorUser, status: UserStatus.PENDING });
      }
    }
    setView('pending');
  };

  const goToEditor = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('GO TO EDITOR HOME', 'Users loaded:', users.length);
    
    const editorUser = users.find(u => u.role === UserRole.EDITOR && u.status === UserStatus.APPROVED);
    if (!editorUser) {
      console.error('No approved editor found. Users:', users);
      showDialog({
        type: 'error',
        title: 'No Editor Found',
        message: `No approved editor users found in database.\n\nCurrent users loaded: ${users.length}\n\nTo fix this:\n1. Go to Supabase Dashboard → Authentication → Users\n2. Create a user with email: editor@idyll.com\n3. Then run in SQL Editor:\n   UPDATE public.users SET status = 'APPROVED', role = 'EDITOR' WHERE email = 'editor@idyll.com';\n4. Refresh this page`
      });
      return;
    }
    
    console.log('Switching to editor:', editorUser);
    setCurrentUser(editorUser);
    setView('home');
  };

  const goToManager = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('GO TO MANAGER TASKS', 'Users loaded:', users.length);
    
    const managerUser = users.find(u => u.role === UserRole.MANAGER && u.status === UserStatus.APPROVED);
    if (!managerUser) {
      console.error('No approved manager found. Users:', users);
      showDialog({
        type: 'error',
        title: 'No Manager Found',
        message: `No approved manager users found in database.\n\nCurrent users loaded: ${users.length}\n\nTo fix this:\n1. Go to Supabase Dashboard → Authentication → Users\n2. Create a user with email: manager@idyll.com\n3. Then run in SQL Editor:\n   UPDATE public.users SET status = 'APPROVED', role = 'MANAGER' WHERE email = 'manager@idyll.com';\n4. Refresh this page`
      });
      return;
    }
    
    console.log('Switching to manager:', managerUser);
    setCurrentUser(managerUser);
    setView('tasks');
  };

  return (
    <div
      ref={containerRef}
      className="fixed z-[999999]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        pointerEvents: 'auto',
        isolation: 'isolate'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex flex-col gap-2 p-3 bg-slate-900 backdrop-blur-md border-2 border-cyan-500 rounded-xl shadow-2xl min-w-[200px]">
        <div 
          className="drag-handle w-full text-center text-[10px] text-cyan-400 font-bold uppercase tracking-wider py-2 cursor-move hover:bg-cyan-500/10 rounded transition-colors border border-cyan-500/30"
        >
          🎮 TEMP NAV v2.0 (DRAG)
        </div>
        
        {/* Debug Info */}
        <div className="text-[9px] text-slate-400 px-2 py-1 bg-slate-800/50 rounded">
          Users loaded: {users.length} | 
          Editors: {users.filter(u => u.role === UserRole.EDITOR && u.status === UserStatus.APPROVED).length} | 
          Managers: {users.filter(u => u.role === UserRole.MANAGER && u.status === UserStatus.APPROVED).length}
        </div>
        
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={goToLanding}
            onMouseDown={(e) => e.stopPropagation()}
            className={`w-full px-3 py-2 text-[11px] font-bold rounded transition-all duration-200 cursor-pointer border-2 ${
              currentView === 'landing'
                ? 'bg-cyan-600 text-white shadow-lg border-cyan-400' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700 hover:border-cyan-500/50'
            }`}
          >
            🏠 Welcome
          </button>

          <button
            type="button"
            onClick={goToLogin}
            onMouseDown={(e) => e.stopPropagation()}
            className={`w-full px-3 py-2 text-[11px] font-bold rounded transition-all duration-200 cursor-pointer border-2 ${
              currentView === 'login'
                ? 'bg-cyan-600 text-white shadow-lg border-cyan-400' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700 hover:border-cyan-500/50'
            }`}
          >
            🔑 Login
          </button>

          <button
            type="button"
            onClick={goToSignup}
            onMouseDown={(e) => e.stopPropagation()}
            className={`w-full px-3 py-2 text-[11px] font-bold rounded transition-all duration-200 cursor-pointer border-2 ${
              currentView === 'signup'
                ? 'bg-cyan-600 text-white shadow-lg border-cyan-400' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700 hover:border-cyan-500/50'
            }`}
          >
            📝 Signup
          </button>

          <button
            type="button"
            onClick={goToPending}
            onMouseDown={(e) => e.stopPropagation()}
            className={`w-full px-3 py-2 text-[11px] font-bold rounded transition-all duration-200 cursor-pointer border-2 ${
              currentView === 'pending'
                ? 'bg-cyan-600 text-white shadow-lg border-cyan-400' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700 hover:border-cyan-500/50'
            }`}
          >
            ⏳ Approval
          </button>

          <button
            type="button"
            onClick={goToEditor}
            onMouseDown={(e) => e.stopPropagation()}
            className={`w-full px-3 py-2 text-[11px] font-bold rounded transition-all duration-200 cursor-pointer border-2 ${
              currentView === 'home' && currentUser?.role === UserRole.EDITOR
                ? 'bg-cyan-600 text-white shadow-lg border-cyan-400' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700 hover:border-cyan-500/50'
            }`}
          >
            📊 Editor Home
          </button>

          <button
            type="button"
            onClick={goToManager}
            onMouseDown={(e) => e.stopPropagation()}
            className={`w-full px-3 py-2 text-[11px] font-bold rounded transition-all duration-200 cursor-pointer border-2 ${
              currentView === 'tasks' && currentUser?.role === UserRole.MANAGER
                ? 'bg-cyan-600 text-white shadow-lg border-cyan-400' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700 hover:border-cyan-500/50'
            }`}
          >
            👔 Manager Tasks
          </button>
        </div>
      </div>
    </div>
  );
};

export default TempIcons;