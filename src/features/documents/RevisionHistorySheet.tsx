import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet, Text } from '../../components/ui';
import { formatDate, personName } from '../../data/selectors';
import { colors, radius, spacing } from '../../theme';
import type { JobDocument } from '../../types/domain';
import { FILE_TYPE_ICON } from './documentMeta';

export interface RevisionHistorySheetProps {
  visible: boolean;
  onClose: () => void;
  document: JobDocument;
  viewingRevisionNumber: number;
  onSelectRevision: (revisionNumber: number) => void;
}

export function RevisionHistorySheet({
  visible,
  onClose,
  document,
  viewingRevisionNumber,
  onSelectRevision,
}: RevisionHistorySheetProps) {
  const revisions = [...document.revisions].sort((a, b) => b.revisionNumber - a.revisionNumber);

  return (
    <BottomSheet visible={visible} title="Revision History" onClose={onClose} maxHeightPercent={80}>
      <Text variant="footnote" color={colors.textSecondary} style={styles.docTitle} numberOfLines={1}>
        {document.title}
      </Text>
      <View style={styles.list}>
        {revisions.map((rev) => {
          const isViewing = rev.revisionNumber === viewingRevisionNumber;
          return (
            <Pressable
              key={rev.id}
              onPress={() => onSelectRevision(rev.revisionNumber)}
              style={[styles.row, isViewing && styles.rowActive, rev.isCurrent && styles.rowCurrent]}
            >
              <View style={[styles.dot, rev.isCurrent ? styles.dotCurrent : styles.dotArchived]} />
              <View style={styles.rowBody}>
                <View style={styles.rowHeadline}>
                  <Text variant="headline" color={rev.isCurrent ? colors.textPrimary : colors.textSecondary}>
                    REV {rev.revisionNumber}
                  </Text>
                  <Text
                    variant="caption1"
                    color={rev.isCurrent ? colors.success : colors.textTertiary}
                    style={styles.statusLabel}
                  >
                    — {rev.isCurrent ? 'CURRENT' : 'ARCHIVED'}
                  </Text>
                  {isViewing ? (
                    <View style={styles.viewingPill}>
                      <Text variant="caption2" color={colors.accentStrong}>
                        Viewing
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text variant="footnote" color={colors.textTertiary}>
                  {personName(rev.uploadedBy)} · {formatDate(rev.uploadedAt)} · {rev.pageCount} page
                  {rev.pageCount === 1 ? '' : 's'}
                </Text>
                <Text variant="footnote" color={colors.textSecondary} style={styles.notes}>
                  {rev.notes}
                </Text>
              </View>
              <Ionicons name={FILE_TYPE_ICON[rev.fileType]} size={16} color={colors.textTertiary} />
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  docTitle: {
    marginBottom: spacing.sm,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.xs,
  },
  rowCurrent: {
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentMuted,
  },
  rowActive: {
    borderColor: colors.accent,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  dotCurrent: {
    backgroundColor: colors.success,
  },
  dotArchived: {
    backgroundColor: colors.textTertiary,
  },
  rowBody: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  rowHeadline: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusLabel: {
    marginLeft: 4,
    letterSpacing: 0.6,
  },
  viewingPill: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accentBorder,
  },
  notes: {
    marginTop: 2,
  },
});
