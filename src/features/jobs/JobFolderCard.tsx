import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Avatar, ProgressBar, StatusBadge, Text } from '../../components/ui';
import { activityForJob, getPerson, timeAgo } from '../../data/selectors';
import { colors, radius, spacing } from '../../theme';
import type { Job } from '../../types/domain';

const STATUS_LABEL: Record<Job['status'], string> = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
};

const STATUS_TONE: Record<Job['status'], 'success' | 'warning' | 'ink'> = {
  active: 'success',
  on_hold: 'warning',
  completed: 'ink',
};

export interface JobFolderCardProps {
  job: Job;
  onPress: () => void;
}

export function JobFolderCard({ job, onPress }: JobFolderCardProps) {
  const people = [...job.managerIds, ...job.employeeIds]
    .map((id) => getPerson(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const employeeCount = job.employeeIds.length;
  const latestActivity = activityForJob(job.id)[0];

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={styles.pressable}>
      {({ pressed }) => (
        <View style={[styles.wrap, pressed && styles.wrapPressed]}>
          <View style={styles.tabRow}>
            <View style={[styles.tab, { backgroundColor: job.tabColor }]} />
          </View>
          <View style={styles.body}>
            <View style={styles.headerRow}>
              <Ionicons name="folder" size={16} color={job.tabColor} style={styles.folderIcon} />
              <Text variant="caption1" color={colors.inkTertiary} style={styles.eyebrow}>
                JOB FOLDER
              </Text>
            </View>

            <Text variant="title3" color={colors.ink} numberOfLines={1} style={styles.name}>
              {job.name}
            </Text>
            <Text variant="footnote" color={colors.inkSecondary} numberOfLines={1} style={styles.address}>
              {job.address}
            </Text>

            <View style={styles.statusRow}>
              <StatusBadge label={STATUS_LABEL[job.status]} tone={STATUS_TONE[job.status]} />
              <Text variant="caption1" color={colors.inkTertiary}>
                {job.progress}% complete
              </Text>
            </View>
            <ProgressBar
              progress={job.progress}
              trackColor="rgba(20,20,20,0.10)"
              fillColor={job.tabColor}
              style={styles.progress}
            />

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={12} color={colors.inkTertiary} />
                <Text variant="caption2" color={colors.inkTertiary} style={styles.metaText}>
                  {employeeCount} {employeeCount === 1 ? 'employee' : 'employees'}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={12} color={colors.inkTertiary} />
                <Text variant="caption2" color={colors.inkTertiary} style={styles.metaText}>
                  {latestActivity ? `Updated ${timeAgo(latestActivity.createdAt)}` : 'No activity yet'}
                </Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <View style={styles.avatarStack}>
                {people.slice(0, 4).map((person, index) => (
                  <Avatar
                    key={person.id}
                    initials={person.initials}
                    color={person.avatarColor}
                    size={26}
                    style={[styles.avatarOverlap, index === 0 && styles.avatarFirst]}
                  />
                ))}
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.inkTertiary} />
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  wrap: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.paperBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 6,
    overflow: 'hidden',
  },
  wrapPressed: {
    opacity: 0.92,
  },
  tabRow: {
    flexDirection: 'row',
  },
  tab: {
    width: 64,
    height: 6,
  },
  body: {
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  folderIcon: {
    marginRight: spacing.xxs,
  },
  eyebrow: {
    letterSpacing: 1,
  },
  name: {
    marginBottom: 2,
  },
  address: {
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progress: {
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatarOverlap: {
    marginLeft: -8,
    borderWidth: 2,
    borderColor: colors.paper,
  },
  avatarFirst: {
    marginLeft: 0,
  },
});
