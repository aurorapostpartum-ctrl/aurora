import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, Screen, Text, TextField } from '../../src/components/ui';
import { useMockDataVersion } from '../../src/data/mockStore';
import { allActivitySorted, formatLongDate, formatTime, getJob, personName } from '../../src/data/selectors';
import { ACTIVITY_ICON, lowercaseLeadingVerb } from '../../src/features/activity/activityMeta';
import { RoleGate } from '../../src/navigation/RoleGate';
import { useAuth } from '../../src/providers/AuthProvider';
import { colors, spacing } from '../../src/theme';
import type { ActivityEntry } from '../../src/types/domain';

export default function ActivityHistoryScreen() {
  return (
    <RoleGate allow={['manager', 'employee']}>
      <ActivityHistoryContent />
    </RoleGate>
  );
}

function ActivityHistoryContent() {
  const { person } = useAuth();
  const version = useMockDataVersion();
  const [query, setQuery] = useState('');

  const scoped = useMemo(() => {
    if (!person) return [];
    const all = allActivitySorted();
    if (person.role === 'manager') return all;
    const jobIds = new Set(person.jobIds);
    return all.filter((entry) => jobIds.has(entry.jobId));
  }, [person, version]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return scoped;
    return scoped.filter((entry) => {
      const jobName = getJob(entry.jobId)?.name ?? '';
      return (
        entry.summary.toLowerCase().includes(q) ||
        personName(entry.actorId).toLowerCase().includes(q) ||
        jobName.toLowerCase().includes(q)
      );
    });
  }, [scoped, query]);

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  if (!person) return null;

  return (
    <Screen glow={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          <Text variant="subhead" color={colors.textPrimary} style={styles.backLabel}>
            Back
          </Text>
        </Pressable>
      </View>

      <View style={styles.titleWrap}>
        <View style={styles.titleInner}>
          <Text variant="largeTitle" style={styles.title}>
            Activity History
          </Text>
          <Text variant="subhead" color={colors.textSecondary} style={styles.subtitle}>
            An automatic timeline of every meaningful action across{' '}
            {person.role === 'manager' ? 'the company' : 'your jobs'}.
          </Text>
          <TextField
            label=""
            placeholder="Filter by person, job, or action..."
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.filterInput}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          {groups.length === 0 ? (
            <EmptyState
              icon="time-outline"
              title="No activity yet"
              message={query.trim() ? `Nothing matched “${query.trim()}”.` : 'Activity will appear here automatically.'}
            />
          ) : (
            groups.map((group) => (
              <View key={group.label} style={styles.dayGroup}>
                <Text variant="title3" style={styles.dayLabel}>
                  {group.label}
                </Text>
                {group.entries.map((entry, index) => (
                  <Pressable
                    key={entry.id}
                    onPress={() => router.push({ pathname: '/(app)/job/[id]', params: { id: entry.jobId, section: 'activity' } })}
                    style={styles.row}
                  >
                    <View style={styles.railColumn}>
                      <View style={styles.iconWrap}>
                        <Ionicons name={ACTIVITY_ICON[entry.type]} size={14} color={colors.accentStrong} />
                      </View>
                      {index < group.entries.length - 1 ? <View style={styles.rail} /> : null}
                    </View>
                    <View style={styles.textColumn}>
                      <Text variant="subhead" numberOfLines={2}>
                        <Text variant="subhead" color={colors.textTertiary}>
                          {formatTime(entry.createdAt)} —{' '}
                        </Text>
                        <Text variant="subhead" color={colors.textPrimary}>
                          {personName(entry.actorId)}
                        </Text>{' '}
                        <Text variant="subhead" color={colors.textSecondary}>
                          {lowercaseLeadingVerb(entry.summary)}
                        </Text>
                      </Text>
                      <Text variant="caption1" color={colors.textTertiary} style={styles.jobLabel}>
                        {getJob(entry.jobId)?.name ?? 'Unknown job'}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function groupByDay(entries: ActivityEntry[]): { label: string; entries: ActivityEntry[] }[] {
  const groups: { label: string; entries: ActivityEntry[] }[] = [];
  for (const entry of entries) {
    const label = formatLongDate(entry.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.entries.push(entry);
    } else {
      groups.push({ label, entries: [entry] });
    }
  }
  return groups;
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    alignSelf: 'flex-start',
  },
  backLabel: {
    marginLeft: 2,
  },
  titleWrap: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleInner: {
    width: '100%',
    maxWidth: 720,
  },
  title: {
    marginBottom: spacing.xxs,
  },
  subtitle: {
    marginBottom: spacing.md,
  },
  filterInput: {
    marginBottom: 0,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 720,
  },
  dayGroup: {
    marginBottom: spacing.lg,
  },
  dayLabel: {
    marginBottom: spacing.sm,
  },
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
  jobLabel: {
    marginTop: 2,
  },
});
