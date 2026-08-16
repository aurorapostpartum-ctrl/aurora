import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar, EmptyState, GlassCard, Screen, SelectModal, StatusBadge, Text } from '../../../src/components/ui';
import { addDeficiencyPhoto, assignDeficiency, setDeficiencyStatus, useMockDataVersion } from '../../../src/data/mockStore';
import { formatLongDate, getDeficiency, getJob, getPerson, getPhoto, personName } from '../../../src/data/selectors';
import { DeficiencyFormSheet } from '../../../src/features/deficiencies/DeficiencyFormSheet';
import { PhotoSourceSheet } from '../../../src/features/photos/PhotoSourceSheet';
import { PhotoViewerModal } from '../../../src/features/photos/PhotoViewerModal';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, radius, spacing } from '../../../src/theme';
import type { DeficiencyStatus, JobPhoto } from '../../../src/types/domain';

const STATUS_OPTIONS: DeficiencyStatus[] = ['open', 'in_progress', 'complete'];

const STATUS_TONE: Record<DeficiencyStatus, 'danger' | 'warning' | 'success'> = {
  open: 'danger',
  in_progress: 'warning',
  complete: 'success',
};

const STATUS_LABEL: Record<DeficiencyStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  complete: 'Complete',
};

const PRIORITY_TONE = { high: 'danger', medium: 'warning', low: 'neutral' } as const;

export default function DeficiencyScreen() {
  return (
    <RoleGate allow={['manager', 'employee']}>
      <DeficiencyContent />
    </RoleGate>
  );
}

function DeficiencyContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { person } = useAuth();
  useMockDataVersion();
  const deficiency = getDeficiency(id);
  const job = deficiency ? getJob(deficiency.jobId) : undefined;

  const [editOpen, setEditOpen] = useState(false);
  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [viewerPhoto, setViewerPhoto] = useState<JobPhoto | null>(null);

  if (!deficiency || !job || !person) {
    return (
      <Screen glow={false}>
        <EmptyState icon="alert-circle-outline" title="Deficiency not found" />
      </Screen>
    );
  }

  const assignee = deficiency.assignedTo ? getPerson(deficiency.assignedTo) : undefined;
  const jobPeople = [...job.managerIds, ...job.employeeIds]
    .map((pid) => getPerson(pid))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const photos = deficiency.photoIds.map((pid) => getPhoto(pid)).filter((p): p is JobPhoto => Boolean(p));

  return (
    <Screen glow={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Pressable onPress={() => setEditOpen(true)} hitSlop={12} style={styles.editButton} accessibilityLabel="Edit deficiency">
          <Ionicons name="pencil-outline" size={15} color={colors.textPrimary} />
          <Text variant="subhead" style={styles.editLabel}>
            Edit
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <View style={styles.badgeRow}>
            <StatusBadge
              label={`${deficiency.priority[0].toUpperCase()}${deficiency.priority.slice(1)} Priority`}
              tone={PRIORITY_TONE[deficiency.priority]}
            />
          </View>
          <Text variant="title1" style={styles.title}>
            {deficiency.title}
          </Text>
          <Text variant="subhead" color={colors.textSecondary} style={styles.location}>
            {deficiency.location}
          </Text>

          <Text variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
            STATUS
          </Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((status) => (
              <Pressable
                key={status}
                onPress={() => setDeficiencyStatus(deficiency.id, status, person.id)}
                style={[styles.statusOption, deficiency.status === status && styles.statusOptionActive]}
              >
                <View style={[styles.statusDot, { backgroundColor: dotColor(status) }]} />
                <Text
                  variant="subhead"
                  color={deficiency.status === status ? colors.textPrimary : colors.textSecondary}
                  style={styles.statusOptionLabel}
                >
                  {STATUS_LABEL[status]}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
            ASSIGNED TO
          </Text>
          <Pressable onPress={() => setAssigneePickerOpen(true)} style={styles.assigneeCard}>
            {assignee ? (
              <>
                <Avatar initials={assignee.initials} color={assignee.avatarColor} size={32} />
                <Text variant="subhead" style={styles.assigneeName}>
                  {assignee.name}
                </Text>
              </>
            ) : (
              <>
                <View style={styles.unassignedIcon}>
                  <Ionicons name="person-outline" size={16} color={colors.textTertiary} />
                </View>
                <Text variant="subhead" color={colors.textTertiary} style={styles.assigneeName}>
                  Unassigned
                </Text>
              </>
            )}
            <Text variant="footnote" color={colors.accentStrong}>
              Reassign
            </Text>
          </Pressable>

          {deficiency.description ? (
            <>
              <Text variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
                DESCRIPTION
              </Text>
              <GlassCard style={styles.card}>
                <View style={styles.cardPad}>
                  <Text variant="body" color={colors.textSecondary}>
                    {deficiency.description}
                  </Text>
                </View>
              </GlassCard>
            </>
          ) : null}

          <Text variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
            PHOTOS ({photos.length})
          </Text>
          <View style={styles.photoGrid}>
            {photos.map((photo) => (
              <Pressable key={photo.id} style={styles.photoTile} onPress={() => setViewerPhoto(photo)}>
                {photo.uri ? (
                  <Image source={{ uri: photo.uri }} style={styles.photoThumb} resizeMode="cover" />
                ) : (
                  <View style={[styles.photoThumb, styles.photoSwatch, { backgroundColor: photo.swatch }]}>
                    <Ionicons name="image" size={18} color="rgba(255,255,255,0.55)" />
                  </View>
                )}
              </Pressable>
            ))}
            <Pressable style={styles.addPhotoTile} onPress={() => setPhotoSheetOpen(true)}>
              <Ionicons name="camera-outline" size={20} color={colors.accentStrong} />
              <Text variant="caption1" color={colors.accentStrong} style={styles.addPhotoLabel}>
                Add Photo
              </Text>
            </Pressable>
          </View>

          <Text variant="footnote" color={colors.textTertiary} style={styles.metaFooter}>
            Reported by {personName(deficiency.reportedBy)} · {formatLongDate(deficiency.reportedAt)}
            {deficiency.completedAt
              ? `\nCompleted by ${personName(deficiency.completedBy)} · ${formatLongDate(deficiency.completedAt)}`
              : ''}
          </Text>
        </View>
      </ScrollView>

      <DeficiencyFormSheet
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        mode="edit"
        job={job}
        actorId={person.id}
        deficiency={deficiency}
      />
      <SelectModal
        visible={assigneePickerOpen}
        title="Assign To"
        options={[{ label: 'Unassigned', value: '' }, ...jobPeople.map((p) => ({ label: p.name, value: p.id }))]}
        selectedValue={deficiency.assignedTo ?? ''}
        onSelect={(value) => assignDeficiency(deficiency.id, value || undefined, person.id)}
        onClose={() => setAssigneePickerOpen(false)}
      />
      <PhotoSourceSheet
        visible={photoSheetOpen}
        onClose={() => setPhotoSheetOpen(false)}
        onPicked={(uri) => addDeficiencyPhoto(deficiency.id, person.id, uri)}
        title="Add Photo"
      />
      <PhotoViewerModal photo={viewerPhoto} onClose={() => setViewerPhoto(null)} />
    </Screen>
  );
}

function dotColor(status: DeficiencyStatus): string {
  if (status === 'open') return colors.danger;
  if (status === 'in_progress') return colors.warning;
  return colors.success;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  editLabel: {
    marginLeft: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 640,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  title: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  location: {
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
    letterSpacing: 1,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  statusOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusOptionLabel: {
    flexShrink: 1,
  },
  assigneeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  unassignedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighlight,
  },
  assigneeName: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardPad: {
    padding: spacing.md,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoTile: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
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
    width: 96,
    height: 96,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoLabel: {
    marginTop: spacing.xxs,
  },
  metaFooter: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
});
