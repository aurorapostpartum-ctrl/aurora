import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Card, EmptyState, Text } from '../../../src/components/ui';
import { DEFICIENCIES, JOBS } from '../../../src/data/company';
import { useMockDataVersion } from '../../../src/data/mockStore';
import {
  activityForJob,
  checklistsForJob,
  documentsForJob,
  getJob,
  hazardAssessmentsForJob,
  personName,
  timeAgo,
} from '../../../src/data/selectors';
import { EmployeeJobCard } from '../../../src/features/jobs/EmployeeJobCard';
import { pendingDocumentReviewCount, requirementsForJob } from '../../../src/features/jobs/jobRequirements';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, spacing } from '../../../src/theme';

export default function HomeScreen() {
  return (
    <RoleGate allow={['employee']}>
      <HomeContent />
    </RoleGate>
  );
}

function HomeContent() {
  const { person } = useAuth();
  const version = useMockDataVersion();

  const myJobs = useMemo(() => (person ? JOBS.filter((j) => person.jobIds.includes(j.id)) : []), [person, version]);

  const stats = useMemo(() => {
    const ids = new Set(myJobs.map((j) => j.id));
    return {
      activeJobs: myJobs.filter((j) => j.status === 'active').length,
      openDeficiencies: DEFICIENCIES.filter((d) => ids.has(d.jobId) && d.status !== 'complete').length,
    };
  }, [myJobs]);

  const jobCards = useMemo(() => {
    if (!person) return [];
    return myJobs.map((job) => {
      const documents = documentsForJob(job.id);
      const checklists = checklistsForJob(job.id);
      const hazards = hazardAssessmentsForJob(job.id);
      const activity = activityForJob(job.id);
      return {
        job,
        requirements: requirementsForJob(hazards, documents, checklists, person.id),
        latestActivity: activity[0],
        documentCount: documents.length,
        pendingDocumentCount: pendingDocumentReviewCount(documents, person.id),
      };
    });
  }, [myJobs, person, version]);

  const recentActivity = useMemo(() => myJobs.flatMap((j) => activityForJob(j.id)).slice(0, 5), [myJobs, version]);

  if (!person) return null;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        <Animated.View entering={FadeInDown.duration(360)}>
          <Text variant="largeTitle" style={styles.title}>
            Good {timeOfDay()}, {person.name.split(' ')[0]}
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            {person.title} · {myJobs.length} {myJobs.length === 1 ? 'job' : 'jobs'} assigned
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(360).delay(60)} style={styles.statsRow}>
          <Card style={styles.statTile} shadowToken="xs">
            <Ionicons name="hammer-outline" size={16} color={colors.textSecondary} style={styles.statIcon} />
            <Text variant="title2" style={styles.statValue}>
              {stats.activeJobs}
            </Text>
            <Text variant="caption1" color={colors.textTertiary}>
              Active jobs
            </Text>
          </Card>
          <Card style={styles.statTile} shadowToken="xs">
            <Ionicons name="alert-circle-outline" size={16} color={colors.textSecondary} style={styles.statIcon} />
            <Text variant="title2" color={stats.openDeficiencies > 0 ? colors.danger : colors.textPrimary} style={styles.statValue}>
              {stats.openDeficiencies}
            </Text>
            <Text variant="caption1" color={colors.textTertiary}>
              Open deficiencies
            </Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(360).delay(100)} style={styles.section}>
          <View style={styles.headerRow}>
            <Text variant="title3" style={styles.myJobsTitle}>
              MY JOBS
            </Text>
            <Text variant="footnote" color={colors.textTertiary}>
              {myJobs.length} {myJobs.length === 1 ? 'job' : 'jobs'}
            </Text>
          </View>

          {jobCards.length === 0 ? (
            <EmptyState icon="folder-open-outline" title="No jobs assigned yet" />
          ) : (
            <View style={styles.jobGrid}>
              {jobCards.map(({ job, requirements, latestActivity, documentCount, pendingDocumentCount }) => (
                <EmployeeJobCard
                  key={job.id}
                  job={job}
                  requirements={requirements}
                  latestActivity={latestActivity}
                  documentCount={documentCount}
                  pendingDocumentCount={pendingDocumentCount}
                  onPress={() => router.push(`/(app)/job/${job.id}`)}
                />
              ))}
            </View>
          )}
        </Animated.View>

        {recentActivity.length > 0 ? (
          <Animated.View entering={FadeInDown.duration(360).delay(140)}>
            <View style={styles.headerRow}>
              <Text variant="title3">Recent Activity</Text>
              <Pressable onPress={() => router.push('/(app)/activity-history' as never)} style={styles.viewAllRow}>
                <Text variant="subhead" color={colors.accentStrong}>
                  View all
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.accentStrong} />
              </Pressable>
            </View>
            <Card style={styles.activityCard}>
              {recentActivity.map((entry, index) => (
                <Pressable
                  key={entry.id}
                  onPress={() => router.push(`/(app)/job/${entry.jobId}`)}
                  style={[styles.activityRow, index === recentActivity.length - 1 && styles.activityRowLast]}
                >
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
                </Pressable>
              ))}
            </Card>
          </Animated.View>
        ) : null}
      </View>
    </ScrollView>
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
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statTile: {
    flex: 1,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  myJobsTitle: {
    letterSpacing: 1,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  jobGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  activityCard: {
    padding: spacing.xs,
  },
  activityRow: {
    padding: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  activityRowLast: {
    borderBottomWidth: 0,
  },
});
