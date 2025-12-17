import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // Assuming framer-motion is installed for animations

// Define the type for a toast message
interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warn';
}

// Define the shape of the context value
interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warn') => void;
}

// Create the context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Props for the ToastProvider
interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const TOAST_TIMEOUT = 3000; // 3 seconds

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warn' = 'info') => {
    const id = Date.now().toString();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  };

  // Effect to automatically remove toasts after a timeout
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prevToasts) => prevToasts.slice(1)); // Remove the oldest toast
      }, TOAST_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`p-4 rounded-lg shadow-lg text-white max-w-xs break-words ${
                toast.type === 'success' ? 'bg-green-500' :
                toast.type === 'error' ? 'bg-red-500' :
                toast.type === 'warn' ? 'bg-yellow-500' : // Added warning style
                'bg-blue-500'
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast functionality
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
