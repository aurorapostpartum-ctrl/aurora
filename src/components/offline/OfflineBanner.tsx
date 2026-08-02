import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Text } from '../ui';
import { hydrateOfflineStore, useIsOnline } from '../../data/offlineStore';
import { colors, spacing } from '../../theme';

// Mounted once at the app root so it's visible no matter which screen is
// active — including job/document detail screens that don't use AppShell.
export function OfflineBanner() {
  const isOnline = useIsOnline();

  useEffect(() => {
    hydrateOfflineStore();
  }, []);

  if (isOnline) return null;

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.root}>
      <Ionicons name="cloud-offline-outline" size={14} color={colors.warning} />
      <Text variant="caption1" color={colors.warning} style={styles.text}>
        You're offline — your work is saved on this device and will sync automatically
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.warningMuted,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(221,165,43,0.35)',
    gap: spacing.xs,
  },
  text: {
    flexShrink: 1,
    textAlign: 'center',
  },
});
