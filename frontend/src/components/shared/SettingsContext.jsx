import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../../services/api';

const SettingsContext = createContext({
  settings: {},
  loading: true,
  error: null,
  refresh: () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSettings = useCallback(async () => {
    try {
      setError(null);
      const res = await settingsAPI.list();
      const data = res.data || [];
      const map = data.reduce((acc, s) => { acc[s.key] = s.value; return acc; }, {});
      setSettings(map);
    } catch {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refresh: loadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
