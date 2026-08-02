import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar, Button, Checkbox, Chip, Screen, Text, TextField } from '../../src/components/ui';
import { CHECKLIST_TEMPLATES, HAZARD_TEMPLATES, PEOPLE, PROJECT_TYPES } from '../../src/data/company';
import { createJob } from '../../src/data/mockStore';
import { RoleGate } from '../../src/navigation/RoleGate';
import { useAuth } from '../../src/providers/AuthProvider';
import { colors, radius, spacing } from '../../src/theme';
import type { ProjectType } from '../../src/types/domain';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function NewJobScreen() {
  return (
    <RoleGate allow={['manager']}>
      <NewJobContent />
    </RoleGate>
  );
}

function NewJobContent() {
  const { person } = useAuth();

  const today = new Date();
  const defaultTarget = new Date();
  defaultTarget.setDate(defaultTarget.getDate() + 90);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [client, setClient] = useState('');
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [startDate, setStartDate] = useState(toDateInput(today));
  const [targetDate, setTargetDate] = useState(toDateInput(defaultTarget));
  const [description, setDescription] = useState('');
  const [employeeIds, setEmployeeIds] = useState<string[]>([]);
  const [checklistTemplateIds, setChecklistTemplateIds] = useState<string[]>([]);
  const [hazardTemplateIds, setHazardTemplateIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    address?: string;
    projectType?: string;
    startDate?: string;
    targetDate?: string;
  }>({});

  const employees = PEOPLE.filter((p) => p.role === 'employee');

  const toggleEmployee = (id: string) => {
    setEmployeeIds((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  };

  const toggleChecklistTemplate = (id: string) => {
    setChecklistTemplateIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const toggleHazardTemplate = (id: string) => {
    setHazardTemplateIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleSubmit = async () => {
    if (!person) return;

    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = 'Enter a job name';
    if (!address.trim()) nextErrors.address = 'Enter a job address';
    if (!projectType) nextErrors.projectType = 'Select a project type';
    if (!DATE_RE.test(startDate.trim())) nextErrors.startDate = 'Use YYYY-MM-DD';
    if (!DATE_RE.test(targetDate.trim())) nextErrors.targetDate = 'Use YYYY-MM-DD';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const job = createJob({
      name,
      address,
      client,
      description,
      projectType: projectType as ProjectType,
      startDate: startDate.trim(),
      targetCompletionDate: targetDate.trim(),
      managerId: person.id,
      employeeIds,
      checklistTemplateIds,
      hazardTemplateIds,
    });
    setSubmitting(false);
    router.replace(`/(app)/job/${job.id}`);
  };

  return (
    <Screen glow={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <Text variant="largeTitle" style={styles.title}>
            New Job Folder
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Every job gets one permanent Job Folder. Fill in the basics — you can add documents,
            photos, and more once it&rsquo;s created.
          </Text>

          <TextField
            label="Job Name"
            placeholder="e.g. Riverside Medical Center"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
            returnKeyType="next"
          />

          <TextField
            label="Address"
            placeholder="Street, city, state, zip"
            value={address}
            onChangeText={(t) => {
              setAddress(t);
              if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
            }}
            error={errors.address}
            returnKeyType="next"
          />

          <TextField label="Client Name" placeholder="Client or ownership group" value={client} onChangeText={setClient} returnKeyType="next" />

          <Text variant="footnote" color={colors.textSecondary} style={styles.fieldLabel}>
            Project Type
          </Text>
          <View style={styles.chipRow}>
            {PROJECT_TYPES.map((type) => (
              <Chip
                key={type}
                label={type}
                selected={projectType === type}
                onPress={() => {
                  setProjectType(type);
                  if (errors.projectType) setErrors((prev) => ({ ...prev, projectType: undefined }));
                }}
              />
            ))}
          </View>
          {errors.projectType ? (
            <Text variant="footnote" color={colors.danger} style={styles.errorText}>
              {errors.projectType}
            </Text>
          ) : null}

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
            placeholder="Scope of work..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={styles.textarea}
          />

          <Text variant="title3" style={styles.sectionTitle}>
            Assigned Employees
          </Text>
          <Text variant="footnote" color={colors.textTertiary} style={styles.sectionSubtitle}>
            Choose who&rsquo;s working this job. You can change this later.
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

          <Text variant="title3" style={styles.sectionTitle}>
            Initial Checklist Templates
          </Text>
          <Text variant="footnote" color={colors.textTertiary} style={styles.sectionSubtitle}>
            Generates a job-specific checklist from each template you select.
          </Text>
          <View style={styles.chipRow}>
            {CHECKLIST_TEMPLATES.filter(
              (template) => !template.archived && (template.visibility === 'company' || template.createdBy === person?.id)
            ).map((template) => (
              <Chip
                key={template.id}
                label={template.name}
                selected={checklistTemplateIds.includes(template.id)}
                onPress={() => toggleChecklistTemplate(template.id)}
              />
            ))}
          </View>

          <Text variant="title3" style={styles.sectionTitle}>
            Initial Hazard Assessment Templates
          </Text>
          <Text variant="footnote" color={colors.textTertiary} style={styles.sectionSubtitle}>
            Generates a job-specific hazard assessment from each template you select.
          </Text>
          <View style={styles.chipRow}>
            {HAZARD_TEMPLATES.filter(
              (template) => !template.archived && (template.visibility === 'company' || template.createdBy === person?.id)
            ).map((template) => (
              <Chip
                key={template.id}
                label={template.name}
                selected={hazardTemplateIds.includes(template.id)}
                onPress={() => toggleHazardTemplate(template.id)}
              />
            ))}
          </View>

          <Button
            label="Create Job Folder"
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submitButton}
          />
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
  errorText: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    marginLeft: spacing.xxs,
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
    marginBottom: spacing.xxs,
  },
  sectionSubtitle: {
    marginBottom: spacing.md,
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
