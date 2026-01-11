import { create } from 'zustand';
import { Toast, ToastType } from '../components/Toast';

interface ToastState {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  showToast: (message: string, type: ToastType = 'info', duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
  },

  removeToast: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  },

  success: (message: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type: 'success', duration };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
  },

  error: (message: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type: 'error', duration };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
  },

  warning: (message: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type: 'warning', duration };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
  },

  info: (message: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type: 'info', duration };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
  },
}));

// Export convenience functions
export const toast = {
  success: (message: string, duration?: number) => useToastStore.getState().success(message, duration),
  error: (message: string, duration?: number) => useToastStore.getState().error(message, duration),
  warning: (message: string, duration?: number) => useToastStore.getState().warning(message, duration),
  info: (message: string, duration?: number) => useToastStore.getState().info(message, duration),
};
