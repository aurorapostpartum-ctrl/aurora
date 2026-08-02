import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { EmptyState, Text } from '../../../components/ui';
import { formatDate, personName, timeAgo } from '../../../data/selectors';
import { ACTIVITY_ICON, lowercaseLeadingVerb } from '../../activity/activityMeta';
import { colors, spacing } from '../../../theme';
import type { ActivityEntry } from '../../../types/domain';

export function ActivitySection({ activity }: { activity: ActivityEntry[] }) {
  if (activity.length === 0) {
    return <EmptyState icon="time-outline" title="No activity yet" />;
  }

  return (
    <View>
      {activity.map((entry, index) => (
        <View key={entry.id} style={styles.row}>
          <View style={styles.railColumn}>
            <View style={styles.iconWrap}>
              <Ionicons name={ACTIVITY_ICON[entry.type]} size={14} color={colors.accentStrong} />
            </View>
            {index < activity.length - 1 ? <View style={styles.rail} /> : null}
          </View>
          <View style={styles.textColumn}>
            <Text variant="subhead">
              <Text variant="subhead" color={colors.textPrimary}>
                {personName(entry.actorId)}
              </Text>{' '}
              <Text variant="subhead" color={colors.textSecondary}>
                {lowercaseLeadingVerb(entry.summary)}
              </Text>
            </Text>
            <Text variant="caption1" color={colors.textTertiary} style={styles.time}>
              {timeAgo(entry.createdAt)} · {formatDate(entry.createdAt)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  railColumn: {
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rail: {
    width: StyleSheet.hairlineWidth,
    flex: 1,
    backgroundColor: colors.divider,
    marginTop: 2,
  },
  textColumn: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  time: {
    marginTop: 2,
  },
});
