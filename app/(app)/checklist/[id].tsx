import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, ProgressBar, Screen, StatusBadge, Text, TextField, Toast } from '../../../src/components/ui';
import {
  addChecklistItemPhoto,
  submitChecklist,
  updateChecklistItemNote,
  updateChecklistItemStatus,
  useMockDataVersion,
} from '../../../src/data/mockStore';
import { formatLongDate, getChecklist, getJob, personName } from '../../../src/data/selectors';
import { PhotoSourceSheet } from '../../../src/features/photos/PhotoSourceSheet';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, radius, spacing } from '../../../src/theme';
import type { ChecklistItem, ChecklistItemStatus } from '../../../src/types/domain';

const STATUS_META: Record<
  Exclude<ChecklistItemStatus, 'pending'>,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  complete: { label: 'Complete', color: colors.success, icon: 'checkmark-circle' },
  incomplete: { label: 'Incomplete', color: colors.danger, icon: 'close-circle' },
  na: { label: 'N/A', color: colors.textSecondary, icon: 'remove-circle' },
};

const STATUS_OPTIONS: Exclude<ChecklistItemStatus, 'pending'>[] = ['complete', 'incomplete', 'na'];

export default function ChecklistRecordScreen() {
  return (
    <RoleGate allow={['manager', 'employee']}>
      <ChecklistRecordContent />
    </RoleGate>
  );
}

function ChecklistRecordContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { person } = useAuth();
  useMockDataVersion();
  const [toast, setToast] = useState<string | null>(null);
  const [photoSheetItemId, setPhotoSheetItemId] = useState<string | null>(null);

  const checklist = getChecklist(id);
  const job = checklist ? getJob(checklist.jobId) : undefined;

  if (!checklist || !job || !person) {
    return (
      <Screen glow={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
            <Text variant="subhead" color={colors.textPrimary} style={styles.backLabel}>
              Checklists
            </Text>
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Ionicons name="checkbox-outline" size={32} color={colors.textTertiary} />
          <Text variant="headline" color={colors.textTertiary} style={styles.notFoundText}>
            Checklist not found
          </Text>
        </View>
      </Screen>
    );
  }

  const isSubmitted = checklist.status === 'completed';
  const total = checklist.items.length;
  const answered = checklist.items.filter((i) => i.status !== 'pending').length;
  const completionPercent = total > 0 ? Math.round((answered / total) * 100) : 0;

  const missingAnswers = checklist.items.filter((i) => i.status === 'pending');
  const missingPhotos = checklist.items.filter((i) => i.requiresPhoto && !(i.photoIds && i.photoIds.length > 0));
  const canSubmit = !isSubmitted && missingAnswers.length === 0 && missingPhotos.length === 0;

  const blockReason = isSubmitted
    ? undefined
    : missingAnswers.length > 0
      ? `${missingAnswers.length} item${missingAnswers.length === 1 ? '' : 's'} still need${missingAnswers.length === 1 ? 's' : ''} a response`
      : missingPhotos.length > 0
        ? `${missingPhotos.length} required photo${missingPhotos.length === 1 ? '' : 's'} missing`
        : undefined;

  // Group items by section, preserving order; items without a sectionName render in one unlabeled group.
  const groups: { name: string | undefined; items: ChecklistItem[] }[] = [];
  for (const item of checklist.items) {
    const last = groups[groups.length - 1];
    if (last && last.name === item.sectionName) {
      last.items.push(item);
    } else {
      groups.push({ name: item.sectionName, items: [item] });
    }
  }

  const handleSetStatus = (itemId: string, status: ChecklistItemStatus) => {
    updateChecklistItemStatus(checklist.id, itemId, status);
  };

  const handleNoteBlur = (itemId: string, note: string) => {
    updateChecklistItemNote(checklist.id, itemId, note);
  };

  const handleAddPhoto = (itemId: string) => {
    setPhotoSheetItemId(itemId);
  };

  const handlePhotoPicked = (uri: string) => {
    if (!photoSheetItemId) return;
    addChecklistItemPhoto(checklist.id, photoSheetItemId, person.id, uri);
    setToast('Photo attached');
  };

  const handleSaveProgress = () => {
    setToast('Progress saved');
    router.back();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    submitChecklist(checklist.id, person.id);
    setToast('Checklist submitted');
  };

  return (
    <Screen glow={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          <Text variant="subhead" color={colors.textPrimary} style={styles.backLabel}>
            Checklists
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
              {checklist.templateName}
            </Text>
            <Text variant="subhead" color={colors.inkSecondary} style={styles.letterheadDate}>
              {formatLongDate(isSubmitted && checklist.completedAt ? checklist.completedAt : checklist.generatedAt)}
            </Text>

            <View style={styles.letterheadDivider} />

            <View style={styles.letterheadMetaRow}>
              <View>
                <Text variant="caption2" color={colors.inkTertiary}>
                  JOB
                </Text>
                <Text variant="subhead" color={colors.ink}>
                  {job.name}
                </Text>
              </View>
              <View>
                <Text variant="caption2" color={colors.inkTertiary}>
                  EMPLOYEE
                </Text>
                <Text variant="subhead" color={colors.ink}>
                  {personName(checklist.generatedBy)}
                </Text>
              </View>
              <View>
                <Text variant="caption2" color={colors.inkTertiary}>
                  TRADE
                </Text>
                <Text variant="subhead" color={colors.ink}>
                  {checklist.trade}
                </Text>
              </View>
            </View>

            <ProgressBar
              progress={completionPercent}
              trackColor="rgba(29,24,16,0.10)"
              fillColor={isSubmitted ? colors.success : colors.accentStrong}
              style={styles.progress}
            />
            <View style={styles.progressRow}>
              <Text variant="title3" color={colors.ink}>
                {completionPercent}%
              </Text>
              <Text variant="footnote" color={colors.inkSecondary} style={styles.progressLabel}>
                complete · {answered} of {total} items
              </Text>
            </View>
          </View>

          {isSubmitted ? (
            <View style={styles.submittedBanner}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text variant="footnote" color={colors.textSecondary} style={styles.submittedText}>
                Submitted by {personName(checklist.completedBy)} on{' '}
                {checklist.completedAt ? formatLongDate(checklist.completedAt) : ''}. This record is permanent and
                can no longer be edited.
              </Text>
            </View>
          ) : null}

          {groups.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.group}>
              {group.name ? (
                <Text variant="caption1" color={colors.textTertiary} style={styles.groupLabel}>
                  {group.name.toUpperCase()}
                </Text>
              ) : null}
              {group.items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  locked={isSubmitted}
                  onSetStatus={(status) => handleSetStatus(item.id, status)}
                  onNoteBlur={(note) => handleNoteBlur(item.id, note)}
                  onAddPhoto={() => handleAddPhoto(item.id)}
                />
              ))}
            </View>
          ))}

          {!isSubmitted ? (
            <View style={styles.actionsRow}>
              <Button label="Save Progress" variant="secondary" onPress={handleSaveProgress} style={styles.actionButton} />
              <Button label="Submit" onPress={handleSubmit} disabled={!canSubmit} style={styles.actionButton} />
            </View>
          ) : null}
          {!isSubmitted && blockReason ? (
            <Text variant="footnote" color={colors.textTertiary} style={styles.blockReason}>
              {blockReason}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <PhotoSourceSheet
        visible={photoSheetItemId !== null}
        onClose={() => setPhotoSheetItemId(null)}
        onPicked={handlePhotoPicked}
      />
      {toast ? <Toast message={toast} onHide={() => setToast(null)} /> : null}
    </Screen>
  );
}

