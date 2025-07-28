// src/components/ToastModule.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, visible, onHide }) => {
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div 
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        transition-all duration-300 ease-in-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      <div className="bg-pink-100 border border-pink-200 text-pink-900 px-6 py-3 rounded-md shadow-lg">
        {message}
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setIsVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast 
        message={toastMessage} 
        visible={isVisible} 
        onHide={hideToast} 
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastModule = {
  Provider: ToastProvider,
  useToast
};

export default ToastModule;