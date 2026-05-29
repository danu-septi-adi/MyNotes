import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LightColors, DarkColors } from '../../constants/theme';

const tabConfig: Record<string, { label: string; focused: string; unfocused: string }> = {
  index: { label: 'Home', focused: 'home', unfocused: 'home-outline' },
  finance: { label: 'Finance', focused: 'wallet', unfocused: 'wallet-outline' },
  activities: { label: 'Aktifitas', focused: 'clipboard-list', unfocused: 'clipboard-list-outline' },
  wishlist: { label: 'Wishlist', focused: 'star', unfocused: 'star-outline' },
  profile: { label: 'Profil', focused: 'account', unfocused: 'account-outline' },
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { settings, resolvedTheme } = useSettings();
  const base = resolvedTheme === 'dark' ? DarkColors : LightColors;
  const activeColor = settings.tabColor || base.primary;
  const bg = resolvedTheme === 'dark' ? '#18181B' : '#FFFFFF';
  const inactiveColor = resolvedTheme === 'dark' ? '#A1A1AA' : '#9CA3AF';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: bg,
          borderTopWidth: 0,
          elevation: 8,
          height: 56 + Math.max(insets.bottom, 8),
          paddingBottom: Math.max(insets.bottom, 8) + 4,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      {Object.entries(tabConfig).map(([name, cfg]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: cfg.label,
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name={focused ? cfg.focused : cfg.unfocused}
                size={24}
                color={focused ? activeColor : inactiveColor}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
