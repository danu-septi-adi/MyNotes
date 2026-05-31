import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface Settings {
  nativeCurrency: string;
  displayCurrency: string;
  theme: ThemeMode;
  tabColor: string;
}

interface SettingsContextType {
  settings: Settings;
  setNativeCurrency: (code: string) => void;
  setDisplayCurrency: (code: string) => void;
  setTheme: (mode: ThemeMode) => void;
  setTabColor: (color: string) => void;
  resolvedTheme: 'light' | 'dark';
}

const defaults: Settings = {
  nativeCurrency: 'IDR',
  displayCurrency: 'USD',
  theme: 'system',
  tabColor: '#6366F1',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaults,
  setNativeCurrency: () => {},
  setDisplayCurrency: () => {},
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
        if (!parsed.nativeCurrency) parsed.nativeCurrency = defaults.nativeCurrency;
        if (!parsed.displayCurrency) parsed.displayCurrency = defaults.displayCurrency;
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

  const setNativeCurrency = (code: string) => save({ ...settings, nativeCurrency: code });
  const setDisplayCurrency = (code: string) => save({ ...settings, displayCurrency: code });
  const setTheme = (theme: ThemeMode) => save({ ...settings, theme });
  const setTabColor = (tabColor: string) => save({ ...settings, tabColor });

  const resolvedTheme: 'light' | 'dark' =
    settings.theme === 'system' ? systemScheme || 'light' : settings.theme;

  if (!loaded) return null;

  return (
    <SettingsContext.Provider value={{ settings, setNativeCurrency, setDisplayCurrency, setTheme, setTabColor, resolvedTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
