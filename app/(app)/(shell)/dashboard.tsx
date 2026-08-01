import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button, Card, Text } from '../../../src/components/ui';
import { DEFICIENCIES, JOBS, JOB_CHECKLISTS, JOB_HAZARD_ASSESSMENTS } from '../../../src/data/company';
import { useMockDataVersion } from '../../../src/data/mockStore';
import { activityForJob, allActivitySorted, getJob, isWithinLastDays, personName, timeAgo } from '../../../src/data/selectors';
import { JobFolderCard } from '../../../src/features/jobs/JobFolderCard';
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
  employee_assigned: 'person-add-outline',
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
  const version = useMockDataVersion();

  const stats = useMemo(() => {
    const activeJobs = JOBS.filter((j) => j.status === 'active').length;
    const openDeficiencies = DEFICIENCIES.filter((d) => d.status !== 'resolved').length;
    const assessmentsThisWeek =
      JOB_CHECKLISTS.filter((c) => isWithinLastDays(c.generatedAt, 7)).length +
      JOB_HAZARD_ASSESSMENTS.filter((h) => isWithinLastDays(h.generatedAt, 7)).length;
    const overallCompletion = JOBS.length
      ? Math.round(JOBS.reduce((sum, j) => sum + j.progress, 0) / JOBS.length)
      : 0;
    return { activeJobs, openDeficiencies, assessmentsThisWeek, overallCompletion };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const recentJobs = useMemo(() => {
    const withActivity = JOBS.map((job) => ({
      job,
      lastActivityAt: activityForJob(job.id)[0]?.createdAt ?? job.startDate,
    }));
    withActivity.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());
    return withActivity.slice(0, 3).map((entry) => entry.job);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const activity = useMemo(() => allActivitySorted().slice(0, 6), [version]);

  if (!person) return null;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        <Animated.View entering={FadeInDown.duration(360)} style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text variant="largeTitle" style={styles.title}>
              Good {timeOfDay()}, {person.name.split(' ')[0]}
            </Text>
            <Text variant="body" color={colors.textSecondary}>
              Here&rsquo;s what&rsquo;s happening across the company today.
            </Text>
          </View>
          <Button
            label="New Job"
            icon={<Ionicons name="add" size={18} color={colors.textOnAccent} style={styles.newJobIcon} />}
            fullWidth={false}
            onPress={() => router.push('/(app)/job-new' as never)}
            style={styles.newJobButton}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(360).delay(60)} style={styles.statsRow}>
          <StatTile
            icon="hammer-outline"
            label="Active Jobs"
            value={stats.activeJobs}
            onPress={() => router.push('/(app)/(shell)/jobs' as never)}
          />
          <StatTile
            icon="alert-circle-outline"
            label="Open Deficiencies"
            value={stats.openDeficiencies}
            tone={stats.openDeficiencies > 0 ? colors.danger : colors.textPrimary}
            onPress={() => router.push('/(app)/(shell)/jobs' as never)}
          />
          <StatTile
            icon="clipboard-outline"
            label="Assessments This Week"
            value={stats.assessmentsThisWeek}
            onPress={() => router.push('/(app)/(shell)/jobs' as never)}
          />
          <StatTile
            icon="speedometer-outline"
            label="Overall Completion"
            value={`${stats.overallCompletion}%`}
            onPress={() => router.push('/(app)/(shell)/jobs' as never)}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(360).delay(100)} style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text variant="title3">Recent Jobs</Text>
            <Pressable onPress={() => router.push('/(app)/(shell)/jobs' as never)} style={styles.viewAllRow}>
              <Text variant="subhead" color={colors.accentStrong}>
                View all
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.accentStrong} />
            </Pressable>
          </View>
          <View style={styles.jobsGrid}>
            {recentJobs.map((job, index) => (
              <Animated.View
                key={job.id}
                entering={FadeInDown.duration(360).delay(140 + index * 60)}
                style={styles.jobsGridItem}
              >
                <JobFolderCard job={job} onPress={() => router.push(`/(app)/job/${job.id}`)} />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(360).delay(160)}>
          <Text variant="title3" style={styles.sectionTitle}>
            Recent Activity
          </Text>
          <Card style={styles.activityCard}>
            {activity.map((entry, index) => (
              <Pressable
                key={entry.id}
                onPress={() => router.push(`/(app)/job/${entry.jobId}`)}
                style={[styles.activityRow, index === activity.length - 1 && styles.activityRowLast]}
              >
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
                <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
              </Pressable>
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
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number | string;
  tone?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.statTilePressable}>
      <Card style={styles.statTile} shadowToken="xs">
        <Ionicons name={icon} size={16} color={colors.textSecondary} style={styles.statIcon} />
        <Text variant="title1" color={tone} style={styles.statValue}>
          {value}
        </Text>
        <Text variant="caption1" color={colors.textTertiary}>
          {label}
        </Text>
      </Card>
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
    maxWidth: 1120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    minWidth: 240,
  },
  title: {
    marginBottom: spacing.xxs,
  },
  newJobButton: {
    paddingHorizontal: spacing.lg,
  },
  newJobIcon: {
    marginRight: -2,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statTilePressable: {
    flexGrow: 1,
    flexBasis: 200,
  },
  statTile: {
    padding: spacing.md,
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statValue: {
    marginBottom: 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  jobsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  jobsGridItem: {
    flexGrow: 1,
    flexBasis: 320,
    maxWidth: 420,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  activityCard: {
    padding: spacing.xs,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: spacing.xs,
  },
});
