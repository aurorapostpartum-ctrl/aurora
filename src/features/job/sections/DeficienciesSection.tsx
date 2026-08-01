import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Button, Chip, EmptyState, StatusBadge, Text, TextField } from '../../../components/ui';
import { formatDate, personName } from '../../../data/selectors';
import { createId } from '../../../lib/id';
import { colors, radius, spacing } from '../../../theme';
import type { Deficiency, DeficiencyPriority, Job, Person } from '../../../types/domain';

interface DeficienciesSectionProps {
  job: Job;
  person: Person;
  deficiencies: Deficiency[];
  setDeficiencies: Dispatch<SetStateAction<Deficiency[]>>;
}

const STATUS_TONE: Record<Deficiency['status'], 'danger' | 'warning' | 'success'> = {
  open: 'danger',
  in_progress: 'warning',
  resolved: 'success',
};

const STATUS_LABEL: Record<Deficiency['status'], string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

const STATUS_CYCLE: Deficiency['status'][] = ['open', 'in_progress', 'resolved'];

const PRIORITY_TONE: Record<DeficiencyPriority, 'danger' | 'warning' | 'neutral'> = {
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
};

export function DeficienciesSection({ job, person, deficiencies, setDeficiencies }: DeficienciesSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<DeficiencyPriority>('medium');

  const handleSubmit = () => {
    if (!title.trim()) return;
    const deficiency: Deficiency = {
      id: createId('def'),
      jobId: job.id,
      title: title.trim(),
      description: '',
      status: 'open',
      priority,
      location: location.trim() || 'Unspecified',
      reportedBy: person.id,
      reportedAt: new Date().toISOString(),
      photoCount: 0,
    };
    setDeficiencies((prev) => [deficiency, ...prev]);
    setTitle('');
    setLocation('');
    setPriority('medium');
    setFormOpen(false);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const cycleStatus = (id: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setDeficiencies((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const nextIndex = (STATUS_CYCLE.indexOf(d.status) + 1) % STATUS_CYCLE.length;
        const nextStatus = STATUS_CYCLE[nextIndex];
        return {
          ...d,
          status: nextStatus,
          resolvedAt: nextStatus === 'resolved' ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  return (
    <View>
      <View style={styles.actionRow}>
        <Text variant="footnote" color={colors.textTertiary}>
          {deficiencies.length} {deficiencies.length === 1 ? 'deficiency' : 'deficiencies'}
        </Text>
        <Button
          label={formOpen ? 'Cancel' : 'Report Deficiency'}
          variant={formOpen ? 'secondary' : 'primary'}
          size="md"
          fullWidth={false}
          onPress={() => setFormOpen((v) => !v)}
        />
      </View>

      {formOpen ? (
        <View style={styles.form}>
          <TextField label="What's wrong?" placeholder="e.g. Cracked slab near loading dock" value={title} onChangeText={setTitle} />
          <TextField label="Location" placeholder="e.g. Building A, Level 2" value={location} onChangeText={setLocation} />
          <Text variant="footnote" color={colors.textSecondary} style={styles.priorityLabel}>
            Priority
          </Text>
          <View style={styles.priorityRow}>
            {(['low', 'medium', 'high'] as DeficiencyPriority[]).map((p) => (
              <Chip key={p} label={p[0].toUpperCase() + p.slice(1)} selected={priority === p} onPress={() => setPriority(p)} />
            ))}
          </View>
          <Button label="Submit Deficiency" onPress={handleSubmit} disabled={!title.trim()} />
        </View>
      ) : null}

      {deficiencies.length === 0 ? (
        <EmptyState icon="alert-circle-outline" title="No deficiencies reported" />
      ) : (
        deficiencies.map((d) => (
          <View key={d.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text variant="headline" style={styles.cardTitle}>
                {d.title}
              </Text>
              <StatusBadge label={d.priority[0].toUpperCase() + d.priority.slice(1)} tone={PRIORITY_TONE[d.priority]} />
            </View>
            <Text variant="footnote" color={colors.textSecondary}>
              {d.location}
            </Text>
            <Text variant="caption1" color={colors.textTertiary} style={styles.meta}>
              Reported by {personName(d.reportedBy)} · {formatDate(d.reportedAt)}
              {d.resolvedAt ? ` · Resolved ${formatDate(d.resolvedAt)}` : ''}
            </Text>
            <Pressable onPress={() => cycleStatus(d.id)} style={styles.statusButton}>
              <StatusBadge label={STATUS_LABEL[d.status]} tone={STATUS_TONE[d.status]} />
              <Ionicons name="sync-outline" size={13} color={colors.textTertiary} style={styles.cycleIcon} />
            </Pressable>
          </View>
        ))
      )}
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
  form: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  priorityLabel: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xxs,
  },
  cardTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  meta: {
    marginTop: spacing.xs,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  cycleIcon: {
    marginLeft: spacing.xs,
  },
});
