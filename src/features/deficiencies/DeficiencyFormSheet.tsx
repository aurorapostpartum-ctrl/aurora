import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BottomSheet, Button, Chip, SelectModal, Text, TextField } from '../../components/ui';
import { assignDeficiency, createDeficiency, updateDeficiency } from '../../data/mockStore';
import { getPerson, personName } from '../../data/selectors';
import { colors, radius, spacing } from '../../theme';
import type { Deficiency, DeficiencyPriority, Job } from '../../types/domain';

export interface DeficiencyFormSheetProps {
  visible: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  job: Job;
  actorId: string;
  deficiency?: Deficiency;
  onSaved?: (deficiency: Deficiency) => void;
}

const PRIORITY_OPTIONS: DeficiencyPriority[] = ['low', 'medium', 'high'];

export function DeficiencyFormSheet({ visible, onClose, mode, job, actorId, deficiency, onSaved }: DeficiencyFormSheetProps) {
  const [title, setTitle] = useState(deficiency?.title ?? '');
  const [description, setDescription] = useState(deficiency?.description ?? '');
  const [location, setLocation] = useState(deficiency?.location ?? '');
  const [priority, setPriority] = useState<DeficiencyPriority>(deficiency?.priority ?? 'medium');
  const [assignedTo, setAssignedTo] = useState<string | undefined>(deficiency?.assignedTo);
  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const jobPeople = [...job.managerIds, ...job.employeeIds]
    .map((id) => getPerson(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const reset = () => {
    setTitle(deficiency?.title ?? '');
    setDescription(deficiency?.description ?? '');
    setLocation(deficiency?.location ?? '');
    setPriority(deficiency?.priority ?? 'medium');
    setAssignedTo(deficiency?.assignedTo);
    setError(undefined);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Describe what's wrong");
      return;
    }
    setError(undefined);

    if (mode === 'create') {
      const created = createDeficiency({
        jobId: job.id,
        title,
        description,
        location,
        priority,
        reportedBy: actorId,
        assignedTo,
      });
      handleClose();
      onSaved?.(created);
    } else if (deficiency) {
      const updated = updateDeficiency(deficiency.id, { title, description, location, priority });
      if (assignedTo !== deficiency.assignedTo) {
        assignDeficiency(deficiency.id, assignedTo, actorId);
      }
      handleClose();
      if (updated) onSaved?.(updated);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      title={mode === 'create' ? 'Report Deficiency' : 'Edit Deficiency'}
      onClose={handleClose}
      maxHeightPercent={90}
    >
      <View style={styles.body}>
        <TextField
          label="What's wrong?"
          placeholder="e.g. Repair damaged drywall in Unit 204"
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            if (error) setError(undefined);
          }}
          error={error}
        />
        <TextField
          label="Description"
          placeholder="Add detail that helps whoever fixes this"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextField label="Location" placeholder="e.g. Building A, Unit 204" value={location} onChangeText={setLocation} />

        <Text variant="footnote" color={colors.textSecondary} style={styles.fieldLabel}>
          Priority
        </Text>
        <View style={styles.chipRow}>
          {PRIORITY_OPTIONS.map((p) => (
            <Chip key={p} label={p[0].toUpperCase() + p.slice(1)} selected={priority === p} onPress={() => setPriority(p)} />
          ))}
        </View>

        <Text variant="footnote" color={colors.textSecondary} style={styles.fieldLabel}>
          Assigned To
        </Text>
        <Pressable onPress={() => setAssigneePickerOpen(true)} style={styles.assigneeButton}>
          <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
          <Text variant="subhead" color={assignedTo ? colors.textPrimary : colors.textTertiary} style={styles.assigneeLabel}>
            {assignedTo ? personName(assignedTo) : 'Unassigned'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.textTertiary} />
        </Pressable>

        <Button
          label={mode === 'create' ? 'Submit Deficiency' : 'Save Changes'}
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </View>

      <SelectModal
        visible={assigneePickerOpen}
        title="Assign To"
        options={[{ label: 'Unassigned', value: '' }, ...jobPeople.map((p) => ({ label: p.name, value: p.id }))]}
        selectedValue={assignedTo ?? ''}
        onSelect={(value) => setAssignedTo(value || undefined)}
        onClose={() => setAssigneePickerOpen(false)}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingBottom: spacing.lg,
  },
  fieldLabel: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  assigneeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  assigneeLabel: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.xs,
  },
});
