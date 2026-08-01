import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Button, EmptyState, Text } from '../../../components/ui';
import { addPhoto } from '../../../data/mockStore';
import { timeAgo } from '../../../data/selectors';
import { colors, radius, spacing } from '../../../theme';
import type { Job, JobPhoto, Person } from '../../../types/domain';

interface PhotosSectionProps {
  photos: JobPhoto[];
  job: Job;
  person: Person;
}

export function PhotosSection({ photos, job, person }: PhotosSectionProps) {
  const handleAddPhoto = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addPhoto({ jobId: job.id, caption: 'New site photo', uploadedBy: person.id });
  };

  return (
    <View>
      <View style={styles.actionRow}>
        <Text variant="footnote" color={colors.textTertiary}>
          {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </Text>
        <Button label="Upload Photo" size="md" fullWidth={false} onPress={handleAddPhoto} />
      </View>

      {photos.length === 0 ? (
        <EmptyState icon="image-outline" title="No photos yet" message="Upload progress photos from the field." />
      ) : (
        <View style={styles.grid}>
          {photos.map((photo) => (
            <Pressable key={photo.id} style={styles.tile}>
              <View style={[styles.swatch, { backgroundColor: photo.swatch }]}>
                <Ionicons name="image" size={22} color="rgba(255,255,255,0.55)" />
              </View>
              <Text variant="footnote" numberOfLines={1} style={styles.caption}>
                {photo.caption}
              </Text>
              <Text variant="caption2" color={colors.textTertiary}>
                {timeAgo(photo.uploadedAt)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    width: 156,
  },
  swatch: {
    width: 156,
    height: 118,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  caption: {
    marginBottom: 1,
  },
});
