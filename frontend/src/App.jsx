import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Register from './pages/Register';
import Blockchain from './pages/Blockchain';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Participants from './pages/Participants';
import ParticipantDetail from './pages/ParticipantDetail';
import Notifications from './pages/Notifications';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ConfirmDialogProvider } from './components/shared/ConfirmDialog';
import { ToastProvider } from './components/shared/Toast';
import ErrorBoundary from './components/shared/ErrorBoundary';

import { useThemeMode, ThemeModeContext } from './components/shared/ThemeModeContext';
import { SettingsProvider, useSettings } from './components/shared/SettingsContext';
import { clearAuthToken } from './utils/auth';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Instant scroll (not smooth) so screen-reader users land at the top of the
    // new route immediately and `prefers-reduced-motion` is respected.
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function AppContent() {
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  const { settings, loading: settingsLoading } = useSettings();

  useEffect(() => {
    if (!settingsLoading && settings['app.theme']) {
      const theme = settings['app.theme'];
      if (theme === 'light' || theme === 'dark') {
        setMode(theme);
        localStorage.setItem('theme', theme);
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      }
    }
  }, [settings, settingsLoading]);

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      if (typeof window !== 'undefined') {
        document.documentElement.setAttribute('data-theme', next);
      }
      return next;
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode);
    }
  }, [mode]);

  const handleLogout = () => {
    clearAuthToken();
    // Full page reload clears all in-memory SPA state; ProtectedRoute and the
    // API client will handle any subsequent requests as unauthenticated.
    window.location.assign('/login');
  };

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ErrorBoundary>
        <ConfirmDialogProvider>
          <ToastProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <a href="#main-content" className="skip-to-content">Skip to main content</a>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout handleLogout={handleLogout} />
                  </ProtectedRoute>
                }>
                  <Route index element={<Home />} />
                  <Route path="blockchain" element={
                    <ProtectedRoute><Blockchain /></ProtectedRoute>
                  } />
                  <Route path="verify" element={
                    <ProtectedRoute><Verify /></ProtectedRoute>
                  } />
                  <Route path="dashboard" element={
                    <ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedRoute><Profile /></ProtectedRoute>
                  } />
                  <Route path="settings" element={
                    <ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>
                  } />
                  <Route path="participants" element={
                    <ProtectedRoute allowedRoles={['admin']}><Participants /></ProtectedRoute>
                  } />
                  <Route path="participants/:participantId" element={
                    <ProtectedRoute allowedRoles={['admin']}><ParticipantDetail /></ProtectedRoute>
                  } />
                  <Route path="notifications" element={
                    <ProtectedRoute><Notifications /></ProtectedRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Router>
          </ToastProvider>
        </ConfirmDialogProvider>
      </ErrorBoundary>
    </ThemeModeContext.Provider>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;