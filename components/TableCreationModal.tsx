import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, DollarSign, Calendar, AlertCircle, Plus } from 'lucide-react';
import { useTheme, COLOR_THEMES } from '../lib/theme-context';
import { useSupabaseStore } from '../lib/supabase-store';
import { UserRole, UserStatus } from '../types';

interface TableCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tableData: {
    name: string;
    description?: string;
    budget?: number;
    assignedUsers?: string[];
    priority?: 'low' | 'medium' | 'high';
    deadline?: string;
  }) => Promise<void>;
  title: string;
  type: 'task' | 'payout';
}

const TableCreationModal: React.FC<TableCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  type
}) => {
  const { theme, colorTheme } = useTheme();
  const currentTheme = COLOR_THEMES[colorTheme];
  const { users } = useSupabaseStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    assignedUsers: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high',
    deadline: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Get approved editors for assignment
  const approvedEditors = users.filter(u => 
    u.role === UserRole.EDITOR && u.status === UserStatus.APPROVED
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        assignedUsers: formData.assignedUsers.length > 0 ? formData.assignedUsers : undefined,
        priority: formData.priority,
        deadline: formData.deadline || undefined
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        budget: '',
        assignedUsers: [],
        priority: 'medium',
        deadline: ''
      });
      onClose();
    } catch (error) {
      console.error('Error creating table:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedUsers: prev.assignedUsers.includes(userId)
        ? prev.assignedUsers.filter(id => id !== userId)
        : [...prev.assignedUsers, userId]
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return currentTheme.primary;
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999999] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="w-full max-w-2xl rounded-2xl shadow-2xl animate-bounce-in"
        style={{
          backgroundColor: theme === 'dark' 
            ? 'rgba(15, 23, 42, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${currentTheme.primary}30`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: `${currentTheme.primary}20` }}
        >
          <h2 
            className="text-2xl font-bold flex items-center gap-3"
            style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.primary}20` }}
            >
              <Plus 
                className="w-5 h-5"
                style={{ color: currentTheme.primary }}
              />
            </div>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              color: theme === 'dark' ? '#ffffff' : '#000000'
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Table Name */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme === 'dark' ? '#e2e8f0' : '#374151' }}
            >
              Table Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={`Enter ${type} table name`}
              className="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2"
              style={{
                backgroundColor: theme === 'dark' ? `${currentTheme.primary}10` : `${currentTheme.primary}05`,
                border: `2px solid ${currentTheme.primary}30`,
                color: theme === 'dark' ? '#ffffff' : '#000000',
                '--tw-ring-color': currentTheme.primary
              } as React.CSSProperties}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme === 'dark' ? '#e2e8f0' : '#374151' }}
            >
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this table's purpose"
              rows={3}
              className="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 resize-none"
              style={{
                backgroundColor: theme === 'dark' ? `${currentTheme.primary}10` : `${currentTheme.primary}05`,
                border: `2px solid ${currentTheme.primary}30`,
                color: theme === 'dark' ? '#ffffff' : '#000000',
                '--tw-ring-color': currentTheme.primary
              } as React.CSSProperties}
            />
          </div>

          {/* Budget and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Budget */}
            <div>
              <label 
                className="block text-sm font-medium mb-2 flex items-center gap-2"
                style={{ color: theme === 'dark' ? '#e2e8f0' : '#374151' }}
              >
                <DollarSign className="w-4 h-4" style={{ color: currentTheme.primary }} />
                Budget
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: theme === 'dark' ? `${currentTheme.primary}10` : `${currentTheme.primary}05`,
                  border: `2px solid ${currentTheme.primary}30`,
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  '--tw-ring-color': currentTheme.primary
                } as React.CSSProperties}
              />
            </div>

            {/* Priority */}
            <div>
              <label 
                className="block text-sm font-medium mb-2 flex items-center gap-2"
                style={{ color: theme === 'dark' ? '#e2e8f0' : '#374151' }}
              >
                <AlertCircle className="w-4 h-4" style={{ color: currentTheme.primary }} />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 appearance-none cursor-pointer"
                style={{
                  backgroundColor: theme === 'dark' ? `${currentTheme.primary}10` : `${currentTheme.primary}05`,
                  border: `2px solid ${currentTheme.primary}30`,
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  '--tw-ring-color': currentTheme.primary
                } as React.CSSProperties}
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label 
              className="block text-sm font-medium mb-2 flex items-center gap-2"
              style={{ color: theme === 'dark' ? '#e2e8f0' : '#374151' }}
            >
              <Calendar className="w-4 h-4" style={{ color: currentTheme.primary }} />
              Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2"
              style={{
                backgroundColor: theme === 'dark' ? `${currentTheme.primary}10` : `${currentTheme.primary}05`,
                border: `2px solid ${currentTheme.primary}30`,
                color: theme === 'dark' ? '#ffffff' : '#000000',
                '--tw-ring-color': currentTheme.primary
              } as React.CSSProperties}
            />
          </div>

          {/* Assigned Users */}
          <div>
            <label 
              className="block text-sm font-medium mb-2 flex items-center gap-2"
              style={{ color: theme === 'dark' ? '#e2e8f0' : '#374151' }}
            >
              <Users className="w-4 h-4" style={{ color: currentTheme.primary }} />
              Assign Users ({formData.assignedUsers.length} selected)
            </label>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 text-left flex items-center justify-between"
                style={{
                  backgroundColor: theme === 'dark' ? `${currentTheme.primary}10` : `${currentTheme.primary}05`,
                  border: `2px solid ${currentTheme.primary}30`,
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  '--tw-ring-color': currentTheme.primary
                } as React.CSSProperties}
              >
                <span>
                  {formData.assignedUsers.length === 0 
                    ? 'Select users to assign' 
                    : `${formData.assignedUsers.length} user${formData.assignedUsers.length > 1 ? 's' : ''} selected`
                  }
                </span>
                <svg 
                  className={`w-5 h-5 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserDropdown && (
                <div 
                  className="absolute top-full left-0 right-0 mt-2 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto"
                  style={{
                    backgroundColor: theme === 'dark' 
                      ? 'rgba(15, 23, 42, 0.95)' 
                      : 'rgba(255, 255, 255, 0.95)',
                    border: `1px solid ${currentTheme.primary}30`,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                >
                  {approvedEditors.length === 0 ? (
                    <div 
                      className="p-4 text-center text-sm"
                      style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}
                    >
                      No approved editors available
                    </div>
                  ) : (
                    approvedEditors.map(user => (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 p-3 hover:bg-opacity-50 cursor-pointer transition-all"
                        style={{
                          backgroundColor: formData.assignedUsers.includes(user.id) 
                            ? `${currentTheme.primary}20` 
                            : 'transparent'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: currentTheme.primary }}
                        />
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                            style={{ 
                              backgroundColor: `${currentTheme.primary}30`,
                              color: currentTheme.primary
                            }}
                          >
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div 
                              className="font-medium"
                              style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
                            >
                              {user.username}
                            </div>
                            <div 
                              className="text-xs"
                              style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}
                            >
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                color: theme === 'dark' ? '#ffffff' : '#000000'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || isSubmitting}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: currentTheme.primary,
                color: theme === 'dark' ? '#ffffff' : '#000000'
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default TableCreationModal;