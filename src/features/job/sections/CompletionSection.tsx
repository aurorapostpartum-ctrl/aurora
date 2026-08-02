import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { type Dispatch, type SetStateAction } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Button, GlassCard, StatusBadge, Text, TextField } from '../../../components/ui';
import { formatDate, personName } from '../../../data/selectors';
import { colors, spacing } from '../../../theme';
import type { Deficiency, Job, ProjectCompletion } from '../../../types/domain';

interface CompletionSectionProps {
  job: Job;
  isManager: boolean;
  actorId: string;
  completion: ProjectCompletion | undefined;
  setCompletion: Dispatch<SetStateAction<ProjectCompletion | undefined>>;
  openDeficiencies: Deficiency[];
}

const PRIORITY_TONE = { high: 'danger', medium: 'warning', low: 'neutral' } as const;

export function CompletionSection({
  job,
  isManager,
  actorId,
  completion,
  setCompletion,
  openDeficiencies,
}: CompletionSectionProps) {
  if (!completion) return null;

  const openDeficiencyCount = openDeficiencies.length;
  const allDone = completion.checklist.every((item) => item.done);
  const canComplete = allDone && openDeficiencyCount === 0 && !completion.isComplete;

  const toggleItem = (itemId: string) => {
    if (!isManager || completion.isComplete) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setCompletion((prev) =>
      prev
        ? {
            ...prev,
            checklist: prev.checklist.map((item) =>
              item.id === itemId ? { ...item, done: !item.done } : item
            ),
          }
        : prev
    );
  };

  const handleComplete = () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCompletion((prev) =>
      prev
        ? { ...prev, isComplete: true, completedAt: new Date().toISOString(), completedBy: actorId }
        : prev
    );
  };

  return (
    <View>
      <GlassCard style={styles.card}>
        <View style={styles.cardBody}>
          <View style={styles.headerRow}>
            <Text variant="title3">Completion Checklist</Text>
            <StatusBadge
              label={completion.isComplete ? 'Project Complete' : 'In Progress'}
              tone={completion.isComplete ? 'success' : 'warning'}
            />
          </View>

          {completion.isComplete && completion.completedAt ? (
            <Text variant="footnote" color={colors.textSecondary} style={styles.completedNote}>
              Marked complete on {formatDate(completion.completedAt)}.
            </Text>
          ) : null}

          {completion.checklist.map((item) => (
            <Pressable
              key={item.id}
              style={styles.itemRow}
              onPress={() => toggleItem(item.id)}
              disabled={!isManager || completion.isComplete}
            >
              <Ionicons
                name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={item.done ? colors.success : colors.textTertiary}
              />
              <Text variant="body" style={styles.itemLabel} color={item.done ? colors.textPrimary : colors.textSecondary}>
                {item.label}
              </Text>
            </Pressable>
          ))}

          {openDeficiencyCount > 0 ? (
            <>
              <Text variant="footnote" color={colors.danger} style={styles.warning}>
                {openDeficiencyCount} open {openDeficiencyCount === 1 ? 'deficiency' : 'deficiencies'} must be marked
                complete before this project can be closed out.
              </Text>
              <View style={styles.deficiencyList}>
                {openDeficiencies.map((d) => (
                  <Pressable
                    key={d.id}
                    onPress={() => router.push(`/(app)/deficiency/${d.id}` as never)}
                    style={styles.deficiencyRow}
                  >
                    <View style={styles.deficiencyText}>
                      <Text variant="subhead" numberOfLines={1}>
                        {d.title}
                      </Text>
                      <Text variant="caption1" color={colors.textTertiary} numberOfLines={1}>
                        {d.assignedTo ? `Assigned to ${personName(d.assignedTo)}` : 'Unassigned'}
                      </Text>
                    </View>
                    <StatusBadge label={d.priority[0].toUpperCase() + d.priority.slice(1)} tone={PRIORITY_TONE[d.priority]} />
                    <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} style={styles.deficiencyChevron} />
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}
        </View>
      </GlassCard>

      {isManager ? (
        <GlassCard style={styles.card}>
          <View style={styles.cardBody}>
            <TextField
              label="Final Notes"
              placeholder="Closeout notes for this job..."
              value={completion.finalNotes}
              onChangeText={(text) => setCompletion((prev) => (prev ? { ...prev, finalNotes: text } : prev))}
              multiline
              numberOfLines={4}
              editable={!completion.isComplete}
              style={styles.textarea}
            />
            {!completion.isComplete ? (
              <Button
                label="Mark Project Complete"
                onPress={handleComplete}
                disabled={!canComplete}
              />
            ) : null}
          </View>
        </GlassCard>
      ) : completion.finalNotes ? (
        <GlassCard style={styles.card}>
          <View style={styles.cardBody}>
            <Text variant="caption1" color={colors.textTertiary} style={styles.notesLabel}>
              FINAL NOTES
            </Text>
            <Text variant="body" color={colors.textSecondary}>
              {completion.finalNotes}
            </Text>
          </View>
        </GlassCard>
      ) : null}

      <Text variant="footnote" color={colors.textTertiary} style={styles.jobName}>
        {job.name} stays permanently in SiteVault as a completed Job Folder — every document,
        checklist, hazard assessment, and photo remains accessible after completion.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  cardBody: {
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  completedNote: {
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
  },
  itemLabel: {
    marginLeft: spacing.sm,
  },
  warning: {
    marginTop: spacing.sm,
  },
  deficiencyList: {
    marginTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    paddingTop: spacing.xs,
  },
  deficiencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    gap: spacing.xs,
  },
  deficiencyText: {
    flex: 1,
    marginRight: spacing.xs,
  },
  deficiencyChevron: {
    marginLeft: 2,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  notesLabel: {
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  jobName: {
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
});
