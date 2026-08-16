import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet, Button, EmptyState, StatusBadge, Text } from '../ui';
import { getJob } from '../../data/selectors';
import { retryFailedSync, retrySyncItem, useIsOnline, useSyncQueue, type SyncItemStatus, type SyncKind } from '../../data/offlineStore';
import { colors, radius, spacing } from '../../theme';

const KIND_ICON: Record<SyncKind, keyof typeof Ionicons.glyphMap> = {
  photo: 'image-outline',
  checklist: 'checkbox-outline',
  hazard: 'warning-outline',
};

const KIND_LABEL: Record<SyncKind, string> = {
  photo: 'Photo',
  checklist: 'Checklist',
  hazard: 'Hazard assessment',
};

const STATUS_META: Record<SyncItemStatus, { label: string; tone: 'neutral' | 'accent' | 'danger' }> = {
  pending: { label: 'Waiting to sync', tone: 'neutral' },
  syncing: { label: 'Syncing…', tone: 'accent' },
  failed: { label: 'Sync failed', tone: 'danger' },
};

export interface SyncStatusSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function SyncStatusSheet({ visible, onClose }: SyncStatusSheetProps) {
  const queue = useSyncQueue();
  const isOnline = useIsOnline();
  const failedCount = queue.filter((item) => item.status === 'failed').length;

  const order: SyncItemStatus[] = ['failed', 'syncing', 'pending'];
  const sorted = [...queue].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

  return (
    <BottomSheet visible={visible} title="Sync Status" onClose={onClose} maxHeightPercent={75}>
      {!isOnline ? (
        <View style={styles.offlineNote}>
          <Ionicons name="cloud-offline-outline" size={16} color={colors.textSecondary} />
          <Text variant="footnote" color={colors.textSecondary} style={styles.offlineNoteText}>
            You're offline. Your work is saved on this device and will sync automatically once you're back online.
          </Text>
        </View>
      ) : null}

      {sorted.length === 0 ? (
        <EmptyState icon="checkmark-done-outline" title="Everything is synced" message="No pending uploads or submissions." />
      ) : (
        <View style={styles.list}>
          {sorted.map((item) => {
            const meta = STATUS_META[item.status];
            const jobName = getJob(item.jobId)?.name ?? 'Unknown job';
            return (
              <View key={item.id} style={styles.row}>
                <View style={styles.rowIcon}>
                  <Ionicons name={KIND_ICON[item.kind]} size={16} color={colors.textSecondary} />
                </View>
                <View style={styles.rowBody}>
                  <Text variant="subhead" numberOfLines={1}>
                    {KIND_LABEL[item.kind]}: {item.label}
                  </Text>
                  <Text variant="caption1" color={colors.textTertiary} numberOfLines={1}>
                    {jobName}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  <StatusBadge label={meta.label} tone={meta.tone} />
                  {item.status === 'failed' ? (
                    <Pressable onPress={() => retrySyncItem(item.id)} hitSlop={8} style={styles.retryLink}>
                      <Text variant="caption1" color={colors.accentStrong}>
                        Retry
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {failedCount > 0 ? (
        <Button label={`Retry All (${failedCount})`} onPress={retryFailedSync} style={styles.retryAll} />
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  offlineNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  offlineNoteText: {
    flex: 1,
  },
  list: {
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.xs,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rowBody: {
    flex: 1,
    marginRight: spacing.sm,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: spacing.xxs,
  },
  retryLink: {
    paddingVertical: 2,
  },
  retryAll: {
    marginTop: spacing.xs,
  },
});
