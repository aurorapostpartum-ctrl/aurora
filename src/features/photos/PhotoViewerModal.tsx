import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Modal, StatusBadge, Text } from '../../components/ui';
import { formatLongDate, personName } from '../../data/selectors';
import { colors, radius, spacing } from '../../theme';
import type { JobPhoto } from '../../types/domain';
import { categoryLabel } from './photoMeta';

export interface PhotoViewerModalProps {
  photo: JobPhoto | null;
  onClose: () => void;
}

const LINKED_ROUTE: Partial<Record<JobPhoto['category'], string>> = {
  checklist: '/(app)/checklist',
  hazard_assessment: '/(app)/hazard-assessment',
  deficiency: '/(app)/deficiency',
};

export function PhotoViewerModal({ photo, onClose }: PhotoViewerModalProps) {
  if (!photo) return null;

  const linkedRoute = LINKED_ROUTE[photo.category];

  return (
    <Modal visible={Boolean(photo)} onClose={onClose} maxWidth={560}>
      <View style={styles.imageWrap}>
        {photo.uri ? (
          <Image source={{ uri: photo.uri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.swatch, { backgroundColor: photo.swatch }]}>
            <Ionicons name="image" size={40} color="rgba(255,255,255,0.55)" />
          </View>
        )}
      </View>

      <View style={styles.badgeRow}>
        <StatusBadge label={categoryLabel(photo.category)} tone="neutral" />
      </View>
      <Text variant="headline" style={styles.caption}>
        {photo.caption}
      </Text>
      <Text variant="footnote" color={colors.textSecondary}>
        {personName(photo.uploadedBy)} · {formatLongDate(photo.uploadedAt)}
      </Text>

      {photo.linkedRecordLabel && linkedRoute ? (
        <Pressable
          onPress={() => {
            onClose();
            router.push(`${linkedRoute}/${photo.linkedRecordId}` as never);
          }}
          style={styles.linkedRow}
        >
          <Ionicons name="link-outline" size={14} color={colors.accentStrong} />
          <Text variant="footnote" color={colors.accentStrong} style={styles.linkedLabel} numberOfLines={1}>
            View {photo.linkedRecordLabel}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.accentStrong} />
        </Pressable>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  imageWrap: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: 320,
    backgroundColor: colors.surface,
  },
  swatch: {
    width: '100%',
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  caption: {
    marginBottom: spacing.xxs,
  },
  linkedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accentBorder,
  },
  linkedLabel: {
    flex: 1,
    marginLeft: spacing.xs,
  },
});
