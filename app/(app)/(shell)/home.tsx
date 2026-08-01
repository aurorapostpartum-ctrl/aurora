import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Card, Text } from '../../../src/components/ui';
import { DEFICIENCIES, JOBS } from '../../../src/data/company';
import { activityForJob, getJob, personName, timeAgo } from '../../../src/data/selectors';
import { JobFolderGrid } from '../../../src/features/jobs/JobFolderGrid';
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

  const myJobs = useMemo(() => (person ? JOBS.filter((j) => person.jobIds.includes(j.id)) : []), [person]);

  const stats = useMemo(() => {
    const ids = new Set(myJobs.map((j) => j.id));
    return {
      activeJobs: myJobs.filter((j) => j.status === 'active').length,
      openDeficiencies: DEFICIENCIES.filter((d) => ids.has(d.jobId) && d.status !== 'resolved').length,
    };
  }, [myJobs]);

  const recentActivity = useMemo(() => myJobs.flatMap((j) => activityForJob(j.id)).slice(0, 5), [myJobs]);

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
          <JobFolderGrid jobs={myJobs} heading="Your Job Folders" emptyMessage="No jobs assigned yet" />
        </Animated.View>

        {recentActivity.length > 0 ? (
          <Animated.View entering={FadeInDown.duration(360).delay(140)}>
            <Text variant="title3" style={styles.sectionTitle}>
              Recent Activity
            </Text>
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
  sectionTitle: {
    marginBottom: spacing.sm,
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
