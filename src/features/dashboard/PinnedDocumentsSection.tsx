import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { EmptyRow, GlassCard, Text } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { SectionHeader } from './SectionHeader';
import { useLocalList } from './useLocalList';
import type { PinnedDocument } from './types';

const KIND_ICON: Record<PinnedDocument['kind'], keyof typeof Ionicons.glyphMap> = {
  pdf: 'document-text-outline',
  doc: 'document-outline',
  sheet: 'grid-outline',
};

export function PinnedDocumentsSection() {
  const { items, hydrated } = useLocalList<PinnedDocument>('dashboard.pinnedDocuments');

  if (!hydrated) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title="Pinned Documents" />
      {items.length === 0 ? (
        <EmptyRow icon="pin-outline" message="Pin documents from your library for quick access" />
      ) : (
        <GlassCard radiusToken="md">
          <View>
            {items.map((item, index) => (
              <View key={item.id}>
                <View style={styles.row}>
                  <Ionicons name={KIND_ICON[item.kind]} size={18} color={colors.textSecondary} />
                  <Text variant="subhead" numberOfLines={1} style={styles.name}>
                    {item.name}
                  </Text>
                  <Ionicons name="pin" size={14} color={colors.accent} />
                </View>
                {index < items.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </GlassCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  name: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: spacing.md,
  },
});
