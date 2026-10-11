import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { useSettings } from './SettingsContext';

const ToastContext = createContext({
  toast: (options) => {},
  success: (message) => {},
  error: (message) => {},
  warning: (message) => {},
  info: (message) => {},
});

export function ToastProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState({
    message: '',
    severity: 'info',
    autoHideDuration: 4000,
    // Monotonic id used to reset the auto-hide timer when a new toast appears.
    id: 0,
  });
  const { settings, loading: settingsLoading } = useSettings();
  const notificationsEnabled = !settingsLoading && settings['enable.notifications'] !== 'false';

  const toast = useCallback(({ message, severity = 'info', autoHideDuration = 4000 }) => {
    if (!notificationsEnabled && severity !== 'error') return;
    setOptions({ message, severity, autoHideDuration, id: Date.now() });
    setOpen(true);
  }, [notificationsEnabled]);

  const success = useCallback((message) => {
    toast({ message, severity: 'success' });
  }, [toast]);

  const error = useCallback((message) => {
    toast({ message, severity: 'error', autoHideDuration: 6000 });
  }, [toast]);

  const warning = useCallback((message) => {
    toast({ message, severity: 'warning', autoHideDuration: 5000 });
  }, [toast]);

  const info = useCallback((message) => {
    toast({ message, severity: 'info' });
  }, [toast]);

  const closeToast = useCallback(() => setOpen(false), []);

  // Auto-hide the toast after `autoHideDuration`; the timer resets whenever a
  // new toast (`id`) is shown and is cleared on unmount/close.
  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(closeToast, options.autoHideDuration);
    return () => clearTimeout(timer);
  }, [open, options.id, options.autoHideDuration, closeToast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {open && notificationsEnabled && (
        <div className="fixed top-4 right-4 z-[100] max-w-sm w-full" role="status" aria-live="polite" aria-atomic="true">
          <div className={`rounded-xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-black/20 border transition-all duration-300
            ${options.severity === 'error' ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' :
              options.severity === 'success' ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20' :
                options.severity === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' :
                  'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20'
            }`}>
            <div className="flex items-start gap-3">
              {options.severity === 'error' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
              {options.severity === 'success' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              {options.severity === 'warning' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
              {(options.severity === 'info' || options.severity === 'default') && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 flex-1">
                {options.message}
              </p>
              <button onClick={closeToast} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0" aria-label="Close notification">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}