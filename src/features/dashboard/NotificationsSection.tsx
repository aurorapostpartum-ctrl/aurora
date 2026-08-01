import { StyleSheet, View } from 'react-native';

import { EmptyRow, ErrorState, GlassCard, Skeleton, Text } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { SectionHeader } from './SectionHeader';
import { useNotifications } from './useNotifications';

export function NotificationsSection() {
  const { data, isLoading, isError, error, refetch } = useNotifications();

  return (
    <View style={styles.section}>
      <SectionHeader title="Notifications" />

      {isLoading ? (
        <GlassCard radiusToken="md">
          <View style={styles.skeletonInner}>
            <Skeleton width="70%" height={14} />
            <Skeleton width="40%" height={12} style={styles.skeletonGap} />
          </View>
        </GlassCard>
      ) : isError ? (
        <ErrorState
          title="Couldn't load notifications"
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyRow icon="notifications-outline" message="You're all caught up — no notifications" />
      ) : (
        <GlassCard radiusToken="md">
          <View>
            {(data ?? []).map((item, index) => (
              <View key={item.id}>
                <View style={styles.row}>
                  {!item.read ? <View style={styles.unreadDot} /> : <View style={styles.dotSpacer} />}
                  <View style={styles.rowText}>
                    <Text variant="subhead" numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text variant="footnote" color={colors.textSecondary} numberOfLines={2}>
                      {item.body}
                    </Text>
                  </View>
                </View>
                {index < (data?.length ?? 0) - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </GlassCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  skeletonInner: {
    padding: spacing.md,
  },
  skeletonGap: {
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: 6,
  },
  dotSpacer: {
    width: 7,
  },
  rowText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: spacing.md,
  },
});
