import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Button, Card, Chip, EmptyState, StatusBadge, Text } from '../../../components/ui';
import { formatDate, getPerson, personName } from '../../../data/selectors';
import { DeficiencyFormSheet } from '../../deficiencies/DeficiencyFormSheet';
import { colors, spacing } from '../../../theme';
import type { Deficiency, DeficiencyPriority, DeficiencyStatus, Job, Person } from '../../../types/domain';

interface DeficienciesSectionProps {
  job: Job;
  person: Person;
  deficiencies: Deficiency[];
}

const STATUS_TONE: Record<DeficiencyStatus, 'danger' | 'warning' | 'success'> = {
  open: 'danger',
  in_progress: 'warning',
  complete: 'success',
};

const STATUS_LABEL: Record<DeficiencyStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  complete: 'Complete',
};

const PRIORITY_TONE: Record<DeficiencyPriority, 'danger' | 'warning' | 'neutral'> = {
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
};

export function DeficienciesSection({ job, person, deficiencies }: DeficienciesSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<DeficiencyStatus | 'all'>('all');

  const filtered = useMemo(
    () => (statusFilter === 'all' ? deficiencies : deficiencies.filter((d) => d.status === statusFilter)),
    [deficiencies, statusFilter]
  );

  const counts = useMemo(
    () => ({
      open: deficiencies.filter((d) => d.status === 'open').length,
      in_progress: deficiencies.filter((d) => d.status === 'in_progress').length,
      complete: deficiencies.filter((d) => d.status === 'complete').length,
    }),
    [deficiencies]
  );

  return (
    <View>
      <View style={styles.actionRow}>
        <Text variant="footnote" color={colors.textTertiary}>
          {deficiencies.length} {deficiencies.length === 1 ? 'deficiency' : 'deficiencies'}
        </Text>
        <Button label="Report Deficiency" size="md" fullWidth={false} onPress={() => setFormOpen(true)} />
      </View>

      <View style={styles.filterRow}>
        <Chip label="All" selected={statusFilter === 'all'} onPress={() => setStatusFilter('all')} />
        <Chip
          label={`Open (${counts.open})`}
          selected={statusFilter === 'open'}
          onPress={() => setStatusFilter('open')}
        />
        <Chip
          label={`In Progress (${counts.in_progress})`}
          selected={statusFilter === 'in_progress'}
          onPress={() => setStatusFilter('in_progress')}
        />
        <Chip
          label={`Complete (${counts.complete})`}
          selected={statusFilter === 'complete'}
          onPress={() => setStatusFilter('complete')}
        />
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon="alert-circle-outline"
          title={deficiencies.length === 0 ? 'No deficiencies reported' : 'No deficiencies match this filter'}
          message={deficiencies.length === 0 ? 'Report an issue found on site to track it through to resolution.' : undefined}
        />
      ) : (
        filtered.map((d) => {
          const assignee = d.assignedTo ? getPerson(d.assignedTo) : undefined;
          return (
            <Pressable
              key={d.id}
              onPress={() => router.push(`/(app)/deficiency/${d.id}` as never)}
              style={styles.cardPressable}
            >
              {({ pressed }) => (
                <Card style={[styles.card, pressed && styles.cardPressed]} shadowToken="xs">
                  <View style={styles.cardHeader}>
                    <Text variant="headline" style={styles.cardTitle} numberOfLines={2}>
                      {d.title}
                    </Text>
                    <StatusBadge label={d.priority[0].toUpperCase() + d.priority.slice(1)} tone={PRIORITY_TONE[d.priority]} />
                  </View>
                  <Text variant="footnote" color={colors.textSecondary} numberOfLines={1}>
                    {d.location}
                  </Text>

                  <View style={styles.metaRow}>
                    <StatusBadge label={STATUS_LABEL[d.status]} tone={STATUS_TONE[d.status]} />
                    {assignee ? (
                      <View style={styles.assigneeRow}>
                        <Avatar initials={assignee.initials} color={assignee.avatarColor} size={20} />
                        <Text variant="footnote" color={colors.textSecondary} style={styles.assigneeLabel}>
                          {assignee.name}
                        </Text>
                      </View>
                    ) : (
                      <Text variant="footnote" color={colors.textTertiary}>
                        Unassigned
                      </Text>
                    )}
                    {d.photoIds.length > 0 ? (
                      <View style={styles.photoCountRow}>
                        <Ionicons name="image-outline" size={13} color={colors.textTertiary} />
                        <Text variant="caption1" color={colors.textTertiary} style={styles.photoCountLabel}>
                          {d.photoIds.length}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <Text variant="caption1" color={colors.textTertiary} style={styles.reportedMeta}>
                    Reported by {personName(d.reportedBy)} · {formatDate(d.reportedAt)}
                    {d.completedAt ? ` · Completed ${formatDate(d.completedAt)}` : ''}
                  </Text>
                </Card>
              )}
            </Pressable>
          );
        })
      )}

      <DeficiencyFormSheet
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        mode="create"
        job={job}
        actorId={person.id}
        onSaved={(created) => router.push(`/(app)/deficiency/${created.id}` as never)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  cardPressable: {
    marginBottom: spacing.sm,
  },
  card: {
    padding: spacing.md,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xxs,
  },
  cardTitle: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeLabel: {
    marginLeft: spacing.xxs,
  },
  photoCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoCountLabel: {
    marginLeft: 2,
  },
  reportedMeta: {
    marginTop: spacing.xs,
  },
});
