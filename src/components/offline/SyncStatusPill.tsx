import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { Text } from '../ui';
import { useOverallSyncStatus } from '../../data/offlineStore';
import { colors } from '../../theme';
import { SyncStatusSheet } from './SyncStatusSheet';

const STATUS_META: Record<
  ReturnType<typeof useOverallSyncStatus>['status'],
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  offline: { icon: 'cloud-offline-outline', color: colors.textSecondary, label: 'Offline' },
  syncing: { icon: 'sync-outline', color: colors.accentStrong, label: 'Syncing' },
  error: { icon: 'alert-circle-outline', color: colors.danger, label: 'Sync failed' },
  synced: { icon: 'cloud-done-outline', color: colors.textTertiary, label: 'Synced' },
};

export function SyncStatusPill() {
  const { status, pendingCount, failedCount } = useOverallSyncStatus();
  const [sheetOpen, setSheetOpen] = useState(false);
  const meta = STATUS_META[status];
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (status === 'syncing') {
      rotation.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false);
    } else {
      rotation.value = 0;
    }
  }, [status, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const badgeCount = status === 'syncing' ? pendingCount : status === 'error' ? failedCount : 0;

  return (
    <>
      <Pressable
        onPress={() => setSheetOpen(true)}
        style={styles.iconButton}
        hitSlop={8}
        accessibilityLabel={`Sync status: ${meta.label}`}
      >
        <Animated.View style={status === 'syncing' ? animatedStyle : undefined}>
          <Ionicons name={meta.icon} size={19} color={meta.color} />
        </Animated.View>
        {badgeCount > 0 ? (
          <View style={[styles.badge, status === 'error' && styles.badgeDanger]}>
            <Text variant="caption2" color={colors.textOnAccent}>
              {badgeCount}
            </Text>
          </View>
        ) : null}
      </Pressable>
      <SyncStatusSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeDanger: {
    backgroundColor: colors.danger,
  },
});
