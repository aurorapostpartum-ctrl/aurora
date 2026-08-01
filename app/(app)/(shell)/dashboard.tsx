import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Card, Text } from '../../../src/components/ui';
import { DEFICIENCIES, JOBS } from '../../../src/data/company';
import { allActivitySorted, getJob, personName, timeAgo } from '../../../src/data/selectors';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, spacing } from '../../../src/theme';
import type { ActivityType } from '../../../src/types/domain';

const ACTIVITY_ICON: Record<ActivityType, keyof typeof Ionicons.glyphMap> = {
  document_uploaded: 'document-text-outline',
  document_revised: 'document-text-outline',
  document_acknowledged: 'checkmark-done-outline',
  checklist_generated: 'checkbox-outline',
  checklist_completed: 'checkbox',
  hazard_assessment_generated: 'warning-outline',
  hazard_assessment_completed: 'shield-checkmark-outline',
  photo_uploaded: 'image-outline',
  deficiency_reported: 'alert-circle-outline',
  deficiency_resolved: 'checkmark-circle-outline',
  note_added: 'chatbubble-ellipses-outline',
  announcement_posted: 'megaphone-outline',
  job_created: 'folder-open-outline',
  job_completed: 'ribbon-outline',
};

export default function DashboardScreen() {
  return (
    <RoleGate allow={['manager']}>
      <DashboardContent />
    </RoleGate>
  );
}

function DashboardContent() {
  const { person } = useAuth();
  const activity = useMemo(() => allActivitySorted().slice(0, 6), []);

  const stats = useMemo(() => {
    const activeJobs = JOBS.filter((j) => j.status === 'active').length;
    const openDeficiencies = DEFICIENCIES.filter((d) => d.status !== 'resolved').length;
    const highPriority = DEFICIENCIES.filter((d) => d.status !== 'resolved' && d.priority === 'high').length;
    const avgProgress = Math.round(JOBS.reduce((sum, j) => sum + j.progress, 0) / JOBS.length);
    return { activeJobs, openDeficiencies, highPriority, avgProgress };
  }, []);

  if (!person) return null;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        <Animated.View entering={FadeInDown.duration(360)}>
          <Text variant="largeTitle" style={styles.title}>
            Good {timeOfDay()}, {person.name.split(' ')[0]}
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Here&rsquo;s what&rsquo;s happening across the company today.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(360).delay(60)} style={styles.statsRow}>
          <StatTile icon="hammer-outline" label="Active jobs" value={stats.activeJobs} />
          <StatTile icon="speedometer-outline" label="Avg. progress" value={`${stats.avgProgress}%`} />
          <StatTile
            icon="alert-circle-outline"
            label="Open deficiencies"
            value={stats.openDeficiencies}
            tone={stats.openDeficiencies > 0 ? colors.danger : colors.textPrimary}
          />
          <StatTile
            icon="flame-outline"
            label="High priority"
            value={stats.highPriority}
            tone={stats.highPriority > 0 ? colors.danger : colors.textPrimary}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(360).delay(100)} style={styles.quickRow}>
          <QuickLink icon="folder-open-outline" label="Jobs" onPress={() => router.push('/(app)/(shell)/jobs' as never)} />
          <QuickLink icon="people-outline" label="Employees" onPress={() => router.push('/(app)/(shell)/employees' as never)} />
          <QuickLink icon="copy-outline" label="Templates" onPress={() => router.push('/(app)/(shell)/templates' as never)} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(360).delay(140)}>
          <Text variant="title3" style={styles.sectionTitle}>
            Recent Activity
          </Text>
          <Card style={styles.activityCard}>
            {activity.map((entry, index) => (
              <View key={entry.id} style={[styles.activityRow, index === activity.length - 1 && styles.activityRowLast]}>
                <View style={styles.activityIcon}>
                  <Ionicons name={ACTIVITY_ICON[entry.type]} size={15} color={colors.accentStrong} />
                </View>
                <View style={styles.activityText}>
                  <Text variant="subhead" numberOfLines={1}>
                    <Text variant="subhead" color={colors.textPrimary}>
                      {personName(entry.actorId)}
                    </Text>{' '}
                    <Text variant="subhead" color={colors.textSecondary}>
                      {entry.summary}
                    </Text>
                  </Text>
                  <Text variant="caption1" color={colors.textTertiary}>
                    {getJob(entry.jobId)?.name} · {timeAgo(entry.createdAt)}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

function StatTile({
  icon,
  label,
  value,
  tone = colors.textPrimary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number | string;
  tone?: string;
}) {
  return (
    <Card style={styles.statTile} shadowToken="xs">
      <Ionicons name={icon} size={16} color={colors.textSecondary} style={styles.statIcon} />
      <Text variant="title2" color={tone} style={styles.statValue}>
        {value}
      </Text>
      <Text variant="caption1" color={colors.textTertiary}>
        {label}
      </Text>
    </Card>
  );
}

function QuickLink({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickLink}>
      <Ionicons name={icon} size={16} color={colors.accentStrong} />
      <Text variant="subhead" color={colors.textPrimary} style={styles.quickLinkLabel}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
    </Pressable>
  );
}

function timeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 1040,
  },
  title: {
    marginBottom: spacing.xxs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statTile: {
    flexGrow: 1,
    flexBasis: 160,
    padding: spacing.md,
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statValue: {
    marginBottom: 2,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  quickLinkLabel: {
    marginHorizontal: spacing.xs,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  activityCard: {
    padding: spacing.xs,
  },
  activityRow: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  activityRowLast: {
    borderBottomWidth: 0,
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  activityText: {
    flex: 1,
  },
});
