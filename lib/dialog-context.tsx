import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomDialog, { DialogType, DialogAction } from '../components/CustomDialog';

interface DialogConfig {
  type: DialogType;
  title: string;
  message: string;
  actions?: DialogAction[];
}

interface DialogContextType {
  showDialog: (config: DialogConfig) => void;
  hideDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showDialog = useCallback((config: DialogConfig) => {
    setDialogConfig(config);
    setIsOpen(true);
  }, []);

  const hideDialog = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setDialogConfig(null), 300); // Wait for animation
  }, []);

  return (
    <DialogContext.Provider value={{ showDialog, hideDialog }}>
      {children}
      {dialogConfig && (
        <CustomDialog
          type={dialogConfig.type}
          title={dialogConfig.title}
          message={dialogConfig.message}
          isOpen={isOpen}
          onClose={hideDialog}
          actions={dialogConfig.actions}
        />
      )}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within DialogProvider');
  }
  return context;
};
