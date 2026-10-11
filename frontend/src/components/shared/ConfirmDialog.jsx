import { useState, createContext, useContext, useCallback, useRef, useEffect } from 'react';

const ConfirmDialogContext = createContext({
  confirm: () => Promise.resolve(false),
});

export function ConfirmDialogProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    title: '',
    content: '',
    resolve: null,
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    confirmColor: 'error',
  });
  const confirmRef = useRef(null);
  const cancelRef = useRef(null);
  const resolveRef = useRef(null);
  const triggerRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      // Remember the element that opened the dialog so we can restore focus.
      triggerRef.current = document.activeElement;
      resolveRef.current = resolve;
      setState({
        open: true,
        title: options.title || 'Are you sure?',
        content: options.content || 'This action cannot be undone.',
        confirmLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        confirmColor: options.confirmColor || 'error',
      });
    });
  }, []);

  const handleConfirm = () => {
    setState((s) => ({ ...s, open: false }));
    if (resolveRef.current) resolveRef.current(true);
  };

  const handleCancel = () => {
    setState((s) => ({ ...s, open: false }));
    if (resolveRef.current) resolveRef.current(false);
  };

  // Initial focus + Escape-to-cancel + focus restoration on close.
  useEffect(() => {
    if (state.open && cancelRef.current) {
      cancelRef.current.focus();
    }
  }, [state.open]);

  useEffect(() => {
    if (!state.open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [state.open]);

  useEffect(() => {
    if (!state.open && triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [state.open]);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {state.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-content">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700">
            <h3 id="confirm-dialog-title" className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-3">
              {state.title}
            </h3>
            <p id="confirm-dialog-content" className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              {state.content}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                ref={cancelRef}
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {state.cancelLabel}
              </button>
              <button
                ref={confirmRef}
                onClick={handleConfirm}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                  ${state.confirmColor === 'error'
                    ? 'bg-red-500 hover:bg-red-600'
                    : state.confirmColor === 'success'
                      ? 'bg-green-500 hover:bg-green-600'
                      : state.confirmColor === 'warning'
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'bg-indigo-500 hover:bg-indigo-600'
                  } transition-colors`}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmDialogContext);
}

export function ConfirmButton({ onConfirm, children, ...props }) {
  const { confirm } = useConfirm();

  const handleClick = async (e) => {
    if (props.onClick) {
      props.onClick?.(e);
    }
    if (onConfirm) {
      const result = await confirm({
        title: props.confirmTitle || 'Confirm Action',
        content: props.confirmContent || 'Are you sure you want to proceed?',
        confirmLabel: props.confirmLabel || 'Confirm',
        cancelLabel: props.cancelLabel || 'Cancel',
        confirmColor: props.confirmColor || 'error',
      });
      if (result) onConfirm(e);
    }
  };

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
}