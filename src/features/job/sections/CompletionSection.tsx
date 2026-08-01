import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { type Dispatch, type SetStateAction } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Button, GlassCard, StatusBadge, Text, TextField } from '../../../components/ui';
import { formatDate } from '../../../data/selectors';
import { colors, spacing } from '../../../theme';
import type { Job, ProjectCompletion } from '../../../types/domain';

interface CompletionSectionProps {
  job: Job;
  isManager: boolean;
  completion: ProjectCompletion | undefined;
  setCompletion: Dispatch<SetStateAction<ProjectCompletion | undefined>>;
  openDeficiencyCount: number;
}

export function CompletionSection({
  job,
  isManager,
  completion,
  setCompletion,
  openDeficiencyCount,
}: CompletionSectionProps) {
  if (!completion) return null;

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
        ? { ...prev, isComplete: true, completedAt: new Date().toISOString(), completedBy: 'you' }
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
            <Text variant="footnote" color={colors.danger} style={styles.warning}>
              {openDeficiencyCount} unresolved {openDeficiencyCount === 1 ? 'deficiency' : 'deficiencies'} must be resolved before completion.
            </Text>
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
