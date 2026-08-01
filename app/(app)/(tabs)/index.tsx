import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen, Text } from '../../../src/components/ui';
import { COMPANY, DEFICIENCIES, JOBS } from '../../../src/data/company';
import { notificationsForPerson } from '../../../src/data/selectors';
import { JobFolderCard } from '../../../src/features/jobs/JobFolderCard';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, spacing, TAB_BAR_HEIGHT } from '../../../src/theme';

export default function JobsScreen() {
  const { person } = useAuth();

  const visibleJobs = useMemo(() => {
    if (!person) return [];
    if (person.role === 'manager') return JOBS;
    return JOBS.filter((j) => person.jobIds.includes(j.id));
  }, [person]);

  const unreadCount = useMemo(() => {
    if (!person) return 0;
    return notificationsForPerson(person.id).filter((n) => !n.read).length;
  }, [person]);

  const stats = useMemo(() => {
    const activeCount = visibleJobs.filter((j) => j.status === 'active').length;
    const visibleIds = new Set(visibleJobs.map((j) => j.id));
    const openDeficiencies = DEFICIENCIES.filter(
      (d) => visibleIds.has(d.jobId) && d.status !== 'resolved'
    ).length;
    return { activeCount, openDeficiencies };
  }, [visibleJobs]);

  if (!person) return null;

  const greeting = getGreeting();
  const firstName = person.name.split(' ')[0];

  return (
    <Screen glow={false}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_HEIGHT + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text variant="caption1" color={colors.textTertiary} style={styles.company}>
                {COMPANY.name.toUpperCase()}
              </Text>
              <Text variant="largeTitle">
                {greeting}, {firstName}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/(app)/notifications')}
              style={styles.bellButton}
              hitSlop={10}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
              {unreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text variant="caption2" color={colors.textOnAccent}>
                    {unreadCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(60)} style={styles.statsRow}>
            <StatTile label="Active jobs" value={stats.activeCount} icon="hammer-outline" />
            <StatTile
              label="Open deficiencies"
              value={stats.openDeficiencies}
              icon="alert-circle-outline"
              tone={stats.openDeficiencies > 0 ? colors.danger : colors.textPrimary}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.sectionHeaderRow}>
            <Text variant="title3">
              {person.role === 'manager' ? 'All Job Folders' : 'Your Job Folders'}
            </Text>
            <Text variant="footnote" color={colors.textTertiary}>
              {visibleJobs.length} {visibleJobs.length === 1 ? 'job' : 'jobs'}
            </Text>
          </Animated.View>

          <View style={styles.grid}>
            {visibleJobs.map((job, index) => (
              <Animated.View
                key={job.id}
                entering={FadeInDown.duration(400).delay(140 + index * 60)}
                style={styles.gridItem}
              >
                <JobFolderCard job={job} onPress={() => router.push(`/(app)/job/${job.id}`)} />
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function StatTile({
  label,
  value,
  icon,
  tone = colors.textPrimary,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: string;
}) {
  return (
    <View style={styles.statTile}>
      <View style={styles.statIconWrap}>
        <Ionicons name={icon} size={16} color={colors.textSecondary} />
      </View>
      <Text variant="title2" color={tone} style={styles.statValue}>
        {value}
      </Text>
      <Text variant="caption1" color={colors.textTertiary}>
        {label}
      </Text>
    </View>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 1040,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  company: {
    letterSpacing: 1.2,
    marginBottom: spacing.xxs,
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    borderRadius: 14,
    padding: spacing.md,
  },
  statIconWrap: {
    marginBottom: spacing.sm,
  },
  statValue: {
    marginBottom: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: 320,
    maxWidth: 480,
  },
});
