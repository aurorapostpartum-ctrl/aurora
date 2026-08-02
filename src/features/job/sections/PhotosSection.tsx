import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Button, Chip, EmptyState, SelectModal, Text } from '../../../components/ui';
import { useSyncStateForRecord } from '../../../data/offlineStore';
import { getPerson, personName, timeAgo } from '../../../data/selectors';
import { PhotoViewerModal } from '../../photos/PhotoViewerModal';
import { DATE_FILTER_OPTIONS, PHOTO_CATEGORY_OPTIONS, categoryIcon, isWithinDateFilter, type DateFilterOption } from '../../photos/photoMeta';
import { UploadPhotoSheet } from '../../photos/UploadPhotoSheet';
import { colors, radius, spacing } from '../../../theme';
import type { Job, JobPhoto, PhotoCategory, Person } from '../../../types/domain';

interface PhotosSectionProps {
  photos: JobPhoto[];
  job: Job;
  person: Person;
}

export function PhotosSection({ photos, job, person }: PhotosSectionProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerPhoto, setViewerPhoto] = useState<JobPhoto | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<PhotoCategory | 'all'>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [employeePickerOpen, setEmployeePickerOpen] = useState(false);

  const uploaders = useMemo(() => {
    const ids = [...new Set(photos.map((p) => p.uploadedBy))];
    return ids.map((id) => getPerson(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [photos]);

  const now = useMemo(() => new Date(), []);

  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (employeeFilter !== 'all' && p.uploadedBy !== employeeFilter) return false;
      if (!isWithinDateFilter(p.uploadedAt, dateFilter, now)) return false;
      return true;
    });
  }, [photos, categoryFilter, employeeFilter, dateFilter, now]);

  const hasFilters = categoryFilter !== 'all' || employeeFilter !== 'all' || dateFilter !== 'all';

  return (
    <View>
      <View style={styles.actionRow}>
        <Text variant="footnote" color={colors.textTertiary}>
          {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </Text>
        <Button label="Upload Photo" size="md" fullWidth={false} onPress={() => setUploadOpen(true)} />
      </View>

      <View style={styles.filterRow}>
        <Chip label="All" selected={categoryFilter === 'all'} onPress={() => setCategoryFilter('all')} />
        {PHOTO_CATEGORY_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={categoryFilter === option.value}
            onPress={() => setCategoryFilter(option.value)}
          />
        ))}
      </View>

      <View style={styles.filterRow}>
        <Pressable onPress={() => setEmployeePickerOpen(true)} style={styles.employeeFilterButton}>
          <Ionicons name="person-outline" size={13} color={colors.textSecondary} />
          <Text variant="footnote" color={colors.textSecondary} style={styles.employeeFilterLabel} numberOfLines={1}>
            {employeeFilter === 'all' ? 'All Employees' : personName(employeeFilter)}
          </Text>
          <Ionicons name="chevron-down" size={13} color={colors.textTertiary} />
        </Pressable>
        {DATE_FILTER_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={dateFilter === option.value}
            onPress={() => setDateFilter(option.value)}
          />
        ))}
      </View>

      {filteredPhotos.length === 0 ? (
        <EmptyState
          icon="image-outline"
          title={photos.length === 0 ? 'No photos yet' : 'No photos match your filters'}
          message={
            photos.length === 0
              ? 'Upload progress photos from the field, or capture them right from your phone.'
              : 'Try a different category, employee, or date range.'
          }
        />
      ) : (
        <View style={styles.grid}>
          {filteredPhotos.map((photo) => (
            <PhotoTile key={photo.id} photo={photo} onPress={() => setViewerPhoto(photo)} />
          ))}
        </View>
      )}

      <UploadPhotoSheet visible={uploadOpen} onClose={() => setUploadOpen(false)} jobId={job.id} uploadedBy={person.id} />
      <PhotoViewerModal photo={viewerPhoto} onClose={() => setViewerPhoto(null)} />
      <SelectModal
        visible={employeePickerOpen}
        title="Filter by Employee"
        options={[{ label: 'All Employees', value: 'all' }, ...uploaders.map((p) => ({ label: p.name, value: p.id }))]}
        selectedValue={employeeFilter}
        onSelect={(value) => setEmployeeFilter(value)}
        onClose={() => setEmployeePickerOpen(false)}
      />
    </View>
  );
}

function PhotoTile({ photo, onPress }: { photo: JobPhoto; onPress: () => void }) {
  const syncState = useSyncStateForRecord(photo.id);

  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <View style={styles.thumbWrap}>
        {photo.uri ? (
          <Image source={{ uri: photo.uri }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={[styles.thumb, styles.swatch, { backgroundColor: photo.swatch }]}>
            <Ionicons name="image" size={22} color="rgba(255,255,255,0.55)" />
          </View>
        )}
        <View style={styles.categoryBadge}>
          <Ionicons name={categoryIcon(photo.category)} size={11} color={colors.textOnAccent} />
        </View>
        {syncState ? (
          <View style={[styles.syncBadge, syncState === 'failed' && styles.syncBadgeFailed]}>
            <Ionicons
              name={syncState === 'failed' ? 'alert-circle' : 'cloud-upload-outline'}
              size={11}
              color={colors.textOnAccent}
            />
          </View>
        ) : null}
      </View>
      <Text variant="footnote" numberOfLines={1} style={styles.caption}>
        {photo.caption}
      </Text>
      <Text variant="caption2" color={colors.textTertiary} numberOfLines={1}>
        {personName(photo.uploadedBy)} · {timeAgo(photo.uploadedAt)}
        {syncState ? ` · ${syncState === 'failed' ? 'Sync failed' : 'Pending sync'}` : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  employeeFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    maxWidth: 180,
  },
  employeeFilterLabel: {
    marginHorizontal: spacing.xxs,
    flexShrink: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  tile: {
    width: 156,
  },
  thumbWrap: {
    width: 156,
    height: 118,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  swatch: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBadgeFailed: {
    backgroundColor: colors.danger,
  },
  caption: {
    marginBottom: 1,
  },
});
