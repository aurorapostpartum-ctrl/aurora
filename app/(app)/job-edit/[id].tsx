import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar, Button, Checkbox, Chip, EmptyState, Screen, Text, TextField } from '../../../src/components/ui';
import { PEOPLE, PROJECT_TYPES } from '../../../src/data/company';
import { updateJob } from '../../../src/data/mockStore';
import { getJob } from '../../../src/data/selectors';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { colors, radius, spacing } from '../../../src/theme';
import type { JobStatus, ProjectType } from '../../../src/types/domain';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];

export default function EditJobScreen() {
  return (
    <RoleGate allow={['manager']}>
      <EditJobContent />
    </RoleGate>
  );
}

function EditJobContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = getJob(id);

  if (!job) {
    return (
      <Screen glow={false}>
        <EmptyState icon="folder-open-outline" title="Job not found" />
      </Screen>
    );
  }

  return <EditJobForm job={job} />;
}

function EditJobForm({ job }: { job: NonNullable<ReturnType<typeof getJob>> }) {
  const [name, setName] = useState(job.name);
  const [address, setAddress] = useState(job.address);
  const [client, setClient] = useState(job.client);
  const [projectType, setProjectType] = useState<ProjectType>(job.projectType);
  const [status, setStatus] = useState<JobStatus>(job.status);
  const [startDate, setStartDate] = useState(job.startDate.slice(0, 10));
  const [targetDate, setTargetDate] = useState(job.targetCompletionDate.slice(0, 10));
  const [description, setDescription] = useState(job.description);
  const [employeeIds, setEmployeeIds] = useState<string[]>(job.employeeIds);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; address?: string; startDate?: string; targetDate?: string }>({});

  const employees = PEOPLE.filter((p) => p.role === 'employee');

  const toggleEmployee = (employeeId: string) => {
    setEmployeeIds((prev) => (prev.includes(employeeId) ? prev.filter((e) => e !== employeeId) : [...prev, employeeId]));
  };

  const handleSubmit = () => {
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = 'Enter a job name';
    if (!address.trim()) nextErrors.address = 'Enter a job address';
    if (!DATE_RE.test(startDate.trim())) nextErrors.startDate = 'Use YYYY-MM-DD';
    if (!DATE_RE.test(targetDate.trim())) nextErrors.targetDate = 'Use YYYY-MM-DD';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    updateJob(job.id, {
      name,
      address,
      client,
      projectType,
      status,
      startDate: startDate.trim(),
      targetCompletionDate: targetDate.trim(),
      description,
      employeeIds,
    });
    setSubmitting(false);
    router.back();
  };

  return (
    <Screen glow={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <Text variant="largeTitle" style={styles.title}>
            Edit Job
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            {job.name}
          </Text>

          <TextField
            label="Job Name"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
          />

          <TextField
            label="Address"
            value={address}
            onChangeText={(t) => {
              setAddress(t);
              if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
            }}
            error={errors.address}
          />

          <TextField label="Client Name" value={client} onChangeText={setClient} />

          <Text variant="footnote" color={colors.textSecondary} style={styles.fieldLabel}>
            Project Type
          </Text>
          <View style={styles.chipRow}>
            {PROJECT_TYPES.map((type) => (
              <Chip key={type} label={type} selected={projectType === type} onPress={() => setProjectType(type)} />
            ))}
          </View>

          <Text variant="footnote" color={colors.textSecondary} style={styles.fieldLabel}>
            Status
          </Text>
          <View style={styles.chipRow}>
            {STATUS_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={status === option.value}
                onPress={() => setStatus(option.value)}
              />
            ))}
          </View>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <TextField
                label="Start Date"
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={(t) => {
                  setStartDate(t);
                  if (errors.startDate) setErrors((prev) => ({ ...prev, startDate: undefined }));
                }}
                error={errors.startDate}
              />
            </View>
            <View style={styles.rowItem}>
              <TextField
                label="Est. Completion"
                placeholder="YYYY-MM-DD"
                value={targetDate}
                onChangeText={(t) => {
                  setTargetDate(t);
                  if (errors.targetDate) setErrors((prev) => ({ ...prev, targetDate: undefined }));
                }}
                error={errors.targetDate}
              />
            </View>
          </View>

          <TextField
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={styles.textarea}
          />

          <Text variant="title3" style={styles.sectionTitle}>
            Assigned Employees
          </Text>
          <View style={styles.employeeList}>
            {employees.map((employee) => {
              const checked = employeeIds.includes(employee.id);
              return (
                <Pressable
                  key={employee.id}
                  onPress={() => toggleEmployee(employee.id)}
                  style={[styles.employeeRow, checked && styles.employeeRowChecked]}
                >
                  <Avatar initials={employee.initials} color={employee.avatarColor} size={32} />
                  <View style={styles.employeeText}>
                    <Text variant="subhead">{employee.name}</Text>
                    <Text variant="caption1" color={colors.textTertiary}>
                      {employee.title}
                    </Text>
                  </View>
                  <Checkbox checked={checked} onChange={() => toggleEmployee(employee.id)} />
                </Pressable>
              );
            })}
          </View>

          <Button label="Save Changes" onPress={handleSubmit} loading={submitting} style={styles.submitButton} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 640,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowItem: {
    flex: 1,
  },
  textarea: {
    minHeight: 70,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  employeeList: {
    marginBottom: spacing.md,
  },
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  employeeRowChecked: {
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentMuted,
  },
  employeeText: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
