import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import {
  useFonts,
  BigShouldersDisplay_700Bold,
  BigShouldersDisplay_800ExtraBold,
} from '@expo-google-fonts/big-shoulders-display';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from '@expo-google-fonts/ibm-plex-sans';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';

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
  const [fontsLoaded] = useFonts({
    BigShouldersDisplay_700Bold,
    BigShouldersDisplay_800ExtraBold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  useEffect(() => {
    hydrateMockStore().finally(() => setDataReady(true));
  }, []);

  useEffect(() => {
    if (status !== 'loading' && dataReady && fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [status, dataReady, fontsLoaded]);

  if (status === 'loading' || !dataReady || !fontsLoaded) {
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
