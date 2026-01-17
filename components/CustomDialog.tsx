import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type DialogType = 'success' | 'error' | 'warning' | 'info';

export interface DialogAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface CustomDialogProps {
  type: DialogType;
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  actions?: DialogAction[];
}

const CustomDialog: React.FC<CustomDialogProps> = ({
  type,
  title,
  message,
  isOpen,
  onClose,
  actions
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-yellow-400" />;
      case 'info':
        return <Info className="w-12 h-12 text-cyan-400" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'info':
        return 'border-cyan-500/30 bg-cyan-500/5';
    }
  };

  const getButtonVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-cyan-600 hover:bg-cyan-500 text-white';
      case 'danger':
        return 'bg-red-600 hover:bg-red-500 text-white';
      case 'secondary':
      default:
        return 'bg-slate-700 hover:bg-slate-600 text-slate-200';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Dialog */}
      <div 
        className={`relative bg-slate-900 border ${getColorClasses()} rounded-2xl shadow-2xl max-w-md w-full animate-slide-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-slate-300 leading-relaxed mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            {actions && actions.length > 0 ? (
              actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    onClose();
                  }}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-colors ${getButtonVariantClasses(action.variant)}`}
                >
                  {action.label}
                </button>
              ))
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-colors"
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDialog;
