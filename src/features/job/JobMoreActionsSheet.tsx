import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet, Text } from '../../components/ui';
import { duplicateJob, setJobStatus } from '../../data/mockStore';
import { colors, radius, spacing } from '../../theme';
import type { Job, JobStatus } from '../../types/domain';

export interface JobMoreActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  job: Job;
  actorId: string;
  onEditJob: () => void;
  onAddEmployee: () => void;
}

const STATUS_OPTIONS: { value: JobStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'active', label: 'Mark Active', icon: 'play-circle-outline' },
  { value: 'on_hold', label: 'Mark On Hold', icon: 'pause-circle-outline' },
  { value: 'completed', label: 'Mark Completed', icon: 'checkmark-circle-outline' },
];

export function JobMoreActionsSheet({ visible, onClose, job, actorId, onEditJob, onAddEmployee }: JobMoreActionsSheetProps) {
  const [busy, setBusy] = useState(false);

  const handleDuplicate = () => {
    setBusy(true);
    const copy = duplicateJob(job.id, actorId);
    setBusy(false);
    onClose();
    if (copy) router.push(`/(app)/job/${copy.id}`);
  };

  const handleStatus = (status: JobStatus) => {
    setJobStatus(job.id, status);
    onClose();
  };

  return (
    <BottomSheet visible={visible} title="More Actions" onClose={onClose}>
      <View style={styles.list}>
        <Text variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
          MANAGE
        </Text>
        <Pressable onPress={onEditJob} style={styles.row}>
          <Ionicons name="pencil-outline" size={18} color={colors.textPrimary} />
          <Text variant="subhead" style={styles.rowLabel}>
            Edit Job
          </Text>
        </Pressable>
        <Pressable onPress={onAddEmployee} style={styles.row}>
          <Ionicons name="person-add-outline" size={18} color={colors.textPrimary} />
          <Text variant="subhead" style={styles.rowLabel}>
            Add Employee
          </Text>
        </Pressable>

        <Text variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
          CHANGE STATUS
        </Text>
        {STATUS_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => handleStatus(option.value)}
            disabled={job.status === option.value}
            style={[styles.row, job.status === option.value && styles.rowDisabled]}
          >
            <Ionicons name={option.icon} size={18} color={job.status === option.value ? colors.textTertiary : colors.textPrimary} />
            <Text
              variant="subhead"
              color={job.status === option.value ? colors.textTertiary : colors.textPrimary}
              style={styles.rowLabel}
            >
              {option.label}
            </Text>
            {job.status === option.value ? (
              <Text variant="caption1" color={colors.textTertiary}>
                Current
              </Text>
            ) : null}
          </Pressable>
        ))}

        <Text variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
          MORE
        </Text>
        <Pressable onPress={handleDuplicate} disabled={busy} style={styles.row}>
          <Ionicons name="copy-outline" size={18} color={colors.textPrimary} />
          <Text variant="subhead" style={styles.rowLabel}>
            Duplicate Job
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.lg,
  },
  sectionLabel: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  rowLabel: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});
