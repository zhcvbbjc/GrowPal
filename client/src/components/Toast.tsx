import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, X, Loader2 } from '../pages/Icons';

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    loading: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = 'info', duration?: number) => {
            const id = Math.random().toString(36).substr(2, 9);
            const newToast: Toast = {
                id,
                type,
                message,
                duration: type === 'loading' ? undefined : duration || 3000,
            };

            setToasts((prev) => [...prev, newToast]);

            if (newToast.duration) {
                setTimeout(() => removeToast(id), newToast.duration);
            }
        },
        [removeToast]
    );

    const success = useCallback((msg: string, dur?: number) => showToast(msg, 'success', dur), [showToast]);
    const error = useCallback((msg: string, dur?: number) => showToast(msg, 'error', dur), [showToast]);
    const info = useCallback((msg: string, dur?: number) => showToast(msg, 'info', dur), [showToast]);
    const loading = useCallback((msg: string) => showToast(msg, 'loading'), [showToast]);

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'loading':
                return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
            default:
                return <AlertCircle className="w-5 h-5 text-primary" />;
        }
    };

    const getBgColor = (type: ToastType) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'loading':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-white border-gray-200';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, success, error, info, loading }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.8 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border ${getBgColor(
                                toast.type
                            )}`}
                        >
                            {getIcon(toast.type)}
                            <p className="flex-1 text-sm font-medium text-gray-800">{toast.message}</p>
                            <button
                                type="button"
                                onClick={() => removeToast(toast.id)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
