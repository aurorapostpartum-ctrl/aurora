import { Stack } from 'expo-router';

import { colors } from '../../src/theme';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="job/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="checklist-template/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="hazard-template/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="person/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen
        name="notifications"
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
