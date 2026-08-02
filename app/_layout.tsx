import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { View } from 'react-native';

import { OfflineBanner } from '../src/components/offline/OfflineBanner';
import { hydrateMockStore } from '../src/data/mockStore';
import { AppProviders } from '../src/providers/AppProviders';
import { useAuth } from '../src/providers/AuthProvider';
import { colors } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <OfflineBanner />
        <RootNavigator />
      </View>
    </AppProviders>
  );
}

function RootNavigator() {
  const { status } = useAuth();
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    hydrateMockStore().finally(() => setDataReady(true));
  }, []);

  useEffect(() => {
    if (status !== 'loading' && dataReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [status, dataReady]);

  if (status === 'loading' || !dataReady) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Protected guard={status === 'signedOut'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'signedIn'}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
