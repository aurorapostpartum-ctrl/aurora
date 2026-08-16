import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, BottomSheet, Button, Checkbox, EmptyRow, Text } from '../../components/ui';
import { PEOPLE } from '../../data/company';
import { addEmployeesToJob, recordActivity } from '../../data/mockStore';
import { personName } from '../../data/selectors';
import { colors, radius, spacing } from '../../theme';
import type { Job } from '../../types/domain';

export interface AddEmployeeSheetProps {
  visible: boolean;
  onClose: () => void;
  job: Job;
  actorId: string;
}

export function AddEmployeeSheet({ visible, onClose, job, actorId }: AddEmployeeSheetProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const available = PEOPLE.filter((p) => p.role === 'employee' && !job.employeeIds.includes(p.id));

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  };

  const handleClose = () => {
    setSelected([]);
    onClose();
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    addEmployeesToJob(job.id, selected);
    const names = selected.map((id) => personName(id)).join(', ');
    recordActivity({
      jobId: job.id,
      type: 'employee_assigned',
      actorId,
      summary: `Assigned ${names} to ${job.name}`,
    });
    setSelected([]);
    onClose();
  };

  return (
    <BottomSheet visible={visible} title="Add Employee" onClose={handleClose}>
      {available.length === 0 ? (
        <EmptyRow icon="checkmark-done-outline" message="Everyone is already assigned to this job" />
      ) : (
        <View style={styles.list}>
          {available.map((person) => {
            const checked = selected.includes(person.id);
            return (
              <Pressable
                key={person.id}
                onPress={() => toggle(person.id)}
                style={[styles.row, checked && styles.rowChecked]}
              >
                <Avatar initials={person.initials} color={person.avatarColor} size={32} />
                <View style={styles.rowText}>
                  <Text variant="subhead">{person.name}</Text>
                  <Text variant="caption1" color={colors.textTertiary}>
                    {person.title}
                  </Text>
                </View>
                <Checkbox checked={checked} onChange={() => toggle(person.id)} />
              </Pressable>
            );
          })}
          <Button
            label={selected.length > 0 ? `Add ${selected.length} to Job` : 'Select employees to add'}
            onPress={handleSubmit}
            disabled={selected.length === 0}
            style={styles.submitButton}
          />
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  rowChecked: {
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentMuted,
  },
  rowText: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});
