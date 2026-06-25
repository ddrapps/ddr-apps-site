import { Stack } from 'expo-router';
import { useBootstrap } from '../hooks/useBootstrap';

export default function RootLayout() {
  useBootstrap();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
