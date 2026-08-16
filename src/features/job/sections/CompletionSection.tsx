import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Button, Chip, GlassCard, Modal, ProgressBar, SelectModal, StatusBadge, Text, TextField } from '../../../components/ui';
import {
  addCompletionItem,
  addCompletionItemPhoto,
  attachCompletionItemDocument,
  markJobComplete,
  removeCompletionItem,
  removeCompletionItemDocument,
  setCompletionItemDone,
  setCompletionItemRequired,
  updateCompletionFinalNotes,
  updateCompletionItemNotes,
} from '../../../data/mockStore';
import { formatLongDate, getPhoto, personName } from '../../../data/selectors';
import { PhotoSourceSheet } from '../../photos/PhotoSourceSheet';
import { colors, radius, spacing } from '../../../theme';
import type { Deficiency, Job, JobDocument, Person, ProjectCompletion, ProjectCompletionItem } from '../../../types/domain';

interface CompletionSectionProps {
  job: Job;
  isManager: boolean;
  person: Person;
  completion: ProjectCompletion | undefined;
  documents: JobDocument[];
  openDeficiencies: Deficiency[];
}

const PRIORITY_TONE = { high: 'danger', medium: 'warning', low: 'neutral' } as const;

export function CompletionSection({ job, isManager, person, completion, documents, openDeficiencies }: CompletionSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newRequired, setNewRequired] = useState(true);
  const [photoSheetItemId, setPhotoSheetItemId] = useState<string | null>(null);
  const [documentPickerItemId, setDocumentPickerItemId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [finalNotesDraft, setFinalNotesDraft] = useState(completion?.finalNotes ?? '');

  if (!completion) return null;

  const locked = !isManager || completion.isComplete;
  const total = completion.checklist.length;
  const done = completion.checklist.filter((i) => i.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const requiredItems = completion.checklist.filter((i) => i.required);
  const requiredRemaining = requiredItems.filter((i) => !i.done).length;
  const openDeficiencyCount = openDeficiencies.length;
  const canComplete = isManager && !completion.isComplete && requiredRemaining === 0 && openDeficiencyCount === 0;

  const handleAddItem = () => {
    if (!newLabel.trim()) return;
    addCompletionItem(job.id, newLabel, newRequired);
    setNewLabel('');
    setNewRequired(true);
    setAddOpen(false);
  };

  const handleMarkComplete = () => {
    markJobComplete(job.id, person.id);
    setConfirmOpen(false);
  };

  const documentsFor = (itemId: string) => {
    const item = completion.checklist.find((i) => i.id === itemId);
    const linked = new Set(item?.documentIds ?? []);
    return documents.filter((d) => !linked.has(d.id));
  };

  return (
    <View>
      <View style={styles.overviewCard}>
        <Text variant="caption1" color={colors.textTertiary} style={styles.eyebrow}>
          PROJECT COMPLETION
        </Text>
        <View style={styles.overviewRow}>
          <View style={styles.overviewLeft}>
            <Text variant="body" color={colors.textSecondary}>
              {done} of {total} items complete
            </Text>
            {requiredRemaining > 0 && !completion.isComplete ? (
              <Text variant="footnote" color={colors.textTertiary} style={styles.requiredNote}>
                {requiredRemaining} required item{requiredRemaining === 1 ? '' : 's'} remaining
              </Text>
            ) : null}
          </View>
          <Text variant="largeTitle" style={styles.percent}>
            {percent}%
          </Text>
        </View>
        <ProgressBar
          progress={percent}
          fillColor={completion.isComplete ? colors.success : colors.accent}
          style={styles.progress}
        />
        <View style={styles.statusBadgeWrap}>
          <StatusBadge
            label={completion.isComplete ? 'Project Complete' : 'In Progress'}
            tone={completion.isComplete ? 'success' : 'warning'}
          />
        </View>
        {completion.isComplete && completion.completedAt ? (
          <Text variant="footnote" color={colors.textSecondary} style={styles.completedNote}>
            Marked complete by {personName(completion.completedBy)} on {formatLongDate(completion.completedAt)}.
          </Text>
        ) : null}
      </View>

      <GlassCard style={styles.card}>
        <View style={styles.cardBody}>
          <Text variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
            CHECKLIST
          </Text>
          {completion.checklist.map((item) => (
            <CompletionItemRow
              key={item.id}
              item={item}
              locked={locked}
              expanded={expandedId === item.id}
              onToggleExpand={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
              onToggleDone={() => setCompletionItemDone(job.id, item.id, !item.done, person.id)}
              onToggleRequired={() => setCompletionItemRequired(job.id, item.id, !item.required)}
              onNotesBlur={(notes) => updateCompletionItemNotes(job.id, item.id, notes)}
              onAddPhoto={() => setPhotoSheetItemId(item.id)}
              onAttachDocument={() => setDocumentPickerItemId(item.id)}
              onRemoveDocument={(docId) => removeCompletionItemDocument(job.id, item.id, docId)}
              onRemove={() => removeCompletionItem(job.id, item.id)}
              documents={documents}
            />
          ))}

          {!locked ? (
            addOpen ? (
              <View style={styles.addForm}>
                <TextField
                  label=""
                  placeholder="e.g. Punch list walk-through"
                  value={newLabel}
                  onChangeText={setNewLabel}
                  style={styles.addInput}
                />
                <View style={styles.addFormRow}>
                  <Chip label="Required" selected={newRequired} onPress={() => setNewRequired((v) => !v)} />
                  <View style={styles.addFormButtons}>
                    <Button
                      label="Cancel"
                      variant="secondary"
                      size="md"
                      fullWidth={false}
                      onPress={() => {
                        setAddOpen(false);
                        setNewLabel('');
                      }}
                    />
                    <Button label="Add Item" size="md" fullWidth={false} onPress={handleAddItem} disabled={!newLabel.trim()} />
                  </View>
                </View>
              </View>
            ) : (
              <Pressable onPress={() => setAddOpen(true)} style={styles.addItemButton}>
                <Ionicons name="add-circle-outline" size={18} color={colors.accentStrong} />
                <Text variant="subhead" color={colors.accentStrong} style={styles.addItemLabel}>
                  Add Completion Item
                </Text>
              </Pressable>
            )
          ) : null}

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
              value={finalNotesDraft}
              onChangeText={setFinalNotesDraft}
              onBlur={() => updateCompletionFinalNotes(job.id, finalNotesDraft)}
              multiline
              numberOfLines={4}
              editable={!completion.isComplete}
              style={styles.textarea}
            />
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

      {isManager && !completion.isComplete ? (
        <View style={styles.markCompleteWrap}>
          <Button
            label="Mark Job Complete"
            size="lg"
            onPress={() => setConfirmOpen(true)}
            disabled={!canComplete}
            style={styles.markCompleteButton}
          />
          {!canComplete ? (
            <Text variant="footnote" color={colors.textTertiary} style={styles.markCompleteHint}>
              {requiredRemaining > 0
                ? `${requiredRemaining} required item${requiredRemaining === 1 ? '' : 's'} remaining`
                : `${openDeficiencyCount} open ${openDeficiencyCount === 1 ? 'deficiency' : 'deficiencies'} must be resolved first`}
            </Text>
          ) : null}
        </View>
      ) : null}

      <Text variant="footnote" color={colors.textTertiary} style={styles.jobName}>
        {job.name} stays permanently in SiteVault as a completed Job Folder — every document, revision, checklist,
        hazard assessment, photo, and activity entry remains fully accessible after completion.
      </Text>

      <PhotoSourceSheet
        visible={photoSheetItemId !== null}
        onClose={() => setPhotoSheetItemId(null)}
        onPicked={(uri) => {
          if (photoSheetItemId) addCompletionItemPhoto(job.id, photoSheetItemId, person.id, uri);
        }}
      />

      <SelectModal
        visible={documentPickerItemId !== null}
        title="Attach Document"
        options={documentPickerItemId ? documentsFor(documentPickerItemId).map((d) => ({ label: d.title, value: d.id })) : []}
        selectedValue={null}
        onSelect={(docId) => {
          if (documentPickerItemId) attachCompletionItemDocument(job.id, documentPickerItemId, docId);
        }}
        onClose={() => setDocumentPickerItemId(null)}
      />

      <Modal
        visible={confirmOpen}
        title="Mark Job Complete?"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <Button label="Cancel" variant="secondary" size="md" fullWidth={false} onPress={() => setConfirmOpen(false)} />
            <Button label="Mark Complete" size="md" fullWidth={false} onPress={handleMarkComplete} />
          </>
        }
      >
        <Text variant="body" color={colors.textSecondary}>
          {job.name} will move from Active to Completed. All documents, revisions, checklists, hazard assessments,
          photos, and activity history stay fully accessible — nothing is deleted or hidden.
        </Text>
      </Modal>
    </View>
  );
}

function CompletionItemRow({
  item,
  locked,
  expanded,
  onToggleExpand,
  onToggleDone,
  onToggleRequired,
  onNotesBlur,
  onAddPhoto,
  onAttachDocument,
  onRemoveDocument,
  onRemove,
  documents,
}: {
  item: ProjectCompletionItem;
  locked: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleDone: () => void;
  onToggleRequired: () => void;
  onNotesBlur: (notes: string) => void;
  onAddPhoto: () => void;
  onAttachDocument: () => void;
  onRemoveDocument: (documentId: string) => void;
  onRemove: () => void;
  documents: JobDocument[];
}) {
  const [notesDraft, setNotesDraft] = useState(item.notes ?? '');
  const photoCount = item.photoIds?.length ?? 0;
  const linkedDocs = (item.documentIds ?? [])
    .map((id) => documents.find((d) => d.id === id))
    .filter((d): d is JobDocument => Boolean(d));

  return (
    <View style={styles.itemBlock}>
      <View style={styles.itemRow}>
        <Pressable onPress={onToggleDone} hitSlop={8} disabled={locked} accessibilityLabel={item.done ? 'Mark incomplete' : 'Mark complete'}>
          <Ionicons
            name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={item.done ? colors.success : colors.textTertiary}
          />
        </Pressable>
        <Pressable style={styles.itemTextWrap} onPress={onToggleExpand}>
          <Text variant="body" color={item.done ? colors.textPrimary : colors.textSecondary}>
            {item.label}
          </Text>
          <View style={styles.itemMetaRow}>
            {item.required ? <StatusBadge label="Required" tone="warning" /> : null}
            {item.notes ? <Ionicons name="document-text-outline" size={13} color={colors.textTertiary} /> : null}
            {photoCount > 0 ? (
              <View style={styles.metaChip}>
                <Ionicons name="image-outline" size={13} color={colors.textTertiary} />
                <Text variant="caption2" color={colors.textTertiary}>
                  {photoCount}
                </Text>
              </View>
            ) : null}
            {linkedDocs.length > 0 ? (
              <View style={styles.metaChip}>
                <Ionicons name="document-outline" size={13} color={colors.textTertiary} />
                <Text variant="caption2" color={colors.textTertiary}>
                  {linkedDocs.length}
                </Text>
              </View>
            ) : null}
          </View>
        </Pressable>
        <Pressable onPress={onToggleExpand} hitSlop={8}>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textTertiary} />
        </Pressable>
      </View>

      {expanded ? (
        <View style={styles.itemDetail}>
          {!locked ? (
            <View style={styles.itemActionsRow}>
              <Button
                label={item.done ? 'Mark Incomplete' : 'Mark Complete'}
                variant={item.done ? 'secondary' : 'primary'}
                size="md"
                fullWidth={false}
                onPress={onToggleDone}
              />
              <Chip label="Required" selected={item.required} onPress={onToggleRequired} />
            </View>
          ) : null}

          <TextField
            label="Notes"
            placeholder="Add notes for this item..."
            value={notesDraft}
            onChangeText={setNotesDraft}
            onBlur={() => onNotesBlur(notesDraft)}
            editable={!locked}
            multiline
            style={styles.notesInput}
          />

          <Text variant="caption1" color={colors.textTertiary} style={styles.itemDetailLabel}>
            PHOTOS
          </Text>
          <View style={styles.photoRow}>
            {(item.photoIds ?? []).map((photoId) => (
              <CompletionPhotoThumb key={photoId} photoId={photoId} />
            ))}
            {!locked ? (
              <Pressable onPress={onAddPhoto} style={styles.addPhotoTile} accessibilityLabel="Add photo">
                <Ionicons name="camera-outline" size={18} color={colors.accentStrong} />
              </Pressable>
            ) : null}
            {(item.photoIds ?? []).length === 0 && locked ? (
              <Text variant="footnote" color={colors.textTertiary}>
                None attached
              </Text>
            ) : null}
          </View>

          <Text variant="caption1" color={colors.textTertiary} style={styles.itemDetailLabel}>
            DOCUMENTS
          </Text>
          <View style={styles.docList}>
            {linkedDocs.map((doc) => (
              <View key={doc.id} style={styles.docChip}>
                <Ionicons name="document-outline" size={13} color={colors.textSecondary} />
                <Text variant="footnote" color={colors.textSecondary} numberOfLines={1} style={styles.docChipLabel}>
                  {doc.title}
                </Text>
                {!locked ? (
                  <Pressable onPress={() => onRemoveDocument(doc.id)} hitSlop={6} accessibilityLabel={`Remove ${doc.title}`}>
                    <Ionicons name="close" size={13} color={colors.textTertiary} />
                  </Pressable>
                ) : null}
              </View>
            ))}
            {!locked ? (
              <Pressable onPress={onAttachDocument} style={styles.attachDocButton}>
                <Ionicons name="attach-outline" size={14} color={colors.accentStrong} />
                <Text variant="footnote" color={colors.accentStrong} style={styles.attachDocLabel}>
                  Attach Document
                </Text>
              </Pressable>
            ) : null}
            {linkedDocs.length === 0 && locked ? (
              <Text variant="footnote" color={colors.textTertiary}>
                None attached
              </Text>
            ) : null}
          </View>

          {!locked ? (
            <Pressable onPress={onRemove} style={styles.removeItemButton}>
              <Ionicons name="trash-outline" size={13} color={colors.danger} />
              <Text variant="caption1" color={colors.danger} style={styles.removeItemLabel}>
                Remove Item
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function CompletionPhotoThumb({ photoId }: { photoId: string }) {
  const photo = getPhoto(photoId);
  if (!photo) return null;
  return (
    <View style={styles.photoThumbWrap}>
      {photo.uri ? (
        <Image source={{ uri: photo.uri }} style={styles.photoThumb} resizeMode="cover" />
      ) : (
        <View style={[styles.photoThumb, styles.photoSwatch, { backgroundColor: photo.swatch }]}>
          <Ionicons name="image" size={16} color="rgba(255,255,255,0.55)" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overviewCard: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  eyebrow: {
    letterSpacing: 1.4,
    marginBottom: spacing.xs,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  overviewLeft: {
    flexShrink: 1,
  },
  requiredNote: {
    marginTop: 2,
  },
  percent: {
    marginLeft: spacing.md,
  },
  progress: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  statusBadgeWrap: {
    flexDirection: 'row',
  },
  completedNote: {
    marginTop: spacing.sm,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardBody: {
    padding: spacing.md,
  },
  sectionLabel: {
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  itemBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
  },
  itemTextWrap: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 2,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  itemDetail: {
    paddingBottom: spacing.md,
    paddingLeft: spacing.xl + spacing.xs,
  },
  itemActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  notesInput: {
    marginBottom: spacing.sm,
  },
  itemDetailLabel: {
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  photoThumbWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  photoSwatch: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoTile: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  docChip: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 200,
    paddingVertical: 6,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHighlight,
    gap: 4,
  },
  docChipLabel: {
    flexShrink: 1,
  },
  attachDocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: spacing.xs,
  },
  attachDocLabel: {
    marginLeft: 4,
  },
  removeItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.xxs,
  },
  removeItemLabel: {
    marginLeft: 4,
  },
  addForm: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  addInput: {
    marginBottom: spacing.sm,
  },
  addFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  addFormButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    padding: spacing.xxs,
  },
  addItemLabel: {
    marginLeft: spacing.xxs,
  },
  warning: {
    marginTop: spacing.md,
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
  markCompleteWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  markCompleteButton: {
    width: '100%',
  },
  markCompleteHint: {
    marginTop: spacing.xs,
  },
  jobName: {
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
});
