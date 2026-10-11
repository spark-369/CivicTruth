import { useContext, createContext } from 'react';

const ThemeModeContext = createContext({
  mode: 'light',
  toggleMode: () => {},
});

export { ThemeModeContext };

export function useThemeMode() {
  return useContext(ThemeModeContext);
}