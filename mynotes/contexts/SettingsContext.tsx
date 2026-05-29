import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface Settings {
  currency: string;
  theme: ThemeMode;
  tabColor: string;
}

interface SettingsContextType {
  settings: Settings;
  setCurrency: (code: string) => void;
  setTheme: (mode: ThemeMode) => void;
  setTabColor: (color: string) => void;
  resolvedTheme: 'light' | 'dark';
}

const defaults: Settings = { currency: 'IDR', theme: 'system', tabColor: '#6366F1' };

const SettingsContext = createContext<SettingsContextType>({
  settings: defaults,
  setCurrency: () => {},
  setTheme: () => {},
  setTabColor: () => {},
  resolvedTheme: 'light',
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [settings, setSettings] = useState<Settings>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@settings').then(str => {
      if (str) {
        const parsed = JSON.parse(str);
        // ensure tabColor has default if not set
        if (!parsed.tabColor) parsed.tabColor = defaults.tabColor;
        setSettings(parsed);
      }
      setLoaded(true);
    });
  }, []);

  const save = (s: Settings) => {
    setSettings(s);
    AsyncStorage.setItem('@settings', JSON.stringify(s));
  };

  const setCurrency = (code: string) => save({ ...settings, currency: code });
  const setTheme = (theme: ThemeMode) => save({ ...settings, theme });
  const setTabColor = (tabColor: string) => save({ ...settings, tabColor });

  const resolvedTheme: 'light' | 'dark' =
    settings.theme === 'system' ? systemScheme || 'light' : settings.theme;

  if (!loaded) return null;

  return (
    <SettingsContext.Provider value={{ settings, setCurrency, setTheme, setTabColor, resolvedTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
