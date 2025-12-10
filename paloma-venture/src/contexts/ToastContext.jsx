import React, { createContext, useState, useContext, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

import './Style/ToastContext.css'; // Importa o CSS específico do Toast

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fecha o toast automaticamente após 3 segundos
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* O COMPONENTE VISUAL DO TOAST FICA AQUI MESMO */}
      <div className={`toast-container ${toast.show ? 'show' : ''} ${toast.type}`}>
        <div className="toast-content">
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{toast.message}</span>
        </div>
        <button onClick={closeToast} className="toast-close">
            <X size={16} />
        </button>
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};