function ItemCard({
  item,
  locked,
  onSetStatus,
  onNoteBlur,
  onAddPhoto,
}: {
  item: ChecklistItem;
  locked: boolean;
  onSetStatus: (status: ChecklistItemStatus) => void;
  onNoteBlur: (note: string) => void;
  onAddPhoto: () => void;
}) {
  const [noteDraft, setNoteDraft] = useState(item.note ?? '');
  const [notesOpen, setNotesOpen] = useState(Boolean(item.note));
  const photoCount = item.photoIds?.length ?? 0;
  const needsPhoto = Boolean(item.requiresPhoto) && photoCount === 0;

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemHeaderRow}>
        <Text variant="body" style={styles.itemText}>
          {item.text}
        </Text>
        {item.required ? <StatusBadge label="Required" tone="warning" /> : null}
      </View>

      <View style={styles.statusRow}>
        {STATUS_OPTIONS.map((status) => {
          const meta = STATUS_META[status];
          const selected = item.status === status;
          return (
            <Pressable
              key={status}
              onPress={() => onSetStatus(status)}
              disabled={locked}
              style={[
                styles.statusButton,
                selected && { backgroundColor: `${meta.color}26`, borderColor: meta.color },
                locked && styles.statusButtonDisabled,
              ]}
            >
              <Ionicons name={meta.icon} size={15} color={selected ? meta.color : colors.textTertiary} />
              <Text variant="footnote" color={selected ? meta.color : colors.textSecondary} style={styles.statusLabel}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {item.requiresPhoto ? (
        <View style={styles.photoRow}>
          <Ionicons name="camera-outline" size={15} color={needsPhoto ? colors.warning : colors.textSecondary} />
          <Text variant="footnote" color={needsPhoto ? colors.warning : colors.textSecondary} style={styles.photoLabel}>
            {photoCount > 0 ? `${photoCount} photo${photoCount === 1 ? '' : 's'} attached` : 'Photo required'}
          </Text>
          {!locked ? (
            <Pressable onPress={onAddPhoto} hitSlop={6}>
              <Text variant="footnote" color={colors.accentStrong}>
                Add Photo
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {locked ? (
        item.note ? (
          <Text variant="footnote" color={colors.textSecondary} style={styles.lockedNote}>
            {item.note}
          </Text>
        ) : null
      ) : notesOpen ? (
        <TextField
          label=""
          placeholder="Add a note"
          value={noteDraft}
          onChangeText={setNoteDraft}
          onBlur={() => onNoteBlur(noteDraft)}
          multiline
          style={styles.noteInput}
        />
      ) : (
        <Pressable onPress={() => setNotesOpen(true)} style={styles.noteToggle}>
          <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
          <Text variant="footnote" color={colors.textSecondary} style={styles.noteToggleLabel}>
            Add note
          </Text>
        </Pressable>
      )}
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  notFoundText: {
    marginTop: spacing.xs,
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressLabel: {
    marginLeft: spacing.xs,
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
  group: {
    marginBottom: spacing.sm,
  },
  groupLabel: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
    letterSpacing: 1,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  itemText: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.backgroundElevated,
  },
  statusButtonDisabled: {
    opacity: 0.6,
  },
  statusLabel: {
    marginLeft: spacing.xxs,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  photoLabel: {
    flex: 1,
  },
  noteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    padding: spacing.xxs,
    alignSelf: 'flex-start',
  },
  noteToggleLabel: {
    marginLeft: 4,
  },
  noteInput: {
    marginTop: spacing.xs,
    marginBottom: 0,
  },
  lockedNote: {
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  blockReason: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
