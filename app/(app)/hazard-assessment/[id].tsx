import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Checkbox, EmptyState, ProgressBar, Screen, StatusBadge, Text, TextField, Toast } from '../../../src/components/ui';
import {
  addCustomHazardItem,
  addHazardItemPhoto,
  removeHazardItem,
  setHazardCurrentStep,
  setHazardItemIdentified,
  signHazardAssessment,
  submitHazardAssessment,
  updateHazardItemControl,
  updateHazardNotes,
  updateHazardWorkDescription,
  useMockDataVersion,
} from '../../../src/data/mockStore';
import { formatLongDate, getHazardAssessment, getJob, personName } from '../../../src/data/selectors';
import { PhotoSourceSheet } from '../../../src/features/photos/PhotoSourceSheet';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, radius, spacing } from '../../../src/theme';
import type { HazardAssessmentStep, JobHazardAssessment, JobHazardItem, Person } from '../../../src/types/domain';

const STEP_TITLES = [
  'What work are you performing today?',
  'Identify hazards',
  'What controls are in place?',
  'Add notes and photos',
  'Review',
  'Digital signature',
  'Submit',
];
const TOTAL_STEPS = STEP_TITLES.length;

export default function HazardAssessmentScreen() {
  return (
    <RoleGate allow={['manager', 'employee']}>
      <HazardAssessmentContent />
    </RoleGate>
  );
}

function HazardAssessmentContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { person } = useAuth();
  useMockDataVersion();
  const [toast, setToast] = useState<string | null>(null);

  const record = getHazardAssessment(id);
  const job = record ? getJob(record.jobId) : undefined;

  const [step, setStep] = useState<HazardAssessmentStep>(() => record?.currentStep ?? 0);

  if (!record || !job || !person) {
    return (
      <Screen glow={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
            <Text variant="subhead" color={colors.textPrimary} style={styles.backLabel}>
              Hazard Assessments
            </Text>
          </Pressable>
        </View>
        <EmptyState icon="warning-outline" title="Hazard assessment not found" />
      </Screen>
    );
  }

  const isSubmitted = record.status === 'completed';
  const identifiedHazards = record.hazards.filter((h) => h.identified);

  const goToStep = (next: HazardAssessmentStep) => {
    setStep(next);
    setHazardCurrentStep(record.id, next);
  };

  const handleSaveExit = () => {
    setToast('Progress saved');
    router.back();
  };

  const handleSubmit = () => {
    submitHazardAssessment(record.id, person.id);
    setToast('Hazard assessment submitted');
  };

  const canProceed = (() => {
    switch (step) {
      case 0:
        return record.workDescription.trim().length > 0;
      case 1:
        return identifiedHazards.length > 0;
      case 2:
        return identifiedHazards.every((h) => h.controlMeasure.trim().length > 0);
      case 3:
        return identifiedHazards.every((h) => !h.requiresPhoto || (h.photoIds && h.photoIds.length > 0));
      case 5:
        return Boolean(record.signatureName && record.signatureName.trim().length > 0);
      default:
        return true;
    }
  })();

  return (
    <Screen glow={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          <Text variant="subhead" color={colors.textPrimary} style={styles.backLabel}>
            Hazard Assessments
          </Text>
        </Pressable>
        <StatusBadge label={isSubmitted ? 'Completed' : 'In Progress'} tone={isSubmitted ? 'success' : 'warning'} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <View style={styles.letterhead}>
            <Text variant="caption1" color={colors.inkTertiary} style={styles.letterheadAddress}>
              {job.address.toUpperCase()}
            </Text>
            <Text variant="title1" color={colors.ink} style={styles.letterheadTitle}>
              {record.templateName}
            </Text>
            <Text variant="subhead" color={colors.inkSecondary} style={styles.letterheadDate}>
              {formatLongDate(isSubmitted && record.completedAt ? record.completedAt : record.generatedAt)}
            </Text>

            <View style={styles.letterheadDivider} />

            <View style={styles.letterheadMetaRow}>
              <View>
                <Text variant="monoLabel" color={colors.inkTertiary}>
                  JOB
                </Text>
                <Text variant="subhead" color={colors.ink}>
                  {job.name}
                </Text>
              </View>
              <View>
                <Text variant="monoLabel" color={colors.inkTertiary}>
                  EMPLOYEE
                </Text>
                <Text variant="subhead" color={colors.ink}>
                  {personName(record.generatedBy)}
                </Text>
              </View>
              <View>
                <Text variant="monoLabel" color={colors.inkTertiary}>
                  TRADE
                </Text>
                <Text variant="subhead" color={colors.ink}>
                  {record.trade}
                </Text>
              </View>
            </View>

            {!isSubmitted ? (
              <>
                <ProgressBar
                  progress={(step / (TOTAL_STEPS - 1)) * 100}
                  trackColor="rgba(20,20,20,0.10)"
                  fillColor={colors.accentStrong}
                  style={styles.progress}
                />
                <Text variant="footnote" color={colors.inkSecondary}>
                  Step {step + 1} of {TOTAL_STEPS} · {STEP_TITLES[step]}
                </Text>
              </>
            ) : null}
          </View>

          {isSubmitted ? (
            <>
              <View style={styles.submittedBanner}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text variant="footnote" color={colors.textSecondary} style={styles.submittedText}>
                  Submitted by {personName(record.completedBy)} on{' '}
                  {record.completedAt ? formatLongDate(record.completedAt) : ''}. This record is permanent and can
                  no longer be edited.
                </Text>
              </View>
              <AssessmentSummary record={record} locked />
            </>
          ) : (
            <>
              <Text variant="title2" style={styles.stepTitle}>
                {STEP_TITLES[step]}
              </Text>

              {step === 0 ? <WorkStep record={record} /> : null}
              {step === 1 ? <HazardsStep record={record} /> : null}
              {step === 2 ? <ControlsStep record={record} /> : null}
              {step === 3 ? <NotesStep record={record} person={person} /> : null}
              {step === 4 ? <AssessmentSummary record={record} onJump={goToStep} /> : null}
              {step === 5 ? <SignatureStep record={record} defaultName={person.name} /> : null}
              {step === 6 ? <SubmitStep record={record} /> : null}

              <View style={styles.navRow}>
                <Button
                  label="Back"
                  variant="secondary"
                  onPress={() => goToStep((step - 1) as HazardAssessmentStep)}
                  disabled={step === 0}
                  style={styles.navButton}
                />
                {step === 6 ? (
                  <Button label="Submit Assessment" onPress={handleSubmit} style={styles.navButton} />
                ) : (
                  <Button
                    label="Next"
                    onPress={() => goToStep((step + 1) as HazardAssessmentStep)}
                    disabled={!canProceed}
                    style={styles.navButton}
                  />
                )}
              </View>

              <Pressable onPress={handleSaveExit} style={styles.saveExitLink}>
                <Ionicons name="save-outline" size={14} color={colors.accentStrong} />
                <Text variant="footnote" color={colors.accentStrong} style={styles.saveExitLabel}>
                  Save & Continue Later
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>

      {toast ? <Toast message={toast} onHide={() => setToast(null)} /> : null}
    </Screen>
  );
}

function groupBySection(hazards: JobHazardItem[]): { name: string | undefined; items: JobHazardItem[] }[] {
  const groups: { name: string | undefined; items: JobHazardItem[] }[] = [];
  for (const item of hazards) {
    const last = groups[groups.length - 1];
    if (last && last.name === item.sectionName) {
      last.items.push(item);
    } else {
      groups.push({ name: item.sectionName, items: [item] });
    }
  }
  return groups;
}

function WorkStep({ record }: { record: JobHazardAssessment }) {
  const [draft, setDraft] = useState(record.workDescription);
  return (
    <View style={styles.stepBody}>
      <Text variant="footnote" color={colors.textSecondary} style={styles.stepHint}>
        Briefly describe the task so this assessment is tied to what's actually happening today.
      </Text>
      <TextField
        label=""
        placeholder="e.g. Installing roof edge protection on Building B, level 3"
        value={draft}
        onChangeText={setDraft}
        onBlur={() => updateHazardWorkDescription(record.id, draft)}
        multiline
        style={styles.workInput}
      />
    </View>
  );
}

function HazardsStep({ record }: { record: JobHazardAssessment }) {
  const [customText, setCustomText] = useState('');
  const groups = groupBySection(record.hazards);

  const handleAddCustom = () => {
    if (!customText.trim()) return;
    addCustomHazardItem(record.id, customText);
    setCustomText('');
  };

  return (
    <View style={styles.stepBody}>
      <Text variant="footnote" color={colors.textSecondary} style={styles.stepHint}>
        Check every hazard present on site today. Examples: working at heights, electrical hazards, moving
        equipment, excavation, slips and trips. Add anything else with "Other" below.
      </Text>

      {groups.map((group, groupIndex) => (
        <View key={groupIndex} style={styles.group}>
          {group.name || group.items[0]?.custom ? (
            <Text variant="caption1" color={colors.textTertiary} style={styles.groupLabel}>
              {(group.name ?? 'ADDED BY YOU').toUpperCase()}
            </Text>
          ) : null}
          {group.items.map((item) => (
            <View key={item.id} style={styles.hazardOptionRow}>
              <View style={styles.hazardOptionLeft}>
                <Checkbox
                  checked={item.identified}
                  onChange={(next) => setHazardItemIdentified(record.id, item.id, next)}
                  label={item.hazard}
                />
              </View>
              <View style={styles.hazardOptionRight}>
                {item.required ? <StatusBadge label="Required" tone="warning" /> : null}
                {item.custom ? (
                  <Pressable
                    onPress={() => removeHazardItem(record.id, item.id)}
                    hitSlop={8}
                    accessibilityLabel={`Remove ${item.hazard}`}
                  >
                    <Ionicons name="close-circle-outline" size={18} color={colors.textTertiary} />
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.addCustomRow}>
        <TextField
          label=""
          placeholder="Other — hazard not listed above"
          value={customText}
          onChangeText={setCustomText}
          onSubmitEditing={handleAddCustom}
          style={styles.addCustomInput}
        />
        <Button label="Add" variant="secondary" size="md" fullWidth={false} onPress={handleAddCustom} />
      </View>
    </View>
  );
}

function ControlsStep({ record }: { record: JobHazardAssessment }) {
  const identified = record.hazards.filter((h) => h.identified);
  return (
    <View style={styles.stepBody}>
      <Text variant="footnote" color={colors.textSecondary} style={styles.stepHint}>
        Confirm or edit the control measure in place for each hazard you identified.
      </Text>
      {identified.map((item) => (
        <ControlItemCard key={item.id} item={item} recordId={record.id} />
      ))}
    </View>
  );
}

function ControlItemCard({ item, recordId }: { item: JobHazardItem; recordId: string }) {
  const [draft, setDraft] = useState(item.controlMeasure);
  return (
    <View style={styles.controlCard}>
      <View style={styles.controlHeaderRow}>
        <Text variant="body" style={styles.controlHazardText}>
          {item.hazard}
        </Text>
        {item.required ? <StatusBadge label="Required" tone="warning" /> : null}
      </View>
      <TextField
        label=""
        placeholder="Control measure in place"
        value={draft}
        onChangeText={setDraft}
        onBlur={() => updateHazardItemControl(recordId, item.id, draft)}
        multiline
        style={styles.controlInput}
      />
    </View>
  );
}

function NotesStep({ record, person }: { record: JobHazardAssessment; person: Person }) {
  const [draft, setDraft] = useState(record.notes);
  const [photoSheetItemId, setPhotoSheetItemId] = useState<string | null>(null);
  const photoItems = record.hazards.filter((h) => h.identified && h.requiresPhoto);

  return (
    <View style={styles.stepBody}>
      <Text variant="footnote" color={colors.textSecondary} style={styles.stepHint}>
        Add any additional notes, then attach photos for hazards that require one.
      </Text>
      <TextField
        label="Notes"
        placeholder="Anything else worth noting about today's conditions..."
        value={draft}
        onChangeText={setDraft}
        onBlur={() => updateHazardNotes(record.id, draft)}
        multiline
        style={styles.notesInput}
      />

      {photoItems.length > 0 ? (
        <>
          <Text variant="caption1" color={colors.textTertiary} style={styles.groupLabel}>
            PHOTOS REQUIRED
          </Text>
          {photoItems.map((item) => {
            const count = item.photoIds?.length ?? 0;
            const needsPhoto = count === 0;
            return (
              <View key={item.id} style={styles.photoRow}>
                <Ionicons name="camera-outline" size={15} color={needsPhoto ? colors.warning : colors.textSecondary} />
                <Text
                  variant="footnote"
                  color={needsPhoto ? colors.warning : colors.textSecondary}
                  style={styles.photoLabel}
                  numberOfLines={1}
                >
                  {item.hazard} — {count > 0 ? `${count} photo${count === 1 ? '' : 's'} attached` : 'Photo required'}
                </Text>
                <Pressable onPress={() => setPhotoSheetItemId(item.id)} hitSlop={6}>
                  <Text variant="footnote" color={colors.accentStrong}>
                    Add Photo
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </>
      ) : null}

      <PhotoSourceSheet
        visible={photoSheetItemId !== null}
        onClose={() => setPhotoSheetItemId(null)}
        onPicked={(uri) => {
          if (photoSheetItemId) addHazardItemPhoto(record.id, photoSheetItemId, person.id, uri);
        }}
      />
    </View>
  );
}

function SummarySection({ title, onEdit, children }: { title: string; onEdit?: () => void; children: ReactNode }) {
  return (
    <View style={styles.summarySection}>
      <View style={styles.summarySectionHeader}>
        <Text variant="caption1" color={colors.textTertiary} style={styles.groupLabel}>
          {title.toUpperCase()}
        </Text>
        {onEdit ? (
          <Pressable onPress={onEdit} hitSlop={8}>
            <Text variant="footnote" color={colors.accentStrong}>
              Edit
            </Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.summaryCard}>{children}</View>
    </View>
  );
}

function AssessmentSummary({
  record,
  locked = false,
  onJump,
}: {
  record: JobHazardAssessment;
  locked?: boolean;
  onJump?: (step: HazardAssessmentStep) => void;
}) {
  const identified = record.hazards.filter((h) => h.identified);
  const totalPhotos = identified.reduce((sum, h) => sum + (h.photoIds?.length ?? 0), 0);
  const edit = locked || !onJump ? undefined : onJump;

  return (
    <View style={styles.stepBody}>
      <SummarySection title="Work Performed" onEdit={edit ? () => edit(0) : undefined}>
        <Text variant="body" color={colors.textSecondary}>
          {record.workDescription || '—'}
        </Text>
      </SummarySection>

      <SummarySection title={`Hazards Identified (${identified.length})`} onEdit={edit ? () => edit(1) : undefined}>
        {identified.length === 0 ? (
          <Text variant="body" color={colors.textTertiary}>
            No hazards identified
          </Text>
        ) : (
          identified.map((item, index) => (
            <View key={item.id} style={index > 0 ? styles.summaryItemDivider : undefined}>
              <Text variant="subhead" color={colors.textPrimary}>
                {item.hazard}
              </Text>
              <Text variant="footnote" color={colors.textSecondary} style={styles.control}>
                Control: {item.controlMeasure || '—'}
              </Text>
            </View>
          ))
        )}
      </SummarySection>

      <SummarySection title="Notes & Photos" onEdit={edit ? () => edit(3) : undefined}>
        <Text variant="body" color={colors.textSecondary}>
          {record.notes || 'No additional notes'}
        </Text>
        <Text variant="footnote" color={colors.textTertiary} style={styles.control}>
          {totalPhotos} photo{totalPhotos === 1 ? '' : 's'} attached
        </Text>
      </SummarySection>

      {record.signatureName ? (
        <SummarySection title="Signature">
          <Text variant="body" color={colors.textSecondary}>
            {record.signatureName}
            {record.signedAt ? ` · ${formatLongDate(record.signedAt)}` : ''}
          </Text>
        </SummarySection>
      ) : null}
    </View>
  );
}

function SignatureStep({ record, defaultName }: { record: JobHazardAssessment; defaultName: string }) {
  const [name, setName] = useState(record.signatureName || defaultName);
  const [certified, setCertified] = useState(Boolean(record.signatureName));

  const handleCertifyChange = (next: boolean) => {
    setCertified(next);
    if (next && name.trim()) {
      signHazardAssessment(record.id, name);
    } else if (!next) {
      signHazardAssessment(record.id, '');
    }
  };

  const handleNameBlur = () => {
    if (certified && name.trim()) {
      signHazardAssessment(record.id, name);
    }
  };

  return (
    <View style={styles.stepBody}>
      <Text variant="footnote" color={colors.textSecondary} style={styles.stepHint}>
        Type your full name to certify this hazard assessment is accurate to the best of your knowledge.
      </Text>
      <TextField
        label="Signature (type your full name)"
        placeholder="Full name"
        value={name}
        onChangeText={setName}
        onBlur={handleNameBlur}
        style={styles.signatureInput}
      />
      <Checkbox
        checked={certified}
        onChange={handleCertifyChange}
        label="I certify that this hazard assessment is accurate to the best of my knowledge."
      />
    </View>
  );
}

function SubmitStep({ record }: { record: JobHazardAssessment }) {
  const identifiedCount = record.hazards.filter((h) => h.identified).length;
  return (
    <View style={styles.stepBody}>
      <View style={styles.submitCard}>
        <Ionicons name="shield-checkmark-outline" size={28} color={colors.accentStrong} />
        <Text variant="headline" style={styles.submitCardTitle}>
          Ready to submit
        </Text>
        <Text variant="footnote" color={colors.textSecondary} style={styles.submitCardBody}>
          {identifiedCount} hazard{identifiedCount === 1 ? '' : 's'} identified, signed by {record.signatureName}.
          Once submitted, this assessment is permanent and can no longer be edited.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
  },
  backLabel: {
    marginLeft: 2,
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
  letterhead: {
    backgroundColor: colors.paper,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.paperBorder,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 26,
    elevation: 8,
  },
  letterheadAddress: {
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  letterheadTitle: {
    marginBottom: 2,
  },
  letterheadDate: {
    marginBottom: spacing.md,
  },
  letterheadDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.paperBorder,
    marginBottom: spacing.md,
  },
  letterheadMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  progress: {
    marginBottom: spacing.sm,
  },
  submittedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.successMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(79,169,104,0.35)',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  submittedText: {
    flex: 1,
  },
  stepTitle: {
    marginBottom: spacing.sm,
  },
  stepBody: {
    marginBottom: spacing.md,
  },
  stepHint: {
    marginBottom: spacing.md,
  },
  workInput: {
    marginBottom: 0,
    minHeight: 96,
  },
  group: {
    marginBottom: spacing.sm,
  },
  groupLabel: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
    letterSpacing: 1,
  },
  hazardOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    gap: spacing.sm,
  },
  hazardOptionLeft: {
    flex: 1,
  },
  hazardOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addCustomRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  addCustomInput: {
    flex: 1,
    marginBottom: 0,
  },
  controlCard: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  controlHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  controlHazardText: {
    flex: 1,
  },
  controlInput: {
    marginBottom: 0,
  },
  notesInput: {
    marginBottom: spacing.md,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  photoLabel: {
    flex: 1,
  },
  summarySection: {
    marginBottom: spacing.md,
  },
  summarySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
    marginRight: spacing.xxs,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  summaryItemDivider: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  control: {
    marginTop: 2,
  },
  signatureInput: {
    marginBottom: spacing.md,
  },
  submitCard: {
    alignItems: 'center',
    textAlign: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
  },
  submitCardTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  submitCardBody: {
    textAlign: 'center',
  },
  navRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  navButton: {
    flex: 1,
  },
  saveExitLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    padding: spacing.xs,
  },
  saveExitLabel: {
    marginLeft: spacing.xxs,
  },
});
