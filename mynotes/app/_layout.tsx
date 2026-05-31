import { useState } from 'react';
import { Stack } from 'expo-router';
import { SettingsProvider } from '../contexts/SettingsContext';
import AnimatedSplash from '../components/AnimatedSplash';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <SettingsProvider>
        <AnimatedSplash onFinish={() => setShowSplash(false)} />
      </SettingsProvider>
    );
  }

  return (
    <SettingsProvider>
      <Stack screenOptions={{ animation: 'fade', animationDuration: 200 }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="categories" options={{ headerShown: false }} />
        <Stack.Screen name="budget" options={{ headerShown: false }} />
        <Stack.Screen name="debts" options={{ headerShown: false }} />
        <Stack.Screen name="trading" options={{ headerShown: false }} />
        <Stack.Screen name="investing" options={{ headerShown: false }} />
        <Stack.Screen name="reports" options={{ headerShown: false }} />
        <Stack.Screen name="data" options={{ headerShown: false }} />
        <Stack.Screen name="credential-categories" options={{ headerShown: false }} />
        <Stack.Screen name="credentials" options={{ headerShown: false }} />
      </Stack>
    </SettingsProvider>
  );
}
