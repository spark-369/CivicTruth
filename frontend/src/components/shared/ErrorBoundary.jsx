import { Component } from 'react';

// Show raw error details only in development builds; production users should
// never see internal error messages or stack traces.
const isDev = import.meta.env?.DEV === true;

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log locally; wire this to an error-reporting service in production.
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-start sm:items-center justify-center p-4 sm:p-6 bg-gray-50 dark:bg-gray-900" role="alert" aria-live="assertive">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-10 text-center max-w-md w-full rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 leading-relaxed">
              We have been notified of this issue. Please try reloading the page. If the problem persists, contact support.
            </p>
            {isDev && this.state.error && (
              <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl p-3 mb-6 text-left font-mono text-[0.75rem] text-red-600 dark:text-red-400 overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="px-6 py-3 bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-500/30 hover:bg-indigo-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;